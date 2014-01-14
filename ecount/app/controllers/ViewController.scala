package controllers

import play.api.mvc._
import persistence.PersistenceContext._
import persistence.StatStore
import play.api.libs.json.Json

/**
 * @define
 *    core navigation controller that processes requests to all core features of the application.
 */
object ViewController extends Controller {

  def index = Action {
    Ok(views.html.main())
  }

  def home = Action {
    Ok(views.html.home.render())
  }

  def map = Action {
    Ok(views.html.map.render())
  }

  def counties = Action {
    Ok(views.html.counties.render())
  }

  def county = Action {
    Ok(views.html.county.render())
  }

  def about = Action {
    Ok(views.html.about.render())
  }

  def election = Action {
    Ok(views.html.election.render())
  }

  def imap = Action {
    Ok(views.html.imap.render())
  }
}