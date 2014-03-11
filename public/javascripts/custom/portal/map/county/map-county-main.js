var mapCountyMain = angular.module('Ecount.Map.County.Main',
[
'Ecount.Map.Elections',
'Ecount.Map.County.Vis',
'Ecount.Map.Util',
'Ecount.Struts.Util'
]);

mapCountyMain.service('Election',
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
mapCountyMain.factory('Tally',
	['ElectionStatistics', 'Extend', 'Compare',
	function(ElectionStatistics, Extend, Compare) {

		function Tally() {};

		// intended to compare the current dataset with the new...
		Tally.prototype.areSame = function(firstArr, secondArr) {
			return Compare(firstArr.results, secondArr.results);
		};

		// get all tally results from server...
		Tally.prototype.getTallyResultsForConstituencies = function(callback) {
			for(var c in this.constituencies) {
				ElectionStatistics.getElectionTallyByConstituency(
					this.election.id, this.constituencies[c].id, callback);
			}
		};

		// set results data to tally results object with the added update over time for live data...
		Tally.prototype.getConstituencyTallyResults = function(cid) {

			for(var c in this.constitunecyResults) {

				console.log(cid, this.constitunecyResults[c]);

				if(this.constitunecyResults[c].id === cid) {
					return this.constitunecyResults[c];
				}
			}
		};

		function Live(constituencies, election) {

			this.FEED_QUERY_TIMER = 10000;

			this.election = election;

			this.constituencies = constituencies;

			this.socket = new WebSocket('ws://localhost:9000/feed?eid=' + this.election.id)

			// listens for an update on constitueny results...
			this.socket.onmessage = function(evt) {
				console.log("'MESSAGE FROM SERVER: ", evt);
				this.constitunecyResults = evt.data;
			}

			this.intervalId = null;

			// values set by tally results function (contains all candidate results by constituency)...
			this.constitunecyResults = [];

			this.live = true;
		};

		Extend(Live, Tally);

		// get tally results for all constituencies...
		Live.prototype.getAllConstituencyResults = function() {

			// do nothing...
		};

		function Previous(constituencies, election) {

			this.election = election;

			this.constituencies = constituencies;

			// values set by tally results function...
			this.constitunecyResults = [];

			this.live = false;
		};

		Extend(Previous, Tally);

		// get tally results for constituencies....
		Previous.prototype.getAllConstituencyResults = function() {
			this.getTallyResultsForConstituencies(function(data) {
				this.constitunecyResults.push(data);
			}.bind(this));
		};

		return {
			live: function(constituencies, election) {
				return new Live(constituencies, election);
			},
			previous: function(constituencies, election) {
				return new Previous(constituencies, election);
			}
		};
	}
]);

mapCountyMain.directive('statTab', function() {
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

mapCountyMain.directive('statPane', function() {
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

mapCountyMain.directive('countyDirective', function() {
	return {
		restrict: 'E',
		controller: 'CountyController',
		templateUrl: '/templates/map/county/templates/county.html'
	};
});

mapCountyMain.controller('CountyController',
	['$scope',
	'Tally',
	'ElectionStatistics',
	function($scope, Tally, ElectionStatistics) {

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
		$scope.mainTallies = [];

		// the constituency id of which is open in the
		$scope.activeCid = null;

		// gets the constituencies for the current election...
		$scope.getConstituencies = function(eid, callback) {
			ElectionStatistics.getElectionCountyConstituencies(
				$scope.countyTarget.id, eid,
				function(data) {
					callback(data);
				});
		};

		// stop feed interval if live feed, close view...
		// clear the current set interval on constituency change and start fresh...
		$scope.dump = function() {
			$.each($scope.mainTallies, function(ith, tally) {
				if(tally.intervalId) {
					clearTimeout(tally.intervalId);
				}
			});

			$scope.closeCountyView();
		};

		// watch for live updates to constituencyResults....
		$scope.$watchCollection('mainTallies', function(newVal) {
			console.log('cr watch', newVal);
		});

		// listens for an latest election tally...
		$scope.$on('latestTally', function(source, _elections) {
			
			$.each(_elections, function(ith, _election) {
				var isLive = _election.isLive,

					tally = null;

				$scope.getConstituencies(_election.id, function(constituencies) {
				
					if(isLive) {
						tally = Tally.live(constituencies, _election);
					} else {
						tally = Tally.previous(constituencies, _election);
					}

					tally.getAllConstituencyResults();

					$scope.mainTallies.push(tally);
				});
			});
		});
	}
]);

mapCountyMain.directive('mainTallyDirective', function() {
	return {
		restrict: 'E',
		transclude: true,
		scope: {
			tally: '=tally'
		},
		controller: 'MainTallyController'
	}
});

// isolate our scope...
mapCountyMain.controller('MainTallyController',
	['$scope', function($scope) {
	}
]);

mapCountyMain.controller('DistrictsMapController',
	['$scope', '$compile', 'Map', 'GeomAPI', 'MapStyle',
	function($scope, $compile, Map, GeomAPI, MapStyle) {

		var DISTRICTS_ZOOM = 16,
			
			MAP_CONTENT_LIST = '<ul class="well info-pane county-vis">' +
			'<li ng-repeat="c in mainTally.constituencies">' +
			'<a href="" ng-click="visConstituencyResults(c.id)" class="btn">' +
			'{{c.title}}' +
			'</a>' +
			'</li>' +
			'</ul>',

			DISTRICTS_VIS_LAYER = '<div id="tally-results-vis" class="county-vis info-pane">' +
				'<div>' +
					'<div ng-if="activeCid !== null">' +
						'<button type="button" class="close" aria-hidden="true"' +
							'ng-click="closeDistrictsVis()">&times;</button>' +
						'<districts-vis-directive></districts-vis-directive>' +
					'</div>' +
				'</div>' +
			'</div>',

			DISTRICTS_VIS_CONTENT_POSITION = 'topright',

			LIST_CONTENT_POSITION = 'bottomleft';

		// compile vis templates...
		function compileTemplates() {
			var compiledConstList = $scope.compileDom(MAP_CONTENT_LIST),
				compiledVisContainer = $scope.compileDom(DISTRICTS_VIS_LAYER);

			return [compiledConstList, compiledVisContainer];
		}

		// container for the visualize view container...
		$scope.districtsVisControl = null;

		$scope.activeCid = null;

		// distirct is selected for vis...
		$scope.districtChange = function(gid) {
			$scope.$broadcast('districtVis', gid);
		};

		// get results of constituency matching cid
		$scope.visConstituencyResults = function(cid) {
			$scope.activeCid = cid;
			$scope.$broadcast('cidChange');
		};

		// empty the selected control...
		$scope.closeDistrictsVis = function() {
			$scope.districtsVisControl.empty();
		};

		// need a closer compile dom function for scoping reasons...
		$scope.compileDom = function(domStr) {
			var compiledDom = $compile(domStr),
				newScope = $scope.$new();

			return compiledDom(newScope)[0];
		};

		$scope.loadMap = function() {

			var countyId = $scope.countyTarget.id,

				templates = compileTemplates();

			// get ed geoms and set up map controls to display interactive content...
			GeomAPI.electoralDistricts(countyId, function(geom) {
				var id = $scope.$index,

					imap = Map.draw('imap-' + id, geom, {'style' : MapStyle.base}, 
						function(target) {

							// district visualization...
							$scope.districtChange(target.gid);
						});

				imap.createInfoControl(templates[0], LIST_CONTENT_POSITION);

				// districts vis control...
				$scope.districtsVisControl = imap.createInfoControl(templates[1],
					DISTRICTS_VIS_CONTENT_POSITION);
			});
		}
	}
]);

// directive that acts as a container for map control visualizations...
mapCountyMain.directive('districtsVisDirective', function() {
	return {
		restrict: 'E',
		controller: 'DistrictsVisController'
	};
});

// fix close anchor button...
mapCountyMain.controller('DistrictsVisController',
	['$scope', '$element', 'Visualize',
	function($scope, $element, Visualize) {

		$scope.visualize = function() {
			var cid = $scope.activeCid;

			// get the tally results for the active cid...
			var tallyResults = $scope.mainTally.getConstituencyTallyResults(cid);

			// set the vis container to visible before begining visualization...
			$scope.districtsVisControl.show();

			var visualize = Visualize(tallyResults.results, $element);
			visualize.county();
		}

		// watch for updates to tally results or the selected constituency id 
		// (change on live update or selection)...
		$scope.$watch('mainTally.constitunecyResults', function(newVal) {

			console.log('dvc mcr', newVal);

			// only visualize automatically if 
			// 1) a constituency is being viewed by the user
			// 2) there is data to view... 
			if($scope.activeCid && newVal) {
				$scope.visualize();
			}
		});

		// event triggered when user chooses an constituency to view..
		$scope.$on('cidChange', $scope.visualize);
	}
]);

mapCountyMain.controller('DistrictVisController',
	['$scope', '$element', 'Visualize',
	function($scope, $element, Visualize) {

		var DISTRICT_VIS_CONTAINER_ID = '#district-vis-body',

			districtVisElem = $element.find(DISTRICT_VIS_CONTAINER_ID);

		$scope.districtId = null;

		// visualizes tally results for the active district (using districtId)...
		function visualizeDistrictResults() {
			var results = [],

				constitunecyResults = $scope.mainTally.constitunecyResults;

			console.log('vis district');

			for(var r in constitunecyResults) {
				if(constitunecyResults[r].results.length > 0) {
					results.push(constitunecyResults[r].results);
				}
			}

			// visualize results for ded by gid...
			var visualize = Visualize(results, districtVisElem);
			visualize.ded($scope.districtId);

		}

		// closes the current visualization...
		$scope.closeDistrictVis = function() {
			districtVisElem.empty();
		}

		// if constituency results change we have to update vis with new results...
		$scope.$on('districtVis', function(source, gid) {
			$scope.districtId = gid;
			visualizeDistrictResults();
		});

		// event triggered when constituencyResults is updated in the Tally object...
		$scope.$watch('mainTally.constitunecyResults', function(newVal) {
			
			console.log('district vis cr', newVal);

			// only visualize automatically if 
			// 1) a district is being viewed by the user
			// 2) there is data to view... 
			if($scope.districtId && newVal) {
				visualizeDistrictResults();
			}
		});
	}
]);