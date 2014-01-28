package helper.account

import persistence.ecount.PersistenceContext
import PersistenceContext._
import helper.ibatis.AccountStore

// can handle all queries to test mybatis contexts
object AccountDispatcher {

  def getAccountDetails(email: String) = {
    withConnection { implicit conn =>
        AccountStore.getAccountDetails(email)
    }
  }

  def getSaltAndHash(email: String) = {
    withConnection { implicit conn =>
        AccountStore.getAccountSaltAndHash(email)
    }
  }
}
