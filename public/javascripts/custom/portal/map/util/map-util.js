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

mapUtil.factory('Map',
	['$rootScope', 'VendorTileLayer',
	function($rootScope, VendorTileLayer) {

		var HIGHLIGHT_WEIGHT = 2,
			HIGHLIGHT_CLICK_COLOR = '#555',
			HIGHLIGHT_FILL_OPACITY = 0.5,

			VIS_CONTAINER_ID = '#tally-results-vis',

			map = null,

			layer = null,

			geoJson = null;

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

		function createInfoControl(content, position) {
			var control = L.control({'position': position});

			control.onAdd = function(map) {
				this.draw();
				return this.div;
			};

			control.draw = function() {
				this.div = content;
			};

			control.show = function() {
				$(VIS_CONTAINER_ID).show();
			}

			control.empty = function() {
				$(VIS_CONTAINER_ID).hide();
			};

			control.addTo(map);
			return control;
		}

		return {

			draw: function(_mapId, _geom, props) {

				var style = props.style || 'default';
					zoom = props.zoom || 12;

				map = L.map(_mapId, {"zoom" : zoom });

				layer = VendorTileLayer(map);

				geoJson = L.geoJson(_geom, {
					style: style,
					onEachFeature: enableInteraction
				}).addTo(map);

				var bounds = geoJson.getBounds();
				map.fitBounds(bounds);

				return this;
			},

			addContentLayer: function(_content, _position) {
				return createInfoControl(_content, _position);
			},

			getMap: function() {
				return map;
			}
		};
	}
]);