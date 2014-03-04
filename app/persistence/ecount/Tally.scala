package persistence.ecount

import org.mybatis.scala.mapping._

import models.ecount.tallysys._
import models.ecount.stat.{ElectionCandidate, ElectionCandidateExtractor}

object Tally {

  val getInactiveBallotBoxes = new SelectListBy[String, ElectionBallotBox] {
    resultMap = new ResultMap[ElectionBallotBox] {
      result(property = "id", column = "ballot_box_id")
      result(property = "title", column = "ballot_title")
    }

    def xsql = <xsql>
      SELECT b.ballot_box_id, b.ballot_title
      FROM tally_sys_ballot_box as b, tally_sys_verification as v
      WHERE v.verification_key = #{{key}}
      AND b.verification_id = v.verification_id
      AND b.active = 'false'
    </xsql>
  }

  val isValidVerificationKey = new SelectOneBy[String, String] {
    def xsql = <xsql>
      SELECT verification_key
      FROM tally_sys_verification
      WHERE verification_key = #{{key}}
    </xsql>
  }

  val isUnique = new SelectOneBy[String, String] {
    def xsql = <xsql>
    SELECT username
    FROM tally_sys_user_access
    WHERE username = #{{username}}
    </xsql>
  }

  val insertNewAccount = new Insert[RepresentativeAccount] {
    def xsql = <xsql>
     INSERT INTO tally_sys_user_access
     VALUES (#{{username}}, #{{ballotBoxId}}, #{{salt}}, #{{hash}}, #{{fname}}, #{{surname}})
    </xsql>
  }

  val lockBallotBox = new Update[Int] {
    def xsql = <xsql>
      UPDATE tally_sys_ballot_box
      SET active = 'true'
      WHERE ballot_box_id = #{{id}}
    </xsql>
  }

  val getElectionCandidates = new SelectListBy[Int, ElectionCandidate] {

    resultMap = new ResultMap[ElectionCandidate] {
      result(property = "id", column = "candidate_id")
      result(property = "name", column = "candidate_name")
    }

    def xsql = <xsql>
      select cc.candidate_id, cc.candidate_name
      FROM
      stat_bank_tally_constituency_candidates as cc,
      tally_sys_ballot_box as b,
      stat_bank_election_to_constituency as ec
      WHERE b.ballot_box_id = #{{id}}
      AND ec.election_id = b.election_id
      AND cc.constituency_id = b.constituency_id
      AND cc.constituency_id = ec.constituency_id
    </xsql>
  }

  def bind = Seq(
    getElectionCandidates,
    getInactiveBallotBoxes,
    insertNewAccount,
    isUnique,
    isValidVerificationKey,
    lockBallotBox)
}
