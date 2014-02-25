package unit

import org.scalatest._
import org.scalatest.junit.JUnitRunner
import org.junit.runner._

import helper.account.AccountDispatcher
import models.ecount.security.AccountSaltAndHash
import service.util.Crypto

@RunWith(classOf[JUnitRunner])
object AuthenticationSuite extends FlatSpec with Matchers {

  /*
   * Verified Account test data
   */
  // email matching test entry in users table
  val CORRECT_USER_LOGIN_EMAIL_VERIFIED = "example@gmail.com"

  // password matching test user table entry
  val USER_LOGIN_PASSWORD = "12345678A"

  // test entries verified account info
  val CORRECT_USER_LOGIN_ID_VERIFIED = 1090
  val CORRECT_USER_API_KEY_VERIFIED = 11800
  val CORRECT_USER_CONSTITUENCY_VERIFIED = "Galway-East"

  /*
   * Unverified Account test data
   */
  // unverified test account table entry
  val CORRECT_USER_LOGIN_EMAIL_UNVERIFIED = "example1@gmail.com"
  val CORRECT_USER_LOGIN_PASSWORD_UNVERIFIED = "12345678"

  // incorrect login test data
  val INCORRECT_USER_LOGIN_EMAIL = "failEmail@gmail.com"

  val CORRECT_SALT_AND_HASH_BYTE_SIZE = 32

  private def getHashAndSalt(password: String) = {
    Crypto.password(password)
  }

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

  "the login service" should "salt and hash users passwords" in {
    val (salt, hash) = getHashAndSalt(USER_LOGIN_PASSWORD)

    assert(salt.getBytes().length == CORRECT_SALT_AND_HASH_BYTE_SIZE)
    assert(hash.getBytes().length == CORRECT_SALT_AND_HASH_BYTE_SIZE)
  }

  it should "match the salt and hashed entries in the corresponding users table entry" in {
    val (salt, hash) = getHashAndSalt(USER_LOGIN_PASSWORD)

    val accSaH = AccountDispatcher.getSaltAndHash(CORRECT_USER_LOGIN_EMAIL_VERIFIED).getOrElse {
      throw new Exception
    }

    assert(accSaH.salt == salt)
    assert(accSaH.hash == hash)
  }
}
