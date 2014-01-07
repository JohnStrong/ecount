package persistence

/**
 * Created by User 1 on 06/01/14.
 */

import org.mybatis.scala.mapping._

import models._

object StatStore {

  val getElectionEntries = new SelectList[Election]{

    resultMap = new ResultMap[Election] {
      result(property = "id", column = "election_id")
      result(property = "title", column = "election_title")
    }

    def xsql = <xsql>
      SELECT election_id, election_title
      FROM stat_bank_elections
    </xsql>
  }

  val getCountyConstituencies = new SelectListBy[Long, Constituency] {

    resultMap = new ResultMap[Constituency] {
      result(property = "id", column = "constituency_id")
      result(property = "title", column = "constituency_title")
    }

    def xsql = <xsql>
      SELECT sbc.constituency_title, sbc.constituency_id
      FROM stat_bank_constituencies as sbc,
      stat_bank_counties_constituencies as sbcc
      WHERE sbcc.county_id = #{{id}}
      AND sbcc.constituency_id = sbc.constituency_id;
    </xsql>
  }

  val getGeneralElectionStatistics = new SelectListBy[Long, GeneralElectionResults] {

    resultMap = new ResultMap[GeneralElectionResults] {
      result(property = "votes", column = "votes")
      result(property = "percentTurnout", column = "percentage_turnout")
      result(property = "invalidBallots", column = "invalid_ballots")
      result(property = "percentInvalid", column = "percentage_invalid")
      result(property = "validVotes", column = "valid_votes")
      result(property = "percentValid", column = "percentage_valid")
      result(property = "registeredElectors", column = "registered_electors")
      result(property = "constituency", column = "constituency_title")
    }
    def xsql = <xsql>
      SELECT sber.votes, sber.percentage_turnout, sber.invalid_ballots,
      sber.percentage_invalid, sber.valid_votes, sber.percentage_valid,
      sber.registered_electors, sbc.constituency_title
      FROM
      stat_bank_election_results as sber,
      stat_bank_constituencies as sbc,
      stat_bank_counties_constituencies as sbcc,
      stat_bank_election_election_results as sbeer,
      counties as c
      WHERE c.county_id = #{{countyid}}
      AND sbeer.election_id = 1
      AND sbcc.county_id = c.county_id
      AND sbc.constituency_id = sbcc.constituency_id
      AND sber.constituency_id = sbc.constituency_id
      AND sbeer.election_results_id = sber.election_results_id
    </xsql>
  }

  def bind = Seq(getCountyConstituencies, getElectionEntries, getGeneralElectionStatistics)
}
