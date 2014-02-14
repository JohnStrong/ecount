var mapElections = angular.module('Ecount.Map.Elections', []);

mapElections.factory('ElectionStatistics', ['$http',
	function($http) {

		var ALL_COUNTY_COUNSTITUENCIES_URL = '/api/elections/constituencies/',
			ALL_ELECTIONS_URL = '/api/elections/',
			ELECTION_TALLY_CONSTITUENCY_URL = '/api/elections/tally/';

		return {

			getElections: function(callback) {
				$http.get(ALL_ELECTIONS_URL)
					.success(function(data) {
						callback(data);
					});
			},
			
			getElectionCountyConstituencies: function(countyId, callback) {
				$http.get(ALL_COUNTY_COUNSTITUENCIES_URL + countyId)
					.success(function(data) {
						callback(data);
					})
			},

			getElectionTallyByConstituency: function(electionId, constituencyId, callback) {
				$http.get(ELECTION_TALLY_CONSTITUENCY_URL + electionId + '/' + constituencyId)
					.success(function(data) {
						callback(data);
					});
			}
		};
	}
]);

// extracts tally results from the provided data set following a filter heuristic...
mapElections.service('TallyExtractor', 
	[function() {
		// filter functions for extractor utility
		var filterFor = {
				districts: function(datum) {
					
					// computes the sum of all district tally results per candidate
					var result = datum.results.reduce(function(prev, next) {
						return prev.result + next.result;
					});

					return {
						'id': datum.id,
						'name' : datum.name,
						'count' : result
					};
				},

				ded: function(dedId) {
					
					return function(datum) {
					
						var result;

						// for each candidate, extracts the tally result relating to the current view 
						$.each(datum.results, function(k, d) { 
							if(d.dedId === dedId) {
								result = d.result;
								return;
							} 
						});

						return {
							'id' : datum.id,
							'name' : datum.name,
							'count' : result 
						};
					}
				}
			};

		return function(scope, dataSet) {
			var filter = null;

			// get the corrrect filter for the current data-set
			if(scope.renderPath[2] === 'districts') {
				filter = filterFor.districts;
			} else if(scope.renderPath[2] === 'ded') {
				filter = filterFor.ded(scope.districtTarget.dedId);
			}

			return function(callback) {
				var resultSet = $.map(dataSet, function(datum) {
					return filter(datum);
				});

				callback(resultSet);
			}
		};
	}
]);

mapElections.directive('electionDirective', function() {
 	return {
 		restrict: 'E',
 		controller: 'ElectionController',
 		templateUrl: '/templates/map/election/templates/election.html'
 	};
 });

mapElections.directive('constituencyTableDirective', function() {
	return {
		restrict: 'E',
		transclude: true,
		templateUrl: '/templates/map/county/templates/constituencyTable.html'
	};
});

mapElections.controller('ElectionStatController',
	['$scope', 'ElectionStatistics', 'TallyExtractor',
	function($scope, ElectionStatistics, TallyExtractor) {

		var tables = [];

		this.addTable = function(scope) {
			tables.push(scope);
		};

		$scope.constituencies = null;

		$scope.constituencyTallyResults = [];

		$scope.election = null;

		$scope.countyId = $scope.$parent.countyTarget.id;

		// get constituencies within the current county...
		$scope.constituencies = function() {
			ElectionStatistics.getElectionCountyConstituencies(
				$scope.countyId,
				function(data) {
					$scope.constituencies = data;
				});
		};

		$scope.$watch('election', function() {

			var constituencyStats = [];

			function getTallyStats(constituency) {
				ElectionStatistics.getElectionTallyByConstituency(
				$scope.election.id, constituency.id,
				function(d) {
					if(d.results.length > 0) {
						d.title = constituency.title;
						constituencyStats.push(d);
					}
				});
			}

			if($scope.election !== null) {

				// get the immediate tally results for each constituency
				$.each($scope.constituencies, function(k, constituency) {
					getTallyStats(constituency);
				});

				$scope.constituencyTallyResults = constituencyStats;
			}
		});

		// visualize map reduced tally results
		$scope.$on('visualizeStatistics', function(source, cid) {
			var dataSet = [];

			// find the correct result set for the current constituency
			$.each($scope.constituencyTallyResults, function(k, d) {
				if(d.id === cid) dataSet = d.results;
			});

			// apply the current data set in the extractor function
			var extractor = new TallyExtractor($scope, dataSet);

			// apply the filter function to the supplied dataset
			var result = extractor(function(result) {
				$scope.$broadcast('emptyVisualization');
				$scope.$broadcast('updateVisualization', result);
			});
		});
	}
]);

mapElections.controller('ElectionController',
	['$scope', 'ElectionStatistics',
	function($scope, ElectionStatistics) {

		$scope.elections = [];
		
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

		// get all election tallys, if it is currently ongoing create a live feed for it...
		ElectionStatistics.getElections(function(elections) {
			$.each(elections, function(k, election) {
				if(isTallyOngoing(election.tallyDate)) {
					$scope.$emit('liveTally', election);
				} else {
					$scope.elections.push(election);
				}
			});
		});
	}
]);