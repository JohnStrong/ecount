package models.ecount.live

import play.api.libs.json.Json
import play.api.libs.iteratee.Concurrent

import models.ecount.tallysys.ElectionBallotBox
import models.ecount.tallysys.implicits.Candidate

case class SocketClient(channel:Concurrent.Channel[String])

object TallyFeed {

  private var clients:Map[(Int,Int), List[SocketClient]] = Map.empty

  private def isKey(keyPair:(Int,Int)):Boolean = {
    clients.isDefinedAt(keyPair)
  }

  private def resultToJson(ballot:ElectionBallotBox, candidates:List[Candidate]) = {
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

  private def addOrUpdateClients(
      keyPair:(Int,Int),
      newClient:SocketClient,
      isKey:((Int,Int))=>Boolean
  ) {

    isKey(keyPair) match {
      case true => {
        val client = clients.find(client => client._1 == keyPair)
        client.map { c =>
          c._2.++(newClient::List())
        }
      }
      case false => {
        val newClientList = List(newClient)
        clients = clients.+(keyPair -> newClientList)
      }
    }
  }

  def addNewClient(channel:Concurrent.Channel[String], keys:(Int, Int)) {

    val newClient = SocketClient(channel)
    addOrUpdateClients(keys, newClient, isKey)

    Console.println(clients)
  }

  // TODO: improve response before working on front end... should work with map of clients (not list)
  def broadcastCandidateTallyResults(ballot:ElectionBallotBox, candidates:List[Candidate]) = {
    val resultsJson = resultToJson(ballot, candidates)

    // TODO: broadcast results....

  }
}
