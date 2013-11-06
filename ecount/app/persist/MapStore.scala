package persistence

import org.mybatis.scala.mapping._

import models._
import scala.util.parsing.json.JSONObject

object MapStore {

  // TODO: fix argument param to work successfully with Application.scala
  val getDivisionsByCounty = new SelectListBy[Int, String] {

    def xsql =
      """
       SELECT ST_asGeoJson(ST_transform(geom, 900913))
       FROM electoral_divisions ed, counties c
       WHERE c.county_id = 22 and c.county = ed.county
      """
  }

  val find = new SelectListBy[String, IMap] {

    resultMap = new ResultMap[IMap] {
      id(property = "id" , column = "gid")
      result(property = "csoCode", column = "cso_code")
      result(property = "county", column = "county")
      result(property = "saps_label", column = "edLabel")
    }

    def xsql =
      """
      SELECT gid, cso_code, county, saps_label
      FROM electoral_divisions
      """
  }

  val getCityTownBounds = new SelectListBy[Unit,String] {

    def xsql =
      """
        SELECT st_asGeoJson(ST_transform(geom, 900913))
        FROM city_towns
        LIMIT 4
      """
  }

  def bind = Seq(getDivisionsByCounty, find, getCityTownBounds)
}