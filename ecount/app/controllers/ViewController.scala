package controllers

import play.api.mvc._

/**
 * @define
 *    core navigation controller that processes requests to all core features of the application.
 */
object ViewController extends Controller {

  def index = Action {
    Ok(views.html.main())
  }
}