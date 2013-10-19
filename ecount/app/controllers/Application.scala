package controllers

import play.api._
import play.api.mvc._

import models.County

object Application extends Controller {

  def index = Action {
    Ok(views.html.index("Your new application is ready."))
  }

  def map(countyId: Long) = Action {
    // there will be some conversion from dynamic route to
    // correct string representation for db query
    County.getElectoralDivisons("Galway County")
    Ok(views.html.index("Your new application is ready."))
  }

}