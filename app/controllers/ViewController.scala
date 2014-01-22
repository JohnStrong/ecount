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
case class RegisterData(name:String, email:String, password:String) extends Auth

object ViewController extends Controller {

  val loginForm = Form(
    mapping(
      "email" -> text,
      "password" -> text
    )(LoginData.apply)(LoginData.unapply)
  )

  val registerForm = Form(
    mapping(
      "name" -> text,
      "email" -> text,
      "password" -> text
    )(RegisterData.apply)(RegisterData.unapply)
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
          // todo: hash input password and compare with entries in the database
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

      def insertNewAccount() = {
        withConnection { implicit conn =>
          // todo: implement update user table with new account
        }
      }

      registerForm.bindFromRequest.fold(
        formWithErrors => {
          BadRequest(views.html.main(loginForm, formWithErrors))
        },
        registerData => {
          // todo: update users table with new entry after hashing password
          Redirect(routes.ViewController.confirmation(registerData.email))
        }
      )
    }
  }

  def confirmation(email: String) = Action {
    Ok(views.html.confirmation(email))
  }

}