package models

class CountyElectoralDivision {
  var id:Long = _
  var name:String = _
  var county:String = _
  var geometry:String = _
}


object CountyElectoralDivision {

  def apply(id:Long, name:String, county:String, geom:String) {

    val ed = new CountyElectoralDivision
    ed.id = id
    ed.name = name
    ed.county = county
    ed.geometry = geom
  }

  def unapply(ed:CountyElectoralDivision) {
    Some(ed.id, ed.name, ed.county, ed.geometry)
  }
}