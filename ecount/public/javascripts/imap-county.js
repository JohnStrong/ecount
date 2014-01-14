var countyMap = angular.module('IMap.county', ['IMap.style', 'IMap.election', 'IMap.geo']);

countyMap.factory('Visualize', function() {

	var margin = [20, 40, 80, 60];
    var width = 760 - margin[3] - margin[3];
    var height = 304 - margin[0] - margin[1];

    var xs = d3.scale.ordinal().rangeRoundBands([0, width], .1);
    var ys = d3.scale.linear().range([height, 0]);

    var xval = function(d) { return d.partyName; };

    var xAxis = d3.svg.axis().scale(xs).orient("bottom");
    var yAxis = d3.svg.axis().scale(ys).orient("left");

    var initSVGContainer = function(elem) {
    	var svg = d3.select(elem).append("svg")
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

    	init: function(d, constituencyTitle) {
    		this.data = d;
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

			d.attr("x",  map.x)
				.attr("y", function(d) { height - 0.5; })
				.attr("width", xs.rangeBand)
	    		.transition().duration(TRANSITION_DELAY)
	    		.delay(function (d,i){ return i * TRANSITION_DELAY;})
	    		.attr("height", function(d) { return height - map.y(d); })
	    		.attr("y", map.y)
	    		.style("fill", function(d) { return setColor(d.partyName); });
		},

    	firstPreferenceVotes: function(elem) {

    		var svg = initSVGContainer(elem);
    		var data = this.data;

    		xs.domain(data.map(xval));

    		var yval = function(d) { return d.partyStats.firstPreferenceVotes; };

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
	    		.call(this.yTitle, "# first preference votes");

	    	svg.selectAll(".bar")
	    		.data(data)
	    		.enter().append("rect")
	    		.call(this.drawBar, { x: xmap, y: ymap });
    	},

    	percentageVote: function(elem) {

    		var svg = initSVGContainer(elem);
    		var data = this.data;

    		var yval = function(d) { return d.partyStats.percentageVote; };

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
	    		.call(this.yTitle, "% votes recieved");

	    	svg.selectAll(".bar")
	    		.data(data)
	    		.enter().append("rect")
	    		.call(this.drawBar, {x: xmap, y: ymap });
    	},

    	seats: function(elem) {

    		var svg = initSVGContainer(elem);
    		var data = this.data;

    		var yval = function(d) { return d.partyStats.seats; };

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
	    		.call(this.yTitle, "# of seats won");

			svg.selectAll(".bar")
	    		.data(data)
	    		.enter().append("rect")
	    		.call(this.drawBar, {x: xmap, y: ymap });
    	}

    };
});

function CountyController($scope, $routeParams, Elections,
	ElectoralDivisions, MapStyle, VendorTileLayer) {

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
			$scope.constituencies = [];

			$.each(data, function(k, party) {
				if(party.stats.length > 0) {
					$scope.constituencies.push(party);
				}
			});
		})
		.error(function(err) {
			// defer error
		});
	}
}