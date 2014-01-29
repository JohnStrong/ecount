package service

import java.util._
import javax.mail._
import javax.mail.internet._
import javax.activation._

object Mail {

  private val SERVICE_PROPERTY_TYPE = "mail.smtp.host"
  private val MAIL_SMTP_HOST = "localhost"

  private val VERIFICATION_MAIL_ORIGIN = "EcountVeri123567832@gmail.com"

  private val VERIFICATION_MAIL_SUBJECT = "Welcome to Ecount!"
  private val VERIFICATION_MAIL_BODY = "this is a test"

  // todo: fix setProperty issues where connect fails
  def sendEmailVerification(userEmail: String) {
     val props:Properties = System.getProperties
     props.setProperty(SERVICE_PROPERTY_TYPE, MAIL_SMTP_HOST)

     val session:Session = Session.getDefaultInstance(props)

     try {
        val message:MimeMessage = new MimeMessage(session)

        message.setFrom(new InternetAddress(VERIFICATION_MAIL_ORIGIN))
        message.addRecipient(Message.RecipientType.TO,
          new InternetAddress(userEmail));

        message.setSubject(VERIFICATION_MAIL_SUBJECT)
        message.setText(VERIFICATION_MAIL_BODY)

        Transport.send(message)

     } catch {
       case messageException:MessagingException =>
          messageException.printStackTrace
     }
  }
}
