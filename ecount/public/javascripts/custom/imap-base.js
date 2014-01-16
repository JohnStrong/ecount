var imap = angular.module('IMap.Base', ['IMap.Vis', 'IMap.Statistics', 'IMap.Geo']);

imap.factory('SharedMapService', ['$rootScope', 'MapStyle', 'VendorTileLayer',
	function($rootScope, MapStyle, VendorTileLayer) {

		var HIGHLIGHT_WEIGHT = 2;
		var HIGHLIGHT_CLICK_COLOR = '#555';
		var HIGHLIGHT_FILL_OPACITY = 0.5;

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
				$rootScope.geoJson.resetStyle(e.target);
			}

			function getElectoralInformation(e){
				$rootScope.county = e.target;
				$rootScope.$broadcast('selection');
			}

			layer.on({
				mouseover: highlightFeature,
				mouseout: resetHighlight,
				click: getElectoralInformation
			});
		};

		function removeMap() {
			var map = $rootScope.map;

			if(map !== undefined) {
				map.remove();
			}
		}

		return {

			setMap: function(mapId, props) {
				removeMap();

				var zoom = props.zoom || 7;

				$rootScope.map = L.map(mapId, {"zoom" : zoom });
				$rootScope.layer = VendorTileLayer($rootScope.map);
			},

			draw: function(_geom) {

				$rootScope.geoJson = L.geoJson(_geom, {
					style: MapStyle,
					onEachFeature: enableInteraction
				}).addTo($rootScope.map);

				var bounds = $rootScope.geoJson.getBounds();
				$rootScope.map.fitBounds(bounds);
			},

			attachMapEvent: function(type, _event) {
				// TODO
			}
		};
	}
]);