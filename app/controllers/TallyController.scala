package controllers

import play.api.mvc._
import play.filters.csrf._

import helpers.{TallyFormHelper, FormErrors}
import service.util.Cache

object TallyController extends Controller {

  private val DASHBOARD_SESSION_KEY = "sys.account"

  private val VERIFICATION_KEY_COOKIE_ID = "verificationKey"

  def index = CSRFAddToken {
    Action { implicit request => {
      if(request.cookies.get(VERIFICATION_KEY_COOKIE_ID).isDefined) {
        if(session.get(DASHBOARD_SESSION_KEY).isDefined) {
          Redirect(routes.TallyController.dashboard)
        } else {
          Ok(views.html.tally(TallyFormHelper.RepresentativeForm))
        }
      } else {
        Ok(views.html.tallyVerification(TallyFormHelper.authForm))
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
          if(TallyFormHelper.isValidKey(verificationKey)) {
            Ok(views.html.tally(TallyFormHelper.RepresentativeForm)).withCookies{
              Cookie(VERIFICATION_KEY_COOKIE_ID, verificationKey)
            }
          } else {
            Ok("verification failed")
          }
        }
      )
    }}
  }

  def access = CSRFCheck {
    Action { implicit request => {
      TallyFormHelper.RepresentativeForm.bindFromRequest.fold(
        formWithErrors => {
         BadRequest(views.html.tally(formWithErrors))
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
              val formWithGlobalError = FormErrors.accountRegistrationFailed
              BadRequest(views.html.tally(formWithGlobalError))
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
          Cache.getAccountFromCache(sessId) match {
            case Some(account) => {
              val ballotBoxId = account.ballotBoxId
              val candidates = TallyFormHelper.getElectionCandidates(ballotBoxId)
              Ok(views.html.tallyDashboard(candidates))
            }
            case _ => {
              val formWithGlobalError = FormErrors.cacheFailure
              Ok(views.html.tally(formWithGlobalError)).withNewSession
            }
          }
        }
        case _ => Redirect(routes.TallyController.index)
      }
    }}
  }
}
