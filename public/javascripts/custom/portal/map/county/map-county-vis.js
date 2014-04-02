var ecountVis = angular.module('Ecount.Map.County.Vis', []);

ecountVis.factory('FilterFor',
	[function() {

		// filter functions for extractor utility...
		return {
			districts: function(datum) {

				console.log('datum', datum);

				// computes the sum of all district tally results per candidate...
				var result = 0;

				for(var r in datum.results) {
					result += datum.results[r].result;
				}

				return {
					'id': datum.id,
					'name' : datum.name,
					'party' : datum.party,
					'count' : result
				};
			},

			// takes the dedId (geom gid) and does a filter to find unique data set...
			ded: function(dedId) {

				return function(datum) {

					var result;

					// for each candidate, extracts the tally result relating to the current view...
					$.each(datum.results, function(k, d) {

						// hard coded for testing purposes for now... (1 = Renmore)
						console.log('ded vis', dedId);

						if(d.dedId === dedId) {
							result = d.result;
							return;
						}
					});

					console.log('ded result', result);

					return {
						'id' : datum.id,
						'name' : datum.name,
						'party' : datum.party,
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

				console.log('result set', resultSet);

				callback(resultSet);
			}
		};
	}
]);

ecountVis.service('StatVisualization', function() {

	var getImage = function(party) {

		var img = 'assets/images/Other.svg';

		switch(party) {
			case 'FF':
				img = 'assets/images/FineFail.svg'
				break;
			case 'FG':
				img = 'assets/images/FineGael.svg'
				break;
			case 'SF':
				img = 'assets/images/SinnFein.svg'
				break;
			case 'LAB':
				img = 'assets/images/Labour.svg'
				break;
			case 'GRN':
				img = 'assets/images/GreenParty.svg'
				break;
			case 'IND':
				img = 'assets/images/Independent.svg'
				break;
			default:
				break;
		}

		return img;
	};

	return function(_domain, _dataset, props) {

		'use strict';

		var dataset = _dataset,
			domain =  _domain,

			// general chart...
			XLINK_NS_PATH = 'http://www.w3.org/1999/xlink',

			CHART_CLASS = 'info-pane',

			CANVAS_HEIGHT_PADDING = 40,
			PADDING = [20, 180, 25],

			WIDTH = props.width,
			HEIGHT = dataset.length * CANVAS_HEIGHT_PADDING,

			BAR_HEIGHT_OFFSET = HEIGHT / dataset.length,

			ANIMATION_DURATION = 1200,
			ANIMATION_DELAY = 100,

			BAR_HEIGHT_TOTAL = BAR_HEIGHT_OFFSET * dataset.length - PADDING[0],
			BAR_MIN_WIDTH = 1,
			BAR_BORDER_WIDTH = 2,

			YSCALE_PADDING_PERCENT = 0.2,

			LEGEND_PADDING = 170,

			TEXT_OFFSET = 10,
			BAR_TEXT_PADDING = 8,

			// chart axis...
			XAXIS_ORIENT = 'bottom',
			XAXIS_TICK_TOTAL = 8,

			LABEL_FILL_COLOR = '#333333',

			// legend...
			LEGEND_RECT_WIDTH = 20,
			LEGEND_RECT_HEIGHT = 20,

			LEGEND_TEXT_HEIGHT = 15,
			LEGEND_TEXT_WIDTH = 25,

			LEGEND_IMAGE_DIM = '20px',
			LEGEND_IMAGE_OFFSET = 12,

			TOOLTIP_COLOR_ID_OFFSET = 1,

			getOrZero = function(d) {
				return (d.count ? d.count : 0);
			},

			// set up chart with container styles and svg vector...
			chart = d3.select(domain)
				.append('div')
				.attr('class', CHART_CLASS)
				.append('svg:svg')
				.attr('xlink', XLINK_NS_PATH)
				.attr('width', WIDTH)
				.attr('height', HEIGHT + PADDING[0]),

			xScale = d3.scale.linear().domain([0, d3.max(dataset,
					function(d) { return getOrZero(d); })
				]).range([0, WIDTH - PADDING[2] - PADDING[1] - PADDING[2]]),

			yScale = d3.scale.ordinal().domain(d3.range(dataset.length)).rangeRoundBands([0,
				BAR_HEIGHT_TOTAL], YSCALE_PADDING_PERCENT),

			// to scale the xaxis on chart correctly...
			xAxis = d3.svg.axis()
		        .scale(xScale)
		        .orient(XAXIS_ORIENT)
		        .ticks(XAXIS_TICK_TOTAL),

			colorScale = d3.scale.category20c(),

			// begin visualization.....
			chartMain = chart.selectAll('rect.bar')
				.data(dataset)
				.enter().append('svg:rect')
				.attr('x', PADDING[0])
				.attr('y', function(d, i) { return yScale(i); })
				.attr('height', yScale.rangeBand())
				.transition()
					.ease('bounce')
					.duration(ANIMATION_DURATION)
					.delay(function(d, i) { return i * ANIMATION_DELAY; })
				.attr('width',
					function(d) {
						var ex  = getOrZero(d);
						return xScale(ex) + BAR_MIN_WIDTH;
					})
				.style('fill', function(d, i) { return colorScale(i); })
				.style('stroke', LABEL_FILL_COLOR)
				.style('stroke-width', BAR_BORDER_WIDTH)
				.attr('index_value', function(d, i) { return 'item-' + i; })
				.attr('color_value', function(d, i) { return colorScale(i); });

		// chart axis...
		chart.append('g')
			.attr('class', 'axis')
			.attr('transform', 'translate(' + PADDING[0] + ',' +
				yScale.rangeExtent()[1] + ')')
			.style('fill', LABEL_FILL_COLOR)
			.call(xAxis);

		// legend...
		chart.selectAll('g.legend').data(dataset)
			.enter()
			.append('g')
			.each(function(d, i) {

				var g = d3.select(this),

					textLen = WIDTH - PADDING[1] + PADDING[0]*2;

				g.append('rect')
					.attr('x', WIDTH - PADDING[1] + PADDING[0]/2)
					.attr('y', yScale(i))
					.attr('width', LEGEND_RECT_WIDTH)
					.attr('height', yScale.rangeBand())
					.style('fill', colorScale(i));

				g.append('text')
					.attr('x', textLen)
					.attr('dy', yScale(i) + LEGEND_RECT_HEIGHT/2)
					.attr('height', LEGEND_TEXT_HEIGHT)
					.style('fill', LABEL_FILL_COLOR)
					.style('font-size', '.75em')
					.text(d.name)
					.each(function(d) {
						d.location = textLen + this.getBBox().width + 5;
					});

				g.append('image')
					.attr('x', function(d) { return d.location; })
					.attr('y', yScale(i))
					.attr('height', LEGEND_IMAGE_DIM)
					.attr('width', LEGEND_IMAGE_DIM)
					.attr('preserveAspectRatio', 'xMinYMin')
					.attr('xlink:href' , function(d) {
						return getImage(d.party);
					});
			});

		// add tipsy tooltip, called when a bar from chart is hovered over...
		$('svg rect').tipsy({
			gravity: 'w',
			html: true,
			title: function() {
				var d = this.__data__;
				return '<span style="color:#222222">' + getOrZero(d) + '</span>';
			}
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

		TOOLTIP_ELEM = 'body',

		COUNTY_VIS_PIXEL_WIDTH = 520,

		DIALOG_PADDING = 20,

		countyFilter = FilterFor.districts,

		districtFilter = FilterFor.ded;

		function failedVisualizationView(container) {
			container.html(FAILED_VIS_MESSAGE);
		}

		function createDialog(elemId, title, width, _close) {
			var dialog = $(elemId).dialog({
				'title':  		title, 
				'width': 		width,
				'modal': 		true,
				'position': 	{ my: "top", at: "top", of: '#live-feed' },
				'resizable': 	false,
				'draggable': 	false,
				'closeText': 	'close',
				'close': 		_close
			});

			return dialog;
		}

		return function(results) {

			return {
				countyWithDialog: function(dialogTitle, props, onClose) {

					var width = props? props.width : COUNTY_VIS_PIXEL_WIDTH,

						title = dialogTitle,
						
						elem = createDialog('#vis-dialog', title, width + DIALOG_PADDING, onClose);

					// empty dialogs contents...
					if(elem) elem.empty();

					TallyExtractor(countyFilter, results)(function(resultSet) {

						if(!resultSet || resultSet.length <= 0) {
							failedVisualizationView(elem);
							return;
						}

						StatVisualization(elem[0], resultSet, {'width': width});

						elem.dialog('open');
					});
				},

				county: function(elem, props) {

					var width = props? props.width : COUNTY_VIS_PIXEL_WIDTH;

					if(elem) elem.empty();

					TallyExtractor(countyFilter, results)(function(resultSet) {

						if(!resultSet || resultSet.length <= 0) {
							failedVisualizationView(elem);
							return;
						}

						StatVisualization(elem[0], resultSet, {'width': width});
					});
				},

				ded: function(elem, dedId, props) {

					// get correct filter for ded results...
					var filterWithDEDId = districtFilter(dedId);

					$.each(results, function(k, result) {

						TallyExtractor(filterWithDEDId, result)(function(resultSet) {

							console.log('te', resultSet);

							if(!resultSet || resultSet.length <= 0) {
								failedVisualizationView(elem);
								return;
							}

							StatVisualization(elem[0], resultSet, {'width': elem.width()});
						});
					});
				}
			};
		};
	}
]);