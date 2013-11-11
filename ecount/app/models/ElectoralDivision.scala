package models

class ElectoralDivision {
  var id:Long = _
  var name:String = _
  var county:String = _
  var geometry:String = _
}


object ElectoralDivision {

  def apply(id:Long, name:String, county:String, geom:String) {

    val ed = new ElectoralDivision
    ed.id = id
    ed.name = name
    ed.county = county
    ed.geometry = geom
  }

  def unapply(ed:ElectoralDivision) {
    Some(ed.id, ed.name, ed.county, ed.geometry)
  }
}