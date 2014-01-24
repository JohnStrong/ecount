package service

/**
 * Created by User 1 on 23/01/14.
 */

import play.api.cache.Cache._
import play.api.Play.current
import play.api.libs.json.Json
import models.ibatis.User

object Cache {

  def cacheUser(user: User) {
      set("user." + user.id, user)
  }

  def removeCachedUser(userId: String) = {
     remove(userId)
  }

  def getUserFromCache(id: Option[String]) = {

    val getCachedUser = {
      getAs[User]("user." + id)
    }

    getCachedUser.map{user => {
        Json.obj(
          "email" -> user.email,
          "name" -> user.name,
          "constituency" -> user.constituency,
          "profession" -> user.profession
        )
      }
    }
  }
}
