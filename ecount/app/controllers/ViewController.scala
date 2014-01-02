package controllers

import persistence.MapStore
import play.api.mvc._
import persistence.PersistenceContext._

import models._
import scala.util.parsing.json.JSONObject

/**
 * @define
 *    core navigation controller that processes requests to all core features of the application.
 */
object ViewController extends Controller {

  def index = Action {
    Ok(views.html.index("E-count: Tally System"))
  }

  def map = Action {
    Ok(views.html.map("Interactive Map"))
  }

}