package controllers

import persistence.MapStore
import play.api._
import play.api.mvc._
import persistence.PersistenceContext._

import models._

/**
 * @define
 *    main application controller handles core requests for the api.
 */
object Application extends Controller {

  def index = Action {
    Ok(views.html.index("welcome"))
  }

  def map = Action {
    Ok(views.html.map("Interactive Map"))
  }

  // load EDs for all/or specific county
  def electoralDivisions(countyId: Long) = Action {
    withConnection { implicit conn =>

      countyId match {

        case id if countyId == 0 =>  {

            // TODO: return geo-json data to client
            val divisions = MapStore.findAllDivisions
            Ok("success")
        }

        case id => {
            NotFound
        }
      }
    }
  }

  // load county statistics in interactive map view
  def loadCountyStats(countyId: Long) = TODO

}