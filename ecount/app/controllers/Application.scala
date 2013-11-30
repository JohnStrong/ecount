package controllers

import persistence.MapStore
import play.api.libs.concurrent.Execution.Implicits._
import play.api.libs.json._
import play.api.mvc._
import persistence.PersistenceContext._

import models._
import scala.util.parsing.json.JSONObject

/**
 * @define
 *    main application controller handles core requests for the api.
 */
object Application extends Controller {

  def index = Action {
    Ok(views.html.index("E-count: Tally System"))
  }

  def map = Action {
    Ok(views.html.map("Interactive Map"))
  }

  def countyNames = Action.async {

    def getCountyNames() = {
      withConnection { implicit conn =>
        MapStore.getAllCounties().map{county => {
            Json.obj(
              "id" -> county.id,
              "name" -> county.name
            )
          }
        }
      }
    }

    val future = scala.concurrent.Future { getCountyNames }
    future.map{counties => Ok(Json.obj(
      "type" -> "counties",
      "counties" -> counties
      ))
    }
  }

  def countyBounds(countyName: String) = Action.async {

    def getAndGroupCounties(countyName: String) = {
      withConnection { implicit conn =>
        MapStore.getCountyBounds(countyName).map(ctd => {
          // return script and exec with comet sockets???
          Json.obj(
            "type" -> "Feature",
            "geometry" ->  Json.parse(ctd)
          )
        })
      }
    }

    val future = scala.concurrent.Future { getAndGroupCounties(countyName) }
    future.map(i => Ok(Json.obj(
      "type" -> "FeatureCollection",
      "features" -> Json.toJson(i)
    )))
  }

  // loads ED coordinates in Geo-Json format for a county by countyId
  def electoralDivisions(countyId: Long) = Action {

    withConnection { implicit conn =>

      val edByCounty =  MapStore.getElectoralDivisions(countyId).map(ed => {
        Json.obj(
          "type" -> "Feature",
          "geometry" ->  Json.parse(ed.geometry),
          "properties" -> Json.obj(
            "id" -> ed.id,
            "name" -> ed.name,
            "county" -> ed.county
          )
        )
      })

      Ok(Json.obj(
        "type" -> "FeatureCollection",
        "features" -> Json.toJson(edByCounty)
      ))
    }
  }

  // load county statistics in interactive map view
  def loadCountyStats(countyId: Long) = TODO

}