package persistence

/**
 * Created by User 1 on 22/01/14.
 */

import org.mybatis.scala.mapping._

import models.User

object AccountStore {

  val getAccountDetails = new SelectOneBy[String, User] {

    resultMap = new ResultMap[User] {
      result(property = "id", column = "user_id")
      result(property = "email", column = "email")
      result(property = "name", column = "username")
      result(property = "constituency", column = "constituency")
      result(property = "apiKey", column = "api_key")
      result(property = "profession", column = "profession")
    }

    def xsql = <xsql>
      SELECT user_id, email, username, constituency, api_key, profession
      FROM users
      WHERE email = #{{email}}
      AND verified = true
    </xsql>
  }

  val insertNewAccount = new Insert[String] {
    def xsql = <xsql>
      INSERT INTO users (email, verified)
      VALUES (#{{email}}, false)
    </xsql>
  }

  def bind = Seq(getAccountDetails, insertNewAccount)
}
