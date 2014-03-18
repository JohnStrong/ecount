package models.stat

sealed trait Extractor
case class ElectionCandidateExtractor(constituencyId:Int, electionId:Int) extends Extractor
