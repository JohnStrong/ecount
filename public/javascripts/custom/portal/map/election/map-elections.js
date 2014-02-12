var mapElections = angular.module('Ecount.Map.Elections', []);

mapElections.factory('ElectionStatistics', ['$http',
	function($http) {

		var ALL_COUNTY_COUNSTITUENCIES_URL = '/api/elections/constituencies/',
			ALL_ELECTIONS_URL = '/api/elections/',
			ELECTION_STATS_GENERAL_URL = '/api/elections/general/',
			ELECTION_STATS_PARTY_URL = '/api/elections/party/',
			ELECTION_TALLY_CONSTITUENCY_URL = '/api/elections/tally/';

		return {

			getElections: function(callback) {
				$http.get(ALL_ELECTIONS_URL)
					.success(function(data) {
						callback(data);
					});
			},

			getElectionStatsGeneral: function(electionId, countyId, callback) {
				$http.get(ELECTION_STATS_GENERAL_URL + electionId + '/' + countyId)
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

			getElectionStatsParty: function(electionId, constituencyId, callback) {
				$http.get(ELECTION_STATS_PARTY_URL + electionId + '/' + constituencyId)
					.success(function(data) {
						callback(data);
					});
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
	['$scope', 'ElectionStatistics',
	function($scope, ElectionStatistics) {

		var tables = [],

			// filter functions for extractor utility
			filterFor = {
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

				ded: function(datum) {
					
					var result;

					// for each candidate, extracts the tally result relating to the current view 
					$.each(datum.results, function(k, d) { 
						if(d.dedId === $scope.districtTarget.dedId) {
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
			},

			extractor = function(dataSet) {
				return function(filter) {
					return resultSet = $.map(dataSet, function(datum) {
						return filter(datum);
					});
				}
			};

		$scope.constituencies = null;

		$scope.constituencyTallyResults = [];

		$scope.election = null;

		$scope.countyId = $scope.$parent.countyTarget.id;

		function visualizeConstituencyData(data) {
			$scope.$broadcast('updateVisualization', data);
		}

		this.addTable = function(scope) {
			tables.push(scope);
		};

		$scope.constituencies = function() {
			ElectionStatistics.getElectionCountyConstituencies(
				$scope.countyId,
				function(data) {
					$scope.constituencies = data;
				});
		};

		$scope.$watch('election', function() {

			// when user chooses election results, get tally data
			function getTallyStats(constituency) {
				ElectionStatistics.getElectionTallyByConstituency(
					$scope.election.id,
					constituency.id,
					function(d) {
						$scope.constituencyTallyResults.push(d);
					}
				);
			}

			if($scope.election !== null) {

				$scope.constituencyTallyResults = [];

				$.each($scope.constituencies, function(k, constituency) {
					getTallyStats(constituency);
				});
			}
		});

		// visualize map reduced tally results
		$scope.$on('visualizeStatistics', function(source, cid) {
			var dataSet = [],

				filter = null,

				extractorResult = null;

			$.each($scope.constituencyTallyResults, function(k, d) {
				if(d.id === cid) dataSet = d.results;
			});

			// apply the current data set in the extractor function
			var extract = extractor(dataSet);

			// get the corrrect filter for the current data-set
			if($scope.renderPath[2] === 'districts') {
				filter = filterFor.districts;
			} else if($scope.renderPath[2] === 'ded') {
				filter = filterFor.ded;
			}

			// apply the filter function to the supplied dataset
			var result = extract(function(datum) {
				return filter(datum);
			});

			// visualze the filtered tally data
			$scope.$broadcast('updateVisualization', result);
		});
	}
]);

mapElections.controller('ElectionController',
	['$scope', 'ElectionStatistics',
	function($scope, ElectionStatistics) {
		$scope.elections = [];

		ElectionStatistics.getElections(function(data) {
			$scope.elections = data;
		});
	}
]);