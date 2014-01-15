var electionBase = angular.module('IMap.Statistics', []);

electionBase.factory('ElectionStatistics', function($http) {

	var ALL_COUNTY_COUNSTITUENCIES_URL = '/api/elections/const/'
	var ALL_ELECTIONS_URL = '/api/elections/';
	var ELECTION_STATS_GENERAL_URL = '/api/elections/general/';
	var ELECTION_STATS_PARTY_URL = '/api/elections/party/';

	return {

		elections: function() {
			return $http.get(ALL_ELECTIONS_URL);
		},

		electionStatsGeneral: function(electionId, countyId) {
			return $http.get(ELECTION_STATS_GENERAL_URL
				+ electionId + '/' + countyId);
		},

		electionStatsParty: function(electionId, countyId) {
			return $http.get(ELECTION_STATS_PARTY_URL
				+ electionId + '/' + countyId);
		}
	};
});

electionBase.service('Elections', function($http, ElectionStatistics) {

	return {
		getElections: function() {
			return ElectionStatistics.elections();
		},

		electionStatsGeneral: function(electionId, countyId) {
			return ElectionStatistics.electionStatsGeneral(electionId, countyId);
		},

		electionStatsParty: function(electionId, countyId) {
			return ElectionStatistics.electionStatsParty(electionId, countyId);
		}
	}
});