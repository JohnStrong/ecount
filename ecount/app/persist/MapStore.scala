package persistence

import org.mybatis.scala.mapping._

import models._

object MapStore {

  val getElectoralDivisions = new SelectListBy[Long, ElectoralDivision] {

    resultMap = new ResultMap[ElectoralDivision] {
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

  val getCountyBounds = new SelectList[GeomCounty] {

    resultMap = new ResultMap[GeomCounty]{
      result(property = "countyId", column = "county")
      result(property = "countyName", column = "countyname")
      result(property =  "geometry", column = "st_asgeojson")
    }
    def xsql =
      """
       Select cb.county, cb.countyname,
       ST_asGeoJson(ST_Transform(st_setSrid(cb.geom, 29902), 4326))
       FROM counties as c, county_boundries as cb
       WHERE c.county = cb.countyname
      """
  }

  def bind = Seq(getElectoralDivisions, getCountyBounds)
}