package controllers

/**
 * Created by User 1 on 06/01/14.
 */

import play.api.mvc._
import persistence.ecount.{StatStore, PersistenceContext}
import PersistenceContext._
import play.api.libs.concurrent.Execution.Implicits._
import play.api.libs.json._

import models.stat.{ConstituencyExtractor, TallyResultsExtractor}

object StatsController extends Controller {

  private def getTallyResults(eid:Int, cid:Int) = {
    withConnection { implicit conn => {
      val tre = TallyResultsExtractor.apply(cid, eid)
      StatStore.getConstituencyElectionCandidates(tre).map(candidate => {
        Json.obj(
          "id" -> candidate.id,
          "name" -> candidate.name,
          "party" -> candidate.party,
          "results" -> StatStore.getConstituencyTallyResults(candidate.id).map(res => {
            Json.obj(
              "result" -> res.result,
              "dedId" -> res.dedId
            )
          })
        )
      })
    }}
  }

  def counties = Action.async {

    def getCounties = {
      withConnection { implicit conn => {
          StatStore.getCounties().map(county => {
            Json.obj(
              "id" ->county.id,
              "name" -> county.name
            )
          })
        }
      }
    }

    val result = scala.concurrent.Future { getCounties }
    result.map{i => {
        Ok(Json.toJson(i))
      }
    }
  }

  def electionEntries = Action.async {

    def getAvailableElections = {
      withConnection { implicit conn => {
        val availables = StatStore.getElectionEntries()

        availables.map(election => {
         Json.obj(
          "id" -> election.id,
          "title" -> election.title,
          "tallyDate" -> election.tallyDate,
          "isLive" -> election.isLive
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

  def constituencies(electionId: Long, countyId: Long) = Action.async {

    def getCountyConstituencies = {
      withConnection { implicit conn => {
          val ce = ConstituencyExtractor(electionId, countyId)
          StatStore.getCountyConstituencies(ce).map(c => {
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

  def constituencyTallyResults(electionId: Int, constituencyId: Int) = Action.async {

    val res = scala.concurrent.Future { getTallyResults(electionId, constituencyId) }
    res.map(i => {
      Ok(Json.obj(
        "id" -> constituencyId,
        "results" -> Json.toJson(i)
      ))
    })
  }
}
