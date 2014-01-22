package persistence

/**
 * Created by User 1 on 22/01/14.
 */

import org.mybatis.scala.mapping._

import models.User

object AccountStore {

  val getAccountDetails = new SelectOneBy[String, User] {

    resultMap = new ResultMap[User] {
      result(property = "name", column = "name")
      result(property = "email", column = "email")
      result(property = "constituency", column = "constituency")
    }

    def xsql = <xsql>
      SELECT name, email, constituency
      FROM users
      WHERE email = #{{email}}
    </xsql>
  }


  def bind = Seq(getAccountDetails)
}
