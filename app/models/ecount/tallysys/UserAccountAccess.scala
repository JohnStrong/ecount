package models.ecount.tallysys

class UserAccountAccess {
   var electionId:Int = _
   var constituencyId:Int = _
   var ballotId:Int = _
}

object UserAccountAccess {
  def apply(userAccountAccess: UserAccountAccess) = {
    Some(userAccountAccess.electionId, userAccountAccess.constituencyId, userAccountAccess.ballotId)
  }
}
