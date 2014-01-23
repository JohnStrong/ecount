package controllers

/**
 * Created by User 1 on 06/01/14.
 */

import play.api.mvc._

import helpers.FormHelper
import service.{Cache, AccountDispatcher}

object AccountAuthController extends Controller {

  val UNAUTHORIZED_LOGIN_MGS = "invalid login"
  val USER_SESSION_ID_KEY = "user.id"

  def addUserToCache(loginData: helpers.LoginData):Option[String] = {
    val userEmail = loginData.email

    AccountDispatcher.getAccountDetails(userEmail) match {
      case Some(u) =>  {
        Cache.cacheUser(u)
        Some(List("",u.id).mkString)
      }
      case _ =>  None
    }
  }

  def login() = Action {
    implicit request => {
      FormHelper.loginForm.bindFromRequest.fold(
        formWithErrors => {
          BadRequest(views.html.main(formWithErrors, FormHelper.registerForm))
        },
        loginData => {
          addUserToCache(loginData) match {
            case Some(id) =>
              Redirect(routes.ViewController.portalHome())
                .withSession(USER_SESSION_ID_KEY -> id)
            case _ =>
              Unauthorized(UNAUTHORIZED_LOGIN_MGS)
          }
        }
      )
    }
  }

  def logout = Action {
    implicit request => {
      session.get(USER_SESSION_ID_KEY).map{user =>
        Cache.removeCachedUser(user)
      }

      Redirect(routes.ViewController.index()).withNewSession
    }
  }

  def register = Action {
    implicit request => {
      FormHelper.registerForm.bindFromRequest.fold(
        formWithErrors => {
          BadRequest(views.html.main(FormHelper.loginForm, formWithErrors))
        },
        registerData => {
          var email = registerData.email
          AccountDispatcher.insertNewAccount(email)
          Redirect(routes.ViewController.confirmation(email))
        }
      )
    }
  }
}
