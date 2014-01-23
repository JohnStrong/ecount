package controllers

import play.api.mvc._

import play.api.data._
import play.api.data.Forms._
import service.Cache

import persistence.AccountStore
import persistence.PersistenceContext._

case class LoginData(email:String, password:String)
case class RegisterData(email:String, password: String)

object ViewController extends Controller {

  val  UNAUTHORIZED_LOGIN_MGS = "invalid login"

  val loginForm: Form[LoginData] = Form(
    mapping(
      "email" -> text,
      "password" -> text
    )(LoginData.apply)(LoginData.unapply)
  )

  val registerForm: Form[RegisterData] = Form(
    mapping(
      "email" -> text,
      "password" -> tuple(
        "main" -> text(minLength=8, maxLength=16),
        "confirm" -> text
      ).verifying(
        "Passwords don't match", password => password._1 == password._2
      )
    )
    {
      (email, password) => RegisterData(email, password._1)
    }
    {
      registerData => Some(registerData.email, (registerData.password, ""))
    }
  )

  def getAccountDetails(userEmail:String) = {
    withConnection { implicit conn =>
      AccountStore.getAccountDetails(userEmail)
    }
  }

 def insertNewAccount(userEmail: String) = {
    withConnection { implicit conn =>
      AccountStore.insertNewAccount(userEmail)
    }
  }

  def index = Action {
    Ok(views.html.main(loginForm, registerForm))
  }

  def login() = Action {
    implicit request => {
      loginForm.bindFromRequest.fold(
        formWithErrors => {
          BadRequest(views.html.main(formWithErrors, registerForm))
        },
        loginData => {
          val userEmail = loginData.email
          getAccountDetails(userEmail) match {
            case Some(u) =>
              Cache.cacheUser(u)
              Redirect(routes.PortalController.portalHome())
            case None =>
              Unauthorized(UNAUTHORIZED_LOGIN_MGS)
          }
        }
      )
    }
  }

  def logout = TODO

  def register = Action {
    implicit request => {
      registerForm.bindFromRequest.fold(
        formWithErrors => {
          BadRequest(views.html.main(loginForm, formWithErrors))
        },
        registerData => {
          var email = registerData.email
          insertNewAccount(email)

          Redirect(routes.ViewController.confirmation(email))
        }
      )
    }
  }

  def confirmation(email: String) = Action {
    Ok(views.html.confirmation(email))
  }

}