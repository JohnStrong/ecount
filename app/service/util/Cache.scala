package service.util

/**
 * Created by User 1 on 23/01/14.
 */

import play.api.cache.Cache._
import play.api.Play.current

import models.ecount.account.User
import models.ecount.tallysys.UserAccountAccess

object Cache {

  def cacheUser(sessId: String, user: User) {
      set("user." + sessId, user)
  }

  def cacheAccount(sessId: String, account: UserAccountAccess) {
    set("tallysys.account." + sessId, account)
  }

  def removeCachedUser(userId: String) = {
     remove(userId)
  }

  def getUserFromCache(sessId: String) = {
    getAs[User]("user." + sessId)
  }

  def getAccountFromCache(sessId: String) = {
    getAs[UserAccountAccess]("tallysys.account." + sessId)
  }
}
