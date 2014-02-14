var mapCounty = angular.module('Ecount.Map.County',
	['Ecount.Map.Util']);

mapCounty.service('LiveTallyFeed', 
	[function() {

		var LIVE_TALLY_RESULTS_UPDATE_INTERVAL = 10000,
			
			getLiveTallyResults = function() {
				console.log('called');
			},

			getElectionCandidates = function() {

			};

		return function(election) {

			this.title = election.title;
			this.date = election.tallyDate;

			this.candidates = [];
			this.percentageTallied = 0;

			setInterval(getLiveTallyResults, LIVE_TALLY_RESULTS_UPDATE_INTERVAL);
		}
	}
]);

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
				if(panes.length === 0) {
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
	};
});

mapCounty.directive('tallyFeedDirective', function() {
	return {
		controller: 'TallyFeedController',
		templateUrl: '/templates/map/county/templates/tallyFeed.html'
	};
});

mapCounty.controller('TallyFeedController',
	['$scope', function($scope) {
		$scope.tallyFeed = null;
	}
]);

mapCounty.controller('CountyController',
	['$scope', '$route', '$location', 'LiveTallyFeed',
	function($scope, $route, $location, LiveTallyFeed) {

		// the district we are viewing...
		$scope.districtTarget = null;

		// holds the live tally count ongoing if one exists...
		$scope.liveTally = null;

		function loadDEDView() {
			var dedId = $scope.districtTarget.dedId;

			$location.path('/map/county/districts/' + dedId);
			$route.reload();
		}

		// listens for any ongoing election tallys...
		$scope.$on('liveTally', function(source, liveElectionTally) {
			$scope.liveTally = new LiveTallyFeed(liveElectionTally);
			console.log($scope.liveTally);
		});

		// check whether we are loading a district or all districts...
		$scope.$on('target-change', function(event, args) {

			if($scope.renderPath[2]) {
				$scope.districtTarget = args[0];
				loadDEDView();
			}
		});
	}
]);

mapCounty.controller('IMapController',
	['$scope', 'SharedMapService', 'GeomAPI', 'MapStyle',
	function($scope, SharedMapService, GeomAPI, MapStyle) {

		var DISTRICTS_ZOOM = 12,
			DISTRICTS_VIEW_DOM_ID = 'county-map-view',

			ED_VIEW_DOM_ID = 'ded-map-view',
			ED_ZOOM = 14;

		$scope.loadMap = {

			districts: function(countyId) {
				var countyId = $scope.countyTarget.id;

				GeomAPI.electoralDistricts(countyId, function(geom) {
					SharedMapService.setMap(DISTRICTS_VIEW_DOM_ID, { "zoom": DISTRICTS_ZOOM });
					SharedMapService.draw(geom, MapStyle.base);
				});
			},
			ed: function(dedId) {
				var gid = $scope.districtTarget.gid;

				GeomAPI.electoralDistrict(gid, function(data) {
					SharedMapService.setMap(ED_VIEW_DOM_ID, { 'zoom': ED_ZOOM });
					SharedMapService.draw(data, MapStyle.base);
				});
			}
		};
	}
]);

mapCounty.controller('DistrictsController',
	['$scope',
	function($scope) {

		$scope.$watch('election', function() {
			$scope.loadMap.districts();
		});
	}
]);

mapCounty.controller('DEDController',
	['$scope',
	function($scope) {

		// load map up to corr with current election value
		$scope.loadMap.ed();

		$scope.$watch('election', function() {
			$scope.loadMap.ed();
		});
	}
]);