package controllers

import play.api.mvc._

object PortalController extends Controller {

  def portalHome() = Action {
    Ok(views.html.portal())
  }
}
