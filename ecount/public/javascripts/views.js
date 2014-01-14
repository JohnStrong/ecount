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
	var ELECTION_STATS_GENERAL_URL = '/stats/elections/general/';
	var ELECTION_STATS_PARTY_URL = '/stats/elections/party/';

	return {
		elections: function() {
			return $http.get(ALL_ELECTIONS_URL);
		},

		electionStatsGeneral: function(electionId, countyId) {
			return $http.get(ELECTION_STATS_GENERAL_URL
				+ electionId + '/' + countyId);
		},

		electionStatsParty: function(electionId, countyId) {
			return $http.get(ELECTION_STATS_PARTY_URL
				+ electionId + '/' + countyId);
		}
	};
});

ecount.service('Elections', function($http, ElectionStatistics, ElectoralDivisions) {

	return {
		getElections: function() {
			return ElectionStatistics.elections();
		},

		electionStatsGeneral: function(electionId, countyId) {
			return ElectionStatistics.electionStatsGeneral(electionId, countyId);
		},

		electionStatsParty: function(electionId, countyId) {
			return ElectionStatistics.electionStatsParty(electionId, countyId);
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


ecount.factory('VendorTileLayer', function() {

	var URL = 'http://{s}.tile.cloudmade.com/{key}/22677/256/{z}/{x}/{y}.png';
	var ATTRIBUTION = 'Map data &copy; 2011 OpenStreetMap contributors, ' +
		'Imagery &copy; 2012 CloudMade';
	var API_KEY = '1f43dc838a3344c69e1a320cf87ce237';

	return function(map) {
		return L.tileLayer(URL, {
			attribution: ATTRIBUTION,
			key: API_KEY
		}).addTo(map);
	}
})

ecount.factory('SharedMapService', function($rootScope, Counties,
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

		$location.path('/feature/map/county')
			.search({'cid' : countyId, 'eid': electionId});

		$route.reload();
	});
}

ecount.factory('Visualize', function() {

	var margin = [20, 40, 80, 60];
    var width = 760 - margin[3] - margin[3];
    var height = 304 - margin[0] - margin[1];

    var xs = d3.scale.ordinal().rangeRoundBands([0, width], .1);
    var ys = d3.scale.linear().range([height, 0]);

    var xval = function(d) { return d.partyName; };

    var xAxis = d3.svg.axis().scale(xs).orient("bottom");
    var yAxis = d3.svg.axis().scale(ys).orient("left");

    var initSVGContainer = function() {
    	var svg = d3.select("#party-vis").append("svg")
			.attr("width", width + margin[0] + margin[2])
			.attr("height", height + margin[0] + margin[1])
			.append("g")
			.attr("transform", "translate(" + margin[2] + "," + margin[0] + ")");

		return svg;
    };

    var setColor = function(_color) {
    	var color;

    	switch(_color) {
    		case 'Fine Gael':
    			color = '#013668';
    			break;
			case 'Fianna Fail':
				color = '#2D4E2F';
				break;
			case 'Sinn Fein':
				color = '#006837';
				break;
			case 'Labour Party':
				color = '#BF1D24';
				break;
			case 'Green Party':
				color = '#818181';
				break;
			case 'Others':
				color = '#DF1D4A';
				break;
			default:
				color = '#0136CA';
				break;
			}

		return color;
    };

    return {

    	init: function(constituencyTitle) {
    		this.constituencyTitle = constituencyTitle;
    	},

    	yTitle: function(d, title) {
    		d.append("text")
				.attr("y", 6)
				.attr("x", 5)
				.attr("dy", ".80em")
				.style("text-anchor", "start")
				.text(title);
		},

		drawBar: function(d, map) {

			var TRANSITION_DELAY = 300;

			d.attr("x", map.x)
	    		.attr("width", xs.rangeBand)
	    		.transition().duration(TRANSITION_DELAY)
	    		.delay(function (d,i){ return i * TRANSITION_DELAY;})
	    		.attr("y", map.y)
	    		.attr("height", function(d) { return height - map.y(d); })
	    		.style("fill", function(d) { return setColor(d.partyName); });
		},

    	firstPreferenceVotes: function(data) {

    		var svg = initSVGContainer();

    		xs.domain(data.map(xval));

			var yval = function(d) { return d.firstPreferenceVotes; };

	  		ys.domain([0, ( 1.15 * d3.max(data, yval))]);

	  		var xmap = function(d) { return xs(xval(d)); };
			var ymap = function(d) { return ys(yval(d)); };

			svg.append("g")
	    		.attr("class", "x axis")
	    		.attr("transform", "translate(0," + height + ")")
	    		.call(xAxis);

	    	svg.append("g")
				.attr("class", "y axis")
	    		.call(yAxis)
	    		.call(this.yTitle, "# first preference votes - " + this.constituencyTitle);

	    	svg.selectAll(".bar")
	    		.data(data)
	    		.enter().append("rect")
	    		.call(this.drawBar, {x: xmap, y: ymap});
    	},

    	percentageVote: function(data) {

    		var svg = initSVGContainer();

    		var yval = function(d) { return d.percentageVote; };

			xs.domain(data.map(xval));
	  		ys.domain([0, ( 1.15 * d3.max(data, yval))]);

	  		var xmap = function(d) { return xs(xval(d)); };
			var ymap = function(d) { return ys(yval(d)); };

			svg.append("g")
	    		.attr("class", "x axis")
	    		.attr("transform", "translate(0," + height + ")")
	    		.call(xAxis);

	    	svg.append("g")
				.attr("class", "y axis")
	    		.call(yAxis)
	    		.call(this.yTitle, "% votes recieved - " +
	    			this.constituencyTitle);

	    	svg.selectAll(".bar")
	    		.data(data)
	    		.enter().append("rect")
	    		.call(this.drawBar, {x: xmap, y: ymap});
    	},

    	seats: function(data) {

    		var svg = initSVGContainer();

    		var yval = function(d) { return d.seats; };

    		xs.domain(data.map(xval));
			ys.domain([0, ( 1.15 * d3.max(data, yval))]);

	  		var xmap = function(d) { return xs(xval(d)); };
			var ymap = function(d) { return ys(yval(d)); };

			svg.append("g")
	    		.attr("class", "x axis")
	    		.attr("transform", "translate(0," + height + ")")
	    		.call(xAxis);

	    	svg.append("g")
				.attr("class", "y axis")
	    		.call(yAxis)
	    		.call(this.yTitle, "# of seats - " + this.constituencyTitle);

			svg.selectAll(".bar")
	    		.data(data)
	    		.enter().append("rect")
	    		.call(this.drawBar, {x: xmap, y: ymap});
    	}

    };
});

function CountyController($scope, $routeParams, Elections,
	ElectoralDivisions, MapStyle, VendorTileLayer, Visualize) {

	$scope.init = function() {
		$scope.countyId = $routeParams.cid;
		$scope.electionId = $routeParams.eid;
	}

	$scope.initMap = function() {

		var COUNTY_ZOOM = 12;

		ElectoralDivisions($scope.countyId).success(function(geom) {

			$scope.map = L.map('county-map-view', { "zoom" : COUNTY_ZOOM });
			$scope.layer = VendorTileLayer($scope.map);

			var geoJson = L.geoJson(geom, {
    			style: MapStyle
			}).addTo($scope.map);

			$scope.map.fitBounds(geoJson.getBounds());
		})
		.error(function(err) {
			//defer error
		});
	}

	$scope.electionResults = function() {

		Elections.electionStatsGeneral($scope.electionId, $scope.countyId)
		.success(function(stats) {
			$scope.general = stats;
		})
		.error(function(err) {
			// defer error
		});

		Elections.electionStatsParty($scope.electionId, $scope.countyId)
		.success(function(data) {

			$.each(data, function(k, party) {
				if(party.stats.length > 0) {

					var stats = party.stats
					var constituencyTitle = party.title;

					Visualize.init(constituencyTitle);
					Visualize.firstPreferenceVotes(stats);
					Visualize.percentageVote(stats);
					Visualize.seats(stats);
				}
			});
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