package service

import persistence.ecount.{PersistenceContext, AccountStore}
import PersistenceContext._
import models.ecount._
import persistence.ecount.AccountStore


case class NewAccount(email: String, salt: String, hash: String)
case class UserAccount(email:String, name: String, constituency: String, profession: String)

object AccountDispatcher {

 private def checkHashWithSalt(userEmail: String, userPassword: String):Boolean = {
   withConnection { implicit conn =>
   AccountStore.getAccountSaltAndHash(userEmail) match {
       case Some(accountSaH) => {
          val (salt, hash) = service.Crypto.hashPassword(
          userPassword, () => accountSaH.salt)
          hash.equals(accountSaH.hash)
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

  def isUniqueAccount(userEmail: String) = {
    withConnection { implicit conn =>
      AccountStore.getAccountDetails(userEmail) match {
        case Some(user) => false
        case None => true
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

  def getAccountDetailsAfterCacheFailure(userEmail: String):Option[User] = {
    withConnection { implicit conn =>
      AccountStore.getAccountDetails(userEmail)
    }
  }
}
