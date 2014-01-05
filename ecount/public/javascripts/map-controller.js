var ecountmap = angular.module('EcountMap', []);

ecountmap.factory('Counties', function($http) {
	return $http.get('/tallysys/map/counties');
});

ecountmap.factory('CountyBounds', function() {
	var COUNTY_BOUNDS_REQ_URL = '/tallysys/map/county/';

	return function(county) {
		return $.getJSON(COUNTY_BOUNDS_REQ_URL + county);
	};
});

ecountmap.factory('CountyCentroid', function($http) {
	var COUNTY_BOUNDS_CENTROID_URL = '/tallysys/map/center/';

	return function(countyId) {
		return $http.get(COUNTY_BOUNDS_CENTROID_URL + countyId);
	}
});

ecountmap.factory('ElectionBounds', function($http) {
	var ELECTION_BOUNDS_REQ_URL = '/tallysys/map/divisions/';

	return function(countyId) {
		return $http.get(ELECTION_BOUNDS_REQ_URL + countyId);
	}
});

// Leaflet module
ecountmap.factory('Map', function() {

	var map = L.map('map');
	var DEFAULT_ZOOM_LEVEL = 6;
	var EVENT_ZOOM_LEVEL = 7;

	var layer = function(position) {


		var URL = 'http://{s}.tile.cloudmade.com/{key}/22677/256/{z}/{x}/{y}.png';
		var ATTRIBUTION = 'Map data &copy; 2011 OpenStreetMap contributors, ' +
			'Imagery &copy; 2012 CloudMade';
		var API_KEY = '1f43dc838a3344c69e1a320cf87ce237';

		map.setView([position.coords.latitude, position.coords.longitude], DEFAULT_ZOOM_LEVEL);

		L.tileLayer(URL, {
			attribution: ATTRIBUTION,
			key: API_KEY
		}).addTo(map);
	};

	var style = function(feature) {

		var FILL_COLOR = "#888822";
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

		updateMapView: function(coords) {
			map.setView(coords, EVENT_ZOOM_LEVEL);
		},

		drawGeom: function (collection) {
			L.geoJson(collection, {
				style: style
			}).addTo(map);
		},

		drawElectoralBounds: function(collection, coords) {
			this.drawGeom(collection);
			this.updateMapView(coords);
		}
	};
});

// get the list of all counties on which statistics can be found
function CountyListController($scope, Map, Counties, CountyBounds, CountyCentroid, ElectionBounds) {

	$scope.getGeomForCounty = function($event) {

		var targetElem = $event.target;
		var countyname = $(targetElem).parent().find("#name").text();
		var countyid = $(targetElem).parent().find("#key").text();

		CountyCentroid(countyname).success(function(c) {

			ElectionBounds(countyid).success(function(geom) {

				Map.drawElectoralBounds(geom, [c.centroid.lat, c.centroid.lon]);

			}).error(function(err) {
				// defer error
			});
		}).error(function(err) {
			// defer error
		});
	};

	var buildMap = function(county) {
		$.when(CountyBounds(county.name))
		.done(function(countyBounds) {
			Map.drawGeom(countyBounds);
		});
	};

	Counties.success(function(data) {

		counties = data.counties;
		$scope.counties = counties;

		$.each(data.counties, function(key, county) {
			buildMap(county);
		});

	}).error(function(err) {
		// defer error
	});
}