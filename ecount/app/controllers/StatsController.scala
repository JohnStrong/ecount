package controllers

/**
 * Created by User 1 on 06/01/14.
 */

import play.api.mvc._
import persistence.PersistenceContext._
import play.api.libs.concurrent.Execution.Implicits._
import persistence.StatStore
import play.api.libs.json.Json

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

  def countyConstituencies(countyId:Long) = Action.async {

    def getCountyConstituencies = {
        withConnection { implicit conn => {
          StatStore.getCountyConstituencies(countyId).map(c => {
            Json.obj(
              "id" -> c.id,
              "title" -> c.title
            )
          })
        }
      }
    }

    val result = scala.concurrent.Future { getCountyConstituencies }
    result.map(i => {
      Ok(Json.toJson(i))
    })
  }

  def generalElectionResults(electionId: Long, countyId: Long) = Action.async {

    def getElectionResults = {
      withConnection {  implicit conn => {
          StatStore.getGeneralElectionStatistics(countyId).map(ges => {
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

    val results = scala.concurrent.Future { getElectionResults }
    results.map(i => {
      Ok(Json.toJson(i))
    })
  }
}
