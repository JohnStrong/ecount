package models.ecount.stat

class ElectionCandidate {
   var id:Int = _
   var name:String = _
   var tallyResult:Int = _
   var dedId:Int = _
}

object ElectionCandidate {
  def apply(ed:ElectionCandidate) =
    Some(ed.id, ed.name, ed.tallyResult, ed.dedId)
}
