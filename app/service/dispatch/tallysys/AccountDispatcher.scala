package service.dispatch.tallysys

import models.tallysys.{ExistingRepresentativeAccount, NewRepresentativeAccount}

import persistence.ecount.Tally
import persistence.ecount.PersistenceContext._
import service.util.{Cache, Crypto}

case class CandidateExtractor(electionId:Int, constituencyId:Int)

object AccountDispatcher {

  private def getMaybeAccount(username:String) = {
    withConnection { implicit conn => {
      Tally.getAccountByUsername(username)
    }}
  }

  private def checkHash(unhashed:String, account:NewRepresentativeAccount) = {
    val hash = Crypto.password(unhashed, () => account.salt)._2

    hash.equals(account.hash) match {
      case true => Some(account)
      case _ => None
    }
  }

  def getElectionByBallotBoxId(ballotBoxId:Int) = {
    withConnection { implicit conn => {
      Tally.getElectionById(ballotBoxId)
    }}
  }
  def getElectionCandidates(electionId:Int, constituencyId:Int) = {
    withConnection { implicit conn => {
       val ce = CandidateExtractor(electionId, constituencyId)
       Tally.getElectionCandidates(ce).toList
    }}
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
      Console.println(verificationKey)
      Tally.getInactiveBallotBoxes(verificationKey)
    }
  }

  def getAccount(sessId:String) = {
    val maybeAccount = Cache.getAccountFromCache(sessId)

    maybeAccount match {
      case Some(account) => Some(account)
      case _ => {
        getMaybeAccount(sessId) match {
          case Some(account) => Some(account)
          case _ => None
        }
      }
    }
  }

  def getAccountWithVerification(login:ExistingRepresentativeAccount) = {
     getMaybeAccount(login.username).map {
       account =>
        checkHash(login.password, account)
     }.getOrElse {
      None
     }
  }

  def removeAccount(username:String) = {
    withConnection { implicit conn =>
      Tally.deleteAccountByUsername(username)
    }
  }

  def getBallotBoxElectionDependencies(sessId:String) = {
    withConnection { implicit conn => {
      getAccount(sessId).map{account =>
        Tally.getBallotBoxElectionDetails(account.ballotBoxId)
      }.getOrElse{
        None
      }
    }}
  }

  def getCountyIdForConstituency(constituencyId:Int) = {
    withConnection { implicit conn =>
      Tally.getCountyIdForConstituency(constituencyId)
    }
  }
}
