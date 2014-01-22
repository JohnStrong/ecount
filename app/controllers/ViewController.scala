package controllers

import play.api.mvc._

import play.api.data._
import play.api.data.Forms._

import persistence.AccountStore
import persistence.PersistenceContext._

/**
 * @define
 *    core navigation controller that processes requests to all core features of the application.
 */

sealed trait Auth

case class LoginData(email:String, password:String) extends Auth

case class RegisterData(
username: String,
email:String,
constituency:String,
password: String,
confirmPassword: String) extends Auth

object ViewController extends Controller {

  val loginForm: Form[LoginData] = Form(
    mapping(
      "email" -> text,
      "password" -> text
    )(LoginData.apply)(LoginData.unapply)
  )

  val registerForm: Form[RegisterData] = Form(
    mapping(
      "username" -> text,
      "email" -> text,
      "constituency" -> text,
      "password" -> tuple(
        "main" -> text(minLength=8, maxLength=16),
        "confirm" -> text
      ).verifying(
        "Passwords don't match", password => password._1 == password._2
      )
    )
    {
      (username, email, constituency, password) => RegisterData(username, email, constituency, password._1, password._2)
    }
    {
      (rd) => Some(rd.username, rd.email, rd.constituency, (rd.password, rd.confirmPassword))
    }
  )

  def index = Action {
    Ok(views.html.main(loginForm, registerForm))
  }

  def login() = Action {
    implicit request => {

      def getAccountDetails(userEmail:String) = {
        withConnection { implicit conn =>
            AccountStore.getAccountDetails(userEmail)
        }
      }

      loginForm.bindFromRequest.fold(
        formWithErrors => {
          BadRequest(views.html.main(formWithErrors, registerForm))
        },
        loginData => {
          val userEmail = loginData.email
          getAccountDetails(userEmail) match {
            case Some(u) => Ok(views.html.portal(u))
            case None => Redirect(routes.ViewController.index())
          }
        }
      )
    }
  }

  def register = Action {
    implicit request => {

      def insertNewAccount(user: models.User) = {
        withConnection { implicit conn =>
          AccountStore.insertNewAccount(user)
        }
      }

      registerForm.bindFromRequest.fold(
        formWithErrors => {
          BadRequest(views.html.main(loginForm, formWithErrors))
        },
        registerData => {
          val user = models.User.apply(registerData.email, registerData.constituency)
          insertNewAccount(user)

          Redirect(routes.ViewController.confirmation(user.email))
        }
      )
    }
  }

  def confirmation(email: String) = Action {
    Ok(views.html.confirmation(email))
  }

}