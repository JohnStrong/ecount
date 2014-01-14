package controllers

/**
 * Created by User 1 on 06/01/14.
 */

import play.api.mvc._
import persistence.PersistenceContext._
import play.api.libs.concurrent.Execution.Implicits._
import persistence.StatStore
import play.api.libs.json._

import models._

object StatsController extends Controller {

  def lveRegisterMatureMale = TODO

  def lveRegisterMatureFemale = TODO

  def lveRegisterYoungMale = TODO

  def lveRegisterYoungFemale = TODO

  def electionEntries = Action.async {

    def getAvailableElections = {
      withConnection { implicit conn => {
        StatStore.getElectionEntries().map(election => {
         Json.obj(
          "id" -> election.id,
          "title" -> election.title
         )
        })
      }
     }
    }

    val result = scala.concurrent.Future { getAvailableElections }
    result.map{i => {
        Ok(Json.toJson(i))
      }
    }
  }

  def electionResultsGeneral(electionId:Long, countyId:Long) = Action.async {
    val ese = ElectionStatsExtractor.apply(electionId, countyId)

    def getGeneralElectionResults = {
      withConnection {  implicit conn => {
        StatStore.getGeneralElectionStatistics(ese).map(ges => {
          Json.obj(
            "constituency" -> ges.constituency,
            "votes" -> ges.votes,
            "percentTurnout" -> ges.percentTurnout,
            "invalidBallots" -> ges.invalidBallots,
            "percentInvalid" -> ges.percentInvalid,
            "validVotes" -> ges.validVotes,
            "percentValid" -> ges.percentValid,
            "registeredElectors" -> ges.registeredElectors
          )
        })
      }
      }
    }

    val geResults = scala.concurrent.Future{ getGeneralElectionResults }

    geResults.map{ g => {
        Ok(Json.toJson(g))
      }
    }
  }

  def electionResultsParty(electionId: Long, countyId:Long) = Action.async {

    def getPartyElectionResults = {
      withConnection { implicit conn => {
        StatStore.getCountyConstituencies(countyId).map(c => {

          val pse = PartyStatsExtractor.apply(c.id, electionId)

          Json.obj(
            "title" -> c.title,
            "stats" ->
              StatStore.getPartyElectionStats(pse).map(pges => {
                Json.obj(
                  "partyName" -> pges.partyName,
                  "partyStats" -> Json.obj(
                  "firstPreferenceVotes" -> pges.firstPreferenceVotes,
                  "percentageVote" -> pges.percentageVote,
                  "seats" -> pges.seats
                  )
                )
              })
           )
        })
      }
      }
    }

    val peResults =  scala.concurrent.Future { getPartyElectionResults }

    peResults.map(p => {
      Ok(Json.toJson(p))
     }
    )
  }
}
