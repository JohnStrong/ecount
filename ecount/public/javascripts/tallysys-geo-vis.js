(function(D, $) {

	/*"use strict";

	$.ajax({

		type: "GET",
		dataType: "json",
		url: "/map/divisions/1",

		error: function(err) {
			console.log(err);
		},

		success: function(data) {

			var poly = [];

			$.each(data.features, function(ith, d) {
				console.log(d.geometry.coordinates[0]);
			});

			var path = d3.geo.path();

			var geos = d3.select("#map")
				.append("svg")
				.attr("width", 1000)
				.attr("height", 500);

			geos.selectAll("path")
			    .data(data.features)
			  	.enter().append("path")
			  		.attr("d", path)
			  		.style('stroke', 'steelblue')
			  		.style("stroke-width", "2");
		}

	});*/

})(d3, $);