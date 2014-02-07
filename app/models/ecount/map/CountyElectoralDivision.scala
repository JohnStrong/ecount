package models.ecount.map

class CountyElectoralDivision {
  var dedId:Int = _
  var gid:Int = _
  var label:String = _
  var county:String = _
  var geometry:String = _
}

object CountyElectoralDivision {

  def apply(dedId:Int, gid:Int, label:String, county:String, geom:String) {

    val ed = new CountyElectoralDivision
    ed.dedId = dedId
    ed.gid = gid
    ed.label = label
    ed.county = county
    ed.geometry = geom
  }

  def unapply(ed:CountyElectoralDivision) {
    Some(ed.dedId, ed.gid, ed.label, ed.county, ed.geometry)
  }
}