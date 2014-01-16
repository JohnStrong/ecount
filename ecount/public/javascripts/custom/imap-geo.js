var geo = angular.module('IMap.Geo', []);

geo.factory('VendorTileLayer', function() {

	var URL = 'http://{s}.tile.cloudmade.com/{key}/22677/256/{z}/{x}/{y}.png';
	var ATTRIBUTION = 'Map data &copy; 2011 OpenStreetMap contributors, ' +
		'Imagery &copy; 2012 CloudMade';
	var API_KEY = '1f43dc838a3344c69e1a320cf87ce237';

	return function(map) {
		return L.tileLayer(URL, {
			attribution: ATTRIBUTION,
			key: API_KEY
		}).addTo(map);
	}
});

geo.factory('GeomAPI', ['$http', 
	function($http) {

		var COUNTY_BOUNDS_REQ_URL = '/map/geo/county/';
		var ELECTION_BOUNDS_REQ_URL = '/map/geo/county/divisions/';

		return {
			countyBounds: function() {
				return $http.get(COUNTY_BOUNDS_REQ_URL);
			},

			electoralDivisions: function(countyId) {
				return $http.get(ELECTION_BOUNDS_REQ_URL + countyId);
			}
		};
	}
]);