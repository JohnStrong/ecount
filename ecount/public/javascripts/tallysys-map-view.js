
// config paths for module
requirejs.config({
	baseUrl: "javascripts"
});

// main map page module
requirejs([], function() {

	var map = L.map('map');

	var calc = {

		long2tile: function(lon,zoom) {
			return (Math.floor((lon+180)/360*Math.pow(2,zoom)));
		},

	 	lat2tile: function(lat,zoom)  {
	 		return (Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom)))
		}
	};

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
	}

	var dom = (function() {

		return {

			countyList: function(collection) {

				var uList = $("<li></li>");

				$("#county-labels").append(uList);

				$.each(collection, function(ith, data) {

					var listElem = $("<li class='county-label'></li>");
					uList.append(listElem.append(data.properties.countyname));

				});
			}
		};

	})();

	var geom = (function() {

		var style = function(feature) {

		    return {
		        fillColor: "#FAFAFA",
		        weight: 2,
		        opacity: 1,
		        color: '#444444',
		        dashArray: '2',
		        fillOpacity: 0.4
		    };
		};

		return {

			drawCounties: function (collection) {

				L.geoJson(collection, {

					style: style,

					onEachFeature: function(feature, layer) {
						layer.bindPopup(feature.properties.countyname);
					}

				}).addTo(map);
			}
		};

	})();

	var query = (function() {

		return {

			counties: function() {

				$.ajax({

			    	type: "GET",
			    	url: "/map/county/all",
			    	dataType: "json",

			    	error: function(err) {
			    		console.log("ERROR during request: " + err);
			    	},

			    	success: function(data) {

			    		geom.drawCounties(data);
			    		navigator.geolocation.getCurrentPosition(layer);
			    	}
				});
			}
		};

	})();

	query.counties();

});