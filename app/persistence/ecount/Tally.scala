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

  def bind = Seq(
    getElectionCandidates,
    getInactiveBallotBoxes,
    insertNewAccount,
    isUnique,
    lockBallotBox)
}
