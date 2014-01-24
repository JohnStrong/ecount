package models.ibatis.security

/**
 * Created by User 1 on 24/01/14.
 */
class AccountSaltAndHash {
  var salt:String = _
  var hash:String = _
}

object AccountSaltAndHash {
  def apply(accountSaH: AccountSaltAndHash) =
    Some(accountSaH.salt, accountSaH.hash)
}
