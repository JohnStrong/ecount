package controllers

import play.api.mvc._
import play.filters.csrf._

import helpers.FormHelper
import service.util.{Cache}
import service.dispatch._

object AccountController extends Controller {

  private val USER_SESSION_ID_KEY = "user.id"

  private val ERROR_NON_UNIQUE_EMAIL = "oops, email address matches another user"
  private val ERROR_FAILED_AUTHENTICATION = "email or password is incorrect"
  private val ERROR_HONEYPOT_FIELD_FILLED = "registration failed, are you a robot?"

  private val FLASH_SESSION_LOGOUT_MESSAGE = "you have been logged out"

  def login() = CSRFCheck {
    Action {
      implicit request => {
        FormHelper.loginForm.bindFromRequest.fold(
          formWithErrors => {
            BadRequest(views.html.auth(formWithErrors, FormHelper.registerForm))
          },
          loginData =>
            FormHelper.authenticateUser(loginData) match {
              case true =>
                Redirect(routes.ViewController.index)
                .withSession(USER_SESSION_ID_KEY -> loginData.email.toLowerCase)
              case false =>
                BadRequest(views.html.auth(
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

      // redirect to home and invalidate user session, add logout message
      Redirect(routes.ViewController.auth).flashing {
        "logout" -> FLASH_SESSION_LOGOUT_MESSAGE
      }.withNewSession
    }
  }

  def register =  CSRFCheck {
    Action { implicit request => {
      FormHelper.registerForm.bindFromRequest.fold(
        formWithErrors => {
          BadRequest(views.html.auth(FormHelper.loginForm, formWithErrors))
        },
        registerData => {
          // verify that registration is not spam
          FormHelper.registerUser(registerData) match {
            case Some(i) => {
              Redirect(routes.ViewController.confirmation(registerData.email))
            }
            case _ =>
              BadRequest(views.html.auth(FormHelper.loginForm,
                FormHelper.registerForm.withGlobalError(ERROR_NON_UNIQUE_EMAIL)))
          }
        }
      )
    }}
  }

  def verifyAccount(verificationLink: String) = Action {
    AccountDispatcher.verifyAccount(verificationLink)
    Redirect(routes.ViewController.auth)
  }
}
