package models.tallysys

class ElectionBallotBox {
  var id:Int = _
  var title:String = _
  var dedId:Int = _
  var electionId:Int = _
  var constituencyId:Int = _
}

object ElectionBallotBox {
  def apply(electionBallotBox: ElectionBallotBox) = {
    Some(electionBallotBox.id, electionBallotBox.title,
      electionBallotBox.dedId, electionBallotBox.electionId, electionBallotBox.constituencyId)
  }
}
