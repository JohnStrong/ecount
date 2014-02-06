package models.ecount.map

class CountyGeom {
  var id:Int = _
  var name:String = _
  var geom:String = _
}

object CountyGeom {
  def apply(c:CountyGeom) =
    Some(c.id, c.name, c.geom)
}
