package controllers

import play.api.mvc._

import play.api.data._
import play.api.data.Forms._

/**
 * @define
 *    core navigation controller that processes requests to all core features of the application.
 */

sealed trait Auth
case class LoginData(email:String, password:String) extends Auth
case class RegisterData(email:String, name:String, password:String) extends Auth

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

  def portal = Action {
    Ok(views.html.portal())
  }
}