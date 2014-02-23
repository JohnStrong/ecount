var mapCountyPrev = angular.module('Ecount.Map.County.Previous',
['Ecount.Map.Elections', 'Ecount.Map.County.Vis']);

mapCountyPrev.controller('PreviousTallyController',
	['$scope', '$element', 'ElectionStatistics', 'Visualize',
	function($scope, $element, ElectionStatistics, Visualize) {

		var TALLY_VIS_ELEM_ID = '#previous-tally-vis',

			FAILED_TO_VIS_TEMPLATE = '<div class="alert alert-info">' +
					'Could not visualize tally results' +
				'</div>',

		tallyVisElement = $element.find(TALLY_VIS_ELEM_ID);

		// if we could not find results for the current selection, display an alert...
		function failedToVisualize() {
			tallyVisElement.empty()
				.html(FAILED_TO_VIS_TEMPLATE);
		}

		// evaluated when the user selects/changes an election and constituency to view...
		function getTallyResults(election, constituency) {
			ElectionStatistics.getElectionTallyByConstituency(
				election.id, constituency.id,
				function(tallyResults) {

					if(!tallyResults.results || tallyResults.results.length <= 0) {
						failedToVisualize();
						return;
					}

					// if we get a useful result set, visualize the tally results...
					Visualize(tallyResults.results, tallyVisElement)
						.county(tallyVisElement.width());
				});
		}

		$scope.$watchCollection('[election, constituency]', function(newVals) {
			if(newVals[0] && newVals[1]) getTallyResults(newVals[0], newVals[1]);
		});

	}
]);