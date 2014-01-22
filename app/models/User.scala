package models

/**
 * Created by User 1 on 22/01/14.
 */
class User {
   var email:String = _
   var constituency:String = _
}

object User {

  def apply(user:User) {
    Some(user.email, user.constituency)
  }

  def apply(email: String, constituency: String) = {
    val u = new User
    u.email = email
    u.constituency = constituency
    u
  }
}
