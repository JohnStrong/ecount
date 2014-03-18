package persistence.ecount

import org.mybatis.scala.mapping._

import models.map.{CountyElectoralDivision, CountyGeom, ElectoralDistrict}
import models.stat.Constituency

object MapStore {

  val getConstituencies = new SelectList[Constituency] {

    resultMap = new ResultMap[Constituency] {
      result(property = "id", column = "constituency_id")
      result(property = "title", column = "constituency_title")
    }

    def xsql = <xsql>
    SELECT constituency_id, constituency_title
    FROM stat_bank_constituencies
    </xsql>
  }

  val getElectoralDivisions = new SelectListBy[Long, CountyElectoralDivision] {

    resultMap = new ResultMap[CountyElectoralDivision] {
        result(property = "id", column = "ded_id")
        result(property = "label", column = "saps_label")
        result(property = "county", column = "county")
        result(property = "geometry", column = "geom")
    }

    def xsql = <xsql>
      SELECT d.ded_id, ed.county, ed.saps_label,
      ST_ASGEOJSON(ST_TRANSFORM(ST_SETSRID(ST_SIMPLIFY(ed.geom, 150), 29902), 4326)) as geom
      FROM geom_electoral_divisions ed, counties c, stat_bank_tally_ded_details as d
      WHERE c.county_id = #{{id}}
      AND ed.county like '%' || c.county || '%'
      AND ed.gid = d.gid
      </xsql>
  }

  val getCountyBounds = new SelectList[CountyGeom] {

    resultMap = new ResultMap[CountyGeom] {
      result(property = "id", column = "county_id")
      result(property = "name", column = "county")
      result(property = "geom", column = "geom")
    }
    def xsql =
      """
        SELECT ST_asGeoJson(
        ST_Transform(ST_SETSRID(ST_SIMPLIFY(cb.geom, 500), 29902), 4326)) as geom,
        c.county_id, c.county
        FROM counties as c, county_boundries as cb
        WHERE c.county = cb.countyname
      """
  }

  def bind = Seq(getConstituencies, getElectoralDivisions, getCountyBounds)
}