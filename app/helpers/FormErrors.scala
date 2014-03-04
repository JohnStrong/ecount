package helpers


object FormErrors {

  private val ERROR_INVALID_VERIFICATION_KEY = "invalid verification key or username"
  private val ERROR_NO_BALLOT_BOX__FOR_ACCOUNT = "no ballot box has been allocated for the specified account"
  private val ERROR_FAILED_TO_REGISTER_ACCOUNT = "failed to register your account, please try a different username"
  private val ERROR_FAILED_TO_LOCATE_ACCOUNT = "could not retrieve account details, you have been signed out"

  val invalidVerificationId = {
    TallyFormHelper.RepresentativeForm.withGlobalError{
      ERROR_INVALID_VERIFICATION_KEY
    }
  }

  val noBallotBoxForAccount = {
    TallyFormHelper.RepresentativeForm.withGlobalError{
      ERROR_NO_BALLOT_BOX__FOR_ACCOUNT
    }
  }

  val accountRegistrationFailed = {
    TallyFormHelper.RepresentativeForm.withGlobalError{
      ERROR_FAILED_TO_REGISTER_ACCOUNT
    }
  }

  val cacheFailure = {
    TallyFormHelper.RepresentativeForm.withGlobalError{
      ERROR_FAILED_TO_LOCATE_ACCOUNT
    }
  }
}
