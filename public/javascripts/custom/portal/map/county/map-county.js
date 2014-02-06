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
				$scope.$emit('visualizeStatistics', pane.$parent.c.id);
			};

			this.addPane = function(pane) {
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
});

mapCounty.directive('tallyFeedDirective', function() {
	return {
		controller: 'TallyFeedController',
		templateUrl: '/templates/map/county/templates/tallyFeed.html'
	};
});

mapCounty.directive('districtDirective', function() {
	return {
		restrict: 'E',
		controller: 'DistrictController',
		templateUrl: '/templates/map/county/templates/districts.html'
	};
});

mapCounty.controller('TallyFeedController',
	['$scope', function($scope) {
		$scope.tallyFeed = null;

		// request tally feed
		console.log('loaded');
	}
]);

mapCounty.controller('CountyController',
	['$scope', '$route', '$location',
	function($scope, $route, $location) {

		function loadEDView() {

			var gid = $scope.target.id;

			$location.path('/map/county/districts/' + gid);
			$route.reload();
		}

		$scope.$on('target-change', function(event, args) {
			console.log('fired');
			$scope.$parent.target = args[0];
			loadEDView();
		});
	}
]);

mapCounty.controller('IMapController', 
	['$scope', 'SharedMapService', 'GeomAPI', 'MapStyle',
	function($scope, SharedMapService, GeomAPI, MapStyle) {

		var DISTRICTS_ZOOM = 12,
			DISTRICTS_VIEW_DOM_ID = 'county-map-view';

			ED_VIEW_DOM_ID = 'ed-map-view',
			ED_ZOOM = 14;

		$scope.loadMap = {

			districts: function() {
				GeomAPI.electoralDivisions($scope.countyId, function(geom) {
					SharedMapService.setMap(DISTRICTS_VIEW_DOM_ID, { "zoom": DISTRICTS_ZOOM });
					SharedMapService.draw(geom, MapStyle.base);
				});
			},
			ed: function() {
				var gid = 2469; // test data right now.....
				GeomAPI.electoralDivision(gid, function(data) {
					SharedMapService.setMap(ED_VIEW_DOM_ID, { 'zoom': ED_ZOOM });
					SharedMapService.draw(data, MapStyle.base);
				});
			}
		};
	}
]);

mapCounty.controller('DEDController', 
	['$scope', function($scope) {
		$scope.initMap = function() {
			$scope.loadMap.districts();
		}
	}
]);

mapCounty.controller('EDController',
	['$scope', 
	function($scope) {
		$scope.initMap = function() {
			$scope.loadMap.ed();
		};
	}
]);