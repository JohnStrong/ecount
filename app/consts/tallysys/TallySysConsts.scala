package consts.tallysys

sealed trait TallySysConsts

object AuthenticationConsts extends TallySysConsts {

  val BAD_VERIFICATION_KEY = "verification failed."

  val BAD_TALLY_RESULTS_POST = "poor request. please do not try that again."

  val VERIFICATION_KEY_MISSING_FROM_REQUEST = "could not verify request. please try again."

  val FAILED_TO_PERSIST_CANDIDATE_TALLIES = "failed to publish tally results. please try again."

  val PUBLISH_TALLY_RESULTS_SUCCESSFUL = "tally results published successfully. Thank you."

  val PUBLISH_TALLY_RESULTS_FAILED = "failed to publish tally results. please try again."
}

object SessionConsts extends TallySysConsts {

  val ACCOUNT_SESSION_ID = "tallysys.account."

  val DASHBOARD_SESSION_KEY = "sys.account"

  val VERIFICATION_KEY_COOKIE_ID = "verificationKey"
}

object FormConsts extends TallySysConsts {
  val USER_PASS_TEXT_LENGTH = (8, 12)
}
