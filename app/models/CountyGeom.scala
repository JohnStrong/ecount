package models

/**
 * Created by User 1 on 06/01/14.
 */
class CountyGeom {
  var id:Int = _
  var geom:String = _
}

object CountyGeom {
  def apply(c:CountyGeom) =
    Some(c.id, c.geom)
}
