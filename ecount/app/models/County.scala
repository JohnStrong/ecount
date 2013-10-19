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

package object County {

  /**
   *
   * @param county
   *               county we wish to return the EDs for
   * @return
   *         EDs as JSON format
   */
  def getElectoralDivisons(county:String) {

    //TODO: complete implementation
    play.api.db.DB.withConnection { implicit conn =>

      val c = SQL(
        """
           select *
           from electoral_divisions
           where county = {countyName};
        """
      ).on("countyName" -> county)

      val countyResultMap = c().map(row =>
        row[Int]("gid") -> row[String]("county")
      ).toList

      countyResultMap.foreach( println(_) )
    }
  }
}

