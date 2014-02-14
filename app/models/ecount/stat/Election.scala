package models.ecount.stat

class Election {
  var id:Int = _
  var title:String = _
  var tallyDate:String = _
}

object Election {
  def apply(e:Election) = {

    Some(e.id, e.title, e.tallyDate)
  }
}
