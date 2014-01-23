package controllers

import play.api.mvc._
import play.api.libs.concurrent.Execution.Implicits._
import play.api.libs.json.Json

import service.Cache

object PortalController extends Controller {

  def account = Action.async {
    request => {
      val userId = request.session.get("user.id")
      val res = scala.concurrent.future { Cache.getUserFromCache(userId) }
      res map { i =>
        Ok(Json.toJson(i))
      }
    }
  }
}
