package ibatis

import org.mybatis.scala.config.{Environment, Configuration}
import org.mybatis.scala.session.Session
import helper.ibatis.AccountStore


object PersistenceContext {
  val conf = Configuration("test/config/mybatis-config.xml")

  conf ++= AccountStore

  val store = conf.createPersistenceContext

  def withConnection[A] (block: Session => A): A =
    store.readOnly(block)

  def withTransaction[A] (block: Session => A): A =
    store.transaction(block)
}
