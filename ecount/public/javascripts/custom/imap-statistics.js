var electionBase = angular.module('IMap.Statistics', []);

electionBase.factory('ElectionStatistics', ['$http',
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