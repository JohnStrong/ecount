package controllers

import play.api.mvc._
import play.filters.csrf._

import play.api.libs.json._
import play.api.libs.iteratee._
import play.api.libs.concurrent.Execution.Implicits._

import helpers.{TallyFormHelper, FormErrors}
import service.dispatch.tallysys.{AccountDispatcher, ResultsDispatcher}

import models.tallysys.implicits.{Candidate, TallyGroup}
import models.live.TallyFeed

object TallySysConsts {

  val BAD_VERIFICATION_KEY = "verification failed."

  val BAD_TALLY_RESULTS_POST = "poor request. please do not try that again."

  val VERIFICATION_KEY_MISSING_FROM_REQUEST = "could not verify request. please try again."

  val FAILED_TO_PERSIST_CANDIDATE_TALLIES = "failed to publish tally results. please try again."

  val PUBLISH_TALLY_RESULTS_SUCCESSFUL = "tally results published successfully. Thank you."

  val PUBLISH_TALLY_RESULTS_FAILED = "failed to publish tally results. please try again."
}

object TallyController extends Controller {

  private val DASHBOARD_SESSION_KEY = "sys.account"
  private val VERIFICATION_KEY_COOKIE_ID = "verificationKey"

  implicit val candidateRds = Json.reads[Candidate]
  implicit val resultsRds = Json.reads[TallyGroup]

  def feed(eid:Int, cid:Int) = WebSocket.async[String] { request => {

    val (out, channel) = Concurrent.broadcast[String]

    TallyFeed.addNewClient(channel, (eid, cid))

    val in = Iteratee.foreach[String] { msg =>
      channel.push("success")
    }

    scala.concurrent.Future { (in, out) }
  }}

  def index = CSRFAddToken {
    Action { implicit request => {
     val key = request.cookies.get(VERIFICATION_KEY_COOKIE_ID)
     key match {
       case Some(key) => {
         if(session.get(DASHBOARD_SESSION_KEY).isDefined) {
           Redirect(routes.TallyController.dashboard)
         } else {
           Redirect(routes.TallyController.account)
         }
       }
       case _ => {
          Ok(views.html.tallyVerification(TallyFormHelper.authForm))
        }
     }
    }}
  }

  def account = CSRFAddToken {
    Action { implicit request => {
      request.cookies.get(VERIFICATION_KEY_COOKIE_ID) match {
        case Some(c) => Ok(views.html.tallyAuth(TallyFormHelper.RepresentativeRegisterForm))
        case None => Redirect(routes.TallyController.index)
      }
    }}
  }

  def logout = {
    Action { implicit request => {
      Redirect(routes.TallyController.account).withSession{
        session - DASHBOARD_SESSION_KEY
      }
    }}
  }

  def verification = CSRFAddToken {
    Action { implicit request => {
      TallyFormHelper.authForm.bindFromRequest.fold(
        hasError => {
          BadRequest(views.html.tallyVerification(hasError))
        },
        verificationKey => {
          if(AccountDispatcher.isValidKey(verificationKey)) {
            Redirect(routes.TallyController.account).withCookies(
              Cookie(VERIFICATION_KEY_COOKIE_ID, verificationKey)
            )
          } else {
            Unauthorized(TallySysConsts.BAD_VERIFICATION_KEY)
          }
        }
      )
    }}
  }

  def access = CSRFCheck {
    Action { implicit request => {
      TallyFormHelper.RepresentativeRegisterForm.bindFromRequest.fold(
        formWithErrors => {
          Ok(views.html.tallyAuth(formWithErrors))
        },
        representativeAuthData => {
          val access = TallyFormHelper.createAccessAccount(representativeAuthData)

          access match {
            case Some(sessionId) => {
              Redirect(routes.TallyController.dashboard).withSession{
                session + (DASHBOARD_SESSION_KEY -> sessionId)
              }
            }
            case _ => {
              val formWithGlobalErrors = FormErrors.accountRegistrationFailed
              Unauthorized(views.html.tallyAuth(formWithGlobalErrors))
            }
          }
        }
      )
    }}
  }

  def dashboard = CSRFAddToken {
    Action { implicit request => {
      session.get(DASHBOARD_SESSION_KEY) match {
        case Some(sessId) => {
          AccountDispatcher.getAccount(sessId) match {
            case Some(account) => {
              val ballotBoxId = account.ballotBoxId

              AccountDispatcher.getElectionByBallotBoxId(ballotBoxId) match {
                case Some(election) => {
                  val candidates = AccountDispatcher.getElectionCandidates(election.id)
                  Ok(views.html.tallyDashboard(election, candidates))
                }
                case _ => {
                  BadRequest("")
                }
              }
            }
            case _ => {
              Redirect(routes.TallyController.account)
            }
          }
        }
        case _ => Redirect(routes.TallyController.index)
      }
    }}
  }

  def receiveTally = Action(parse.json) {
    implicit request => {
      request.body.validate[TallyGroup].map{
        case tallies => {
          val candidates = tallies.candidates

          session.get(DASHBOARD_SESSION_KEY).map(key => {
            AccountDispatcher.getBallotBoxElectionDependencies(key).map(
              ballot => {

              ResultsDispatcher.addTalliesForCandidates(ballot, candidates)

              TallyFeed.broadcastCandidateTallyResults(ballot, candidates) match {
                case true =>  Ok(TallySysConsts.PUBLISH_TALLY_RESULTS_SUCCESSFUL)
                case _ => InternalServerError(TallySysConsts.PUBLISH_TALLY_RESULTS_FAILED)
              }
            }).getOrElse {
              BadRequest(TallySysConsts.FAILED_TO_PERSIST_CANDIDATE_TALLIES)
            }
          }).getOrElse{
            BadRequest(TallySysConsts.VERIFICATION_KEY_MISSING_FROM_REQUEST)
          }
        }
      }.recoverTotal {
        e => BadRequest(TallySysConsts.BAD_TALLY_RESULTS_POST)
      }
    }
  }
}
