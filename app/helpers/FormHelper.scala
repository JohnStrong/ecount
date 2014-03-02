package helpers

import play.api.data.Form
import play.api.data.Forms._
import play.api.mvc._
import service.dispatch.AccountDispatcher
import service.util.{Mail, Crypto, Cache}

sealed trait FormBinding
case class LoginData(email:String, password:String) extends FormBinding
case class RegisterData(email:String, password: String) extends FormBinding

object FormHelper {

  private val PASSWORD_VERIFICATION_FAILED_MESSAGE = "passwords do not match"

  val loginForm: Form[LoginData] = Form[LoginData](
    mapping(
      "email" -> email,
      "password" -> text
    )(LoginData.apply)(LoginData.unapply)
  )

  val registerForm: Form[RegisterData] = Form[RegisterData](
    mapping(
      "email" -> email,
      "password" -> tuple(
        "main" -> text(minLength=8, maxLength=16),
        "confirm" -> text
      ).verifying(
          PASSWORD_VERIFICATION_FAILED_MESSAGE, password => password._1 == password._2
      )
    )
    {
      (email, password) => RegisterData(email, password._1)
    }
    {
      registerData => Some(registerData.email, (registerData.password, ""))
    }
  )


  def verifyCorrectSecurityQuestion(email: String, securityQuestionAnswer: String) = {
    true
  }

  def authenticateUser(loginData: LoginData) = {

    def verifyLogin = {
      val email = loginData.email.toLowerCase
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
        case true => {

          // generate verification hash
          val verificationLink = Crypto.verificationLink()

          // add new user (unverified) to the system
          val update = AccountDispatcher.insertNewUnverifiedAccount(email.toLowerCase,
            password, verificationLink)

          // mail verification link to registered user
          Mail.sendVerificationEmail(email, verificationLink)

          Some(update)
        }
        case false =>
          None
      }
    }

    var email = registerData.email
    val password = registerData.password
    successfulRegistration(email, password)
  }
}

