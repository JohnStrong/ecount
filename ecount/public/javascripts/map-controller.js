var ecountmap = angular.module('EcountMap', []);

ecountmap.factory('Counties', function($http) {
	return $http.get('/tallysys/map/counties');
});

// Leaflet module
ecountmap.factory('Geom', function() {

	var map = L.map('map');

	var layer = function(position) {

			var ZOOM = 7;
			var URL = 'http://{s}.tile.cloudmade.com/{key}/22677/256/{z}/{x}/{y}.png';
			var ATTRIBUTION = 'Map data &copy; 2011 OpenStreetMap contributors, Imagery &copy; 2012 CloudMade';
			var API_KEY = '1f43dc838a3344c69e1a320cf87ce237';

			map.setView([position.coords.latitude, position.coords.longitude], ZOOM);

			L.tileLayer(URL, {
				attribution: ATTRIBUTION,
				key: API_KEY
			}).addTo(map);
		};

	var style = function(feature) {

		var FILL_COLOR = "#AAAA66";
		var STROKE_COLOR = '#AAAAAA';
		var WEIGHT_OPACITY_NUM = 1;
		var FILL_OPACITY = 0.2;

	    return {
	        fillColor: FILL_COLOR,
	        weight: WEIGHT_OPACITY_NUM,
	        opacity: WEIGHT_OPACITY_NUM,
	        color: STROKE_COLOR,
	        fillOpacity: FILL_OPACITY
	    };
	};

	navigator.geolocation.getCurrentPosition(layer);

	return {

		drawCounties: function (collection) {

			L.geoJson(collection, {
				style: style
			}).addTo(map);
		}
	};
});

// get the list of all counties on which statistics can be found
function CountyListController($scope, $http, Geom, Counties) {

	$scope.errors = [];

	Counties.success(function(data, status, headers, config) {

		var COUNTY_BOUNDS_REQ_URL = '/tallysys/map/county/';

		var counties = data.counties;

		$scope.counties = counties;

		$.each(counties, function(key, county) {

			$http.get(COUNTY_BOUNDS_REQ_URL + county.name)
				.success(function(data, status, headers, config) {
					Geom.drawCounties(data);
				})
				.error(function(data, status, headers, config) {
					$scope.errors.push(status);
				});
		});
	})
	.error(function(data, status, headers, config) {
		$scope.errors.push(status);
	});
}