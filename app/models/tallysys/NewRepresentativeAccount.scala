package models.tallysys

import service.util.Crypto

sealed trait RepresentativeAccount

class NewRepresentativeAccount extends RepresentativeAccount {
     var username:String = _
     var fname:String = _
     var surname:String = _
     var salt:String = _
     var hash:String = _
     var ballotBoxId:Int = _
}

case class ExistingRepresentativeAccount(username:String, password:String) extends RepresentativeAccount

object RepresentativeAccount {

  def apply(account:NewRepresentativeAccount) = {
   Some(account.username, account.fname, account.surname, account.salt, account.hash, account.ballotBoxId)
  }

  def apply(username:String, password:String) = {
    ExistingRepresentativeAccount(username, password)
  }

  def apply(username:String, fname:String, surname:String, password:String, ballotBoxId:Int) = {
    val (salt, hash) = Crypto.password(password)

    val account = new NewRepresentativeAccount
    account.username = username
    account.fname = fname
    account.surname = surname
    account.salt = salt
    account.hash = hash
    account.ballotBoxId = ballotBoxId

    account
  }

  def unapply(ra:ExistingRepresentativeAccount) = {
    Some(ra.username, ra.password)
  }
}
