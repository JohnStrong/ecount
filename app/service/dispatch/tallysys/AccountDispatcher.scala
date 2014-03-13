package service.dispatch.tallysys

import persistence.ecount.Tally
import persistence.ecount.PersistenceContext._
import service.util.Cache

object AccountDispatcher {

  private def getMaybeAccount(username:String) = {
    withConnection { implicit conn => {
      Tally.getAccountByUsername(username)
    }}
  }

  def getElectionByBallotBoxId(ballotBoxId:Int) = {
    withConnection { implicit conn => {
      Tally.getElectionById(ballotBoxId)
    }}
  }
  def getElectionCandidates(electionId:Int) = {
    withConnection { implicit conn => {
       Tally.getElectionCandidates(electionId).toList
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

    Console.println(sessId)
    Console.println(maybeAccount)

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
