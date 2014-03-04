package controllers

import play.api.mvc._
import play.filters.csrf._

import helpers.{TallyFormHelper, FormErrors}
import service.util.Cache

object TallyController extends Controller {

  private val DASHBOARD_SESSION_KEY = "sys.account"

  def index = CSRFAddToken {
    Action { implicit request => {
      if(session.get(DASHBOARD_SESSION_KEY).isDefined) {
        Redirect(routes.TallyController.dashboard)
      } else {
        Ok(views.html.tally(TallyFormHelper.authForm))
      }
    }}
  }

  def verification = CSRFCheck {
    Action { implicit request => {
      TallyFormHelper.authForm.bindFromRequest.fold(
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
              /*
              getDashboardDependencies(account) match {
               case Some(dependencies) => {
                  Ok(views.html.tallyDashboard(dependencies._1, dependencies._2))
                }
                case _ => {
                  val formWithGlobalError = FormErrors.noBallotBoxForAccount
                  BadRequest(views.html.tally(formWithGlobalError)).withNewSession
                }
              }
              */
              Ok("")
            }
            case _ => {
              val formWithGlobalError = FormErrors.cacheFailure
              Ok(views.html.tally(formWithGlobalError))
            }
          }
        }
        case _ => Redirect(routes.TallyController.index)
      }
    }}
  }
}
