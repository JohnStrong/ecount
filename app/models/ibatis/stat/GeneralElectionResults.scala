package models.ibatis.stat

/**
 * Created by User 1 on 06/01/14.
 */
class GeneralElectionResults {
  var votes:Int = _
  var percentTurnout:Double = _
  var invalidBallots:Int = _
  var percentInvalid:Double = _
  var validVotes:Int = _
  var percentValid:Double = _
  var registeredElectors:Int = _
  var constituency:String = _
}

object GeneralElectionResults {
  def apply(ger:GeneralElectionResults) = {
    Some(ger.votes, ger.percentTurnout, ger.invalidBallots, ger.percentInvalid,
      ger.validVotes, ger.percentValid, ger.registeredElectors, ger.constituency)
  }
}