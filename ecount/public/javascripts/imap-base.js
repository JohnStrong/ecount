var imap = angular.module('IMap.base', ['IMap.style', 'IMap.election', 'IMap.geo']);

imap.factory('SharedMapService', function($rootScope, Counties,
	CountyBounds, MapStyle, VendorTileLayer) {

	var HIGHLIGHT_WEIGHT = 2;
	var HIGHLIGHT_CLICK_COLOR = '#555';
	var HIGHLIGHT_FILL_OPACITY = 0.5;

	var IRELAND_LAT = 53.40;
	var IRELAND_LON = -8;
	var IRELAND_ZOOM = 7;

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

	function draw(geom) {
		$rootScope.geoJson = L.geoJson(geom, {
			style: MapStyle,
			onEachFeature: enableInteraction
		}).addTo($rootScope.map);
	}

	$rootScope.electionId = function(_id) {
		electionId = _id;
	};

	$rootScope.setUpMap = function() {
		$rootScope.map = L.map('map-view',
			{
				"center": [IRELAND_LAT, IRELAND_LON],
				"zoom" : IRELAND_ZOOM
			}
		);

		$rootScope.layer = VendorTileLayer($rootScope.map);
	};

	$rootScope.drawCountry = function() {

		Counties.success(function(data) {

			counties = data.counties;

			$.each(data.counties, function(key, county) {
				$.when(CountyBounds(county.name))
				.done(function(countyBounds) {
					draw(countyBounds)
				});
			});

		}).error(function(err) {
			// defer error
		});
	};
});

function ElectionController($scope, SharedMapService, Elections) {

	$scope.getElections = function() {
		Elections.getElections().success(function(data) {
			$scope.elections = data;
		}).error(function(err) {
			// defer error
		});
	}

	$scope.electionChange = function($event) {
		var button = $event.target;
		var electionId = $(button).closest("div").find("span").text();
		$scope.electionId(electionId);
	};
}

function MapController($scope, $route, $routeParams, $location,
	$http, SharedMapService) {

	$scope.initMap = function() {
		$scope.setUpMap();
		$scope.drawCountry();
	};

	$scope.$on('selection', function(e, args) {

		var countyId = args[0].feature.properties.id;
		var electionId = args[1];

		console.log(args);

		$location.path('/map/county')
			.search({'cid' : countyId, 'eid': electionId});

		$route.reload();
	});
}