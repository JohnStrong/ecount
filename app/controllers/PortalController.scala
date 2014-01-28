package controllers

import play.api.mvc._
import play.api.libs.concurrent.Execution.Implicits._
import play.api.libs.json.Json

import service.{AccountDispatcher, Cache}
import models.ecount.User

object PortalController extends Controller {

  private val INVALID_SESSION = "oops, you are not connected"

  private def userToJson(user: User) = {
    Json.obj(
      "email" -> user.email,
      "name" -> user.name,
      "constituency" -> user.constituency,
      "profession" -> user.profession
    )
  }

  private def unauthorizedAccount {
    Unauthorized(INVALID_SESSION)
  }

  private def getUserSession(request: Request[AnyContent]) = {
    request.session.get("user.id").get
  }

  def account = Action.async {
    request => {
      val sessId = getUserSession(request)

      val res = scala.concurrent.future { Cache.getUserFromCache(sessId) }
      res map { user =>
        user match {
          case Some(u) => Ok(Json.toJson(userToJson(u)))
          case _ =>
            AccountDispatcher.getAccountDetailsAfterCacheFailure(sessId) match {
              case Some(u) => Ok(Json.toJson(userToJson(u)))
            }
        }
      }
    }
  }
}
