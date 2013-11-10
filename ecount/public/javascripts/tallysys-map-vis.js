(function(D, jq) {

	// for jQuery dom manipulation
	var manipulate = (function() {

		return {

			countyList: function(features) {

				D.select("#county-labels")
					.append("ul")
					.selectAll("li")
					.data(features)
					.enter()
					.append("li")
					.attr("class", "county-label")
					.append("span")
					.append("a")
					.on("click", evts.clicked)
					.text(function(d) {
						return d.properties['name'];
					});
			}
		};

	})();

	// d3 svg event handling module
	var evts = (function() {

		// draw electoral division returned by http request
		var drawED = function(features) {

			svg.append("path").data(features)
				.append("path")
				.attr("d", path)
				.style("fill", "#aaa")
				.style("stroke", "#444")
				.style("stroke-width", "1px");

			svg.append("text")
    	};

		return  {

	    	clicked: function(d){

		    	jq.ajax({

		    		type: "GET",
		    		url: "/map/divisions/" + d.id,
		    		dataType: "json",

		    		error: function(err) {
		    			console.log(err);
		    		},

		    		success: function(data) {
		    			drawED(data.features);
		    		}

		    	});
	    	},

	    	hover: function(d) {
	    		d3.select(this).style("fill", "#f2f2f2");
	    	},

	    	leave: function(d) {
	    		d3.select(this).style("fill", "#ffffff");
	    	}
	    };

    })();

    var margin = [0.5, 0.5];

    var projUtil = {
		height: 590,
    	width: 750,
		scale: 30000,
		countiesCentroid: [-8.64311, 52.665584]
	};

	var svg = D.select("#map").append("svg")
    	.attr("width", projUtil.width)
    	.attr("height", projUtil.height)
    	.attr("fill", "none")
    	.append("g");

    var projection = d3.geo.mercator()
		.scale(projUtil.scale)
		.center(projUtil.countiesCentroid)
		.translate([projUtil.height/2, projUtil.width/2]);

	var path = d3.geo.path()
		.projection(projection);

    var init = function() {

    	jq.ajax({

	    	type: "GET",
	    	url: "/map/county/all",
	    	dataType: "json",

	    	error: function(err) {

	    		console.log("ERROR during request: " + err);
	    	},

	    	success: function(data) {

	    		// add lists of counties to aside
	    		manipulate.countyList(data.features);

				svg.selectAll("path").data(data.features,
	    			function(d) { return d.id = d.properties['id']; }).enter()
	    			.append("path")
	    			.attr("d", path)
	    			.on("click", evts.clicked)
	    			.on("mouseover", evts.hover)
	    			.on("mouseout", evts.leave)
					.style("fill", "#fff")
					.style("stroke", "#222")
					.style("stroke-width", "1px");
	    	}
   		});
    };

    init();


})(d3, $);