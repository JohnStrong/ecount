var vis = angular.module('Ecount.Map.County.Vis', 
	['Ecount.Map.Elections']);

vis.directive('visDirective',function() {
	return {
		controller: 'VisualizationController'
	};
});

vis.factory('StatVisualization', function() {
	
	"use strict";

	return function(domain, dataset) {

		var dataset = dataset,

			WIDTH = 800,
			HEIGHT = dataset.length * 60,
			BAR_HEIGHT_OFFSET = 50,

			ANIMATION_DURATION = 1200,
			ANIMATION_DELAY = 100,

			BAR_WIDTH_TOTAL = 500,
			BAR_HEIGHT_TOTAL = BAR_HEIGHT_OFFSET * dataset.length,

			BAR_MIN_WIDTH = 3,

			CANVAS_HEIGHT_PADDING = 30,
			PADDING = [5, 18],
			LEGEND_PADDING = 150,

			TEXT_OFFSET = 10,
			BAR_TEXT_PADDING = 20,

			colorScale = d3.scale.category20c();

		var chart = d3.select(domain)
			.append('svg:svg')
			.attr('width', WIDTH)
			.attr('height', HEIGHT);

		return function(title, extraction) {

			var xScale = d3.scale.linear().domain([0, 
					d3.max(dataset, function(d) { 
						return extraction(d.stats); })]).rangeRound([0, BAR_WIDTH_TOTAL]),
				
				yScale = d3.scale.linear().domain([0, dataset.length]).range([0, BAR_HEIGHT_TOTAL]);

			
			chart.append('svg:text')
				.attr('x', 0)
				.attr('y', 0)
				.attr('dx', PADDING[0])
				.attr('dy', PADDING[1])
				.attr('text-anchor', 'start')
				.text(title)
				.attr('fill', '#428BAA');
			

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
						var ex  = extraction(d.stats); 
						return xScale(ex) + BAR_MIN_WIDTH; 
					})
				.style('fill', function(d, i) { return colorScale(i); })
				.attr('index_value', function(d, i) { return "item-" + i; })
				.attr('color_value', function(d, i) { return colorScale(i); });

			// add legend
			chart.selectAll('circle')
				.data(dataset).enter()
				.append('svg:circle')
				.attr('cx', WIDTH - LEGEND_PADDING)
				.attr('cy', function(d, i) { return CANVAS_HEIGHT_PADDING + i*BAR_HEIGHT_OFFSET; })
				.attr('stroke-width', '.5')
				.style('fill', function(d, i) { return colorScale(i); })
				.attr('index_value', function(d, i) { return 'legend-' + i; })
				.attr('r', 5)
				.attr('color_value', function(d, i) { return colorScale(i); });

			chart.selectAll('text.legend')
				.data(dataset).enter()
				.append('svg:text')
				.attr('x', WIDTH - LEGEND_PADDING)
				.attr('y', function(d, i) { return PADDING[1] + i*BAR_HEIGHT_OFFSET; })
				.attr('dx', 0)
				.attr('dy', '5px')
				.attr('text-anchor', 'start')
				.text(function(d) { d.name; })
				.attr('fill', '#5A5A5A');


			//append values onto end of bar
			chart.selectAll('text.chart')
				.data(dataset).enter()
				.append('svg:text')
				.attr('x', PADDING[0])
				.attr('y', function(d, i) { return yScale(i); })
				.attr('dx', function(d) { 
					var ex  = extraction(d.stats); 
					return xScale(ex) + BAR_MIN_WIDTH; 
				})
				.attr('dy', BAR_HEIGHT_OFFSET - BAR_TEXT_PADDING + CANVAS_HEIGHT_PADDING)
				.attr('text-anchor', 'start')
				.text(function(d) { return extraction(d.stats); })
				.attr('fill', '#5A5A5A');
		};
	};
});

vis.controller('VisualizationController',
	['$scope', '$element', 'ElectionStatistics', 'StatVisualization',
	function($scope, $element, ElectionStatistics, StatVisualization)	{
		ElectionStatistics.getElectionStatsParty($scope.electionId, $scope.c.id, function(data) {
			StatVisualization($element[0], data)('first preference votes', 
				function(stats) { return stats.firstPreferenceVotes; });
			StatVisualization($element[0], data)('percentage of vote', 
				function(stats) { return stats.percentageVote; });
			StatVisualization($element[0], data)('no. of seats won', 
				function(stats) { return stats.seats; });
		});	
	}
]);