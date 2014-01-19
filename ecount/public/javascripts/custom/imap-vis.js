var vis = angular.module('IMap.Vis', []);

vis.factory('MapStyle', function() {

	return function(feature) {

		var DEFAULT_WEIGHT = 2;
        var DEFAULT_OPACITY = 0.5;
        var DEAULT_COLOR = '#888888';
        var DEAULT_FILL_COLOR = '#428BCA';
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

vis.factory('Layer', function() {
	var info = L.control();

	info.onAdd = function (map) {
	    this._div = L.DomUtil.create('div', 'info');
	    this.update();
	    return this._div;
	};

	return info;
});

vis.factory('Visualize', function() {

	var margin = [20, 40, 80, 60];
    var width = 705 - margin[3] - margin[3];
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
				.attr("dy", ".5em")
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