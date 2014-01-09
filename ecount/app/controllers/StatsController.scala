package controllers

/**
 * Created by User 1 on 06/01/14.
 */

import play.api.mvc._
import persistence.PersistenceContext._
import play.api.libs.concurrent.Execution.Implicits._
import persistence.StatStore
import play.api.libs.json.Json

class ElectionStatsExtractor {
  var electionId:Long = _
  var countyId:Long = _
}

object ElectionStatsExtractor {
  def apply(electionId: Long, countyId: Long) =  {
    val electionSE = new ElectionStatsExtractor
    electionSE.electionId = electionId
    electionSE.countyId = countyId

    electionSE
  }
}
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

  def generalElectionResults(electionId: Long, countyId: Long) = Action.async {

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

    def getPartyElectionResults = {
      withConnection { implicit conn => {
          StatStore.getPartyElectionStats(ese).map(pges => {
            Json.obj(
              "partyName" -> pges.partyName,
              "firstPreferenceVotes" -> pges.firstPreferenceVotes,
              "percentageVote" -> pges.percentageVote,
              "seats" -> pges.seats
            )
          })
        }
      }
    }

    val geResults = scala.concurrent.Future { getGeneralElectionResults }
    val peResults =  scala.concurrent.Future { getPartyElectionResults }

    geResults.zip(peResults).map(p => {
      Ok(Json.obj(
        "general" -> Json.toJson(p._1),
        "parties" -> Json.toJson(p._2)
      ))
    })
  }
}
