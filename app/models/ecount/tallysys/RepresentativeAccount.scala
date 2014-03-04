package models.ecount.tallysys

import service.util.Crypto

class RepresentativeAccount(
     val username:String,
     val fname:String,
     val surname:String,
     val salt:String,
     val hash:String,
     val ballotBoxId:Int)

object RepresentativeAccount {
  def apply(username:String, fname:String, surname:String, password:String, ballotBoxId:Int) = {
    val (salt, hash) = Crypto.password(password)
    new RepresentativeAccount(username, fname, surname, salt, hash, ballotBoxId)
  }
}
