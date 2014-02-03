var tally = angular.module('Ecount.Tally.County',
	[]);

tally.directive('tallyDirective', function() {
	return {
		restrict: 'E',
		scope: {
			data: '@'
		},
		controller: 'TallyFeedController',
		templateUrl: '/tally/view'
	};
});

tally.controller('TallyFeedController',
	[function($scope) {
		console.log('tally scope', $scope);
	}
]);