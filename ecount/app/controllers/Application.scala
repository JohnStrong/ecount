package controllers

import persistence.MapStore
import play.api._
import play.api.libs.json._
import play.api.mvc._
import persistence.PersistenceContext._

import models.{GeoElectoralDivisions, IMap}

/**
 * @define
 *    main application controller handles core requests for the api.
 */
object Application extends Controller {

  def index = Action {
    Ok(views.html.index("welcome"))
  }

  def map = Action {
    Ok(views.html.map("Interactive Map"))
  }

  // TODO: fix issue with poor data returned by Json...
  // loads ED coordinates in Geo-Json format for a county by countyId
  def electoralDivisions(countyId: Int) = Action {

    withConnection { implicit conn =>

      val edByCounty = MapStore.findDivisionsByCounty(countyId).map(ed => {
        Json.toJson(ed.geoJson)
      }).toSeq

      Ok(Json.toJson(edByCounty))
    }
  }

  // load county statistics in interactive map view
  def loadCountyStats(countyId: Long) = TODO

}