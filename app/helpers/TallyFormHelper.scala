package helpers

import play.api.data.Form
import play.api.data.Forms._

import persistence.ecount.PersistenceContext._
import persistence.ecount.Tally
import models.ecount.tallysys.{RepresentativeAccount}
import service.util.{Cache}

object TallyFormHelper {

  val ACCOUNT_SESSION_ID = "tallysys.account."

  val authForm:Form[String] = Form[String] {
   "key" -> text
  }

  val RepresentativeForm:Form[RepresentativeAccount] = Form[RepresentativeAccount] {
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

  private def generateAccountSession(account: models.ecount.tallysys.RepresentativeAccount) = {
    Console.println(ACCOUNT_SESSION_ID + account.username)

    Cache.cacheAccount(ACCOUNT_SESSION_ID + account.username, account)
    Some(account.username)
  }

  def createAccessAccount(implicit newAccount: models.ecount.tallysys.RepresentativeAccount) = {
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
