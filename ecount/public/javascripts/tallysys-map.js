(function($, O, P) {

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

			GOOGLE_PROJECTION: new O.Projection("EPSG:4326"),

			IRISH_PROJECTION: new P.Proj("EPSG:29902"),

			OPENLAYERS_PROJECTION: new P.Proj("EPSG:900913")
		};

	})(O, P);

	//	takes OpenLayers vector 'V' & map 'M',
	//	@returns
	//		a collection of operations on electoral division data
	var request = function(M) {

		return {
			electoralDivisions : function() {

				var geojson = new OpenLayers.Layer.GML("GeoJSON", "/map/divisions/0", {
					projection: new OpenLayers.Projection("EPSG:900913"),
  					format: OpenLayers.Format.GeoJSON
				});

				M.addLayer(geojson);
			}
		};
	};

	// Entry Point...
	navigator.geolocation.getCurrentPosition(function(position) {

		var options = {
		    div: "map",
		    zoom: 8,
		    center: [],
		    layers: [
		        new OpenLayers.Layer.OSM()
		    ]
		};

		// initalize map with optio
		var map = new O.Map(options);


		// center position on map with lon-lat coordinates
		var point = new O.LonLat(position.coords.longitude, position.coords.latitude);
		point.transform(projections['GOOGLE_PROJECTION'], map.getProjectionObject());
		map.setCenter(point);

		request(map).electoralDivisions();

	});

})($, OpenLayers, Proj4js);