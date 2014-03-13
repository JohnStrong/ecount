package helpers.feed

import models.ecount.tallysys.ElectionBallotBox
import models.ecount.tallysys.implicits.Candidate
import play.api.libs.json.Json


object ToJson {

  def tallyResults(ballot:ElectionBallotBox, candidates:List[Candidate]) = {
    Json.obj(
      "cid" -> ballot.constituencyId,
      "eid" -> ballot.electionId,
      "results" -> candidates.map{candidate =>
        Json.obj(
          "id" -> candidate.id,
          "name" -> candidate.name,
          "tally" -> candidate.tally
        )
      }
    )
  }

}
