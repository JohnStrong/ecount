// main map page module
(function() {

	var calc = {

		long2tile: function(lon,zoom) {
			return (Math.floor((lon+180)/360*Math.pow(2,zoom)));
		},

	 	lat2tile: function(lat,zoom)  {
	 		return (Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) +
	 			1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom)))
		}
	};

	// LEAFLET MODULE
	var geom = (function(map) {

		var layer = function(position) {

			var zoom = 7;
			var lonTile = calc.long2tile(position.coords.longitude, zoom);
			var latTile = calc.lat2tile(position.coords.latitude, zoom);

			map.setView([position.coords.latitude, position.coords.longitude], zoom);

			// add an OpenStreetMap tile layer
			L.tileLayer('http://{s}.tile.cloudmade.com/{key}/22677/256/{z}/{x}/{y}.png', {
				attribution: 'Map data &copy; 2011 OpenStreetMap contributors, Imagery &copy; 2012 CloudMade',
				key: '1f43dc838a3344c69e1a320cf87ce237'
			}).addTo(map);
		};

		var style = function(feature) {

		    return {
		        fillColor: "#AAAA66",
		        weight: 1,
		        opacity: 1,
		        color: '#AAAAAA',
		        fillOpacity: 0.2
		    };
		};

		navigator.geolocation.getCurrentPosition(layer);

		return {

			drawCounties: function (collection) {

				L.geoJson(collection, {

					style: style

				}).addTo(map);
			}
		};

	})(L.map('map'));


	// RESTful QUERY MODULE
	var query = function(counties) {

		return {

			countyBounds: function() {

				$.each(counties, function(key, datum) {

					$.ajax({

			    	type: "GET",
			    	url: "/tallysys/map/county/" + datum,
			    	dataType: "json",

			    	error: function(err) {
			    		console.error("ERROR during request: " + err);
			    	},

			    	success: function(data) {
			    		console.log("success");
			    		geom.drawCounties(data);
			    	}

					});
				});

			}
		};

	};


	// INIT
	(function() {

		var countiesHTML = $("#counties").find(".county");
		var counties = [];

		counties = $.map(countiesHTML, function(elem, i) {
			return $(elem).find("a").text();
		});

		query(counties).countyBounds();

	})();

});