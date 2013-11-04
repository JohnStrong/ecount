package models

class GeoElectoralDivisions {
  var geoJson: String = _
}

object GeoElectoralDivisions {

  def apply(geoJson:String) = {

    val ed = new GeoElectoralDivisions

    ed.geoJson = geoJson

    ed
  }

  def unapply(gED:GeoElectoralDivisions) =
    Some(gED.geoJson)
}