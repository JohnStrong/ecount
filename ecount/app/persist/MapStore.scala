package persistence

import org.mybatis.scala.mapping._

import models._

object MapStore {

  val getElectoralDivisions = new SelectListBy[Int, String] {

    def xsql =
      """
       SELECT ST_asGeoJson(ST_transform(geom, 4326))
       FROM electoral_divisions ed, counties c
       WHERE c.county_id = 22 and c.county = ed.county
      """
  }

  val getCountyBounds = new SelectList[GeomCounty] {

    resultMap = new ResultMap[GeomCounty]{
      result(property = "countyId", column = "county")
      result(property = "countyName", column = "countyname")
      result(property =  "geometry", column = "st_asgeojson")
    }
    def xsql =
      """
       Select county, countyname, ST_asGeoJson(ST_Transform(st_setSrid(geom, 29902), 4326))
       FROM county_boundries
      """
  }

  def bind = Seq(getElectoralDivisions, getCountyBounds)
}