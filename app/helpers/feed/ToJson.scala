package helpers.feed

import models.tallysys.ElectionBallotBox
import models.tallysys.implicits.Candidate
import play.api.libs.json.Json


object ToJson {

  def tallyResults(ballot:ElectionBallotBox, candidates:List[Candidate]) = {
    Json.obj(
      "cid" -> ballot.constituencyId,
      "dedId" -> ballot.dedId,
      "results" -> candidates.map{candidate =>
        Json.obj(
          "id" -> candidate.id,
          "name" -> candidate.name,
          "result" -> candidate.tally
        )
      }
    )
  }

}
