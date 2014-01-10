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
			templateUrl: '/map'
		});
		$routeProvider.when('/feature/about', {
			templateUrl: '/about',
			controller: AboutController,
			controllerAs: 'about'
		});
		$routeProvider.when('/feature/map/county', {
			templateUrl: '/map/county',
			controller: CountyController,
			controllerAs: 'county'
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

ecount.factory('ElectoralDivisions', function($http) {

	var ELECTION_BOUNDS_REQ_URL = '/tallysys/map/divisions/';

	return function(countyId) {
		return $http.get(ELECTION_BOUNDS_REQ_URL + countyId);
	};
});

ecount.factory('ElectionStatistics', function($http) {
	var ALL_COUNTY_COUNSTITUENCIES_URL = '/stats/elections/const/'
	var ALL_ELECTIONS_URL = '/stats/elections/';
	var GENERAL_ELECTION_STATS_URL = '/stats/elections/';

	return {
		elections: function() {
			return $http.get(ALL_ELECTIONS_URL);
		},

		generalElectionStats: function(electionId, countyId) {
			return $http.get(GENERAL_ELECTION_STATS_URL
				+ electionId + '/' + countyId);
		}
	};
});

ecount.service('Elections', function($http, ElectionStatistics, ElectoralDivisions) {

	return {
		getElections: function() {
			return ElectionStatistics.elections();
		},

		generalElectionStats: function(electionId, countyId) {
			return ElectionStatistics.generalElectionStats(electionId, countyId)
		}
	}
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

ecount.service('MapCore', function() {

	var imap = L.map('imap-view');

	return {

		getMap: function() {
			return imap;
		}
	};
});

ecount.service('IMap', function(MapCore) {

	var map = MapCore.getMap();
	var geoJson;

	var DEFAULT_ZOOM_LEVEL = 6.7;
	var EVENT_ZOOM_LEVEL = 8;

	var setView = function(position) {
		map.setView([position[0], position[1]], DEFAULT_ZOOM_LEVEL);
	};

	return {

		draw: function (collection, coords, props) {
			setView(coords);

			geoJson = L.geoJson(collection, {
				style: props.style,
				onEachFeature: props.event
			}).addTo(map);
		},

		drawCounty: function(collection, props) {
			geoJson = L.geoJson(collection, {
				style: props.style
			}).addTo(map);
		},

		getGeoJson: function() {
			return geoJson;
		}
	};
});

ecount.factory('SharedMapService', function($rootScope, IMap, Counties,
	CountyBounds, ElectoralDivisions, MapStyle, MapCore) {

	var IRELAND_LAT = 53.40;
	var IRELAND_LON = -8;

	var HIGHLIGHT_WEIGHT = 2;
	var HIGHLIGHT_CLICK_COLOR = '#555';
	var HIGHLIGHT_FILL_OPACITY = 0.5;

	var map = MapCore.getMap();
	var electionId = 1;

	var layer = (function() {

		var URL = 'http://{s}.tile.cloudmade.com/{key}/22677/256/{z}/{x}/{y}.png';
		var ATTRIBUTION = 'Map data &copy; 2011 OpenStreetMap contributors, ' +
			'Imagery &copy; 2012 CloudMade';
		var API_KEY = '1f43dc838a3344c69e1a320cf87ce237';

		return L.tileLayer(URL, {
			attribution: ATTRIBUTION,
			key: API_KEY,
			z: 10,
			x: 443,
			y: 543
		}).addTo(map);

	})();

	function zoomToFeature(bounds) {
		map.fitBounds(bounds);
	}

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
		IMap.getGeoJson().resetStyle(e.target);
	}

	function getElectoralInformation(e){
		var county = e.target;
		var args = [county, electionId];

		$rootScope.$broadcast('selection', args);
	}

	function buildCountry(county, layer) {
		$.when(CountyBounds(county.name))
			.done(function(countyBounds) {
				IMap.draw(countyBounds,
					[IRELAND_LAT, IRELAND_LON],
					{
						"event": layer,
						"style": MapStyle
					}
			);
		});
	}

	function buildCounty(eds) {
		IMap.draw(eds, { "style": MapStyle });
	}

	$rootScope.enableInteraction = function(feature, layer) {
		layer.on({
			mouseover: highlightFeature,
			mouseout: resetHighlight,
			click: getElectoralInformation
		});
	},

	$rootScope.electionId = function(_id) {
		electionId = _id;
	},

	$rootScope.drawCountry = function() {

		var ei = this.enableInteraction;

		Counties.success(function(data) {

			counties = data.counties;

			$.each(data.counties, function(key, county) {
				buildCountry(county, ei);
			});

		}).error(function(err) {
			// defer error
		});
	},

	$rootScope.drawCounty = function(cid) {

		ElectoralDivisions(cid)
		.success(function(eds) {
			buildCounty(eds)
		}).error(function(err) {
			// defer error
		});
	}
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


function MapController($scope, $route, $routeParams, $location, $http, SharedMapService) {

	$scope.initMap = function() {
		$scope.drawCountry();
	};

	$scope.$on('selection', function(e, args) {

		var countyId = args[0].feature.properties.id;
		var electionId = args[1];

		$location.path('/feature/map/county')
			.search({'cid' : countyId, 'eid': electionId});

		$route.reload();
	});
}

function CountyController($scope, $routeParams, Elections) {

	$scope.init = function() {
		$scope.countyId = $routeParams.cid;
		$scope.electionId = $routeParams.eid;
	}

	$scope.initMap = function() {
		console.log("render county view for imap", $scope);
	}

	$scope.electionResults = function() {

		Elections.generalElectionStats($scope.electionId, $scope.countyId)
		.success(function(stats) {
			$scope.general = stats.general;
			$scope.party = stats.party;
		})
		.error(function(err) {
			// defer error
		});
	}
}

function AboutController($scope) {

}

function HomeController($scope) {

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