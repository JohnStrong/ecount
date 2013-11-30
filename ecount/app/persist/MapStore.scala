package persistence

import org.mybatis.scala.mapping._

import models._

object MapStore {

  val getElectoralDivisions = new SelectListBy[Long, CountyElectoralDivision] {

    resultMap = new ResultMap[CountyElectoralDivision] {
       result(property = "id", column = "gid")
       result(property = "name", column = "saps_label")
       result(property = "county", column = "county")
       result(property = "geometry", column = "st_asgeojson")
    }

    def xsql = <xsql>
      SELECT ed.gid, ed.county, ed.saps_label,
      ST_asGeoJson(ST_transform(ed.geom, 4326))
      FROM electoral_divisions ed, counties c
      WHERE c.county_id = #{{id}}
      AND c.county = ed.county
      </xsql>
  }

  val getAllCounties = new SelectList[County] {

    resultMap = new ResultMap[County] {
      result(property = "id", column = "county_id")
      result(property = "name", column = "county")
    }

    def xsql =
      """
        SELECT county_id, county
        FROM counties
      """
  }

  val getCountyBounds = new SelectListBy[String, String] {

    def xsql =
      """
        SELECT ST_asGeoJson(ST_Transform(st_setSrid(cb.geom, 29902), 4326))
        FROM counties as c, county_boundries as cb
        WHERE c.county = #{countyName}
        AND c.county = cb.countyname
      """
  }

  def bind = Seq(getElectoralDivisions, getAllCounties, getCountyBounds)
}