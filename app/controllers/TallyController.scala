package controllers

import play.api.mvc._

/**
 * live tally data Controller
 */
object TallyController extends Controller {

  def loadView = Action {
    Ok(views.html.tally.render())
  }
}
