var ecountVis = angular.module('Ecount.Map.County.Vis', []);

ecountVis.factory('FilterFor',
	[function() {

		// filter functions for extractor utility...
		return {
			districts: function(datum) {
				// computes the sum of all district tally results per candidate...
				var result = datum.results.reduce(function(prev, next) {
					var prev = prev.result || 0,
						next = next.result || 0;

					return prev + next;
				});

				return {
					'id': datum.id,
					'name' : datum.name,
					'count' : result
				};
			},

			// takes the dedId (geom gid) and does a filter to find unique data set...
			ded: function(dedId) {

				return function(datum) {

					var result;

					// for each candidate, extracts the tally result relating to the current view...
					$.each(datum.results, function(k, d) {
						// hard coded for testing purposes for now...
						if(d.dedId === 2469) {
							result = d.result;
							return;
						}
					});

					return {
						'id' : datum.id,
						'name' : datum.name,
						'count' : result
					};
				}
			}
		};
	}
])

// extracts tally results from the provided data set following a filter heuristic...
ecountVis.service('TallyExtractor',
	[function() {

		return function(filter, dataSet) {
			return function(callback) {
				var resultSet = $.map(dataSet, function(datum) {
					return filter(datum);
				});

				callback(resultSet);
			}
		};
	}
]);

ecountVis.service('StatVisualization', function() {

	'use strict';

	return function(_domain, _dataset, props) {

		var dataset = _dataset,
			domain =  _domain,

			// general chart...
			CANVAS_HEIGHT_PADDING = 25,
			PADDING = [20, 180],

			WIDTH = props.width,
			HEIGHT = dataset.length * CANVAS_HEIGHT_PADDING,

			BAR_HEIGHT_OFFSET = HEIGHT / dataset.length,

			ANIMATION_DURATION = 1200,
			ANIMATION_DELAY = 100,

			BAR_HEIGHT_TOTAL = BAR_HEIGHT_OFFSET * dataset.length - PADDING[0],
			BAR_MIN_WIDTH = 1,
			BAR_BORDER_COLOR = '#FFFFFF',
			BAR_BORDER_WIDTH = 1,

			LEGEND_PADDING = 150,

			TEXT_OFFSET = 10,
			BAR_TEXT_PADDING = 8,

			// chart axis...
			XAXIS_ORIENT = 'bottom',
			XAXIS_TICK_TOTAL = 8,
			XAXIS_FILL_COLOR = '#FFFFFF',

			// legend...
			LEGEND_RECT_WIDTH = 20,
			LEGEND_RECT_HEIGHT = 10,

			LEGEND_TEXT_HEIGHT = 15,
			LEGEND_TEXT_WIDTH = 50;

		var chart = d3.select(domain)
			.append('div')
			.attr('class', 'info-pane')
			.append('svg:svg')
			.attr('width', WIDTH)
			.attr('height', HEIGHT + PADDING[0]);

		// d3 api specific vars...
		var xScale = d3.scale.linear().domain([0,
				d3.max(dataset, function(d) {
					return d.count; })]).range([0, WIDTH - PADDING[1] - PADDING[0]]),

			yScale = d3.scale.linear().domain([0, dataset.length]).range([BAR_HEIGHT_OFFSET,
				BAR_HEIGHT_TOTAL]),

			// to scale the xaxis on chart correctly...
			xAxis = d3.svg.axis()
		        .scale(xScale)
		        .orient(XAXIS_ORIENT)
		        .ticks(XAXIS_TICK_TOTAL),

			colorScale = d3.scale.category20c();

		// begin visualization.....
		var chartMain = chart.selectAll('rect')
			.data(dataset)
			.enter().append('svg:rect')
			.attr('x', PADDING[0])
			.attr('y', function(d, i) { return yScale(i) - PADDING[0]/2; })
			.attr('height', BAR_HEIGHT_OFFSET/1.5)
			.transition()
				.ease('bounce')
				.duration(ANIMATION_DURATION)
				.delay(function(d, i) { return i * ANIMATION_DELAY; })
			.attr('width',
				function(d) {
					var ex  = d.count;
					return xScale(ex) + BAR_MIN_WIDTH;
				})
			.style('fill', function(d, i) { return colorScale(i); })
			.style('stroke', BAR_BORDER_COLOR)
			.style('stroke-width', BAR_BORDER_WIDTH)
			.attr('index_value', function(d, i) { return 'item-' + i; })
			.attr('color_value', function(d, i) { return colorScale(i); });

		// chart axis...
		chart.append('g')
			.attr('class', 'axis')
			.attr('transform', 'translate(' + PADDING[0] + ',' +
				(BAR_HEIGHT_TOTAL) + ')')
			.style('fill', XAXIS_FILL_COLOR)
			.call(xAxis);

		// legend...
		chart.selectAll('g.legend').data(dataset)
			.enter()
			.append('g')
			.each(function(d, i) {
				var g = d3.select(this);

				g.append('rect')
					.attr('x', WIDTH - PADDING[1] + PADDING[0])
					.attr('y', PADDING[0]/2 + (PADDING[0] * i))
					.attr('width', LEGEND_RECT_WIDTH)
					.attr('height', LEGEND_RECT_HEIGHT)
					.style('fill', colorScale(i));

				g.append('text')
					.attr('x', WIDTH - PADDING[1] + PADDING[0]*2.5)
					.attr('y', PADDING[0] + (PADDING[0] * i))
					.attr('height', LEGEND_TEXT_HEIGHT)
					.attr('width', LEGEND_TEXT_WIDTH)
					.style('fill', colorScale(i))
					.text('' + d.name);
			});
	};
});

ecountVis.factory('Visualize',
	['FilterFor',
	'TallyExtractor',
	'StatVisualization',
	function(FilterFor, TallyExtractor, StatVisualization) {

		var FAILED_VIS_MESSAGE = '<div class="alert alert-vis">' +
		'<h3>Oops!</h3>' +
		'<p>could not visualize tally results<p>' +
		'</div>',

		COUNTY_VIS_PIXEL_WIDTH = 520,

			countyFilter = FilterFor.districts,
			districtFilter = FilterFor.ded;

		function failedVisualizationView(container) {
			container.html(FAILED_VIS_MESSAGE);
		}

		return function(results, elem) {

			return {
				county: function(idealWidth) {
					if(elem) elem.empty();

					var width = idealWidth || COUNTY_VIS_PIXEL_WIDTH;

					TallyExtractor(countyFilter, results)(function(resultSet) {

						if(!resultSet || resultSet.length <= 0) {
							failedVisualizationView(elem);
							return;
						}

						return StatVisualization(elem[0], resultSet, {'width': width});
					});
				},

				ded: function(dedId, props) {

					// empty current element to make way for fresh results...
					if(elem) elem.empty();

					// get correct filter for ded results...
					var filterWithDEDId = districtFilter(dedId);

					$.each(results, function(k, result) {

						TallyExtractor(filterWithDEDId, result)(function(resultSet) {

							console.log('extractor', resultSet);

							if(!resultSet || resultSet.length <= 0) {
								failedVisualizationView(elem);
								return;
							}

							StatVisualization(elem[0], resultSet, {'width': elem.width()});
							return;
						});
					});
				}
			};
		};
	}
]);