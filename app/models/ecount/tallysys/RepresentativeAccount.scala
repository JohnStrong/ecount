package models.ecount.tallysys

import service.util.Crypto

class RepresentativeAccount{
     var username:String = _
     var fname:String = _
     var surname:String = _
     var salt:String = _
     var hash:String = _
     var ballotBoxId:Int = _
}

object RepresentativeAccount {

  def apply(account:RepresentativeAccount) = {
   Some(account.username, account.fname, account.surname, account.salt, account.hash, account.ballotBoxId)
  }

  def apply(username:String, fname:String, surname:String, password:String, ballotBoxId:Int) = {
    val (salt, hash) = Crypto.password(password)

    val account = new RepresentativeAccount
    account.username = username
    account.fname = fname
    account.surname = surname
    account.salt = salt
    account.hash = hash
    account.ballotBoxId = ballotBoxId

    account
  }
}
