package helpers

import play.api.data.Form
import play.api.data.Forms._

sealed trait FormBinding
case class LoginData(email:String, password:String) extends FormBinding
case class RegisterData(email:String, password: String) extends FormBinding

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
}

