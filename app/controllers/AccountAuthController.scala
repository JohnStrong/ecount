package controllers

import play.api.mvc._

import helpers.FormHelper
import service.{Cache, AccountDispatcher}
import models.ibatis.User

object AccountAuthController extends Controller {

  val UNAUTHORIZED_LOGIN_MGS = "invalid login"
  val USER_SESSION_ID_KEY = "user.id"

  def addUserToCache(user: User) = {
    Cache.cacheUser(user)
    List("",user.id).mkString
  }

  def verifyLoginInformation(loginData: helpers.LoginData) = {
    val email = loginData.email
    val password = loginData.password

    AccountDispatcher.getAccountDetails(email, password) match {
      case Some(u) => Some(addUserToCache(u))
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
          verifyLoginInformation(loginData) match {
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
          val password = registerData.password
          AccountDispatcher.insertNewUnverifiedAccount(email, password)
          Redirect(routes.ViewController.confirmation(email))
        }
      )
    }
  }
}
