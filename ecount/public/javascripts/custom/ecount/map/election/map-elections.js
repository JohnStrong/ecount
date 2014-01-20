var mapElections = angular.module('Ecount.Map.Elections', []);

mapElections.factory('ElectionStatistics', ['$http',
	function($http) {

		var ALL_COUNTY_COUNSTITUENCIES_URL = '/api/elections/const/'
		var ALL_ELECTIONS_URL = '/api/elections/';
		var ELECTION_STATS_GENERAL_URL = '/api/elections/general/';
		var ELECTION_STATS_PARTY_URL = '/api/elections/party/';

		return {

			getElections: function() {
				return $http.get(ALL_ELECTIONS_URL);
			},

			getElectionStatsGeneral: function(electionId, countyId) {
				return $http.get(ELECTION_STATS_GENERAL_URL
					+ electionId + '/' + countyId);
			},

			getElectionStatsParty: function(electionId, countyId) {
				return $http.get(ELECTION_STATS_PARTY_URL
					+ electionId + '/' + countyId);
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


mapElections.controller('ElectionController',
	['$scope', 'ElectionStatistics',
	function($scope, ElectionStatistics) {
		$scope.elections = [];

		$scope.getElections = function() {
			ElectionStatistics.getElections().success(function(data) {
				$scope.elections = data;
				$scope.$parent.election = $scope.elections[0];
			}).error(function(err) {
				// defer error
			});
		}
	}
]);

mapElections.controller('ElectionStatController',
	['$scope', 'ElectionStatistics',
	function($scope, ElectionStatistics) {

		var tables = [];

		$scope.constituencies = [];
		$scope.electionId = $scope.election.id;
		$scope.countyId = $scope.target.id;

		this.addTable = function(scope) {
			tables.push(scope);
		};

		$scope.electionResults = {
			general: function() {
				ElectionStatistics.getElectionStatsGeneral($scope.electionId, $scope.countyId)
				.success(function(stats) {
					$scope.general = stats;
				})
				.error(function(err) {
					// defer error
				});
			},

			party: function() {
				ElectionStatistics.getElectionStatsParty($scope.electionId, $scope.countyId)
				.success(function(data) {

					$.each(data, function(k, party) {
						if(party.stats.length > 0) {
							$scope.constituencies.push(party);
						}
					});
				})
				.error(function(err) {
					// defer error
				});
			}
		}
	}
]);