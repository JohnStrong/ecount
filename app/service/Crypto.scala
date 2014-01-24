package service

import java.security._

object Crypto {

  private val SALT_SCRAMBLE_BYTE_SIZE = 20

  private def toHex(data:Array[Byte]) = {

    val buff:StringBuffer = new StringBuffer();
    for(datum <- data) {
      buff.append(Integer.toString((datum & 0xff) + 0x100, 16).substring(1))
    }

    buff
  }

  def generateSecureSalt() = {
    val sc:SecureRandom = new SecureRandom()
    val bytes: Array[Byte] = new Array(SALT_SCRAMBLE_BYTE_SIZE)
    val seed = sc.generateSeed(SALT_SCRAMBLE_BYTE_SIZE)

    toHex(seed).toString
  }

  private def SHA256(saltedPassword: String) = {
    val md:MessageDigest = MessageDigest.getInstance("SHA-256")
    md.update(saltedPassword.getBytes())
    val byteData:Array[Byte] = md.digest()

    toHex(byteData).toString
  }

  def hashPassword(unHashed: String, saltFunction: () => String = generateSecureSalt) = {
    val salt = saltFunction()
    val hash = SHA256(List(unHashed, salt).mkString)

    (salt, hash)
  }
}
