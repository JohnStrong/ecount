package service.dispatch

import persistence.ecount.{PersistenceContext, MapStore}
import PersistenceContext._

object MapDispatcher {

   lazy val getConstituencies = {
    withConnection { implicit conn =>
      val constituenciesList = MapStore.getConstituencies
      for(constituency <- constituenciesList.apply())
        yield (constituency.id -> constituency.title)
    }
   }
}
