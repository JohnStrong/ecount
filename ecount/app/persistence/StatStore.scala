package persistence

/**
 * Created by User 1 on 06/01/14.
 */

import org.mybatis.scala.mapping._

import models._

object StatStore {

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
      stat_bank_counties_constituencies as sbcc, counties as c
      WHERE c.county_id = #{{id}}
      AND sbcc.county_id = c.county_id
      AND sbc.constituency_id = sbcc.constituency_id
      AND sber.constituency_id = sbc.constituency_id
    </xsql>
  }

  def bind = Seq(getGeneralElectionStatistics)
}
