package controllers

import play.api.mvc._
import play.api.libs.concurrent.Execution.Implicits._
import play.api.libs.json.Json

import service.dispatch.AccountDispatcher
import models.ecount.account.User
import service.util.Cache

object PortalController extends Controller {

  private val INVALID_SESSION = "oops, you are not connected"
  private val USER_SESSION_ID_KEY = "user.id"

  private def userToJson(user: User) = {
    Json.obj(
      "email" -> user.email,
      "name" -> user.name,
      "constituency" -> user.constituency,
      "profession" -> user.profession
    )
  }

  private def getAccountDetails(sessId: String) = {
    Cache.getUserFromCache(sessId) match {
      case Some(user) => Some(user)
      case _ => AccountDispatcher.getAccountDetailsAfterCacheFailure(sessId)
    }
  }

  // todo: check potentially unsafe lookup for account details on session id
  def account = Action.async {
    implicit request => {
      val res = scala.concurrent.Future { session.get(USER_SESSION_ID_KEY) }
      res.map { sessId =>
        getAccountDetails(sessId.get) match {
          case Some(user) =>
            Ok(Json.toJson(userToJson(user)))
          case _ => NotFound
        }
      }
    }
  }
}
