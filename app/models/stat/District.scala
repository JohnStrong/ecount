package models.stat

class District {
  var id:Int =  _
  var title:String = _
}

object District {
  def apply(district: District) = {
    Some(district.id, district.title)
  }
}
