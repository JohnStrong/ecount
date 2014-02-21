var mapElections = angular.module('Ecount.Map.Elections', []);

mapElections.factory('ElectionStatistics', ['$http',
	function($http) {

		var ALL_COUNTY_COUNSTITUENCIES_URL = '/api/elections/constituencies/',

			ALL_ELECTIONS_URL = '/api/elections/',

			ALL_COUNTIES_URL = '/api/counties/',

			ELECTION_TALLY_CONSTITUENCY_URL = '/api/elections/tally/';

		return {

			getElections: function(callback) {
				$http.get(ALL_ELECTIONS_URL)
					.success(callback);
			},

			getCounties: function(callback) {
				$http.get(ALL_COUNTIES_URL)
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
	function($scope, ElectionStatistics) {

		// current elections...
		$scope.elections = [];

		$scope.counties = [];

		$scope.election = null;

		$scope.county = null;

		// receive previous elections from map controller...
		$scope.$on('previousTallys', function(source, _elections) {

			$scope.elections = _elections;

			// get counties...
			ElectionStatistics.getCounties(function(counties) {
				$scope.counties = counties;
			});
		});

		$scope.$watch('county', function(newVal) {
			console.log('county select', $scope.county);
		});
	}
]);

mapElections.controller('PreviousTallyController',
	['$scope', function($scope) {
		console.log('ptc', $scope);
	}
]);