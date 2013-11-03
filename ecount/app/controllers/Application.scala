package com.ecount.controllers

import play.api._
import play.api.mvc._

import com.ecount.models._

/**
 * @define
 *    main application controller handles core requests for the api.
 */
object Application extends Controller {

  // TODO: mybatis integration

  def index = Action {
    Ok(views.html.index("welcome"))
  }

  def map = Action {
    Ok(views.html.map("Interactive Map"))
  }

  // load EDs for all/or specific county
  def electoralDivisions(countyId: Long) = Action {

    countyId match {
      case id if countyId == 0 =>
        Map.getAllED()
      case id =>
        Map.getEDByCounty(countyId)
    }

    Ok("success")
  }

  // load county statistics in interactive map view
  def loadCountyStats(countyId: Long) = TODO
}