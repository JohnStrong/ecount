package helpers

import play.api.data.Form
import play.api.data.Forms._

import persistence.ecount.PersistenceContext._
import persistence.ecount.Tally
import models.ecount.tallysys.VerificationDetailsExtractor
import models.ecount.stat.ElectionCandidateExtractor
import service.util.{Cache, Crypto}

case class RepresentativeAuthData(authenticationKey: String, username: String)

object TallyFormHelper {

  val authForm:Form[RepresentativeAuthData] = Form[RepresentativeAuthData] {
    mapping(
      "verification key" -> text,
      "username" -> text
    )(RepresentativeAuthData.apply)(RepresentativeAuthData.unapply)
  }

  def getAccountAccess(verificationKey: String, username: String) = {
    withConnection { implicit conn => {
      val vde = VerificationDetailsExtractor(verificationKey, username)
      val account = Tally.getAccountAccess(vde)

      account match {
        case Some(a) => {
          val sessId = Crypto.generateSession(username)
          Cache.cacheAccount(sessId, a)
          Some(sessId)
        }

        case _ => None
      }
    }}
  }

  def getElectionCandidates(constituencyId:Int, electionId:Int) = {
    withConnection { implicit conn => {
      val ece = ElectionCandidateExtractor(constituencyId, electionId)
      Tally.getElectionCandidates(ece).toList
    }}
  }

  def getSupervisedBallotBox(ballotBoxId:Int) = {
    withConnection{ implicit conn => {
      Tally.getBallotBox(ballotBoxId)
    }}
  }
}
