package service

/**
 * Created by User 1 on 23/01/14.
 */

import play.api.cache.Cache._
import play.api.Play.current

object Cache {

  def cacheUser(user: models.User) {
      set("user." + user.id, user)
  }

  def getCachedUser(userId: Long) {
    // todo
  }
}
