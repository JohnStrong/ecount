package models.ecount.map

/**
 * Created by User 1 on 06/02/14.
 */
class ElectoralDistrict {
  var id:Int = _
  var title:String = _
  var constituencyId:Int = _
  var geom:String = _
}

object ElectoralDistrict {
  def apply(ed: ElectoralDistrict) =
    Some(ed.id, ed.title, ed.constituencyId, ed.geom)
}
