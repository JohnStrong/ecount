package helpers.form.error

import helpers.form.TallyFormHelper

object FormErrors {

  private val ERROR_INVALID_VERIFICATION_KEY = "invalid verification key or username."

  private val ERROR_NO_BALLOT_BOX__FOR_ACCOUNT = "no ballot box has been allocated for the specified account."

  private val ERROR_FAILED_TO_REGISTER_ACCOUNT = "failed to register your account, please try a different username."

  private val ERROR_FAILED_TO_LOCATE_ACCOUNT = "could not retrieve account details, you have been signed out."

  private val ERROR_INVALID_LOGIN_CREDENTIALS = "login failed. username or password is invalid."

  val invalidVerificationId = {
    TallyFormHelper.RepresentativeRegisterForm.withGlobalError {
      ERROR_INVALID_VERIFICATION_KEY
    }
  }

  val noBallotBoxForAccount = {
    TallyFormHelper.RepresentativeRegisterForm.withGlobalError {
      ERROR_NO_BALLOT_BOX__FOR_ACCOUNT
    }
  }

  val accountRegistrationFailed = {
    TallyFormHelper.RepresentativeRegisterForm.withGlobalError {
      ERROR_FAILED_TO_REGISTER_ACCOUNT
    }
  }

  val invalidAccount = {
    TallyFormHelper.RepresentativeRegisterForm.withGlobalError {
      ERROR_FAILED_TO_LOCATE_ACCOUNT
    }
  }

  val invalidLogin = {
    TallyFormHelper.RepresentativeLoginForm.withGlobalError {
     ERROR_INVALID_LOGIN_CREDENTIALS
    }
  }
}
