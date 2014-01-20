package models

/**
 * Created with IntelliJ IDEA.
 * User: User 1
 * Date: 29/11/13
 * Time: 23:24
 * To change this template use File | Settings | File Templates.
 */
class County {
  var id:Long = _
  var name:String = _
}

object County {

  def apply(id:Long, name: String) = {

    val c = new County()
    c.id = id
    c.name = name
  }

  def unapply(county: County) = {
    Some(county.id, county.name)
  }
}
