package persistence

/**
 * Created by User 1 on 22/01/14.
 */

import org.mybatis.scala.mapping._

import models.User

object AccountStore {

  val getAccountDetails = new SelectOneBy[String, User] {

    resultMap = new ResultMap[User] {
      result(property = "email", column = "email")
      result(property = "constituency", column = "constituency")
    }

    def xsql = <xsql>
      SELECT username, email, constituency, api_key, profession
      FROM users
      WHERE email = #{{email}}
      AND verified = true
    </xsql>
  }

  val insertNewAccount = new Insert[User] {
    def xsql = <xsql>
      INSERT INTO users (username, email, constituency, verified)
      VALUES (#{{username}}, #{{email}}, #{{constituency}}, false)
    </xsql>
  }

  def bind = Seq(getAccountDetails, insertNewAccount)
}
