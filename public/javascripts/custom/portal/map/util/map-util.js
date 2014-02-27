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

			VIS_CONTAINER_ID = '#tally-results-vis';

		function infoHelper() {
			var info = L.control({position : 'bottomright'});

			info.onAdd = function(map) {
				this.container = L.DomUtil.create('div', 'info-pane info-helper');
				this.draw();
				return this.container;
			}

			info.draw = function(contents) {
				if(contents) {
					this.container.innerHTML = contents;
				} 
			}

			return info;
		}

		function IMap(_mapId, _geom, style, zoom) {
					
			this.map = L.map(_mapId, {"zoom" : zoom });

			this.layer = VendorTileLayer(this.map);

			this.style = style;

			this.zoom = zoom;

			this.infoHelper = infoHelper();

			this.geoJson = L.geoJson(_geom, {
					style: style,
					onEachFeature: this.enableInteraction.bind(this)
				}).addTo(this.map);

			this.bounds = this.geoJson.getBounds();
			
		}

		IMap.prototype.enableInteraction = function(feature, layer) {

			function highlightFeature(e) {

				var l = e.target;

				l.setStyle({
					weight: HIGHLIGHT_WEIGHT,
			        color: HIGHLIGHT_CLICK_COLOR,
			        fillOpacity: HIGHLIGHT_FILL_OPACITY
				});

				var regexx = new RegExp('[^\\s*0-9^/].*', 'g');
				var sanitized = regexx.exec(feature.properties.name);
				this.infoHelper.draw('<h3>' + sanitized + '</h3>');

				if(!L.Browser.ie && !L.Browser.opera) {
		   			l.bringToFront();
				}
			}

			function resetHighlight(e) {
				this.geoJson.resetStyle(e.target);
			}

			function getElectoralInformation(e){
				var target = e.target.feature.properties;
				$rootScope.$broadcast("target-change", [target]);
			}

			layer.on({
				mouseover: highlightFeature.bind(this),
				mouseout: resetHighlight.bind(this),
				click: getElectoralInformation
			});
		};

		IMap.prototype.createInfoControl = function(content, position) {
			
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

			control.addTo(this.map);

			return control;
		};

		return {

			draw: function(_mapId, _geom, props) {
				var style = props.style || 'default',
					zoom = props.zoom || 12;

				var imap = new IMap(_mapId, _geom, style, zoom);

				imap.map.fitBounds(imap.bounds);

				imap.infoHelper.addTo(imap.map);

				return imap;
			}
		};
	}
]);