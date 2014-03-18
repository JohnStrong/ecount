package service.util

import play.api.cache.Cache._
import play.api.Play.current

import models.account.User
import models.tallysys.NewRepresentativeAccount

object Cache {

  def cacheUser(sessId: String, user: User) {
      set("user." + sessId, user)
  }

  def cacheAccount(sessId:String, account:NewRepresentativeAccount) {
    set("tallysys.account", account)
  }

  def removeCachedUser(userId: String) = {
     remove(userId)
  }

  def getUserFromCache(sessId: String) = {
    getAs[User]("user." + sessId)
  }

  def getAccountFromCache(sessId: String) = {
    getAs[NewRepresentativeAccount]("tallysys.account")
  }
}
