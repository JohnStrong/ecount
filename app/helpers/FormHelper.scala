package helpers

import play.api.data.Form
import play.api.data.Forms._
import service.{Cache, AccountDispatcher}
import play.api.mvc._

sealed trait FormBinding
case class LoginData(email:String, password:String) extends FormBinding
case class RegisterData(email:String, name: String, constituency: String, password: String) extends FormBinding

object FormHelper {

  val loginForm: Form[LoginData] = Form[LoginData](
    mapping(
      "email" -> text,
      "password" -> text
    )(LoginData.apply)(LoginData.unapply)
  )

  val registerForm: Form[RegisterData] = Form[RegisterData](
    mapping(
      "email" -> text,
      "name" -> text,
      "constituency" -> text,
      "password" -> tuple(
        "main" -> text(minLength=8, maxLength=16),
        "confirm" -> text
      ).verifying(
          "Passwords don't match", password => password._1 == password._2
        )
    )
    {
      (email, name, constituency, password) => RegisterData(email, name, constituency, password._1)
    }
    {
      registerData => Some(registerData.email, registerData.name, registerData.constituency, (registerData.password, ""))
    }
  )

  def authenticateUser(loginData: LoginData) = {

    def verifyLogin = {
      val email = loginData.email
      val password = loginData.password
      AccountDispatcher.getAccountDetails(email, password)
    }

    verifyLogin match {
      case Some(user) => {
        Cache.cacheUser(user)
        true
      }
      case _ => false
    }
  }

  def registerUser(registerData: RegisterData) = {

    def successfulRegistration(email: String, password: String) = {
      AccountDispatcher.isUniqueAccount(email) match {
        case true =>
          val update = AccountDispatcher.insertNewUnverifiedAccount(email, password)
          Some(update)
        case false =>
          None
      }
    }

    var email = registerData.email
    val password = registerData.password
    successfulRegistration(email, password)
  }
}

