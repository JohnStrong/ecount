package models.ecount.stat

/**
 * Created by User 1 on 07/02/14.
 */
class TallyResultsExtractor {
   var constituencyId:Long = _
   var electionId:Long = _
}

object TallyResultsExtractor {
  def apply(constituencyId:Long, electionId:Long) = {
    val tre = new TallyResultsExtractor
    tre.constituencyId = constituencyId
    tre.electionId = electionId

    tre
  }
}
