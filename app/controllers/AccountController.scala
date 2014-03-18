package controllers

import play.api.mvc._
import play.filters.csrf._

import helpers.FormHelper
import service.util.Cache
import service.dispatch._

object AccountController extends Controller {

  private val USER_SESSION_ID_KEY = "user.id"

  private val ERROR_NON_UNIQUE_EMAIL = "oops, email address matches another user"
  private val ERROR_FAILED_AUTHENTICATION = "email or password is incorrect"

  private val FLASH_SESSION_LOGOUT_MESSAGE = "you have been logged out"
  private val FLASH_FORGOTTEN_PASSWORD_MESSAGE = "forgotten your password? click here to have it"

  def login() = CSRFCheck {
    Action {
      implicit request => {
        FormHelper.loginForm.bindFromRequest.fold(
          formWithErrors => {
            BadRequest(views.html.auth(formWithErrors, FormHelper.registerForm))
          },
          loginData => {
            FormHelper.authenticateUser(loginData) match {
              case Some(id) =>
                Redirect(routes.ViewController.index).withSession {
                  session + (USER_SESSION_ID_KEY -> id)
                }
              case _ => {
                BadRequest(views.html.auth(
                  FormHelper.loginForm.withGlobalError(ERROR_FAILED_AUTHENTICATION),
                  FormHelper.registerForm,
                  None, Some(FLASH_FORGOTTEN_PASSWORD_MESSAGE)
                ))
              }
            }
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

      Redirect(routes.ViewController.auth).flashing {
        "auth message" -> FLASH_SESSION_LOGOUT_MESSAGE
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

  def passwordReset = CSRFCheck {
    Action { implicit request => {
      FormHelper.registerForm.bindFromRequest.fold(
        formWithErrors => {
           BadRequest(views.html.resetPassword(formWithErrors))
        },
        passwordResetData => {
          // TODO...
          Ok("password reset link has been sent to your email address")
        }
      )
    }}
  }

  def verifyAccount(verificationLink: String) = Action {
    AccountDispatcher.verifyAccount(verificationLink)
    Redirect(routes.ViewController.auth)
  }
}
