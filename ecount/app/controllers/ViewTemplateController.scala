package controllers

/**
 * Created by User 1 on 18/01/14.
 */

import play.api.mvc._

object ViewTemplateController extends Controller {
  def constituencyTable = Action {
    Ok(views.html.constituencyTable.render())
  }
}
