package models.ibatis

/**
 * Created by User 1 on 22/01/14.
 */
class User {
  var id:Long = _
  var email:String = _
  var name: String = _
  var constituency:String = _
  var apiKey:String = _
  var profession:String = _
}

object User {

  def apply(user:User) {
    Some(user.id, user.email,user.name, user.constituency, user.apiKey, user.profession)
  }

  def apply(id: Long, email: String, name: String, constituency: String, apiKey: String, profession: String) = {
    val user = new User
    user.id = id
    user.email = email
    user.name = name
    user.constituency = constituency
    user.apiKey = apiKey
    user.profession = profession

    user
  }
}
