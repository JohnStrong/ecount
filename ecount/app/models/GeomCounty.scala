/**
 * Created with IntelliJ IDEA.
 * User: User 1
 * Date: 18/10/13
 * Time: 16:06
 * To change this template use File | Settings | File Templates.
 */

package models

class GeomCounty {
  var countyId:Int = _
  var countyName:String = _
  var geometry:String = _
}

object GeomCounty {

  def apply(id:Int, county:String, geom:String) = {

    val m = new GeomCounty
    m.countyId = id
    m.countyName = county
    m.geometry = geom
  }

  def unapply(m:GeomCounty) =
    Some(m.countyId, m.countyName, m.geometry)
}

