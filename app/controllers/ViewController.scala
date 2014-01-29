package controllers

import play.api.mvc._
import play.filters.csrf._

import helpers.FormHelper
import service.MapDispatcher

object ViewController extends Controller {

 private val CONSTITUENCIES = MapDispatcher.getConstituencies

  def index = CSRFAddToken {
    Action { implicit request =>
      Ok(views.html.main(CONSTITUENCIES, FormHelper.loginForm, FormHelper.registerForm)).withNewSession
    }
  }

  def portalHome() = Action {
    implicit request => {
      Ok(views.html.portal())
    }
  }

  def confirmation(email: String) = Action {
    Ok(views.html.confirmation(email))
  }

}