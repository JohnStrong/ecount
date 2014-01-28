package models.ecount.map

class CountyGeom {
  var id:Int = _
  var geom:String = _
}

object CountyGeom {
  def apply(c:CountyGeom) =
    Some(c.id, c.geom)
}
