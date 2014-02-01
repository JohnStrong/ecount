package models.ecount.stat

/**
 * Created by User 1 on 06/01/14.
 */
class Election {
  var id:Int = _
  var title:String = _
}

object Election {
  def apply(e:Election) =
    Some(e.id, e.title)
}
