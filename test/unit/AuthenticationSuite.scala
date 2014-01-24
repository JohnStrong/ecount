package unit

import org.scalatest._
import org.scalatest.junit.JUnitRunner
import org.junit.runner._

import helper.account.AccountDispatcher

@RunWith(classOf[JUnitRunner])
object AuthenticationSuite extends FlatSpec with Matchers {

  val USER_LOGIN_PASSWORD = "12345678A"

  val CORRECT_USER_LOGIN_EMAIL_VERIFIED = "example@gmail.com"
  val CORRECT_USER_LOGIN_ID_VERIFIED = 1090
  val CORRECT_USER_API_KEY_VERIFIED = 11800
  val CORRECT_USER_CONSTITUENCY_VERIFIED = "Galway-East"

  val CORRECT_USER_LOGIN_EMAIL_UNVERIFIED = "example1@gmail.com"
  val CORRECT_USER_LOGIN_PASSWORD_UNVERIFIED = "12345678"

  val INCORRECT_USER_LOGIN_EMAIL = "failEmail@gmail.com"

  "The login service" should "allow users access to the portal when given correct information" in {
    val user = AccountDispatcher.getAccountDetails(
      CORRECT_USER_LOGIN_EMAIL_VERIFIED) getOrElse {
      throw new Exception
    }

    user.email should be (CORRECT_USER_LOGIN_EMAIL_VERIFIED)
  }

  it should "deny unregistered users access to the system" in {
    AccountDispatcher.getAccountDetails(INCORRECT_USER_LOGIN_EMAIL) match {
      case Some(u) => throw new Exception
      case None => assert(true)
    }
  }

  it should "yield the correct user account information on a success auth" in {
    val user = AccountDispatcher.getAccountDetails(
      CORRECT_USER_LOGIN_EMAIL_VERIFIED).getOrElse{
      throw new Exception
    }

    user.email should be (CORRECT_USER_LOGIN_EMAIL_VERIFIED)
    user.id  should be (CORRECT_USER_LOGIN_ID_VERIFIED)
    user.apiKey should be (CORRECT_USER_API_KEY_VERIFIED)
    user.constituency should be (CORRECT_USER_CONSTITUENCY_VERIFIED)
  }

  it should "not give an unverified user access to the portal" in {
    AccountDispatcher.getAccountDetails(
      CORRECT_USER_LOGIN_EMAIL_UNVERIFIED
    ) match {
      case Some(u) => throw new Exception
      case None =>  assert(true)
    }
  }
}
