package models.stat

/**
 * Created by User 1 on 12/02/14.
 */
class ElectionCandidateTally {
 var result:Long = _
 var dedId:Int = _
}

object ElectionCandidateTally {
  def apply(ect:ElectionCandidateTally) =
    Some(ect.result, ect.dedId)
}
