var imap = angular.module('IMap.Base', ['IMap.Vis', 'IMap.Statistics', 'IMap.Geo']);

imap.service('InfoControl', function() {

	return function() {
		this.info = L.control();

		this.onAdd = function() {

		};

		this.update = function(props) {
			this._div.innerHTML = props ? '<h4>' + props.name + '</h4>' :
				'hover over a DED';
		};
	}
});

imap.factory('SharedMapService',
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