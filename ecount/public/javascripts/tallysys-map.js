(function(G, $, D) {

    "use strict";

	var initialize = function() {

		// get geolocation, load & project electoral divisions
		navigator.geolocation.getCurrentPosition(function(position) {

			$.ajax({

				type: "GET",

				dataType: "json",

				url: "/map/divisions/1",

				error: function(err) {
					console.log(err);
				},

				success: function(data) {

					// parse returned geojson
					$.each(data, function(key, value) {
						console.log(value);
						console.log(key);
					});

					// center map at position
					var mapOptions = {
					  center: new G.maps.LatLng(position.coords.latitude,
					  	position.coords.longitude),
					  zoom: 10,
					  mapTypeId: G.maps.MapTypeId.ROADMAP
					};

					var map = new G.maps.Map(document.getElementById("map"),
					    mapOptions);
				}
			});
		});
	};

	G.maps.event.addDomListener(window, 'load', initialize);

})(google, $, d3);