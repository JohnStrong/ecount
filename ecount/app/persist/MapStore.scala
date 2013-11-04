package persistence

import org.mybatis.scala.mapping._

import models.{GeoElectoralDivisions, IMap}

object MapStore {

  // TODO: fix argument param to work successfully with Application.scala
  val findDivisionsByCounty = new SelectListBy[Int, GeoElectoralDivisions] {

    resultMap = new ResultMap[GeoElectoralDivisions] {
      result(property = "geoJson", column = "st_asgeojson")
    }

    def xsql =
      """
      SELECT ST_asGeoJson(geom)
      FROM electoral_divisions ed, counties c
      WHERE c.county_id = 1
      AND c.county = ed.county;
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

  def bind = Seq(findDivisionsByCounty, find)
}