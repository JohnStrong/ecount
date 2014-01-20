package models

/**
 * Created with IntelliJ IDEA.
 * User: User 1
 * Date: 05/01/14
 * Time: 01:50
 * To change this template use File | Settings | File Templates.
 */
class Point {
  var y:Long = _
  var x:Long = _
}

object Point {
  def apply(point:Point) =
    Some(point.y, point.x)
}
