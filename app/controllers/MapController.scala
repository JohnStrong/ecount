package controllers

import persistence.ecount.{PersistenceContext, MapStore}
import PersistenceContext._

import play.api.libs.concurrent.Execution.Implicits._
import play.api.mvc._
import play.api.libs.json.Json
import persistence.ecount.MapStore

object MapController extends Controller {

  def countyBounds() = Action.async {

    def getAndGroupCounties = {
      withConnection { implicit conn =>
        MapStore.getCountyBounds().map(ctd => {
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

  def electoralDivisions(countyId: Long) = Action.async {

    def getEDsByCountyId =
      withConnection { implicit conn =>
        MapStore.getElectoralDivisions(countyId).map(ed => {
          Json.obj(
            "type" -> "Feature",
            "geometry" ->  Json.parse(ed.geometry),
            "properties" -> Json.obj(
              "id" -> ed.id,
              "name" -> ed.label,
              "county" -> ed.county
            )
          )
        })
      }

    val edByCounty = scala.concurrent.Future { getEDsByCountyId }

    edByCounty.map{ i =>
      Ok( Json.obj(
        "type" -> "FeatureCollection",
        "features" -> Json.toJson(i)
        )
      )
    }
  }

  def electoralDivision(gid: Long) = Action.async {

    def getDedById =
      withConnection {  implicit conn =>
         MapStore.getElectoralDivision(gid).map(ed => {
           Json.obj(
             "type" -> "Feature",
             "geometry" -> Json.parse(ed)
           )
          }
         )
      }

    val ded = scala.concurrent.Future { getDedById }

    ded.map { i =>
       Ok(Json.obj(
          "type" -> "FeatureCollection",
          "features" -> Json.toJson(i)
        )
       )
    }
  }
}
