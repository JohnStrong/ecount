package models.tallysys

class TallyElection {
  var id:Int = _
  var title:String = _
  var constituencyId:Int = _
}

object TallyElection {
  def apply(e:TallyElection) = {
    Some(e.id, e.title, e.constituencyId)
  }
}
