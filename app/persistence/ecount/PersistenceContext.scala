package persistence.ecount

import org.mybatis.scala.config._
import org.mybatis.scala.session.Session
import play.api.Play.current
import play.api.db.DB._

object PersistenceContext {

  // configure db environment
  val conf =
    Configuration(
      Environment(
        "default",
        new ManagedTransactionFactory(),
        getDataSource()
      )
    )

  conf ++= MapStore
  conf ++= StatStore
  conf ++= AccountStore

  val store = conf.createPersistenceContext

  def withConnection[A] (block: Session => A): A =
    store.readOnly(block)

  def withTransaction[A] (block: Session => A): A =
    store.transaction(block)

}