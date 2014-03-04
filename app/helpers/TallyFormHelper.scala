package helpers

import play.api.data.Form
import play.api.data.Forms._

import persistence.ecount.PersistenceContext._
import persistence.ecount.Tally
import models.ecount.tallysys.{RepresentativeAccount}
import models.ecount.stat.ElectionCandidateExtractor
import service.util.{Cache, Crypto}

object TallyFormHelper {

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

  private def generateAccountSession(implicit account: models.ecount.tallysys.RepresentativeAccount) = {
    val sessId = Crypto.generateSession(account.username)
    Cache.cacheAccount(sessId, account)
    Some(sessId)
  }

  def isValidKey(verificationKey:String) = {
    withConnection { implicit conn => {
      Tally.isValidVerificationKey(verificationKey) match {
        case Some(key) => true
        case _ => false
      }
    }}
  }

  def getBallotBoxes(verificationKey:String) = {
   withConnection { implicit conn =>
     Tally.getInactiveBallotBoxes(verificationKey)
   }
  }

  def createAccessAccount(implicit newAccount: models.ecount.tallysys.RepresentativeAccount) = {
    withConnection { implicit conn => {
     Tally.isUnique(newAccount.username) match {
       case None => {
         Tally.insertNewAccount(newAccount)
         Tally.lockBallotBox(newAccount.ballotBoxId)
         generateAccountSession
       }
       case _ => None
     }
    }}
  }

  def getElectionCandidates(ballotBoxId:Int) = {
    withConnection { implicit conn => {
      Tally.getElectionCandidates(ballotBoxId).toList
    }}
  }
}
