package controllers

import play.api.mvc._
import play.filters.csrf._

import helpers.FormHelper
import service.{AccountDispatcher, Cache}

object ViewController extends Controller {

  val UNAUTHORIZED_PORTAL_ACCESS_MG = "Oops, you are not connected"
  val USER_SESSION_ID_KEY = "user.id"

  def index = CSRFAddToken {
    Action { implicit request =>
      Ok(views.html.main(FormHelper.loginForm, FormHelper.registerForm)).withNewSession
    }
  }

  def getAccountDetails(sessId: String) = {
    Cache.getUserFromCache(sessId) match {
      case Some(user) => Some(user)
      case _ => AccountDispatcher.getAccountDetailsAfterCacheFailure(sessId)
    }
  }

  def portalHome() = Action {
    implicit request => {
      session.get(USER_SESSION_ID_KEY).map { sessId =>
        getAccountDetails(sessId) match {
          case Some(user) => Ok(views.html.portal(user))
          case _ => Unauthorized(UNAUTHORIZED_PORTAL_ACCESS_MG)
        }
      }.getOrElse {
        Unauthorized(UNAUTHORIZED_PORTAL_ACCESS_MG)
      }
    }
  }

  def confirmation(email: String) = Action {
    Ok(views.html.confirmation(email))
  }

}