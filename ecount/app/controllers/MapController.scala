package controllers

/**
 * Created with IntelliJ IDEA.
 * User: User 1
 * Date: 02/01/14
 * Time: 16:18
 * To change this template use File | Settings | File Templates.
 */

import persistence.MapStore
import persistence.PersistenceContext._
import play.api.libs.concurrent.Execution.Implicits._
import play.api.libs.json._
import play.api.mvc._
import play.api.libs.json.Json

object MapController extends Controller {

  def counties = Action.async {

    val getCountyNames  = {
      withConnection { implicit conn =>
        MapStore.getAllCounties() map { county => {
            Json.obj(
              "id" -> county.id,
              "name" -> county.name
            )
          }
        }
      }
    }

    val countyList = scala.concurrent.Future { getCountyNames }
    countyList.map { countiesFuture =>

      Ok(Json.obj(
        "type" -> "counties",
        "counties" -> countiesFuture
      ))
    }
  }
  def countyBounds(countyName: String) = Action.async {

    def getAndGroupCounties = {
      withConnection { implicit conn =>
        MapStore.getCountyBounds(countyName).map(ctd => {
          Json.obj(
            "type" -> "Feature",
            "geometry" ->  Json.parse(ctd.geom),
            "properties" -> Json.obj(
              "id" -> ctd.id
            )
          )
        })
      }
    }

    val groupedCounties = scala.concurrent.Future { getAndGroupCounties }
    groupedCounties.map(i => Ok(Json.obj(
      "type" -> "FeatureCollection",
      "features" -> Json.toJson(i)
    )))
  }
  // loads ED coordinates in Geo-Json format for a county by countyId
  def electoralDivisions(countyId: Long) = Action.async {

    def getEDByCountyId =
      withConnection { implicit conn =>
        MapStore.getElectoralDivisions(countyId).map(ed => {
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
      }

    val edByCounty = scala.concurrent.Future { getEDByCountyId }

    edByCounty.map{ i =>
      Ok( Json.obj(
        "type" -> "FeatureCollection",
        "features" -> Json.toJson(i)
        )
      )
    }
  }

  // load county statistics in interactive map view
  def loadCountyStats(countyId: Long) = TODO
}
