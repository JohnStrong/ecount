package controllers

import persistence.MapStore
import play.api._
import play.api.libs.json._
import play.api.mvc._
import persistence.PersistenceContext._

import models.{GeoElectoralDivisions, IMap}
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

  // loads ED coordinates in Geo-Json format for a county by countyId
  def electoralDivisions(countyId: Int) = Action {

    withConnection { implicit conn =>

      val edByCounty =  MapStore.getDivisionsByCounty(countyId).map(ed => {
        Json.obj(
          "type" -> "Feature",
          "geometry" ->  Json.parse(ed)
        )
      })

      Ok(Json.obj(
          "type" -> "FeatureCollection",
          "features" -> Json.toJson(edByCounty)
        )
      )
    }
  }

  // load county statistics in interactive map view
  def loadCountyStats(countyId: Long) = TODO

}