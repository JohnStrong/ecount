package controllers

import play.api.mvc._
import play.filters.csrf._

import play.api.libs.json._
import play.api.libs.iteratee._
import play.api.libs.concurrent.Execution.Implicits._

import service.dispatch.tallysys.{AccountDispatcher, ResultsDispatcher}

import models.tallysys.implicits.{Candidate, TallyGroup}
import models.live.TallyFeed

import consts.tallysys.{AuthenticationConsts, SessionConsts}

import helpers.form.TallyFormHelper
import helpers.form.error.FormErrors

object TallyController extends Controller {

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
     val key = request.cookies.get(SessionConsts.VERIFICATION_KEY_COOKIE_ID)
     key match {
       case Some(key) => {
         if(session.get(SessionConsts.DASHBOARD_SESSION_KEY).isDefined) {
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
      request.cookies.get(SessionConsts.VERIFICATION_KEY_COOKIE_ID) match {
        case Some(c) =>
          Ok(views.html.tallyAuth(
            TallyFormHelper.RepresentativeRegisterForm,
            TallyFormHelper.RepresentativeLoginForm))
        case None => Redirect(routes.TallyController.index)
      }
    }}
  }

  def logout = {
    Action { implicit request => {
      Redirect(routes.TallyController.account).withSession{
        session - SessionConsts.DASHBOARD_SESSION_KEY
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
              Cookie(SessionConsts.VERIFICATION_KEY_COOKIE_ID, verificationKey)
            )
          } else {
            Unauthorized(AuthenticationConsts.BAD_VERIFICATION_KEY)
          }
        }
      )
    }}
  }

  def access = CSRFCheck {
    Action { implicit request => {
      TallyFormHelper.RepresentativeRegisterForm.bindFromRequest.fold(
        formWithErrors => {
          Ok(views.html.tallyAuth(formWithErrors, TallyFormHelper.RepresentativeLoginForm))
        },
        representativeAuthData => {
          val access = TallyFormHelper.createAccessAccount(representativeAuthData)

          access match {
            case Some(sessionId) => {
              Redirect(routes.TallyController.dashboard).withSession{
                session + (SessionConsts.DASHBOARD_SESSION_KEY -> sessionId)
              }
            }
            case _ => {
              val formWithGlobalErrors = FormErrors.accountRegistrationFailed
              Unauthorized(views.html.tallyAuth(formWithGlobalErrors,
                TallyFormHelper.RepresentativeLoginForm))
            }
          }
        }
      )
    }}
  }

  def login = CSRFCheck {
    Action { implicit request => {
      TallyFormHelper.RepresentativeLoginForm.bindFromRequest.fold(
        formWithErrors => {
          Ok(views.html.tallyAuth(TallyFormHelper.RepresentativeRegisterForm, formWithErrors))
        },
        loginData => {
          val maybeAccount = AccountDispatcher.getAccountWithVerification(loginData)

          maybeAccount.map {
            account => {
              Redirect(routes.TallyController.dashboard).withSession {
                session + (SessionConsts.DASHBOARD_SESSION_KEY -> account.username)
              }
            }
          }.getOrElse {
            val formWithGlobalError = FormErrors.invalidLogin
            Unauthorized(views.html.tallyAuth(TallyFormHelper.RepresentativeRegisterForm,
              formWithGlobalError))
          }
        }
      )
    }}
  }

  def dashboard = CSRFAddToken {
    Action { implicit request => {
      session.get(SessionConsts.DASHBOARD_SESSION_KEY) match {
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

          session.get(SessionConsts.DASHBOARD_SESSION_KEY).map(key => {
            AccountDispatcher.getBallotBoxElectionDependencies(key).map(
              ballot => {
              ResultsDispatcher.addTalliesForCandidates(ballot, candidates)

              TallyFeed.broadcastCandidateTallyResults(ballot, candidates) match {
                case true =>  {
                  // remove temporary account (user must create another to submit new tally)
                  AccountDispatcher.removeAccount(key)

                  Ok(AuthenticationConsts.PUBLISH_TALLY_RESULTS_SUCCESSFUL)
                }
                case _ => InternalServerError(AuthenticationConsts.PUBLISH_TALLY_RESULTS_FAILED)
              }
            }).getOrElse {
              BadRequest(AuthenticationConsts.FAILED_TO_PERSIST_CANDIDATE_TALLIES)
            }
          }).getOrElse{
            BadRequest(AuthenticationConsts.VERIFICATION_KEY_MISSING_FROM_REQUEST)
          }
        }
      }.recoverTotal {
        e => BadRequest(AuthenticationConsts.BAD_TALLY_RESULTS_POST)
      }
    }
  }
}
