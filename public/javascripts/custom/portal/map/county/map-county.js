var mapCounty = angular.module('Ecount.Map.County',
	['Ecount.Map.Util', 'Ecount.Map.Elections', 'Ecount.Map.County.Vis']);

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
	['ElectionStatistics',
	'Extend',
	function(ElectionStatistics, Extend) {

		function Tally() {};

		// pull tally results for constituency (cid) and assign on callback function...
		Tally.prototype.getElectionTally = function(cid, callback) {
			ElectionStatistics.getElectionTallyByConstituency(
				this.election.id, cid, callback);
		}


		function Live(election, constituencies) {

			this.FEED_QUERY_TIMER = 100000;

			this.election = election;

			this.constituencies = constituencies;

			this.tallyResults = null;

			this.live = true;
		};

		Extend(Live, Tally);

		// set results data to tally results object with the added update over time for live data...
		Live.prototype.getConstituencyResults = function(cid) {

			// fix not a function error...
			this.getTallyResults = function() {
				
				this.getElectionTally(cid, function(data) {
					this.tallyResults = data;
				}.bind(this));
			}.bind(this);

			this.getTallyResults();
			setInterval(this.getTallyResults, this.FEED_QUERY_TIMER);
		};

		function Previous(election, constituencies) {
			this.election = election;

			this.constituencies = constituencies;

			this.tallyResults = null;

			this.live = false;
		};

		Extend(Previous, Tally);

		// set results data to tally results object...
		Previous.prototype.getConstituencyResults = function(cid) {
			this.getElectionTally(cid, function(data) {
				this.tallyResults = data;
			}.bind(this));
		};

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
	['$scope',
	'Tally', 
	'Election', 
	'ElectionStatistics',
	'Map',
	'Visualize',
	function($scope, Tally, Election, ElectionStatistics, Map, Visualize) {

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

		// holds the latest tally (can be live or most recent)...
		$scope.mainTally = null;

		// get constituencies for this county...
		$scope.constituencies = null;

		$scope.closeCountyView = function(e) {
			$scope.countyTarget = null;
		}

		$scope.visConstituencyResults = function(cid) {
			$scope.mainTally.getConstituencyResults(cid);
		}

		$scope.getConstituencies = function() {
			ElectionStatistics.getElectionCountyConstituencies(
				$scope.countyTarget.id,
				function(data) {
					$scope.constituencies = data;
				});
		};

		// listens for an latest election tally...
		$scope.$on('latestTally', function(source, _election) {
			var isLive = isTallyOngoing(_election.tallyDate);

			// create an election object here and inject it into LatestTally...
			var election = new Election(_election);
			var constituencies = $scope.constituencies;

			$scope.mainTally = isLive?
				Tally.live(election, constituencies) : Tally.previous(election, constituencies);
		});

		// open ded stat view for the ded that has been selected on the imap...
		$scope.$on('target-change', function(event, args) {
			if($scope.renderPath[2]) {
				var dedId = args[0].gid;
				var results = $scope.mainTally.tallyResults.results;
				
				Visualize(results).ded(dedId);
			}
		});
	}
]);

mapCounty.controller('DistrictsMapController',
	['$scope', '$compile', 'Map', 'GeomAPI', 'MapStyle',
	function($scope, $compile, Map, GeomAPI, MapStyle) {
		
		var DISTRICTS_ZOOM = 16,
			DISTRICTS_VIEW_DOM_ID = 'county-map-view',

			MAP_CONTENT_LIST = '<ul class="well">' +
			'<li ng-repeat="c in constituencies">' +
			'<a href="" ng-click="visConstituencyResults(c.id)" class="btn">' +
			'{{c.title}}' +
			'</a>' +
			'</li>' +
			'</ul>',

			MAP_VIS_LAYER = '<div id="tally-results-vis" class="county-vis info-pane">' +
				'<div>' +
					'<div ng-if="mainTally.tallyResults !== null">' +
						'<a href="" class="btn vis-close" ng-click="visControl.empty()">Close[x]</a>' +
						'<vis-directive></vis-directive>' +
					'</div>' +
				'</div>' +
			'</div>',

			VIS_CONTENT_POSITION = 'topright',
			LIST_CONTENT_POSITION = 'bottomleft';

		$scope.listControl = null;

		$scope.visControl = null;

		// need a closer compile dom function for scoping reasons...
		$scope.compileDom = function(domStr) {
			var compiledDom = $compile(domStr),
				newScope = $scope.$new();

			return compiledDom(newScope)[0];
		};

		$scope.loadMap = function() {

			var countyId = $scope.countyTarget.id;

			var compiledConstList = $scope.compileDom(MAP_CONTENT_LIST),
				compiledVisContainer = $scope.compileDom(MAP_VIS_LAYER);

			// get ed geoms and set up map controls to display interactive content...
			GeomAPI.electoralDistricts(countyId, function(geom) {
				Map.draw(DISTRICTS_VIEW_DOM_ID, geom, {'style' : MapStyle.base});

				$scope.listControl = Map.addContentLayer(compiledConstList, LIST_CONTENT_POSITION);
				$scope.visControl = Map.addContentLayer(compiledVisContainer, VIS_CONTENT_POSITION);	
			});
		}
	}
]);

mapCounty.directive('visDirective', function() {
	return {
		restrict: 'E',
		controller: 'VisController'
	};
});

// fix close anchor button...
mapCounty.controller('VisController', 
	['$scope', '$element', 'Visualize',
	function($scope, $element, Visualize) {
		
		$scope.$watch('mainTally.tallyResults', function() {
			var visualize =  Visualize($scope.mainTally.tallyResults.results);
			visualize.county($element);
		});
	}
]);