var ecount = angular.module('Ecount',
	['ngRoute', 'ngAnimate', 'Core.Directive', 'IMap.Base']);

ecount.config(
	function($routeProvider) {

		$routeProvider
			.when(
				'/home',
				{
					action: 'home'
				}
			)
			.when(
				'/map',
				{
					action: 'map.base'
				}
			)
			.when(
				'/about',
				{
					action: 'about'
				}
			)
			.when(
				'/map/election/:eid/county/:cid',
				{
					action: 'map.county.ded'
				}
			)
			.when(
				'/map/county/districts/:gid',
				{
					action: 'map.county.ed'
				}
			)
			.when(
				'/map/county/ed',
				{
					controller: 'DEDController',
					templateUrl: '/map/county/ed'
				}
			);
		}
);

ecount.controller('AppController',
	['$scope', '$route', '$routeParams',
	function($scope, $route, $routeParams) {

		var render = function() {

			var renderAction = $route.current.action;
			var renderPath = renderAction.split(".");

			$scope.renderAction = renderAction;
			$scope.renderPath = renderPath;
		};

		$scope.$on('$routeChangeSuccess',
			function($currentRoute, $previousRoute) {
				render();
			}
		);
	}
]);

//1 to 2
ecount.controller('ElectionController',
	['$scope', 'ElectionStatistics',
	function($scope, ElectionStatistics) {
		$scope.elections = [];

		$scope.getElections = function() {
			ElectionStatistics.getElections().success(function(data) {
				$scope.elections = data;
				$scope.$parent.election = $scope.elections[0];
			}).error(function(err) {
				// defer error
			});
		}
	}
]);

ecount.controller('ElectionStatController',
	['$scope', 'ElectionStatistics',
	function($scope, ElectionStatistics) {

		var tables = [];

		$scope.constituencies = [];
		$scope.electionId = $scope.election.id;
		$scope.countyId = $scope.target.id;

		this.addTable = function(scope) {
			tables.push(scope);
		};

		$scope.electionResults = function() {

			ElectionStatistics.getElectionStatsGeneral($scope.electionId, $scope.countyId)
			.success(function(stats) {
				$scope.general = stats;
			})
			.error(function(err) {
				// defer error
			});

			ElectionStatistics.getElectionStatsParty($scope.electionId, $scope.countyId)
			.success(function(data) {

				$.each(data, function(k, party) {
					if(party.stats.length > 0) {
						$scope.constituencies.push(party);
					}
				});
			})
			.error(function(err) {
				// defer error
			});
		}
	}
]);

ecount.controller('MapController',
	['$scope', '$route', '$location',
	function($scope, $route, $location) {

		$scope.target = null;
		$scope.election = null;

		$scope.loadCountyView = function() {
			var countyId = $scope.target.id;
			var electionId = $scope.election.id;

			$location.path('/map/election/' + electionId + '/county/' + countyId);
			$route.reload();
		}

		$scope.$on('target-change', function(event, args) {
			$scope.target = args[0];
			$("#election-modal").modal();
		});
	}
]);

ecount.controller('MapBaseController',
	['$scope', 'GeomAPI', 'SharedMapService', 'MapStyle',
	function($scope, GeomAPI, SharedMapService, MapStyle)	{

		var IRELAND_ZOOM = 10;
		var MAP_VIEW_DOM_ID = 'map-view';

		$scope.initMap = function() {
			GeomAPI.countyBounds().success(function(geom) {
				SharedMapService.setMap(MAP_VIEW_DOM_ID, { "zoom": IRELAND_ZOOM});
				SharedMapService.draw(geom, MapStyle.base);
			}).error(function(err) {
				// defer error
			});
		}

		$scope.electionSelected = function() {
			$('#election-modal').modal('hide')
				.on('hidden.bs.modal', $scope.loadCountyView);
		};
	}
]);

ecount.controller('CountyController',
	['$scope', '$route', '$location',
	function($scope, $route, $location) {

		$scope.countyId = null;
		$scope.electionId = null;

		function loadEDView() {

			var gid = $scope.target.id;

			$location.path('/map/county/districts/' + gid);
			$route.reload();
		}

		$scope.$on('target-change', function(event, args) {
			$scope.$parent.target = args[0];
			loadEDView();
		});
	}
]);

ecount.controller('DistrictController',
	['$scope', 'GeomAPI', 'SharedMapService', 'MapStyle',
	function($scope, GeomAPI, SharedMapService, MapStyle) {

		var COUNTY_ZOOM = 12;
		var MAP_VIEW_DOM_ID = 'county-map-view';

		$scope.initMap = function() {
			GeomAPI.electoralDivisions($scope.countyId).success(function(geom) {
				SharedMapService.setMap(MAP_VIEW_DOM_ID, { "zoom": COUNTY_ZOOM });
				SharedMapService.draw(geom, MapStyle.base);
			})
			.error(function(err) {
				//defer error
			});
		}
	}
]);

ecount.controller('DEDController',
	['$scope', 'SharedMapService', 'GeomAPI', 'MapStyle',
	function($scope, SharedMapService, GeomAPI, MapStyle) {

		var MAP_VIEW_DOM_ID = 'ded-map-view';
		var DED_ZOOM = 14;

		var gid = $scope.$parent.target.id;

		$scope.initDEDMap = function() {
			GeomAPI.electoralDivision(gid).success(function(geom) {
				SharedMapService.setMap(MAP_VIEW_DOM_ID, { "zoom": DED_ZOOM });
				SharedMapService.draw(geom, MapStyle.base);
			})
			.error(function(err) {
				//defer error
			});
		};
	}
]);

ecount.controller('VisualizationController',
	['$scope', '$element', 'Visualize',
	function($scope, $element, Visualize)	{
		Visualize.init($scope.c.stats, $scope.c.title);
		Visualize.firstPreferenceVotes($element[0]);
		Visualize.percentageVote($element[0]);
		Visualize.seats($element[0]);
	}
]);

ecount.controller('AboutController', ['$scope',
	function($scope)	{

	}
]);

ecount.controller('HomeController', ['$scope',
	function($scope)	{

	}
]);