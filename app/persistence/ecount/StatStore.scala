package persistence.ecount

import org.mybatis.scala.mapping._

import models.ecount.stat._
import models.ecount.map.County

object StatStore {

  val getCounties = new SelectList[County] {

    resultMap = new ResultMap[County] {
      result(property = "id",  column = "county_id")
      result(property = "name", column = "county")
    }

    def xsql = <xsql>
      SELECT county_id, county
      FROM counties;
    </xsql>
  }

  val getElectionEntries = new SelectList[Election]{

    resultMap = new ResultMap[Election] {
      result(property = "id", column = "election_id")
      result(property = "title", column = "election_title")
      result(property = "tallyDate", column = "tally_date")
      result(property = "isAvailable", column = "available")
      result(property = "isLive", column = "live")
    }

    def xsql = <xsql>
      SELECT election_id, election_title, tally_date, available, live
      FROM stat_bank_elections
      ORDER BY tally_date DESC
    </xsql>
  }

  val getCountyConstituencies = new SelectListBy[ConstituencyExtractor, Constituency] {

    resultMap = new ResultMap[Constituency] {
      result( property = "id", column = "constituency_id")
      result( property = "title", column = "constituency_title")
    }

    def xsql = <xsql>
      SELECT sbc.constituency_id, sbc.constituency_title
      FROM
      stat_bank_constituencies as sbc,
      stat_bank_counties_constituencies sbcc,
      stat_bank_election_to_constituency as etc,
      counties as c
      WHERE c.county_id = #{{countyId}}
      AND etc.election_id = #{{electionId}}
      AND etc.constituency_id = sbc.constituency_id
      AND sbcc.county_id = c.county_id
      AND sbc.constituency_id = sbcc.constituency_id;
    </xsql>
  }

  val getConstituencyElectionCandidates = new SelectListBy[TallyResultsExtractor, ElectionCandidate] {

    resultMap = new ResultMap[ElectionCandidate] {
      result(property = "id", column = "candidate_id")
      result(property = "name", column = "candidate_name")
    }

    def xsql = <xsql>
      SELECT ca.candidate_id, ca.candidate_name
      FROM stat_bank_constituencies as c,
      stat_bank_tally_election_to_const_candidates as ec,
      stat_bank_tally_constituency_candidates as ca
      WHERE c.constituency_id = #{{constituencyId}}
      AND ec.election_id = #{{electionId}}
      AND ca.candidate_id = ec.candidate_id
      AND ca.constituency_id = c.constituency_id;
    </xsql>
  }

  val getConstituencyTallyResults = new SelectListBy[Long, ElectionCandidateTally] {

    resultMap = new ResultMap[ElectionCandidateTally] {
      result(property = "result", column = "count")
      result(property = "dedId", column = "gid")
    }

    def xsql = <xsql>
      SELECT cr.count, d.gid
      FROM stat_bank_tally_candidate_to_results as ctr,
      stat_bank_tally_candidate_results as cr,
      stat_bank_tally_ded_details as d
      WHERE ctr.candidate_id = #{{id}}
      AND cr.results_id = ctr.results_id
      AND d.ded_id = cr.ded_id
    </xsql>
  }

  def bind = Seq(
    getCounties,
    getElectionEntries,
    getCountyConstituencies,
    getConstituencyElectionCandidates,
    getConstituencyTallyResults
  )
}
