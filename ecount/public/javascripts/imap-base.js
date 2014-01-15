var imap = angular.module('IMap.Base', ['IMap.Vis', 'IMap.Statistics', 'IMap.Geo']);

imap.factory('SharedMapService', function($rootScope, MapStyle, VendorTileLayer) {

	var HIGHLIGHT_WEIGHT = 2;
	var HIGHLIGHT_CLICK_COLOR = '#555';
	var HIGHLIGHT_FILL_OPACITY = 0.5;

	var electionId = 1;

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
		var county = e.target;
		var args = [county, electionId];

		$rootScope.$broadcast('selection', args);
	}

	function enableInteraction(feature, layer) {
		layer.on({
			mouseover: highlightFeature,
			mouseout: resetHighlight,
			click: getElectoralInformation
		});
	};

	return {

		electionId: function(_id) {
			electionId = _id;
		},

		setMap: function(_map) {
			$rootScope.map = _map
			$rootScope.layer = VendorTileLayer($rootScope.map);
		},

		draw: function(_geom) {
			function d() {
				$rootScope.geoJson = L.geoJson(_geom, {
					style: MapStyle,
					onEachFeature: enableInteraction
				}).addTo($rootScope.map);
			}

			return {
				counties: function() {
					d();
				},

				electoralDivisions: function() {
					d();

					var bounds = $rootScope.geoJson.getBounds();
					$rootScope.map.fitBounds(bounds);
				}
			};
		}
	};
});