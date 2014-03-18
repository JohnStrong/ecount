package service.dispatch.tallysys

import persistence.ecount.Tally
import persistence.ecount.PersistenceContext._

import models.tallysys.implicits.Candidate
import models.tallysys.ElectionBallotBox

sealed trait CandidateResult

case class NewCandidateResult(
  candidateId:Int,
  candidateTally:Int,
  ballotBoxId:Int,
  dedId:Int,
  electionId:Int
) extends CandidateResult

case class UpdatedCandidateResult(resultsId:Int, tally:Int) extends CandidateResult
case class PartialTally(candidateId:Int, dedId:Int) extends CandidateResult

object ResultsDispatcher {

  private def getMaybePartialTallyForCandidate(candidateId:Int, dedId:Int) = {
   withConnection { implicit conn => {
     val partial = PartialTally(candidateId, dedId)
     Tally.hasPartialTallyForCandidate(partial)
   }}
  }

  private def newCandidateTallyResult(candidate:Candidate, ballot:ElectionBallotBox) = {
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

  private def addCandidateTally(candidate:Candidate, ballot:ElectionBallotBox) = {
    getMaybePartialTallyForCandidate(candidate.id, ballot.dedId).map {
      case resultsId => updateCandidateTallyResult(resultsId, candidate.tally)
    }.getOrElse {
      newCandidateTallyResult(candidate, ballot)
    }
  }

  def addTalliesForCandidates(ballot:ElectionBallotBox, candidates:List[Candidate]) = {
    candidates.foreach { candidate =>
      addCandidateTally(candidate, ballot)
    }
  }
}
