package service.util

import java.security._

object Crypto {

  private val SALT_SCRAMBLE_BYTE_SIZE = 32

  private def toHex(data:Array[Byte]) = {

    val buff:StringBuffer = new StringBuffer();
    for(datum <- data) {
      buff.append(Integer.toString((datum & 0xff) + 0x100, 16).substring(1))
    }

    buff
  }

  private def generateSecureSalt() = {
    val sc:SecureRandom = new SecureRandom()
    val seed = sc.generateSeed(SALT_SCRAMBLE_BYTE_SIZE)

    toHex(seed).toString
  }

  private def SHA256(saltedPassword: String) = {
    val md:MessageDigest = MessageDigest.getInstance("SHA-256")
    md.update(saltedPassword.getBytes())
    val byteData:Array[Byte] = md.digest()

    toHex(byteData).toString
  }

  def password(unHashed: String, saltFunction: () => String = generateSecureSalt) = {
    val salt = saltFunction()
    val hash = SHA256(List(unHashed, salt).mkString)

    (salt, hash)
  }

  def verificationLink() = {
    generateSecureSalt()
  }
}
