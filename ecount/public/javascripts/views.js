var ecount = angular.module('Ecount', ['ngRoute'],

	function($routeProvider, $locationProvider) {

		$routeProvider.when('/', {
			redirectTo: '/feature/home'
		});
		$routeProvider.when('/feature/home', {
			templateUrl: '/home',
			controller: HomeController,
			controllerAs: 'home'
		});
		$routeProvider.when('/feature/map', {
			templateUrl: '/map',
			controller: MapController,
			controllerAs: 'map'
		});
		$routeProvider.when('/feature/about', {
			templateUrl: '/about',
			controller: AboutController,
			controllerAs: 'about'
		});

	// configure html5 to get links working on jsfiddle
	$locationProvider.html5Mode(true);
});

ecount.factory('Counties', function($http) {
	return $http.get('/tallysys/map/counties');
});

ecount.factory('CountyBounds', function() {
	var COUNTY_BOUNDS_REQ_URL = '/tallysys/map/county/';

	return function(county) {
		return $.getJSON(COUNTY_BOUNDS_REQ_URL + county);
	};
});

ecount.factory('Elections', function($http) {
	return $http.get('/stats/elections/');
})

ecount.factory('ElectorialDivisions', function($http) {

	var ELECTION_BOUNDS_REQ_URL = '/tallysys/map/divisions/';

	return function(countyId) {
		return $http.get(ELECTION_BOUNDS_REQ_URL + countyId);
	};
});

ecount.factory('ElectionStatistics', function($http) {
	var ALL_COUNTY_COUNSTITUENCIES_URL = '/stats/elections/const/'
	var GENERAL_ELECTION_STATS_URL = '/stats/elections/general/';

	return {
		generalElectionStats: function(electionId, countyId) {
			return $http.get(GENERAL_ELECTION_STATS_URL
				+ electionId + '/' + countyId);
		}
	};
});

ecount.factory('MapStyle', function() {

	return function(feature) {

		var DEFAULT_WEIGHT = 2;
        var DEFAULT_OPACITY = 0.5;
        var DEAULT_COLOR = '#888888';
        var DEAULT_FILL_COLOR = '#265588';
        var DEAULT_DASH_ARRAY = '3';
        var DEFAULT_FILL_OPACITY = 0.2;

	    return {
	        weight: DEFAULT_WEIGHT,
	        opacity: DEFAULT_OPACITY,
	        color: DEAULT_COLOR,
	        fillColor: DEAULT_FILL_COLOR,
	        dashArray: DEAULT_DASH_ARRAY,
	        fillOpacity: DEFAULT_FILL_OPACITY
	    };
	};
});

ecount.service('MapLayer', function() {

	var imap = L.map('imap-view');

	var geojson;

	var gInfo = (function() {

		var i = L.control();

		i.onAdd = function (map) {
		    this._div = L.DomUtil.create('div', 'imap-info'); // create a div with a class "info"
		    this.update('<h4>click on a county to view some election statistics</h4>');
		    return this._div;
		};

		// method that we will use to update the control based on feature properties passed
		i.update = function (markup) {
		    this._div.innerHTML = markup;
		};

		i.addTo(imap);
		return i;
	})();

	var pInfo = (function() {

		var i = L.control();

		i.onAdd = function (map) {
		    this._div = L.DomUtil.create('div', 'imap-info'); // create a div with a class "info"
		    this.update('');
		    return this._div;
		};

		// method that we will use to update the control based on feature properties passed
		i.update = function (markup) {
		    this._div.innerHTML = markup;
		};

		i.setPosition('bottomleft');
		i.addTo(imap);
		return i;
	})();

	return {

		getMap: function() {
			return imap;
		},

		getGeoJson: function() {
			return geojson;
		},

		setGeoJson: function(_geo) {
			geojson = _geo;
		},

		GeneralElectionStats: function(stats) {
			var htm = '<h4>Election Statistics</h4>';

			$(stats).each(function(key, data) {
				htm += '<div class="imap-info-entry">' +
				'<b>' + data.constituency + ': </b>' +
				'<p>' +
				'registered electors: ' + data.registeredElectors + '<br />' +
				'votes: ' + data.votes + '<br />' +
				'turnout: ' + data.percentTurnout + '%<br />' +
				'invalid ballots: ' + data.invalidBallots + '<br />' +
				'percentage invalid: ' + data.percentInvalid + '%<br />' +
				'valid ballots: ' + data.validVotes + '<br />' +
				'percentage valid: ' + data.percentValid + '%<br />' +
				'</p>' +
				'</div>';
			});

			gInfo.update(htm);
		},

		PartyElectionStats: function(stats) {

			var htm = '<h4>Party Results</h4>';

			$(stats).each(function(key, data) {
				htm += '<div class="imap-info-entry">' +
				'<b>' + data.partyName + ': </b>' +
				'<p>' +
				'first preference votes: ' + data.firstPreferenceVotes + '<br />' +
				'percentage vote: ' + data.percentageVote + '%<br />' +
				'seats: ' + data.seats + '<br />'
				'</p>' +
				'</div>';
			});

			pInfo.update(htm);
		}
	};
});

ecount.service('Interact', function(ElectorialDivisions, ElectionStatistics, MapLayer, MapStyle) {

	var HIGHLIGHT_WEIGHT = 3;
	var HIGHLIGHT_CLICK_COLOR = '#885526';
	var HIGHLIGHT_FILL_OPACITY = 0.5;

	var map = MapLayer.getMap();

	var electionId = 1;

	var layer = (function() {

		var URL = 'http://{s}.tile.cloudmade.com/{key}/22677/256/10/443/534.png';
		var ATTRIBUTION = 'Map data &copy; 2011 OpenStreetMap contributors, ' +
			'Imagery &copy; 2012 CloudMade';
		var API_KEY = '1f43dc838a3344c69e1a320cf87ce237';

		return L.tileLayer(URL, {
			attribution: ATTRIBUTION,
			key: API_KEY
		}).addTo(map);
	})();

	function highlightFeature(e) {
		var layer = e.target;

		layer.setStyle({
			weight: HIGHLIGHT_WEIGHT,
	        color: HIGHLIGHT_CLICK_COLOR,
	        fillOpacity: HIGHLIGHT_FILL_OPACITY
		});

		if(!L.Browser.ie && !L.Browser.opera) {
   			layer.bringToFront();
		}
	}

	function resetHighlight(e) {
		MapLayer.getGeoJson().resetStyle(e.target);
	}

	function getElectoralInformation(e){

		function zoomToFeature() {
			map.fitBounds(e.target.getBounds());
		}

		function drawED(geom) {
			L.geoJson(geom, {
				style: MapStyle
			}).addTo(map);
		}

		var countyId = e.target.feature.properties.id;

		// electoral divisions
		ElectorialDivisions(countyId)
			.success(function(geom) {
				zoomToFeature();
				drawED(geom);
			}).error(function(err) {
				// defer error
			});

		ElectionStatistics.generalElectionStats(electionId, countyId)
			.success(function(stats) {
				MapLayer.GeneralElectionStats(stats.general);
				MapLayer.PartyElectionStats(stats.parties);
			})
			.error(function(err) {
				// defer error
			});
	}


	return {
		enable: function(feature, layer) {
			layer.on({
				mouseover: highlightFeature,
				mouseout: resetHighlight,
				click: getElectoralInformation
			});
		},

		setElectionId: function(_id) {
			electionId = _id;
		}
	}
});

ecount.service('IMap', function(Interact, MapLayer, MapStyle) {

	var map = MapLayer.getMap();

	var DEFAULT_ZOOM_LEVEL = 7;
	var EVENT_ZOOM_LEVEL = 8;

	var setView = function(position) {
		map.setView([position.coords.latitude, position.coords.longitude], DEFAULT_ZOOM_LEVEL);
	};

	return {

		renderMap: function() {
			navigator.geolocation.getCurrentPosition(setView);
		},

		setElectionId: function(_id) {
			Interact.setElectionId(_id);
		},

		drawCounties: function (collection) {
			var geojson = L.geoJson(collection, {
				style: MapStyle,
				onEachFeature: Interact.enable
			}).addTo(map);

			MapLayer.setGeoJson(geojson);
		}
	};
});

function MapController($scope, IMap, Counties, CountyBounds, Elections) {

	$scope.initIMap = function() {

		function buildMap(county) {
			$.when(CountyBounds(county.name))
				.done(function(countyBounds) {
					IMap.drawCounties(countyBounds);
					IMap.renderMap();
				});
		}

		Counties.success(function(data) {

			counties = data.counties;

			$.each(data.counties, function(key, county) {
				buildMap(county);
			});

		}).error(function(err) {
			// defer error
		});
	};

	$scope.getElections = function() {
		Elections.success(function(data) {
			$scope.elections = data;
		}).error(function(err) {
			// defer error
		});
	}

	$scope.electionChange = function($event) {

		var button = $event.target;

		$(button).closest("#election-selections")
			.find("button").removeClass("active");
		$(button).addClass("active");

		var electionId = $(button).closest("div").find("span").text();
		IMap.setElectionId(electionId);
	};
}

/** STATISTICS SERVICE **/
ecount.factory('GeneralStats', function($http){

	return {
		liveRegister: function() {
			return $.getJSON(
				'/stats/general/register/mature/m',
				'/stats/general/register/mature/f',
				'/stats/general/register/young/m',
				'/stats/general/register/young/f')
		}
	};
});

function StatBankController($scope, GeneralStats) {
	$.when(GeneralStats.liveRegister())
		.done(function(mm, mf, ym, yf) {
			console.log(mm, mf, ym, yf);
		});
}

function AboutController($scope) {

}

function HomeController($scope) {

}

/*

*/