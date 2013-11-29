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

  def getAndGroupCounties() = {
    withConnection { implicit conn =>
      MapStore.getCountyBounds().map(ctd => {
        // return script and exec with comet sockets???
        Json.obj(
          "type" -> "Feature",
          "geometry" ->  Json.parse(ctd.geometry),
          "properties" -> Json.obj(
            "id" -> ctd.countyId,
            "countyname" -> ctd.countyName)
        )
      })
    }
  }

  def countyBounds = Action.async {
    val future = scala.concurrent.Future { getAndGroupCounties() }
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