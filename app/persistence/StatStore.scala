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

  val getGeneralElectionStatistics = new SelectListBy[ElectionStatsExtractor, GeneralElectionResults] {

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
      WHERE c.county_id = #{{countyId}}
      AND sbeer.election_id = #{{electionId}}
      AND sbcc.county_id = c.county_id
      AND sbc.constituency_id = sbcc.constituency_id
      AND sber.constituency_id = sbc.constituency_id
      AND sbeer.election_results_id = sber.election_results_id
    </xsql>
  }

  val getCountyConstituencies = new SelectListBy[Long, Constituency] {

    resultMap = new ResultMap[Constituency] {
      result( property = "id", column = "constituency_id")
      result( property = "title", column = "constituency_title")
    }

    def xsql = <xsql>
      SELECT sbc.constituency_id, sbc.constituency_title
      FROM
      stat_bank_constituencies as sbc,
      stat_bank_counties_constituencies sbcc, counties as c
      WHERE c.county_id = #{{id}}
      AND sbcc.county_id = c.county_id
      AND sbc.constituency_id = sbcc.constituency_id;
    </xsql>
  }

  val getPartyElectionStats = new SelectListBy[PartyStatsExtractor, PartyElectionResults] {

    resultMap = new ResultMap[PartyElectionResults] {
         result( property = "firstPreferenceVotes", column = "first_preference_votes")
         result( property = "percentageVote", column = "percentage_vote")
         result( property = "seats", column = "seats")
         result( property = "partyName", column = "party_name")
    }

    def xsql = <xsql>
      SELECT sbper.first_preference_votes, sbper.percentage_vote,
      sbper.seats, sbper.party_name
      FROM
      stat_bank_party_election_results as sbper,
      stat_bank_constituencies as sbc,
      stat_bank_election_party_election_results as sbeper
      WHERE sbc.constituency_id = #{{constId}}
      AND sbeper.election_id = #{{electionId}}
      AND sbper.constituency_id = sbc.constituency_id
      AND sbeper.election_results_id = sbper.election_results_id
    </xsql>
  }

  def bind = Seq(getElectionEntries, getGeneralElectionStatistics, getCountyConstituencies, getPartyElectionStats)
}
