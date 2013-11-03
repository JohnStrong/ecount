/**
 * Created with IntelliJ IDEA.
 * User: User 1
 * Date: 18/10/13
 * Time: 16:06
 * To change this template use File | Settings | File Templates.
 */

package com.ecount.models

import anorm._
import play.api.Play.current

/**
 * @define
 *    base api for handling map data
 */
object Map {

  def getAllED() {

    play.api.db.DB.withConnection { implicit conn =>

    }
  }

  /**
   * @param id
   *      county id when wish to return the EDs for
   * @return
   *         ED as GEO-JSON format
   */
  def getEDByCounty(id:Long) {

    play.api.db.DB.withConnection { implicit conn =>

    }
  }
}

