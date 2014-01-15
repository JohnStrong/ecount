var geo = angular.module('IMap.geo', []);

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

geo.factory('Counties', function($http) {
	return $http.get('/tallysys/map/counties');
});

geo.factory('CountyBounds', function() {
	var COUNTY_BOUNDS_REQ_URL = '/tallysys/map/county/';

	return function(county) {
		return $.getJSON(COUNTY_BOUNDS_REQ_URL + county);
	};
});