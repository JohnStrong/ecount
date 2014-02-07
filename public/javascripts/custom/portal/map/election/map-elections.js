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

		var tables = [];

		$scope.constituencies = null;
		$scope.constituencyTallyResults = [];
		$scope.election = null;
		$scope.countyId = $scope.$parent.countyTarget.id;

		function visualizeConstituencyData(data) {
			$scope.$broadcast('updateVisualization', data);
		}

		function MapReduce(data) {
			// TODO...
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
			var dataSet = [];

			$.each($scope.constituencyTallyResults, function(k, d) {
				if(d.id === cid) dataSet = d.results;
			});

			if($scope.renderPath[2] === 'ded') {
				$scope.$broadcast('updateVisualization', dataSet);
			} else {
				// TODO map-reduce phase of tally stats by each district
			}
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