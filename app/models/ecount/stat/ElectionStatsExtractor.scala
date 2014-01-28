package models.ecount.stat

/**
 * Created by User 1 on 10/01/14.
 */
class ElectionStatsExtractor {
  var electionId:Long = _
  var countyId:Long = _
}

object ElectionStatsExtractor {
  def apply(electionId: Long, countyId: Long) =  {
    val electionSE = new ElectionStatsExtractor
    electionSE.electionId = electionId
    electionSE.countyId = countyId

    electionSE
  }
}
