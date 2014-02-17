var ecountVis = angular.module('Ecount.Map.County.Vis',
	[]);

ecountVis.factory('FilterFor',
	[function() {

		// filter functions for extractor utility...
		return {
			districts: function(datum) {

				// computes the sum of all district tally results per candidate...
				var result = datum.results.reduce(function(prev, next) {
					return prev.result + next.result;
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
						if(d.dedId === dedId) {
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

	"use strict";

	return function(_domain, _dataset) {

		var dataset = _dataset,
			domain =  _domain,

			WIDTH = 600,
			HEIGHT = dataset.length * 30,
			BAR_HEIGHT_OFFSET = 25,

			ANIMATION_DURATION = 1200,
			ANIMATION_DELAY = 100,

			BAR_WIDTH_TOTAL = 460,
			BAR_HEIGHT_TOTAL = BAR_HEIGHT_OFFSET * dataset.length,
			BAR_MIN_WIDTH = 5,
			BAR_BORDER_COLOR = '#FFFFFF',
			BAR_BORDER_WIDTH = 1,

			CANVAS_HEIGHT_PADDING = 30,
			PADDING = [5, 15],

			LEGEND_PADDING = 150,

			TEXT_OFFSET = 10,
			BAR_TEXT_PADDING = 8,

			colorScale = d3.scale.category20c();

		var chart = d3.select(domain)
			.append('svg:svg')
			.attr('width', WIDTH)
			.attr('height', HEIGHT);

		var xScale = d3.scale.linear().domain([0,
				d3.max(dataset, function(d) {
					return d.count; })]).rangeRound([0, BAR_WIDTH_TOTAL]),

			yScale = d3.scale.linear().domain([0, dataset.length]).range([0, BAR_HEIGHT_TOTAL]);

		// begin visualization.....
		chart.selectAll('rect')
			.data(dataset)
			.enter().append('svg:rect')
			.attr('x', PADDING[0])
			.attr('y', function(d, i) { return yScale(i) + CANVAS_HEIGHT_PADDING; })
			.attr('height', BAR_HEIGHT_OFFSET)
			.transition()
				.ease('bounce')
				.duration(ANIMATION_DURATION)
				.delay(function(d, i) { return i * ANIMATION_DELAY; })
			.attr('width',
				function(d) {
					var ex  = d.count;
					return xScale(ex) + BAR_MIN_WIDTH;
				})
			.attr('dx', function(d, i) {
				return BAR_WIDTH_TOTAL + PADDING[1];
			})
			.style('fill', function(d, i) { return colorScale(i); })
			.style('stroke', BAR_BORDER_COLOR)
			.style('stroke-width', BAR_BORDER_WIDTH)
			.attr('index_value', function(d, i) { return "item-" + i; })
			.attr('color_value', function(d, i) { return colorScale(i); });

		//append values onto end of bar
		chart.selectAll('text.chart')
			.data(dataset).enter()
			.append('svg:text')
			.attr('x', PADDING[1])
			.attr('y', function(d, i) { return yScale(i); })
			.attr('dy', BAR_HEIGHT_OFFSET - BAR_TEXT_PADDING + CANVAS_HEIGHT_PADDING)
			.attr('text-anchor', 'start')
			.text(function(d) { return (''+d.name + ': ' + d.count); })
			.attr('fill', '#FFFFFF');
	};
});

ecountVis.service('DialogVisualization', function() {
	"use strict";
});

ecountVis.factory('Visualize', 
	['FilterFor', 
	'TallyExtractor', 
	'StatVisualization', 
	'DialogVisualization',
	function(FilterFor, TallyExtractor, StatVisualization, DialogVisualization) {

		var COUNTY_RESULTS_VIS_ELEMENT = '#tally-results-vis';

			countyFilter = FilterFor.districts,
			districtFilter = FilterFor.ded;

		return function(results) {
			return {
				county: function() {
					$(COUNTY_RESULTS_VIS_ELEMENT).empty();

					TallyExtractor(countyFilter, results)(function(resultSet) {
						return StatVisualization(COUNTY_RESULTS_VIS_ELEMENT, resultSet);
					});
				},

				ded: function(dedId) {
					var dedDialogId = 'ded-results-vis-' + dedId,
						dialogHTML = '<div id="' + dedDialogId + '"></div>';

					bootbox.alert(dialogHTML);

					var filterWithDEDId = districtFilter(dedId);
					TallyExtractor(filterWithDEDId, results)(function(resultSet) {
						return StatVisualization('#'+dedDialogId, resultSet);
					});
				}
			};
		};
	}
]);