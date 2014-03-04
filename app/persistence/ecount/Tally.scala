package persistence.ecount

import org.mybatis.scala.mapping._

import models.ecount.tallysys._
import models.ecount.stat.{ElectionCandidate, ElectionCandidateExtractor}

object Tally {

  val getAccountAccess = new SelectOneBy[VerificationDetailsExtractor, UserAccountAccess] {

    resultMap = new ResultMap[UserAccountAccess] {
      result(property = "electionId", column = "election_id")
      result(property = "constituencyId", column = "constituency_id")
      result(property = "ballotId", column = "ballot_id")
    }

    def xsql = <xsql>
      SELECT ua.election_id, ua.constituency_id, ua.ballot_id
      FROM tally_sys_verification as v,
      tally_sys_verified_users as u,
      tally_sys_user_access as ua
      WHERE v.verification_key = #{{verificationKey}}
      AND u.username = #{{username}}
      AND u.verification_key = v.verification_key
      AND ua.username = u.username
    </xsql>
  }

  val getElectionCandidates = new SelectListBy[ElectionCandidateExtractor, ElectionCandidate] {

    resultMap = new ResultMap[ElectionCandidate] {
      result(property = "id", column = "candidate_id")
      result(property = "name", column = "candidate_name")
    }

    def xsql = <xsql>
      SELECT c.candidate_id, c.candidate_name
      FROM stat_bank_tally_constituency_candidates as c,
      stat_bank_tally_election_to_const_candidates as ecc
      WHERE c.constituency_id = #{{constituencyId}}
      AND ecc.election_id = #{{electionId}}
      AND c.candidate_id = ecc.candidate_id
    </xsql>
  }

  val getBallotBox = new SelectOneBy[Int, ElectionBallotBox] {

    resultMap = new ResultMap[ElectionBallotBox] {
      result(property = "ballotTitle", column = "ballot_title")
      result(property = "dedId", column = "ded_id")
    }

    def xsql = <xsql>
      SELECT b.ded_id, b.ballot_title
      FROM tally_sys_ballot_box as b
      WHERE b.ballot_id = #{{id}}
    </xsql>
  }

  def bind = Seq(
    getAccountAccess,
    getElectionCandidates,
    getBallotBox)
}
