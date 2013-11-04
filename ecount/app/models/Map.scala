/**
 * Created with IntelliJ IDEA.
 * User: User 1
 * Date: 18/10/13
 * Time: 16:06
 * To change this template use File | Settings | File Templates.
 */

package models

import play.api.Play.current

import persistence._

class Map{
  var id:Int = _
  var csoCode:String = _
  var county:String = _
  var edLabel:String = _
}

object Map {

  def apply(id:Int, csoCode:String, county:String, edLabel:String) = {

    val m = new Map
    m.id = id
    m.csoCode = csoCode
    m.county = county
    m.edLabel = m.edLabel

    m
  }

  def unapply(m:Map) =
    Some(m.id , m.csoCode, m.county, m.edLabel)
}

