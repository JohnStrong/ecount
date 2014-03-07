package controllers

import play.api.mvc._
import play.filters.csrf._

import helpers.{TallyFormHelper, FormErrors}
import service.dispatch.tallysys.AccountDispatcher

object TallyController extends Controller {

  private val DASHBOARD_SESSION_KEY = "sys.account"
  private val VERIFICATION_KEY_COOKIE_ID = "verificationKey"

  private val BAD_TALLY_RESULTS_POST = "poor request. please do not try that again."

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

  def receiveTally = Action {
    implicit request => {
      val body = request.body
      val jsonBody = body.asJson

      jsonBody.map { json =>
        Ok("works...")
      }.getOrElse {
        BadRequest(BAD_TALLY_RESULTS_POST)
      }
    }
  }
}
