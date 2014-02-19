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

mapElections.controller('ElectionController',
	['$scope',
	function($scope) {

		// current elections...
		$scope.elections = [];

		$scope.election = null;

		// receive previous elections from map controller...
		$scope.$on('previousTallys', function(source, _elections) {
			$scope.elections = _elections;
		})
	}
]);