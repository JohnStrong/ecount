var mapUtil = angular.module('Ecount.Map.Util', []);

mapUtil.factory('VendorTileLayer', function() {

	var URL = 'http://{s}.tile.cloudmade.com/{key}/22677/256/{z}/{x}/{y}.png',
		ATTRIBUTION = 'Map data &copy; 2011 OpenStreetMap contributors, ' +
			'Imagery &copy; 2012 CloudMade',
		API_KEY = '1f43dc838a3344c69e1a320cf87ce237';

	return function(map) {
		return L.tileLayer(URL, {
			attribution: ATTRIBUTION,
			key: API_KEY
		}).addTo(map);
	}
});

// constructor service to hold election info and handle its events...
mapUtil.service('Election', function() {
	return function(_election) {

	};
});

mapUtil.factory('GeomAPI', ['$http',
	function($http) {

		var COUNTY_BOUNDS_REQ_URL = '/map/geo/county/',
			ELECTORAL_DISTRICTS_REQ_URL = '/map/geo/county/districts/',
			ELECTORAL_DISTRICT_REQ_URL = '/map/geo/county/district/';

		return {
			countyBounds: function(callback) {
				$http.get(COUNTY_BOUNDS_REQ_URL)
					.success(function(geom) {
						callback(geom);
					});
			},

			electoralDistricts: function(countyId, callback) {
				$http.get(ELECTORAL_DISTRICTS_REQ_URL + countyId)
					.success(function(geom) {
						callback(geom);
					});
			},

			electoralDistrict: function(gid, callback) {
				return $http.get(ELECTORAL_DISTRICT_REQ_URL + gid)
					.success(function(data) {
						callback(data);
					});
			}
		};
	}
]);

mapUtil.factory('SharedMapService',
	['$rootScope', 'VendorTileLayer',
	function($rootScope, VendorTileLayer) {

		var HIGHLIGHT_WEIGHT = 2;
		var HIGHLIGHT_CLICK_COLOR = '#555';
		var HIGHLIGHT_FILL_OPACITY = 0.5;

		var map = null;
		var layer = null;
		var geoJson = null;

		function enableInteraction(feature, layer) {

			function highlightFeature(e) {

				var l = e.target;

				l.setStyle({
					weight: HIGHLIGHT_WEIGHT,
			        color: HIGHLIGHT_CLICK_COLOR,
			        fillOpacity: HIGHLIGHT_FILL_OPACITY
				});


				if(!L.Browser.ie && !L.Browser.opera) {
		   			l.bringToFront();
				}
			}

			function resetHighlight(e) {
				geoJson.resetStyle(e.target);
			}

			function getElectoralInformation(e){
				var target = e.target.feature.properties;
				$rootScope.$broadcast("target-change", [target]);
			}

			layer.on({
				mouseover: highlightFeature,
				mouseout: resetHighlight,
				click: getElectoralInformation
			});
		};

		function removeMap() {
			if(map !== null) {
				map.remove();
			}
		}

		return {

			setMap: function(mapId, props) {

				removeMap();

				var zoom = props.zoom || 12;

				map = L.map(mapId, {"zoom" : zoom });
				layer = VendorTileLayer(map);
			},

			draw: function(_geom, _style) {

				geoJson = L.geoJson(_geom, {
					style: _style,
					onEachFeature: enableInteraction
				}).addTo(map);

				var bounds = geoJson.getBounds();
				map.fitBounds(bounds);
			}
		};
	}
]);