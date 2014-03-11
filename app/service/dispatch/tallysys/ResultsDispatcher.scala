package service.dispatch.tallysys

import controllers.Candidate

import persistence.ecount.Tally
import persistence.ecount.PersistenceContext._

import models.ecount.tallysys.ElectionBallotBox

sealed trait CandidateResult

case class NewCandidateResult(
  candidateId:Int,
  candidateTally:Int,
  ballotBoxId:Int,
  dedId:Int,
  electionId:Int
) extends CandidateResult

case class UpdatedCandidateResult(resultsId:Int, tally:Int) extends CandidateResult

object ResultsDispatcher {

  private def getMaybePartialTallyForCandidate(candidateId:Int) = {
   withConnection { implicit conn => {
     Tally.hasPartialTallyForCandidate(candidateId)
   }}
  }

  private def newCandidateTallyResult(candidate:Candidate)(implicit ballot:ElectionBallotBox) = {
    withConnection { implicit conn => {
      val result = NewCandidateResult(candidate.id, candidate.tally,
        ballot.id, ballot.dedId, ballot.electionId)
      Tally.insertNewCandidateTallyResult(result)
    }}
  }

  private def updateCandidateTallyResult(resultsId:Int, tally:Int) = {
    withConnection { implicit conn => {
      val result = UpdatedCandidateResult(resultsId, tally)
      Tally.updateCandidateTallyResult(result)
    }}
  }

  private def addCandidateTally(candidate:Candidate)(implicit ballot:ElectionBallotBox) = {
    getMaybePartialTallyForCandidate(candidate.id).map {
      case resultsId => updateCandidateTallyResult(resultsId, candidate.tally)
    }.getOrElse {
      newCandidateTallyResult(candidate)
    }
  }

  def addTalliesForCandidates(ballot:ElectionBallotBox, candidates:List[Candidate]) = {
    candidates.foreach { candidate =>
      implicit val b = ballot
      addCandidateTally(candidate)
    }
  }
}
