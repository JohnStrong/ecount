/**
 * Created with IntelliJ IDEA.
 * User: User 1
 * Date: 18/10/13
 * Time: 16:06
 * To change this template use File | Settings | File Templates.
 */

package models

class GeomCounty {
  var county:String = _
  var geometry:String = _
}

object GeomCounty {

  def apply(county:String, geom:String) = {

    val m = new GeomCounty
    m.county = county
    m.geometry = geom
  }

  def unapply(m:GeomCounty) =
    Some(m.county, m.geometry)
}

