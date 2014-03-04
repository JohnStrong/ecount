package models.ecount.tallysys

/**
 * Created by User 1 on 04/03/14.
 */
class ElectionBallotBox {
  var id:Int = _
  var title:String = _
}

object ElectionBallotBox {
  def apply(electionBallotBox: ElectionBallotBox) = {
    Some(electionBallotBox.id, electionBallotBox.title)
  }
}
