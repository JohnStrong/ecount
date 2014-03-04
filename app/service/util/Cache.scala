package service.util

import play.api.cache.Cache._
import play.api.Play.current

import models.ecount.account.User
import models.ecount.tallysys.RepresentativeAccount

object Cache {

  def cacheUser(sessId: String, user: User) {
      set("user." + sessId, user)
  }

  def cacheAccount(sessId:String, account:RepresentativeAccount) {
    set("tallysys.account." + sessId, account)
  }

  def removeCachedUser(userId: String) = {
     remove(userId)
  }

  def getUserFromCache(sessId: String) = {
    getAs[User]("user." + sessId)
  }

  def getAccountFromCache(sessId: String) = {
    getAs[RepresentativeAccount]("tallysys.account." + sessId)
  }
}
