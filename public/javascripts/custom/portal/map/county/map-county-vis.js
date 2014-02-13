var vis = angular.module('Ecount.Map.County.Vis',
	[]);

vis.directive('visDirective',function() {
	return {
		controller: 'VisualizationController'
	};
});

vis.factory('StatVisualization', function() {

	"use strict";

	return function(domain, dataset) {

		var dataset = dataset,

			WIDTH = 900,
			HEIGHT = dataset.length * 30,
			BAR_HEIGHT_OFFSET = 25,

			ANIMATION_DURATION = 1200,
			ANIMATION_DELAY = 100,

			BAR_WIDTH_TOTAL = 600,
			BAR_HEIGHT_TOTAL = BAR_HEIGHT_OFFSET * dataset.length,
			BAR_MIN_WIDTH = 5,
			BAR_BORDER_COLOR = '#FFFFFF',
			BAR_BORDER_WIDTH = 1,

			CANVAS_HEIGHT_PADDING = 30,
			PADDING = [5, 18],

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
			.style('fill', function(d, i) { return colorScale(i); })
			.style('stroke', BAR_BORDER_COLOR)
			.style('stroke-width', BAR_BORDER_WIDTH)
			.attr('index_value', function(d, i) { return "item-" + i; })
			.attr('color_value', function(d, i) { return colorScale(i); });

		//append values onto end of bar
		chart.selectAll('text.chart')
			.data(dataset).enter()
			.append('svg:text')
			.attr('x', PADDING[0])
			.attr('y', function(d, i) { return yScale(i); })
			.attr('dx', function(d) {
				var ex  = d.count;
				return xScale(ex) + BAR_MIN_WIDTH;
			})
			.attr('dy', BAR_HEIGHT_OFFSET - BAR_TEXT_PADDING + CANVAS_HEIGHT_PADDING)
			.attr('text-anchor', 'start')
			.text(function(d) { return (''+d.name + ': ' + d.count); })
			.attr('fill', '#8A8A8A');
	};
});

vis.controller('VisualizationController',
	['$scope', '$element', 'ElectionStatistics', 'StatVisualization',
	function($scope, $element, ElectionStatistics, StatVisualization)	{

		$scope.$on('emptyVisualization', function() {
			$($element).empty();
		});

		$scope.$on('updateVisualization', function(source, data) {
			StatVisualization($element[0], data);
		});
	}
]);