package controllers

import play.api.mvc._
import play.filters.csrf._

import helpers.{TallyFormHelper, FormErrors}
import service.util.Cache
import models.ecount.tallysys.UserAccountAccess

object TallyController extends Controller {

  private val DASHBOARD_SESSION_KEY = "sys.account"

  private def getSupervisedBallotBox(ballotId:Int) = {
    TallyFormHelper.getSupervisedBallotBox(ballotId)
  }

  private def getDashboardDependencies(account:UserAccountAccess) = {
    getSupervisedBallotBox(account.ballotId) match {
      case Some(ballot) => {
        val candidates = TallyFormHelper.getElectionCandidates(account.constituencyId, account.electionId)
        Some((candidates, ballot))
      }
      case _ => None
    }
  }

  def index = CSRFAddToken {
    Action { implicit request => {
      Ok(views.html.tally(TallyFormHelper.authForm))
    }}
  }

  def verification = CSRFCheck {
    Action { implicit request => {
      TallyFormHelper.authForm.bindFromRequest.fold(
        formWithErrors => {
         BadRequest(views.html.tally(formWithErrors))
        },
        representativeAuthData => {
          val key = representativeAuthData.authenticationKey
          val username = representativeAuthData.username

          TallyFormHelper.getAccountAccess(key, username) match {

            case Some(sessId) => {
             Redirect(routes.TallyController.dashboard).withSession{
               DASHBOARD_SESSION_KEY -> sessId
             }
            }
            case _ => {
              val formWithGlobalError = FormErrors.invalidVerificationId
              BadRequest(views.html.tally(formWithGlobalError))
            }
          }
        }
      )
    }}
  }

  def dashboard = Action {
    implicit request => {
      session.get(DASHBOARD_SESSION_KEY) match {
        case Some(sessId) => {
          Cache.getAccountFromCache(sessId) match {
            case Some(account) => {
              getDashboardDependencies(account) match {
                case Some(dependencies) => {
                  Ok(views.html.tallyDashboard(dependencies._1, dependencies._2))
                }
                case _ => {
                  val formWithGlobalError = FormErrors.noBallotBoxForAccount
                  BadRequest(views.html.tally(formWithGlobalError)).withNewSession
                }
              }
            }
            case _ => Unauthorized("unauthorized access to the tally system")
          }
        }
        case _ => Unauthorized("unauthorized access to the tally system")
      }
    }
  }
}
