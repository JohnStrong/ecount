var map = angular.module('Ecount.Map',
	['Map.Util']);

map.factory('MapStyle', function() {

	var DEFAULT_WEIGHT = 2;
    var DEFAULT_OPACITY = 0.5;
    var DEAULT_COLOR = '#888888';
    var DEAULT_FILL_COLOR = '#428BCA';
    var DEAULT_DASH_ARRAY = '3';
    var DEFAULT_FILL_OPACITY = 0.2;

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

map.controller('MapBaseController',
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