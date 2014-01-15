var ecount = angular.module('Ecount', ['ngRoute', 'ngAnimate','Core.Directive', 'IMap.Base'],

	function($routeProvider, $locationProvider) {

		$routeProvider.when('/', {
			templateUrl: '/home',
			controller: HomeController,
			controllerAs: 'home'
		});
		$routeProvider.when('/map', {
			templateUrl: '/map'
		});
		$routeProvider.when('/about', {
			templateUrl: '/about',
			controller: AboutController,
			controllerAs: 'about'
		});
		$routeProvider.when('/map/county', {
			templateUrl: '/map/county',
			controller: CountyController,
			controllerAs: 'county'
		});

	// configure html5 to get links working on jsfiddle
	$locationProvider.html5Mode(true);
});

//1 to 2

function ElectionController($scope, SharedMapService, Elections) {
	$scope.elections = [];

	$scope.getElections = function() {
		Elections.getElections().success(function(data) {
			$scope.elections = data;
			$scope.election = $scope.elections[0];
		}).error(function(err) {
			// defer error
		});
	}
}

function MapController($scope, $route, $routeParams, $location, GeomAPI, SharedMapService) {

	var IRELAND_ZOOM = 9;

	$scope.initMap = function() {
		GeomAPI.countyBounds().success(function(geom) {
			
			SharedMapService.setMap('map-view', { "zoom": IRELAND_ZOOM});
			SharedMapService.draw(geom);

		}).error(function(err) {
			// defer error
		});
	};

	$scope.$on('selection', function(e, args) {

		var countyId = $scope.county.feature.properties.id;
		var electionId = $scope.election.id;

		$location.path('/map/county')
			.search({ 'eid': electionId, 'cid' : countyId });

		$route.reload();
	});
}

function CountyController($scope, $routeParams, Elections, GeomAPI, SharedMapService) {

	var COUNTY_ZOOM = 12;

	$scope.init = function() {
		$scope.countyId = $routeParams.cid;
		$scope.electionId = $routeParams.eid;
	}

	$scope.initMap = function() {

		GeomAPI.electoralDivisions($scope.countyId).success(function(geom) {

			SharedMapService.setMap('county-map-view', { "zoom": COUNTY_ZOOM });
			SharedMapService.draw(geom);
		})
		.error(function(err) {
			//defer error
		});
	}

	$scope.electionResults = function() {

		Elections.electionStatsGeneral($scope.electionId, $scope.countyId)
		.success(function(stats) {
			$scope.general = stats;
		})
		.error(function(err) {
			// defer error
		});

		Elections.electionStatsParty($scope.electionId, $scope.countyId)
		.success(function(data) {
			$scope.constituencies = [];

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

function VisualizationController($scope, $element, Visualize) {
	Visualize.init($scope.c.stats, $scope.c.title);
	Visualize.firstPreferenceVotes($element[0]);
	Visualize.percentageVote($element[0]);
	Visualize.seats($element[0]);
}

function AboutController($scope) {

}

function HomeController($scope) {

}