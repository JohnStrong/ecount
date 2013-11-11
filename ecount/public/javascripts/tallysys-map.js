(function($, O, D) {

"use strict";

// Open Layers top-level map
var map = new O.Map({

	div: "map",
	zoom: 6.5,
    numZoomLevels: 20,
    projection: new OpenLayers.Projection("EPSG:900913"),
   	displayProjection: new OpenLayers.Projection("EPSG: 4326"),
    center: [],
    layers: [
       new OpenLayers.Layer.OSM()
    ],
    controls: [
        new OpenLayers.Control.Navigation(),
        new OpenLayers.Control.Zoom(),
        new OpenLayers.Control.ScaleLine(),
        new OpenLayers.Control.LayerSwitcher(),
        new OpenLayers.Control.MousePosition(),
        new OpenLayers.Control.KeyboardDefaults()
    ]
});

var styles = {

	mapDefault: "#FAFAFA",
	mapHover: "#99CC22",
	countyBoundary: "#444444",
	countyFill: "#CCCCCC",
	countyBorder: "1px",
	opacityDefault: ".5",
	opacityHover: "1"
};

// DOM manipulation module
var manipulate = (function(OL) {

	return {

		countyList: function(collection) {

			D.select("#county-labels")
				.append("ul")
				.selectAll("li")
				.data(collection.features)
				.enter()
				.append("li")
				.attr("class", "county-label")
				.append("span")
				.append("a")
				.on("click", evts.clicked)
				.text(function(d) {
					return d.properties['name'];
				});
		},

		drawCounties: function(collection) {
			overlay.counties(collection);			
		},

		drawEDs: function(features) {
			// TODO
		}
	};

})();

// HTTP requests module
var query = (function(M) {

	return {

		countyBounds: function() {

			$.ajax({

		    	type: "GET",
		    	url: "/map/county/all",
		    	dataType: "json",

		    	error: function(err) {
		    		console.log("ERROR during request: " + err);
		    	},

		    	success: function(data) {

		    		M.countyList(data);
		    		M.drawCounties(data);
		    	}
			});
		},

		electoralDivisions: function(d) {

			$.ajax({

	    		type: "GET",
	    		url: "/map/divisions/" + d.id,
	    		dataType: "json",

	    		error: function(err) {
	    			console.log(err);
	    		},

	    		success: function(data) {
	    			M.drawEDs(data.features);
	    		}

	    	});
		}
	};

})(manipulate);

// Event handling module
var evts = (function(S, Q) {

	return  {

    	clicked: function(d){
    		Q.electoralDivisions(d);
    	},

    	hover: function(d) {
    		D.select(this)
    		.style("fill", S.mapHover)
    		.style("fill-opacity", S.opacityHover)
    		.style("cursor", "pointer");
    	},

    	leave: function(d) {
    		D.select(this)
    		.style("fill", S.mapDefault)
    		.style("fill-opacity", S.opacityDefault)
    		.style("cursor", "default");
    	}
    };

})(styles, query);

// module handles map overlays
var overlay = (function(S, E) {

	return {

		counties: function(collection) {

			var overlay = new OpenLayers.Layer.Vector("counties");

			overlay.afterAdd = function() {

				var mapDiv;
				var svg;
				var g;
				var bounds;
				var path;
				var feature;

				var project = function(x) {
					var point = map.getViewPortPxFromLonLat(
						new OpenLayers.LonLat(x[0], x[1])
                        .transform("EPSG:4326", "EPSG:900913"));
                    return [point.x, point.y];
				};

		        var set = function() {		

					var bottomLeft = project(bounds[0]);
	                var topRight = project(bounds[1]);

	                svg.attr("width", topRight[0] - bottomLeft[0])
		            	.attr("height", bottomLeft[1] - topRight[1])
		            	.style("margin-left", bottomLeft[0] + "px")
		            	.style("margin-top", topRight[1] + "px");

		            g.attr("transform", "translate(" + 
		            	-bottomLeft[0] + "," + -topRight[1] + ")");

	            	feature.attr("d", path)
			            .on("click", E.clicked)
						.on("mouseover", E.hover)
						.on("mouseout", E.leave)
			            .style("fill", S.mapDefault)
			            .style("stroke", S.countyBoundary)
			            .style("stroke-width", S.countyBorder)
			            .style("fill-opacity", S.opacityDefault)
				};

				mapDiv = D.selectAll("#" + overlay.div.id);
				mapDiv.selectAll("svg").remove();

				svg = mapDiv.append("svg");
				g = svg.append("g");

				bounds = D.geo.bounds(collection);
				path = D.geo.path().projection(project);

				feature = g.selectAll("path")
	            .data(collection.features, function(d) {
	            	return d.id = d.properties['id'];
	            }).enter().append("path");

	            map.events.register("moveend", map, set);
				set();
				
			};

			map.addLayer(overlay);
		}
	};

})(styles, evts);

// entry point
var init = function() {

	var center = [-881166.06195, 7042602.03710]
	var point = new O.LonLat(center[0], center[1]);

	map.setCenter(point);
	query.countyBounds();
};

init();

})($, OpenLayers, d3);