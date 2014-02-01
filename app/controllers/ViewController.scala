package controllers

import play.api.mvc._
import play.filters.csrf._

import helpers.FormHelper
import service.dispatch.MapDispatcher

object ViewController extends Controller {

  private val CONSTITUENCIES = MapDispatcher.getConstituencies
  private val SESSION_ID_KEY = "user.id"

  private def getFormDependencies = {
    (CONSTITUENCIES, FormHelper.loginForm, FormHelper.registerForm)
  }

  def index = CSRFAddToken {
    Action { implicit request =>
      val (constituencies, loginForm, registerForm) = getFormDependencies
      Ok(views.html.main(constituencies, loginForm, registerForm)).withNewSession
    }
  }

  def auth() = CSRFAddToken {
    Action { implicit request =>
      val (constituencies, loginForm, registerForm) = getFormDependencies
      Ok(views.html.auth(constituencies, loginForm, registerForm))
    }
  }

  def portalHome() = Action {
    implicit request => {
      session.get(SESSION_ID_KEY).isDefined match {
        case true => Ok(views.html.portal())
        case false => Redirect(routes.ViewController.auth())
      }
    }
  }

  def confirmation(email: String) = Action {
    Ok(views.html.confirmation(email))
  }

}