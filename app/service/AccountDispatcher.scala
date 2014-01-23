package service

import persistence.PersistenceContext._
import persistence.AccountStore

/**
 * Created by User 1 on 23/01/14.
 */
object AccountDispatcher {

  def getAccountDetails(userEmail:String) = {
    withConnection { implicit conn =>
      AccountStore.getAccountDetails(userEmail)
    }
  }

  def insertNewAccount(userEmail: String) = {
    withConnection { implicit conn =>
      AccountStore.insertNewAccount(userEmail)
    }
  }
}
