package service

/**
 * Created by User 1 on 23/01/14.
 */

import play.api.cache.Cache._
import play.api.Play.current
import play.api.libs.json.Json

import models.ecount.User
import persistence.ecount.AccountStore

object Cache {

  def cacheUser(user: User) {
      set("user." + user.id, user)
  }

  def removeCachedUser(userId: String) = {
     remove(userId)
  }

  def getUserFromCache(sessId: String) = {
    getAs[User]("user." + sessId)
  }
}
