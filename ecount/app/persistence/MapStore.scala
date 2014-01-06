package persistence

import org.mybatis.scala.mapping._

import models._

object MapStore {

  val getCountyCentroid = new SelectOneBy[String, Point] {

    resultMap = new ResultMap[Point] {
      result(property = "x", column = "lon")
      result(property = "y", column = "lat")
    }

    def xsql = <xsql>
      SELECT ST_X(ST_PointOnSurface(ST_TRANSFORM(st_setSrid(geom, 29902), 4326))) as lon,
      ST_Y(ST_PointOnSurface(ST_TRANSFORM(st_setSrid(geom, 29902), 4326))) as lat
      FROM county_boundries
      WHERE countyname = #{{name}};
    </xsql>
  }
  val getElectoralDivisions = new SelectListBy[Long, CountyElectoralDivision] {

    resultMap = new ResultMap[CountyElectoralDivision] {
        result(property = "id", column = "gid")
        result(property = "name", column = "saps_label")
        result(property = "county", column = "county")
        result(property = "geometry", column = "geom")
    }

    def xsql = <xsql>
      SELECT ed.gid, ed.county, ed.saps_label,
      ST_ASGEOJSON(ST_TRANSFORM(st_setSrid(ST_SIMPLIFY(ed.geom, 60), 29902), 4326)) as geom
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

  val getCountyBounds = new SelectListBy[String, CountyGeom] {

    resultMap = new ResultMap[CountyGeom] {
      result(property = "id", column = "county_id")
      result(property = "geom", column = "st_asgeojson")
    }
    def xsql =
      """
        SELECT ST_asGeoJson(ST_Transform(st_setSrid(ST_SIMPLIFY(cb.geom, 50), 29902), 4326)),
        c.county_id
        FROM counties as c, county_boundries as cb
        WHERE c.county = #{countyName}
        AND c.county = cb.countyname
      """
  }

  def bind = Seq(getCountyCentroid, getElectoralDivisions, getAllCounties, getCountyBounds)
}