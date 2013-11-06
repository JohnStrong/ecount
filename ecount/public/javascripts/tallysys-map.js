(function($, O, P) {

	"use strict";

	var GOOGLE_PROJECTION = new O.Projection("EPSG:4326");

	// definte new projection systems
	P.defs["EPSG:29902"] = "+proj=tmerc +lat_0=53.5 +lon_0=-8 +k=1.000035 +x_0=200000 +y_0=250000 +ellps=mod_airy +towgs84=482.5,-130.6,564.6,-1.042,-0.214,-0.631,8.15 +units=m +no_defs";
	P.defs["EPSG:900913"] = "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs";

	var IRISH_PROJECTION = new Proj4js.Proj("EPSG:29902");
	var OPENLAYERS_PROJECTION = new Proj4js.Proj("EPSG:900913");

	navigator.geolocation.getCurrentPosition(function(position) {

		var options = {
		    div: "map",
		    zoom: 4,
		    center: [],
		    layers: [
		        new OpenLayers.Layer.OSM()
		    ]
		};

		// initalize map with options
		var vector = new O.Layer.Vector('multiPolygon')
		var map = new O.Map(options);

		// center position on map with lon-lat coordinates
		var point = new O.LonLat(position.coords.longitude, position.coords.latitude);
		point.transform(GOOGLE_PROJECTION, map.getProjectionObject());

		map.setCenter(point);

		$.ajax({

			type: "GET",
			dataType: "json",
			url: "/map/allbounds",

			error: function(err) {

			},

			success: function(data) {

				var polygonList = [];

				$.each(data.features, function(ith, feature) {

					$.each(feature.geometry.coordinates, function(kth, data) {

						var pointList = [];

						for(var i = 0; i < data.length; i++) {

							for(var j = 0; j < data[i].length; j++) {

								// convert from Irish Grid to OpenLayers format
								var coord = new P.Point(data[i][j][0], data[i][j][1])
								P.transform(IRISH_PROJECTION, OPENLAYERS_PROJECTION, coord);

								var lonLat = new O.LonLat(coord.x, coord.y);
								pointList.push(lonLat);
							}
						}

						var linearRing = new O.Geometry.LinearRing(pointList);
						polygonList.push(new O.Geometry.Polygon([linearRing]));
					});

					var multiPolyGeom = new O.Geometry.MultiPolygon(polygonList);
					var multiPolyFeature = new O.Feature.Vector(multiPolyGeom);

					vector.addFeatures(multiPolyFeature);
					map.addLayer(vector);
				});
			}
		});
	});

})($, OpenLayers, Proj4js);