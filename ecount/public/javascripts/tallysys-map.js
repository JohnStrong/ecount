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

					var coords = [];

					$.each(data.features, function(ith, datum) {
						console.log(datum.geometry, "");
						//coords.push(new G.maps.LatLng(25.774, -80.190));
					});

					// center map at position
					var mapOptions = {
					  center: new G.maps.LatLng(position.coords.latitude,
					  		position.coords.longitude),
					  zoom: 8,
					  mapTypeId: G.maps.MapTypeId.ROADMAP
					};

					var map = new G.maps.Map(document.getElementById("map"),
					    mapOptions);

					var polys = new google.maps.Polygon({
						map: map,
						paths: coords,
						strokeColor: '#111',
						strokeOpacity: 0.8,
						strokeWeight: 2,
						fillColor: '#FF0000',
						fillOpacity: 0.5,
						draggable: false,
						geodesic: true
					});
				}
			});
		});
	};

	G.maps.event.addDomListener(window, 'load', initialize);

})(google, $, d3);