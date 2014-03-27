var map = angular.module('Ecount.Map',
	['Ecount.Map.Util', 'Ecount.Map.Elections']);

map.factory('MapStyle', function() {

	var DEFAULT_OPACITY = 0.5,
    	DEAULT_COLOR = '#888888',
   		DEAULT_FILL_COLOR = '#428BCA',
    	DEAULT_DASH_ARRAY = '2',
    	DEFAULT_WEIGHT = 2,
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

map.directive('statTab', function() {
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
				if(panes.length === 0) {
					$scope.select(pane);
				}

				panes.push(pane);
			};
		},

		templateUrl: '/templates/map/county/templates/statTab.html'
	};
});

map.directive('statPane', function() {
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

map.controller('MapController',
	['$scope', '$compile', '$route', '$location', 'ElectionStatistics',
	function($scope, $compile, $route, $location, ElectionStatistics) {

		$scope.county = null;

		$scope.compileDom = function(domStr) {
			var compiledDom = $compile(domStr),
				newScope = $scope.$new();

			return compiledDom(newScope)[0];
		};

		$scope.openCountyView = function(county) {
			$scope.county = county;
			$scope.$digest();
		};

		$scope.resetToHome = function() {
			$scope.county = null;
		};

		// get all election tallys, if it is currently ongoing create a live feed for it...
		$scope.getElections = function() {
			ElectionStatistics.getElections(function(_elections) {

				var elections = [],

					latestElections = [],
					sameDay = [];

				$.each(_elections, function(k, election) {
					elections.push(election);
				});

				// remove latest and push it up to the feed view... (CountyController)
				latestElections.push(elections.splice(0, 1)[0]);

				$.each(elections, function(ith, election) {
					if(election.tallyDate === latestElections[0].tallyDate) {
						sameDay.push(ith);
					}
				});

				$.each(sameDay, function(ith) {
					latestElections.push(elections.splice(ith, 1)[0]);
				});

				$scope.$broadcast('previousTallys', elections);
				$scope.$broadcast('latestTally', latestElections);
			});
		};
	}
]);

map.controller('MapBaseController',
	['$scope', 'GeomAPI', 'Map', 'MapStyle',
	function($scope, GeomAPI, Map, MapStyle)	{

		var IRELAND_ZOOM = 10,
			MAP_VIEW_DOM_ID = 'map-view',

			WELCOME_HTML = '<div class="welcome-info info-pane">' +
			'<h1>Welcome to ecount!</h1>' +
			'<p>choose a county to view some tally statistics</p></div>',

			WELCOME_POSITION = 'topright';

		$scope.initMap = function() {
			GeomAPI.countyBounds(function(geom) {
				var compiledWelcome = $scope.compileDom(WELCOME_HTML);

				var imap = Map.draw(MAP_VIEW_DOM_ID, geom, {'style' : MapStyle.base},
					function(target) {
						$scope.openCountyView(target);
					});
				imap.createInfoControl(compiledWelcome, WELCOME_POSITION);
			});
		};
	}
]);