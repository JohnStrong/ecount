var map = angular.module('Ecount.Map',
	['Ecount.Map.Util', 'Ecount.Map.Elections']);

map.factory('MapStyle', function() {

	var DEFAULT_WEIGHT = 2,
    	DEFAULT_OPACITY = 0.5,
    	DEAULT_COLOR = '#888888',
   		DEAULT_FILL_COLOR = '#428BCA',
    	DEAULT_DASH_ARRAY = '3',
    	DEFAULT_FILL_OPACITY = 0.2;

	var base = {
		weight: DEFAULT_WEIGHT,
		opacity: DEFAULT_OPACITY,
    	color: DEAULT_COLOR,
    	fillColor: DEAULT_FILL_COLOR,
    	dashArray: DEAULT_DASH_ARRAY,
    	fillOpacity: DEFAULT_FILL_OPACITY
    };

    return {
        base: base
    };
});

map.directive('mapDirective', function() {
	return {
		restrict: 'E',
		controller: 'MapController',
		templateUrl: '/templates/core/templates/map.html'
	}
});

map.directive('mapBaseDirective', function() {
	return {
		restrict: 'E',
		controller: 'MapBaseController',
		templateUrl: '/templates/map/base/templates/base.html'
	};
});

map.controller('MapController',
	['$scope', '$route', '$location', 'ElectionStatistics',
	function($scope, $route, $location, ElectionStatistics) {

		// county currently being viewed...
		$scope.countyTarget = null;

		function loadCountyView() {
			var countyId = $scope.countyTarget.id;

			$location.path('/map/county/' + countyId);
			$route.reload();
		}

		// get all election tallys, if it is currently ongoing create a live feed for it...
		$scope.getElections = function() {
			ElectionStatistics.getElections(function(_elections) {

				var elections = [];

				$.each(_elections, function(k, election) {
					elections.push(election);
				});

				// remove latest and push it up to the feed view... (CountyController)
				var latestElection = elections.splice(0, 1);

				$scope.$broadcast('previousTallys', elections);
				$scope.$broadcast('latestTally', latestElection[0]);
			});
		}

		$scope.$on('target-change', function(event, args) {
			// check whether we are loading a district or all districts
			if(!$scope.renderPath[2]) {
				$scope.countyTarget = args[0];
				loadCountyView();
			}
		});
	}
]);

map.controller('MapBaseController',
	['$scope', 'GeomAPI', 'Map', 'MapStyle',
	function($scope, GeomAPI, Map, MapStyle)	{

		var IRELAND_ZOOM = 10,
			MAP_VIEW_DOM_ID = 'map-view',

			WELCOME_HTML = '<div class="welcome-info"><h1>Welcome to ecount!</h1><p>choose a county to vew some tally statistics</p></div>',
			WELCOME_POSITION = 'topright';

		$scope.initMap = function() {
			GeomAPI.countyBounds(function(geom) {
				Map.draw(MAP_VIEW_DOM_ID, geom, {'style' : MapStyle.base});
				Map.addContentLayer(WELCOME_HTML, WELCOME_POSITION);
			});
		};
	}
]);