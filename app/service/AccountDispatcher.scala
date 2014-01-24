package service

import persistence.PersistenceContext._
import persistence.AccountStore
import models.ibatis._


case class NewAccount(email: String, hash: String, salt: String)
case class UserAccount(email:String, name: String, constituency: String, profession: String)

object AccountDispatcher {

 def checkHashWithSalt(userEmail: String, userPassword: String):Boolean = {
   withConnection { implicit conn =>
   AccountStore.getAccountSaltAndHash(userEmail) match {
       case Some(accountSaH) => {
          service.Crypto.hashPassword(
          userPassword, () => accountSaH.salt).equals(accountSaH.hash)
       }
       case _ => false
     }
   }
 }

 def getAccountDetails(userEmail: String, userPassword: String):Option[User] = {
    withConnection { implicit conn =>
      checkHashWithSalt(userEmail, userPassword) match {
        case true =>
          AccountStore.getAccountDetails(userEmail) match {
            case Some(user) => Some(user)
            case None => None
          }
        case false =>
            None
      }
    }
  }

  def insertNewUnverifiedAccount(userEmail: String, unHashedPassword: String) = {
    withConnection { implicit conn =>
      val hashedSaltedPassword =  service.Crypto.hashPassword(unHashedPassword)
      val newUser = NewAccount(userEmail, hashedSaltedPassword._1, hashedSaltedPassword._2)
      AccountStore.insertNewAccount(newUser)
    }
  }
}
