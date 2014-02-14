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
          "title" -> election.title,
          "tallyDate" -> election.tallyDate
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
        StatStore.getConstituencyElectionCandidates(tre).map(candidate => {
          Json.obj(
            "id" -> candidate.id,
            "name" -> candidate.name,
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

    val res = scala.concurrent.Future { getTallyResults }
    res.map(i => {
      Ok(Json.obj(
        "id" -> constituencyId,
        "results" -> Json.toJson(i)
      ))
    })
  }
}
