package models.tallysys.implicits;

case class Candidate(id:Int, name:String, tally:Int)
case class TallyGroup(candidates:List[Candidate])