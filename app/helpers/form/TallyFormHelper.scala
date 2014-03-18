package helpers.form

import play.api.data.Form
import play.api.data.Forms._

import persistence.ecount.PersistenceContext._
import persistence.ecount.Tally
import models.tallysys.{RepresentativeAccount, NewRepresentativeAccount, ExistingRepresentativeAccount}
import service.util.Cache
import consts.tallysys.{SessionConsts, FormConsts}

object TallyFormHelper {

  private val minMax = FormConsts.USER_PASS_TEXT_LENGTH

  val authForm:Form[String] = Form[String] {
   "key" -> text
  }

  val RepresentativeRegisterForm = Form[NewRepresentativeAccount] {
    mapping(
      "username" -> nonEmptyText(minLength = minMax._1, maxLength = minMax._2),
      "fname" -> text,
      "surname" -> text,
      "password" -> tuple(
        "main" -> nonEmptyText(minLength = minMax._1, maxLength = minMax._2),
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
    "username" -> nonEmptyText(minLength = minMax._1, maxLength = minMax._2),
    "password" -> nonEmptyText(minLength = minMax._1, maxLength = minMax._2)
   )(RepresentativeAccount.apply)(RepresentativeAccount.unapply)
  }

  private def generateAccountSession(account: NewRepresentativeAccount) = {
    Console.println(SessionConsts.ACCOUNT_SESSION_ID + account.username)

    Cache.cacheAccount(SessionConsts.ACCOUNT_SESSION_ID + account.username, account)
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
