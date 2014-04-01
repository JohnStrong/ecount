var mapCountyPrev = angular.module('Ecount.Map.County.Previous',
['Ecount.Map.Elections', 'Ecount.Map.County.Vis']);

mapCountyPrev.controller('PreviousTallyController',
	['$scope', '$element', 'ElectionStatistics', 'Visualize',
	function($scope, $element, ElectionStatistics, Visualize) {

		var TALLY_VIS_ELEM_ID = '#previous-tally-vis',

			FAILED_TO_VIS_TEMPLATE = '<div class="alert alert-info bottom">' +
					'no results available for the selected area' +
				'</div>';

		// if we could not find results for the current selection, display an alert...
		function failedToVisualize() {
			$(TALLY_VIS_ELEM_ID).empty()
				.html(FAILED_TO_VIS_TEMPLATE);
		}

		// evaluated when the user selects/changes an election and constituency to view...
		function getTallyResults(election, constituency) {

			console.log('previous tally', election, constituency);

			ElectionStatistics.getElectionTallyByConstituency(
				election.id, constituency.id,
				function(tallyResults) {

					if(!tallyResults.results || tallyResults.results.length <= 0) {
						failedToVisualize();
						return;
					}

					var tallyVisElement = $element.find(TALLY_VIS_ELEM_ID);

					// if we get a useful result set, visualize the tally results...
					Visualize(tallyResults.results)
						.county(tallyVisElement, {'width' : tallyVisElement.width()});
				});
		}

		$scope.$watch('constituency', function(newVal) {
			
			console.log('vals', newVal);

			if(newVal) getTallyResults($scope.election, newVal);
		});

	}
]);