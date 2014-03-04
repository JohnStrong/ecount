package helpers


object FormErrors {

  private val ERROR_INVALID_VERIFICATION_KEY = "invalid verification key or username"
  private val ERROR_NO_BALLOT_BOX__FOR_ACCOUNT = "no ballot box has been allocated for the specified account"

  val invalidVerificationId = {
    TallyFormHelper.authForm.withGlobalError{
      ERROR_INVALID_VERIFICATION_KEY
    }
  }

  val noBallotBoxForAccount = {
    TallyFormHelper.authForm.withGlobalError{
      ERROR_NO_BALLOT_BOX__FOR_ACCOUNT
    }
  }
}
