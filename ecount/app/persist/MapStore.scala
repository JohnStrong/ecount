package persistence

import org.mybatis.scala.mapping._

import models.Map

object MapStore {

  val findDivisionsByCounty = new SelectOneBy[String, String] {
    def xsql = <xsql>
      SELECT ST_ASGEOJSON(geom)
      FROM electoral_divisions
      WHERE county = #{{value}}
    </xsql>
  }

  val findAllDivisions = new SelectListBy[Unit, List[String]] {
    def xsql = <xsql>
      SELECT ST_ASGEOJSON(geom)
      FROM electoral_divisions
    </xsql>
  }

  val find = new SelectListBy[String, Map] {
    def xsql = <xsql>
      SELECT gid, cso_code, county, saps_label
      FROM electoral_divisions
    </xsql>
  }

  def bind = Seq(findDivisionsByCounty, findAllDivisions, find)
}