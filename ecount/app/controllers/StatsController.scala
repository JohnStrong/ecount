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

  def generalElectionResults(countyId: Long) = Action.async {

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
