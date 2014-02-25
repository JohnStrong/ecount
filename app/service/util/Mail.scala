package service.util

import play.api.Play.current
import com.typesafe.plugin._

object Mail {

  private val VERIFICATION_MAIL_ORIGIN = "John Strong <ecountveri123567832@gmail.com>"

  private val VERIFICATION_MAIL_SUBJECT = "Welcome to Ecount!"
  private val MAIL_BODY_TEXT_PLAIN = "Follow this link to verify your account and begin using ecount:"

  // todo: fix setProperty issues where connect fails
  def sendVerificationEmail(userEmail: String, verificationLink: String) {

    val mail = use[MailerPlugin].email
    mail.setSubject(VERIFICATION_MAIL_SUBJECT)
    mail.setRecipient(userEmail, userEmail)
    mail.setFrom(VERIFICATION_MAIL_ORIGIN)

    val verificationLinkHtml = "<a href='localhost:9000/auth/verification?id=" +
      verificationLink + "'>continue</a>"

    mail.send(MAIL_BODY_TEXT_PLAIN, verificationLinkHtml)

  }
}
