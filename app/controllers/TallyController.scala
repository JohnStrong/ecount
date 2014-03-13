package controllers

import play.api.mvc._
import play.filters.csrf._

import play.api.libs.json._
import play.api.libs.iteratee._
import play.api.libs.concurrent.Execution.Implicits._

import helpers.{TallyFormHelper, FormErrors}
import service.dispatch.tallysys.{AccountDispatcher, ResultsDispatcher}

import models.ecount.tallysys.implicits.{Candidate, TallyGroup}
import models.ecount.live.TallyFeed

object TallyController extends Controller {

  private val DASHBOARD_SESSION_KEY = "sys.account"
  private val VERIFICATION_KEY_COOKIE_ID = "verificationKey"

  private val BAD_TALLY_RESULTS_POST = "poor request. please do not try that again."
  private val VERIFICATION_KEY_MISSING_FROM_REQUEST = "could not verify request. please try again."
  private val FAILED_TO_PERSIST_CANDIDATE_TALLIES = "failed to publish tally results. please try again."

  implicit val candidateRds = Json.reads[Candidate]
  implicit val resultsRds = Json.reads[TallyGroup]

  def feed(eid:Int, cid:Int) = WebSocket.using[String] { request => {

    val (out, channel) = Concurrent.broadcast[String]

    TallyFeed.addNewClient(channel, (eid, cid))

    val in = Iteratee.foreach[String] { msg =>
      channel.push("RESPONSE")
    }

    (in, out)
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
        case Some(c) => Ok(views.html.tallyAuth(TallyFormHelper.RepresentativeForm))
        case None => Redirect(routes.TallyController.index)
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
            Unauthorized("verification failed")
          }
        }
      )
    }}
  }

  def access = CSRFCheck {
    Action { implicit request => {
      TallyFormHelper.RepresentativeForm.bindFromRequest.fold(
        formWithErrors => {
          Ok(views.html.tallyAuth(formWithErrors))
        },
        representativeAuthData => {
          val access = TallyFormHelper.createAccessAccount(representativeAuthData)

          access match {
            case Some(sessionId) => {
              Redirect(routes.TallyController.dashboard).withSession{
                DASHBOARD_SESSION_KEY -> sessionId
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
          Console.println(sessId)

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
            AccountDispatcher.getBallotBoxElectionDependencies(key).map(ballot => {
              ResultsDispatcher.addTalliesForCandidates(ballot, candidates)

              TallyFeed.broadcastCandidateTallyResults(ballot, candidates)

              Ok("complete")
            }).getOrElse {
              BadRequest(FAILED_TO_PERSIST_CANDIDATE_TALLIES)
            }
          }).getOrElse{
            BadRequest(VERIFICATION_KEY_MISSING_FROM_REQUEST)
          }
        }
      }.recoverTotal {
        e => BadRequest(BAD_TALLY_RESULTS_POST)
      }
    }
  }
}
