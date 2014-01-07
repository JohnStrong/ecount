package models

/**
 * Created by User 1 on 07/01/14.
 */
class Constituency {
  var id:Int = _
  var title:String = _
}

object Constituency {
  def apply(c:Constituency) =
    Some(c.id, c.title)
}
