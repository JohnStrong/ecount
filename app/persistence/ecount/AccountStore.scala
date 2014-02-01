package persistence.ecount

import org.mybatis.scala.mapping._

import models.ecount.security.AccountSaltAndHash
import service.dispatch.NewAccount
import models.ecount.account.User

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

  val getAccountSaltAndHash = new SelectOneBy[String, AccountSaltAndHash] {

    resultMap = new ResultMap[AccountSaltAndHash] {
      result(property = "salt", column = "salt")
      result(property = "hash", column = "hash")
    }

    def xsql = <xsql>
      SELECT salt, hash
      FROM users
      WHERE email = #{{email}}
    </xsql>
  }

  val insertNewAccount = new Insert[NewAccount] {
    def xsql = <xsql>
      INSERT INTO users (email, hash, salt, verified)
      VALUES (#{{email}}, #{{hash}}, #{{salt}}, false)
    </xsql>
  }

  def bind = Seq(getAccountDetails, getAccountSaltAndHash, insertNewAccount)
}
