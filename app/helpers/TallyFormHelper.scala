package helpers

import play.api.data.Form
import play.api.data.Forms._

import persistence.ecount.PersistenceContext._
import persistence.ecount.Tally
import models.tallysys.{RepresentativeAccount, NewRepresentativeAccount, ExistingRepresentativeAccount}
import service.util.{Cache}

object TallyFormHelper {

  val ACCOUNT_SESSION_ID = "tallysys.account."

  val authForm:Form[String] = Form[String] {
   "key" -> text
  }

  val RepresentativeRegisterForm = Form[NewRepresentativeAccount] {
    mapping(
      "username" -> text,
      "fname" -> text,
      "surname" -> text,
      "password" -> tuple(
        "main" -> text(minLength = 6),
        "confirm" -> text
      ).verifying(
       "passwords do not match", password => password._1 == password._2
      ),
      "ballot box" -> number
    )
    {
      (username, fname, surname, password, ballotBoxId) =>
        RepresentativeAccount.apply(username, fname, surname, password._1, ballotBoxId)
    }
    {
       ra => Some(ra.username, ra.fname, ra.surname, ("", ""), ra.ballotBoxId)
    }
  }

  val RepresentativeLoginForm = Form[ExistingRepresentativeAccount] {
   mapping(
    "username" -> text,
    "password" -> text
   )(RepresentativeAccount.apply)(RepresentativeAccount.unapply)
  }

  private def generateAccountSession(account: NewRepresentativeAccount) = {
    Console.println(ACCOUNT_SESSION_ID + account.username)

    Cache.cacheAccount(ACCOUNT_SESSION_ID + account.username, account)
    Some(account.username)
  }

  def createAccessAccount(implicit newAccount: NewRepresentativeAccount) = {
    withConnection { implicit conn => {
     Tally.isUnique(newAccount.username) match {
       case None => {
         Tally.insertNewAccount(newAccount)
         Tally.lockBallotBox(newAccount.ballotBoxId)
         generateAccountSession (newAccount)
       }
       case _ => None
     }
    }}
  }
}
