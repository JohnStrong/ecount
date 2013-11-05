package models

class GeoElectoralDivisions {
  var lon:Double = _
  var lat:Double = _
}

object GeoElectoralDivisions {

  def apply(lon:Double, lat:Double) = {
    val ed = new GeoElectoralDivisions
    ed.lon = lon
    ed.lat = lat
  }

  def unapply(gED:GeoElectoralDivisions) =
    Some(gED.lon, gED.lat)
}