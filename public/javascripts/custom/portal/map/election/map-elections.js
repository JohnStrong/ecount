var mapElections = angular.module('Ecount.Map.Elections', ['Ecount.Map.County.Vis']);

mapElections.factory('ElectionStatistics', ['$http',
	function($http) {

		var ALL_COUNTY_COUNSTITUENCIES_URL = '/api/elections/constituencies/',

			ALL_ELECTIONS_URL = '/api/elections/',

			ELECTION_TALLY_CONSTITUENCY_URL = '/api/elections/tally/';

		return {

			getElections: function(callback) {
				$http.get(ALL_ELECTIONS_URL)
					.success(callback);
			},

			getElectionCountyConstituencies: function(countyId, callback) {
				$http.get(ALL_COUNTY_COUNSTITUENCIES_URL + countyId)
					.success(callback)
			},

			getElectionTallyByConstituency: function(electionId, constituencyId, callback) {
				$http.get(ELECTION_TALLY_CONSTITUENCY_URL + electionId + '/' + constituencyId)
					.success(callback);
			}
		};
	}
]);

mapElections.controller('ElectionController',
	['$scope', 'ElectionStatistics',
	function($scope) {

		// current elections...
		$scope.elections = [];

		// holds the user election selection...
		$scope.election = null;

		// holds users constituency selection for current county...
		$scope.constituency = null;

		// receive previous elections from map controller...
		$scope.$on('previousTallys', function(source, _elections) {
			$scope.elections = _elections;
		});
	}
]);

mapElections.controller('PreviousTallyController',
	['$scope', '$element', 'ElectionStatistics', 'Visualize',
	function($scope, $element, ElectionStatistics, Visualize) {

		var TALLY_VIS_ELEM_ID = '#previous-tally-vis',

			FAILED_TO_VIS_TEMPLATE = '<div class="alert alert-info">' +
					'Could not visualize tally results' +
				'</div>',

		tallyVisElement = $(TALLY_VIS_ELEM_ID);

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