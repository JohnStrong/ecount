package persistence

import org.mybatis.scala.mapping._

import models.{GeoElectoralDivisions, IMap}
import scala.util.parsing.json.JSONObject

object MapStore {

  // TODO: fix argument param to work successfully with Application.scala
  val getDivisionsByCounty = new SelectListBy[Int, String] {

    /*resultMap = new ResultMap[GeoElectoralDivisions] {
        result(property = "lon", column = "lon")
        result(property = "lat", column = "lat")
    }*/

    def xsql =
      """
       Select ST_asGeoJson(geom) from electoral_divisions ed, counties c
       where c.county_id = 1 and c.county = ed.county
       limit 1
      """
  }

  val find = new SelectListBy[String, IMap] {

    resultMap = new ResultMap[GeoElectoralDivisions] {
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

  def bind = Seq(getDivisionsByCounty, find)
}