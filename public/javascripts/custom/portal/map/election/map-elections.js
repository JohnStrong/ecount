var mapElections = angular.module('Ecount.Map.Elections', []);

mapElections.factory('ElectionStatistics', ['$http',
	function($http) {

		var ALL_COUNTY_COUNSTITUENCIES_URL = '/api/elections/constituencies/',
			ALL_ELECTIONS_URL = '/api/elections/',
			ELECTION_STATS_GENERAL_URL = '/api/elections/general/',
			ELECTION_STATS_PARTY_URL = '/api/elections/party/';

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
		$scope.constituencyVisData = [];
		$scope.election = null;
		$scope.countyId = $scope.target.id;

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

		$scope.$on('visualizeStatistics', function(source, cid) {
			var constituencyVisData = $scope.constituencyVisData;
			
			$.each(constituencyVisData, function(k, constituencyData) {
				if(cid === constituencyData.cid) {
					visualizeConstituencyData(constituencyData.data);
					return;
				}
			});
		});

		$scope.$watch('election', function() {

			function getTallyStats(constituency) {
				ElectionStatistics.getElectionStatsParty($scope.election.id, 
					constituency.id, function(d) {
						$scope.constituencyVisData.push({'cid' : constituency.id, 'data': d});
				});
			}

			if($scope.election !== null) {
				
				$scope.constituencyVisData = [];

				$.each($scope.constituencies, function(k, constituency) {
					getTallyStats(constituency);
				});
			}
		})
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