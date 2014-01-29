package controllers

import play.api.mvc._
import play.filters.csrf._

import helpers.FormHelper
import service.{Cache, AccountDispatcher, Mail}

object AccountController extends Controller {

  val UNAUTHORIZED_LOGIN_MGS = "invalid login"
  val USER_SESSION_ID_KEY = "user.id"

  private def AuthenticateUser(loginData: helpers.LoginData) = {

    def verifyLogin = {
      val email = loginData.email
      val password = loginData.password
      AccountDispatcher.getAccountDetails(email, password)
    }

    verifyLogin match {
     case Some(user) => {
       Cache.cacheUser(user)
       Redirect(routes.ViewController.portalHome)
         .withSession(USER_SESSION_ID_KEY -> user.email)
     }
     case _ =>
       Unauthorized(UNAUTHORIZED_LOGIN_MGS)
    }
  }

  private def successfulRegistration(email: String, password: String) = {
    AccountDispatcher.isUniqueAccount(email) match {
      case true =>
        val update = AccountDispatcher.insertNewUnverifiedAccount(email, password)
        //Mail.sendEmailVerification(email)
        Some(update)
      case false =>
        None
    }
  }

  def login() = CSRFCheck {
    Action {
      implicit request => {
        FormHelper.loginForm.bindFromRequest.fold(
          formWithErrors => {
            BadRequest(views.html.main(formWithErrors, FormHelper.registerForm))
          },
          loginData => AuthenticateUser(loginData)
        )
      }
    }
  }

  def logout = Action {
    implicit request => {
      session.get(USER_SESSION_ID_KEY).map{user =>
        Cache.removeCachedUser(user)
      }

      Redirect(routes.ViewController.index())
    }
  }

  // todo: do something better when user fails the unique account check
  def register =  CSRFCheck {
    Action { implicit request => {
      FormHelper.registerForm.bindFromRequest.fold(
        formWithErrors => {
          BadRequest(views.html.main(FormHelper.loginForm, formWithErrors))
        },
        registerData => {
          var email = registerData.email
          val password = registerData.password
          successfulRegistration(email, password) match {
            case Some(i) =>
              Redirect(routes.ViewController.confirmation(email))
            case _ =>
              BadRequest(views.html.main(
                FormHelper.loginForm, FormHelper.registerForm))
          }
        }
      )
     }
   }
  }
}
