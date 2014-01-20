n = 2 ^ 10
sec = function(a) {
	return 1/Math.cos(a);
}

xtile = ((lon_deg + 180) / 360) * n
ytile = (1 - (ln(tan(lat_rad) + sec(lat_rad)) / Pi)) / 2 * n