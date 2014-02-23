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

		// pull tally results for constituency (cid) and assign on callback function...
		Tally.prototype.getElectionTallyByConstituency = function(cid, callback) {
			for(var c in this.constitunecyResults) {

				console.log(cid, this.constitunecyResults[c]);

				if(this.constitunecyResults[c].id === cid) {
					callback(this.constitunecyResults[c]);
					return;
				}
			}
		};

		// set results data to tally results object with the added update over time for live data...
		Tally.prototype.getConstituencyResults = function(cid) {

			this.getElectionTallyByConstituency(cid, function(results) {
				console.log('callback', this, results);

				this.tallyResults = results;
			}.bind(this));
		};

		function Live(constituencies, election) {

			this.FEED_QUERY_TIMER = 10000;

			this.election = election;

			this.constituencies = constituencies;

			// values set by tally results function (contains all candidate results by constituency)...
			this.constitunecyResults = [];

			this.intervalId = setInterval(this.getTallyResults.bind(this),
				this.FEED_QUERY_TIMER);

			this.tallyResults = null;

			this.live = true;

			// get tally results initially...
			this.getTallyResults();
		};

		Extend(Live, Tally);

		// clear the current set interval on constituency change and start fresh...
		Live.prototype.stopUpdates = function() {
			if(this.intervalId !== null) {
				clearInterval(this.intervalId);
			}
		};

		// get tally results for all constituencies...
		Live.prototype.getTallyResults = function() {

			// update the constituency results for each constituency
			// if changes have occured...
			this.getTallyResultsForConstituencies(function(data) {

				var currentResults = this.constitunecyResults;

				console.log('new tally result', data);

				// if currentResults is less than the total constitunecy length
				// just add the new result...
				if(currentResults.length < this.constituencies.length) {
					currentResults.push(data);
					return;
				}

				// check if the returned dataset has changed from
				// its previous instance in the current result set...
				$.each(currentResults, function(k, result) {
					if(result.id === data.id && !this.areSame(result, data)) {

						console.log('tally result change');

						result = data;
						return;
					}
				}.bind(this));

				console.log('current tally results', this.constitunecyResults);

			}.bind(this));
		};

		function Previous(constituencies, election) {

			this.election = election;

			this.constituencies = constituencies;

			// values set by tally results function...
			this.constitunecyResults = [];

			this.tallyResults = null;

			this.live = false;
		};

		// get tally results for constituencies....
		Previous.prototype.getTallyResults = function() {
			this.getTallyResultsForConstituencies(function(data) {
				this.constitunecyResults.push(data);
			});
		};

		Extend(Previous, Tally);

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
		$scope.mainTally = null;

		// get constituencies for this county...
		$scope.constituencies = null;

		// the constituency id of which is open in the
		$scope.activeCid = null;

		// get results of constituency matching cid
		$scope.visConstituencyResults = function(cid) {

			// set the active cid (this is needed when listening for live updates)...
			$scope.activeCid = cid;

			// get constituency results for this cid (visualize directive will be activated)...
			console.log('viscalled', cid, $scope.mainTally);

			$scope.mainTally.getConstituencyResults(cid);
		};

		$scope.getConstituencies = function() {
			ElectionStatistics.getElectionCountyConstituencies(
				$scope.countyTarget.id,
				function(data) {
					$scope.constituencies = data;
				});
		};

		// stop feed interval if live feed, close view...
		$scope.dump = function() {
			if($scope.mainTally.intervalId) {
				$scope.mainTally.stopUpdates();
			}

			$scope.closeCountyView();
		};

		// listens for an latest election tally...
		$scope.$on('latestTally', function(source, _election) {
			var isLive = isTallyOngoing(_election.tallyDate);

			$scope.mainTally = isLive? Tally.live($scope.constituencies, _election) :
				Tally.previous($scope.constituencies, _election);
		});

		// open ded stat view for the ded that has been selected on the imap...
		$scope.$on('target-change', function(event, args) {

			// visualize ded results if renderPath == ded...
			if($scope.renderPath[2] === 'districts') {
				// district visualization...
				$scope.$broadcast('districtChange', args[0].gid);
			}
		});

		// when receiving live updates, set new tally results on change...
		$scope.$watch('mainTally.constitunecyResults', function(newVal) {

			console.log('watching cr', newVal);

			if(newVal) {
				$scope.mainTally.getConstituencyResults($scope.activeCid);
			}
		});
	}
]);

mapCountyMain.controller('DistrictsMapController',
	['$scope', '$compile', 'Map', 'GeomAPI', 'MapStyle',
	function($scope, $compile, Map, GeomAPI, MapStyle) {

		var DISTRICTS_ZOOM = 16,
			DISTRICTS_VIEW_DOM_ID = 'county-map-view',

			MAP_CONTENT_LIST = '<ul class="well info-pane county-vis">' +
			'<li ng-repeat="c in constituencies">' +
			'<a href="" ng-click="visConstituencyResults(c.id)" class="btn">' +
			'{{c.title}}' +
			'</a>' +
			'</li>' +
			'</ul>',

			DISTRICTS_VIS_LAYER = '<div id="tally-results-vis" class="county-vis info-pane">' +
				'<div>' +
					'<div ng-if="mainTally.tallyResults !== null">' +
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


		// empty the selected control...
		$scope.closeDistrictsVis = function() {
			$scope.districtsVisControl.empty();
			$scope.mainTally.tallyResults = null;
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

				Map.draw(DISTRICTS_VIEW_DOM_ID, geom, {'style' : MapStyle.base});

				Map.addContentLayer(templates[0], LIST_CONTENT_POSITION);

				// districts vis control...
				$scope.districtsVisControl = Map.addContentLayer(templates[1],
					DISTRICTS_VIS_CONTENT_POSITION);

				console.log('vis control', $scope.districtsVisControl);
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

		// watch for updates to tally results (change on live update or selection)...
		$scope.$watch('mainTally.tallyResults', function() {
			if($scope.mainTally.tallyResults) {

				console.log('called distircts', $scope);

				// set the vis container to visible before begining visualization...
				$scope.districtsVisControl.show();

				var results = $scope.mainTally.tallyResults.results;
				var visualize = Visualize(results, $element);
				visualize.county();
			}
		});
	}
]);

mapCountyMain.controller('DistrictVisController',
	['$scope', '$element', 'Visualize',
	function($scope, $element, Visualize) {

		var DISTRICT_VIS_CONTAINER_ID = '#district-vis-body',

			districtVisElem = $element.find(DISTRICT_VIS_CONTAINER_ID);

		$scope.districtId = null;

		function visualizeDistrictResults() {
			var results = [],

				constitunecyResults = $scope.mainTally.constitunecyResults;

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
		$scope.$on('districtChange', function(source, gid) {
			$scope.districtId = gid;
			visualizeDistrictResults();
		});
	}
]);