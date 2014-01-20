package controllers

/**
 * Created by User 1 on 20/01/14.
 */

import play.api.mvc._

object TemplateAssetsController extends Controller {

  val TEMPLATE_PATH_PREFIX = List("public", "javascripts", "custom", "templates")

  def at(file: String): Action[AnyContent] = {
    Assets.at(path="/" + TEMPLATE_PATH_PREFIX.mkString("/"), file)
  }

}
