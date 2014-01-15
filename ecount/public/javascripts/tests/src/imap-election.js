var electionBase = angular.module('IMap.election', []);

electionBase.factory('ElectoralDivisions', function($http) {

	var ELECTION_BOUNDS_REQ_URL = '/tallysys/map/divisions/';

	return function(countyId) {
		return $http.get(ELECTION_BOUNDS_REQ_URL + countyId);
	};
});

electionBase.factory('ElectionStatistics', function($http) {

	var ALL_COUNTY_COUNSTITUENCIES_URL = '/stats/elections/const/'
	var ALL_ELECTIONS_URL = '/stats/elections/';
	var ELECTION_STATS_GENERAL_URL = '/stats/elections/general/';
	var ELECTION_STATS_PARTY_URL = '/stats/elections/party/';

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

electionBase.service('Elections', function($http, ElectionStatistics, ElectoralDivisions) {

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