package controllers

/**
 * Created by User 1 on 06/01/14.
 */

import play.api.mvc._
import persistence.ecount.{StatStore, PersistenceContext}
import PersistenceContext._
import play.api.libs.concurrent.Execution.Implicits._
import play.api.libs.json._

import models.ecount.stat.{PartyStatsExtractor, ElectionStatsExtractor, TallyResultsExtractor}

object StatsController extends Controller {

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

  def constituencies(countyId: Long) = Action.async {

    def getCountyConstituencies = {
      withConnection { implicit conn => {
          StatStore.getCountyConstituencies(countyId).map(c => {
            Json.obj(
              "id" -> c.id,
              "title" -> c.title
            )
          }
        )
      }}
    }

    val constituencies = scala.concurrent.Future{ getCountyConstituencies }

    constituencies.map(c => {
      Ok(Json.toJson(c))
    })
  }

  def constituencyTallyResults(electionId: Long, constituencyId: Long) = Action.async {

    def getTallyResults = {
      withConnection { implicit conn => {
          val tre = TallyResultsExtractor.apply(constituencyId, electionId)

          StatStore.getConstituencyTallyResults(tre).map(res => {
            Json.obj(
              "id" -> res.id,
              "name" -> res.name,
              "count" -> res.tallyResult,
              "ded" -> res.dedId
            )
          })
        }
      }
    }

    val res = scala.concurrent.Future { getTallyResults }
    res.map(i => {
      Ok(Json.obj(
        "id" -> constituencyId,
        "results" -> Json.toJson(i))
      )
    })
  }

  def electionResultsParty(electionId: Long, constituencyId:Long) = Action.async {

    def getPartyElectionResults = {
      withConnection { implicit conn => {

        val pse = PartyStatsExtractor.apply(constituencyId, electionId)

        StatStore.getPartyElectionStats(pse).map(pges => {
          Json.obj(
            "name" -> pges.partyName,
            "stats" -> Json.obj(
            "firstPreferenceVotes" -> pges.firstPreferenceVotes,
            "percentageVote" -> pges.percentageVote,
            "seats" -> pges.seats
            )
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
