(function(D, jq) {

	var projUtil = {
		height: 500,
    	width: 850,
		scale: 25000,
		countiesCentroid: [-8.64311-0.6,52.665584-0.7]
	};

    var svg = D.select("#map").append("svg")
    	.attr("width", projUtil.width)
    	.attr("height", projUtil.height)
    	.attr("fill", "#222")
    	.append("g");

    jq.ajax({

    	type: "GET",
    	url: "/map/county/all",
    	dataType: "json",

    	error: function(err) {
    		console.log("ERROR during request: " + err);
    	},

    	success: function(data) {

    		var projection = d3.geo.mercator()
				.scale(projUtil.scale)
				.center(projUtil.countiesCentroid)
				.translate([projUtil.height/2, projUtil.width/2]);

			var path = d3.geo.path()
				.projection(projection);

    		svg.selectAll("path").data(data.features)
    			.enter()
    			.append("path")
				.attr("d", path)
				.style("fill", "#60A917");
    	}
    });



})(d3, $);