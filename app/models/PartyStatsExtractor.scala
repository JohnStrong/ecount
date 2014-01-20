package models

/**
 * Created by User 1 on 10/01/14.
 */
class PartyStatsExtractor {
  var constId:Long = _
  var electionId:Long = _
}

object PartyStatsExtractor {
  def apply(constId: Long, electionId: Long) = {
    val countyCE = new PartyStatsExtractor
    countyCE.constId = constId
    countyCE.electionId = electionId

    countyCE
  }
}