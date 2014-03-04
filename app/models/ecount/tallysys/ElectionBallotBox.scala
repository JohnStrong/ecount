package models.ecount.tallysys

/**
 * Created by User 1 on 04/03/14.
 */
class ElectionBallotBox {
  var dedId:Int = _
  var ballotTitle:String = _
}

object ElectionBallotBox {
  def apply(electionBallotBox: ElectionBallotBox) = {
    Some(electionBallotBox.dedId, electionBallotBox.ballotTitle)
  }
}
