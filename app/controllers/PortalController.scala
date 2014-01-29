package controllers

import play.api.mvc._
import play.api.libs.concurrent.Execution.Implicits._
import play.api.libs.json.Json

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

  // todo: check potentially unsafe lookup for account details on session id
  def account = TODO
}
