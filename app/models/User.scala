package models

/**
 * Created by User 1 on 22/01/14.
 */
class User {
   var name:String = _
   var email:String = _
   var constituency:String = _
}

object User {

  def apply(user:User) {
    Some(user.name, user.email, user.constituency)
  }
}
