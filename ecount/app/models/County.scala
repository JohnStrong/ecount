/**
 * Created with IntelliJ IDEA.
 * User: User 1
 * Date: 18/10/13
 * Time: 16:06
 * To change this template use File | Settings | File Templates.
 */

package models

import anorm._
import play.api.Play.current

/** packages all methods for accessing projection data
 * for the interactive map service
 */
package object County {

  /**
   *
   * @param county
   *               county we wish to return the EDs for
   * @return
   *         EDs as JSON format
   */
  def getElectoralDivisions(county:String) {

    //TODO: complete implementation
    play.api.db.DB.withConnection { implicit conn =>

    }
  }
}

