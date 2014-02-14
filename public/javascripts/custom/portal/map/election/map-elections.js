var mapElections = angular.module('Ecount.Map.Elections', []);

mapElections.factory('ElectionStatistics', ['$http',
	function($http) {

		var ALL_COUNTY_COUNSTITUENCIES_URL = '/api/elections/constituencies/',
			ALL_ELECTIONS_URL = '/api/elections/',
			ELECTION_TALLY_CONSTITUENCY_URL = '/api/elections/tally/';

		return {

			getElections: function(callback) {
				$http.get(ALL_ELECTIONS_URL)
					.success(function(data) {
						callback(data);
					});
			},

			getElectionCountyConstituencies: function(countyId, callback) {
				$http.get(ALL_COUNTY_COUNSTITUENCIES_URL + countyId)
					.success(function(data) {
						callback(data);
					})
			},

			getElectionTallyByConstituency: function(electionId, constituencyId, callback) {
				$http.get(ELECTION_TALLY_CONSTITUENCY_URL + electionId + '/' + constituencyId)
					.success(function(data) {
						callback(data);
					});
			}
		};
	}
]);

// extracts tally results from the provided data set following a filter heuristic...
mapElections.service('TallyExtractor',
	[function() {
		// filter functions for extractor utility
		var filterFor = {
				districts: function(datum) {

					// computes the sum of all district tally results per candidate
					var result = datum.results.reduce(function(prev, next) {
						return prev.result + next.result;
					});

					return {
						'id': datum.id,
						'name' : datum.name,
						'count' : result
					};
				},

				ded: function(dedId) {

					return function(datum) {

						var result;

						// for each candidate, extracts the tally result relating to the current view
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

		return function(scope, dataSet) {
			var filter = null;

			// get the corrrect filter for the current data-set
			if(scope.renderPath[2] === 'districts') {
				filter = filterFor.districts;
			} else if(scope.renderPath[2] === 'ded') {
				filter = filterFor.ded(scope.districtTarget.dedId);
			}

			return function(callback) {
				var resultSet = $.map(dataSet, function(datum) {
					return filter(datum);
				});

				callback(resultSet);
			}
		};
	}
]);

mapElections.controller('ElectionController',
	['$scope',
	function($scope) {

		// current elections...
		$scope.elections = [];

		// receive previous elections from map controller...
		$scope.$on('previousTallys', function(source, _elections) {
			$scope.elections = _elections;
		})
	}
]);