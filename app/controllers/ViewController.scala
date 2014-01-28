package controllers

import play.api.mvc._
import play.filters.csrf._

import helpers.FormHelper

object ViewController extends Controller {

  val UNAUTHORIZED_PORTAL_ACCESS_MG = "Oops, you are not connected"
  val USER_SESSION_ID_KEY = "user.id"

  def index = CSRFAddToken {
    Action { implicit request =>
      Ok(views.html.main(FormHelper.loginForm, FormHelper.registerForm)).withNewSession
    }
  }

  def portalHome() = Action {
    implicit request => {
      session.get(USER_SESSION_ID_KEY).map { user =>
        Ok(views.html.portal())
      }.getOrElse {
        Unauthorized(UNAUTHORIZED_PORTAL_ACCESS_MG)
      }
    }
  }

  def confirmation(email: String) = Action {
    Ok(views.html.confirmation(email))
  }

}