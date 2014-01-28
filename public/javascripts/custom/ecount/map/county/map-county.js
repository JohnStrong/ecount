var mapCounty = angular.module('Ecount.Map.County',
	['Ecount.Map.Util']);

mapCounty.directive('statTab', function() {
	return {
		restrict: 'E',
		transclude: true,
		scope: {},
		controller: function($scope) {
			var panes = $scope.panes = [];

			$scope.select = function(pane) {
				angular.forEach(panes, function(pane) {
					pane.selected = false;
				});

				pane.selected = true;
			};

			this.addPane = function(pane) {
				if (panes.length == 0) {
					$scope.select(pane);
				}

				panes.push(pane);
			};
		},

		templateUrl: '/templates/map/county/templates/statTab.html'
	};
});

mapCounty.directive('statPane', function() {
	return {
		require: '^statTab',
		restrict: 'E',
		transclude: true,
		scope: {
			title: '@'
		},
		link: function(scope, element, attrs, tabsCtrl) {
			tabsCtrl.addPane(scope);
		},
		templateUrl: '/templates/map/county/templates/statPane.html'
	};
});

mapCounty.directive('countyDirective', function() {
	return {
		restrict: 'E',
		controller: 'CountyController',
		templateUrl: '/templates/map/county/templates/county.html'
	}
})

mapCounty.directive('districtDirective', function() {
	return {
		transclude: true,
		restrict: 'E',
		controller: 'DistrictController',
		templateUrl: '/templates/map/county/templates/districts.html'
	};
});

mapCounty.directive('edDirective', function() {
	return {
		transclude: true,
		restrict: 'E',
		controller: 'DEDController',
		templateUrl: '/templates/map/county/templates/ded.html'
	};
});

mapCounty.controller('CountyController',
	['$scope', '$route', '$location',
	function($scope, $route, $location) {

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

mapCounty.controller('DistrictController',
	['$scope', 'GeomAPI', 'SharedMapService', 'MapStyle',
	function($scope, GeomAPI, SharedMapService, MapStyle) {

		var COUNTY_ZOOM = 12,
			MAP_VIEW_DOM_ID = 'county-map-view';

		$scope.initMap = function() {
			GeomAPI.electoralDivisions($scope.countyId, function(geom) {
				SharedMapService.setMap(MAP_VIEW_DOM_ID, { "zoom": COUNTY_ZOOM });
				SharedMapService.draw(geom, MapStyle.base);
			});
		}
	}
]);

mapCounty.controller('DEDController',
	['$scope', 'SharedMapService', 'GeomAPI', 'MapStyle',
	function($scope, SharedMapService, GeomAPI, MapStyle) {

		var MAP_VIEW_DOM_ID = 'ded-map-view',
			DED_ZOOM = 14;

		var gid = $scope.$parent.target.id;

		$scope.initDEDMap = function() {
			GeomAPI.electoralDivision(gid, function(geom) {
				SharedMapService.setMap(MAP_VIEW_DOM_ID, { 'zoom': DED_ZOOM });
				SharedMapService.draw(geom, MapStyle.base);
			});
		};
	}
]);