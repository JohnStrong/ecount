package models.tallysys

class VerificationDetails {
  var constituencyId:Int = _
  var verificationId:Int = _
}

object VerificationDetails {
  def apply(verificationDetails: VerificationDetails) = {
    Some(verificationDetails.constituencyId, verificationDetails.verificationId)
  }
}
