package models.stat

/**
 * Created by User 1 on 08/01/14.
 */
class PartyElectionResults {
  var partyName:String = _
  var firstPreferenceVotes:Int = _
  var percentageVote:Double = _
  var seats:Int = _
}

object PartyElectionResults {
  def apply(per:PartyElectionResults) =
    Some(per.partyName, per.firstPreferenceVotes, per.percentageVote, per.seats)
}
