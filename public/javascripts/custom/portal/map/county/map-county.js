var mapCounty = angular.module('Ecount.Map.County',
	['Ecount.Map.Util', 'Ecount.Map.Elections']);

mapCounty.service('Election',
	[function() {
		return function(_election) {
			this.id = _election.id;
			this.title = _election.title;
			this.tallyDate = _election.tallyDate;
		}
	}
]);

// service that streams tally data in near real-time from server to client
// should be able to:
//		- get the latest candidates and results
//		- compute the count/percentage total at a high level
mapCounty.factory('Tally',
	['ElectionStatistics', 'TallyExtractor',
	function(ElectionStatistics, TallyExtractor) {

		var getLatestTallyResults = function(eid, cid) {

			var results = null;

			
			return results;
		};

		var Tally = function(election, constituencies) {
			this.election = election;

			this.constituencies = constituencies;

			this.tallyResults = null;
		};


		var Live = Tally
		Live.prototype.getConstituencyResults = function(cid) {
			console.log('live', cid);
		};

		var Previous = Tally
		Previous.prototype.getConstituencyResults = function(cid) {
			console.log('previous', cid);
		}

		return {
			live: function(election, constituencies) {
				return new Live(election, constituencies);
			},
			previous: function(election, constituencies) {
				return new Previous(election, constituencies);
			}
		};
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

mapCounty.controller('CountyController',
	['$scope', '$route', '$location', 'Tally', 'Election', 'ElectionStatistics',
	function($scope, $route, $location, Tally, Election, ElectionStatistics) {

		// the district we are viewing...
		$scope.districtTarget = null;

		// holds the latest tally (can be live or most recent)...
		$scope.mainTally = null;

		// get constituencies for this county
		$scope.constituencies = null;

		$scope.getConstituencies = function() {
			ElectionStatistics.getElectionCountyConstituencies(
				$scope.countyTarget.id,
				function(data) {
					$scope.constituencies = data;
				});
		};

		// check if tally is live...
		var isTallyOngoing = (function() {

			var DATE_SUBSTRING_SPLIT_SYMBOL = 'T';

			// returns true if an election tally date matches the current date
			return function(tallyDate) {
				var currentISO = new Date().toISOString(),

					currentDate = currentISO.substring(0,
						currentISO.indexOf(DATE_SUBSTRING_SPLIT_SYMBOL));

				return currentDate === tallyDate;
			};
		})();

		function loadDEDView () {
			var dedId = $scope.districtTarget.gid;
			$location.path('/map/county/districts/' + dedId);
			$route.reload();
		}

		// listens for an latest election tally...
		$scope.$on('latestTally', function(source, _election) {
			var isLive = isTallyOngoing(_election.tallyDate);

			// create an election object here and inject it into LatestTally...
			var election = new Election(_election);
			var constituencies = $scope.constituencies;

			$scope.mainTally = isLive?
				Tally.live(election, constituencies) : Tally.previous(election, constituencies);
		});

		// open ded stat view for the ded that has been selected on the imap
		$scope.$on('target-change', function(event, args) {
			if($scope.renderPath[2]) {
				$scope.districtTarget = args[0];
				loadDEDView();
			}
		});
	}
]);

mapCounty.controller('DistrictsMapController',
	['$scope', 'SharedMapService', 'GeomAPI', 'MapStyle',
	function($scope, SharedMapService, GeomAPI, MapStyle) {
		console.log($scope);

		var DISTRICTS_ZOOM = 12,
			DISTRICTS_VIEW_DOM_ID = 'county-map-view';

		$scope.loadMap = function() {

			var countyId = $scope.countyTarget.id;

			GeomAPI.electoralDistricts(countyId, function(geom) {
				SharedMapService.setMap(DISTRICTS_VIEW_DOM_ID, { "zoom": DISTRICTS_ZOOM });
				SharedMapService.draw(geom, MapStyle.base);
			});
		}
	}
]);

mapCounty.controller('DEDController',
	['$scope',
	function($scope) {

		// load map up to corr with current election value
		console.log('DEDController', $scope);
	}
]);