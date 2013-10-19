package controllers

import play.api._
import play.api.mvc._

import models.County

object Application extends Controller {

  def index = Action {
    Ok(views.html.index("Your new application is ready."))
  }

  def map(countyId: Long) = Action {
    County.getElectoralDivisions("Galway County")
    Ok(views.html.index("Your new application is ready."))
  }

}