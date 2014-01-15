var ecount = angular.module('Ecount', ['ngRoute', 'Core.Directive', 'IMap.Base'],

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

function ElectionController($scope, SharedMapService, Elections) {

	$scope.getElections = function() {
		Elections.getElections().success(function(data) {
			$scope.elections = data;
		}).error(function(err) {
			// defer error
		});
	}

	$scope.electionChange = function($event) {
		var button = $event.target;
		var electionId = $(button).closest("div").find("span").text();
		$scope.electionId(electionId);
	};
}

function MapController($scope, $route, $routeParams, $location, CountyBounds, SharedMapService) {

	var IRELAND_LAT = 53.40;
	var IRELAND_LON = -8;
	var IRELAND_ZOOM = 7;

	$scope.initMap = function() {

		CountyBounds.success(function(geom) {
			
			SharedMapService.setMap(L.map(
				'map-view',
				{
					"center": [IRELAND_LAT, IRELAND_LON],
					"zoom" : IRELAND_ZOOM
				}
			));

			SharedMapService.draw(geom).counties();

		}).error(function(err) {
			// defer error
		});
	};

	$scope.$on('selection', function(e, args) {

		var countyId = args[0].feature.properties.id;
		var electionId = args[1];

		$location.path('/map/county')
			.search({'cid' : countyId, 'eid': electionId});

		$route.reload();
	});
}

function CountyController($scope, $routeParams, Elections, ElectoralDivisions, SharedMapService) {

	$scope.init = function() {
		$scope.countyId = $routeParams.cid;
		$scope.electionId = $routeParams.eid;
	}

	$scope.initMap = function() {

		var COUNTY_ZOOM = 12;

		ElectoralDivisions($scope.countyId).success(function(geom) {
			SharedMapService.setMap(L.map('county-map-view', { "zoom" : COUNTY_ZOOM }));
			SharedMapService.draw(geom).electoralDivisions();
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

function AboutController($scope) {

}

function HomeController($scope) {

}