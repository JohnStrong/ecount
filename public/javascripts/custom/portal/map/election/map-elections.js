var mapElections = angular.module('Ecount.Map.Elections', []);

mapElections.factory('ElectionStatistics', ['$http',
	function($http) {

		var ALL_COUNTY_COUNSTITUENCIES_URL = '/api/elections/constituencies/',

			ALL_ELECTIONS_URL = '/api/elections/',

			ELECTION_TALLY_CONSTITUENCY_URL = '/api/elections/tally/';

		return {

			getElections: function(callback) {
				$http.get(ALL_ELECTIONS_URL)
					.success(callback);
			},

			getElectionCountyConstituencies: function(countyId, callback) {
				$http.get(ALL_COUNTY_COUNSTITUENCIES_URL + countyId)
					.success(callback)
			},

			getElectionTallyByConstituency: function(electionId, constituencyId, callback) {
				$http.get(ELECTION_TALLY_CONSTITUENCY_URL + electionId + '/' + constituencyId)
					.success(callback);
			}
		};
	}
]);

mapElections.controller('ElectionController',
	['$scope', 'ElectionStatistics',
	function($scope) {

		// current elections...
		$scope.elections = [];

		// holds the user election selection...
		$scope.election = null;

		// holds users constituency selection for current county...
		$scope.constituency = null;

		// receive previous elections from map controller...
		$scope.$on('previousTallys', function(source, _elections) {
			$scope.elections = _elections;
		});
	}
]);