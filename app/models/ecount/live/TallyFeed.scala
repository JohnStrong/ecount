package models.ecount.live

import collection.mutable.{ListBuffer, HashMap}

import play.api.libs.json._
import play.api.libs.iteratee.Concurrent

import helpers.feed.ToJson

import models.ecount.tallysys.ElectionBallotBox
import models.ecount.tallysys.implicits.Candidate

import service.dispatch.tallysys.AccountDispatcher

case class SocketClient(channel:Concurrent.Channel[JsValue])

object TallyFeed {

  private val clients:HashMap[(Int,Int), ListBuffer[SocketClient]] = HashMap.empty

  private def isKey(keyPair:(Int,Int)):Boolean = {
    clients.isDefinedAt(keyPair)
  }

  private def broadcast(results:JsValue)(ballot:ElectionBallotBox, countyId:Int) = {
    val channels = clients.find(_._1 == (ballot.electionId, countyId))

    channels.foreach { c =>
      c._2.foreach(_.channel.push(results))
    }
  }

  private def addOrUpdateClients(
      keyPair:(Int,Int),
      newClient:SocketClient,
      isKey:((Int,Int))=>Boolean
  ) {

    isKey(keyPair) match {
      case true => {
        val existing = clients.find(_._1 == keyPair)
        val updated = existing.map { e => (e._1 -> e._2.:+(newClient)) }

        clients.-=(keyPair)
        clients.+=(updated.get)
      }
      case false => {
        val newClientList = ListBuffer(newClient)
        clients.+=(keyPair -> newClientList)
      }
    }
  }

  def addNewClient(channel:Concurrent.Channel[JsValue], keys:(Int, Int)) {

    val newClient = SocketClient(channel)
    addOrUpdateClients(keys, newClient, isKey)
  }

  def broadcastCandidateTallyResults(ballot:ElectionBallotBox, candidates:List[Candidate]) = {
    val resultsJson = ToJson.tallyResults(ballot, candidates)
    val emit = broadcast(resultsJson)_

    AccountDispatcher.getCountyIdForConstituency(ballot.constituencyId) match {
      case Some(countyId) =>
        emit(ballot, countyId); true
      case _ => false
    }
  }
}
