(function(Q, O, P) {

	"use strict";

	var projections = (function(O, P) {

		// Irish Grid
		P.defs["EPSG:29902"] = "+proj=tmerc +lat_0=53.5"+
		"+lon_0=-8 +k=1.000035 +x_0=200000 +y_0=250000 "+
		"+ellps=mod_airy +towgs84=482.5,-130.6,564.6," +
		"-1.042,-0.214,-0.631,8.15 +units=m +no_defs";

		// Open Layers Grid (Geom)
		P.defs["EPSG:900913"] = "+proj=merc +a=6378137" +
		" +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0" +
		" +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs";

		return {

			REGULAR_PROJECTION: new O.Projection("EPSG:4326"),

			IRISH_PROJECTION: new P.Proj("EPSG:29902"),

			OPENLAYERS_PROJECTION: new P.Proj("EPSG:900913")
		};

	})(O, P);
	
	/**
	 *	@description
	 *		given a lat,lon position on which to center the map, 
	 *		returns various properties to layer projections
	 **/ 
	var draw = (function(O) {
		
		var map;

		return function(position) {
			
			map = new O.Map({
				div: "map",
			    zoom: 7,
			    center: [],
			    layers: [
			        new OpenLayers.Layer.OSM()
			    ]
			});

			var point = new O.LonLat(position.coords.longitude, 
				position.coords.latitude);

			point.transform(projections['GOOGLE_PROJECTION'],
				map.getProjectionObject());

			map.setCenter(point);

			return {

				// get county projection by id
				countyBorder: function(id) {
				
					console.log(map);

					var geojson = new O.Layer.GML("GeoJSON", "/map/county/all", {
						projection: new O.Projection("EPSG:900913"),
						format: O.Format.GeoJSON
					});

					map.addLayer(geojson);
				}
			};
		};

	})(O);
	
	// give user an option of geolocate or selection here....
	navigator.geolocation.getCurrentPosition(function(position) {
		draw(position).countyBorder(0);
	});
	

})($, OpenLayers, Proj4js);