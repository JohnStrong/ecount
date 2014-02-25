import sbt._
import Keys._
import play.Project._

object ApplicationBuild extends Build {

  val appName         = "Ecount"
  val appVersion      = "0.1-SNAPSHOT"

  val appDependencies = Seq(
    "com.typesafe" %% "play-plugins-mailer" % "2.2.0"
  )

  val main = play.Project(
    appName, appVersion, appDependencies
  )
}