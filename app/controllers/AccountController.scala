package controllers

import play.api.mvc._
import play.filters.csrf._

import helpers.FormHelper
import service.{MapDispatcher, Cache, AccountDispatcher, Mail}

object AccountController extends Controller {

  private val USER_SESSION_ID_KEY = "user.id"

  private val ERROR_NON_UNIQUE_EMAIL = "email address matches another user"
  private val ERROR_FAILED_AUTHENTICATION = "email or password is incorrect"

  private val CONSTITUENCIES = MapDispatcher.getConstituencies

  def login() = CSRFCheck {
    Action {
      implicit request => {
        FormHelper.loginForm.bindFromRequest.fold(
          formWithErrors => {
            BadRequest(views.html.main(CONSTITUENCIES,
              formWithErrors, FormHelper.registerForm))
          },
          loginData =>
            FormHelper.authenticateUser(loginData) match {
              case true =>
                Redirect(routes.ViewController.portalHome)
                .withSession(USER_SESSION_ID_KEY -> loginData.email)
              case false =>
                BadRequest(views.html.main(CONSTITUENCIES,
                  FormHelper.loginForm.withGlobalError(ERROR_FAILED_AUTHENTICATION),
                  FormHelper.registerForm))
            }
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

  def register =  CSRFCheck {
    Action { implicit request => {
      FormHelper.registerForm.bindFromRequest.fold(
        formWithErrors => {
          BadRequest(views.html.main(CONSTITUENCIES,
            FormHelper.loginForm, formWithErrors))
        },
        registerData => {
           FormHelper.registerUser(registerData) match {
            case Some(i) =>
              Redirect(routes.ViewController.confirmation(registerData.email))
            case _ =>
              BadRequest(views.html.main(CONSTITUENCIES,
                FormHelper.loginForm,
                FormHelper.registerForm.withGlobalError(ERROR_NON_UNIQUE_EMAIL)))
          }
        }
      )
     }
   }
  }
}
