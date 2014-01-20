var directives = angular.module('Core.Directive', []);

directives.directive('homeDirective', function() {
	return {
		restrict: 'E',
		templateUrl: '/home'
	}
});

directives.directive('mapDirective', function() {
	return {
		restrict: 'E',
		controller: 'MapController',
		templateUrl: '/map'
	}
});

directives.directive('aboutDirective', function() {
	return {
		restrict: 'E',
		controller: 'AboutController',
		templateUrl: '/about',
	}
})

 directives.directive('electionDirective', function() {
 	return {
 		restrict: 'E',
 		controller: 'ElectionController',
 		templateUrl: '/election'
 	};
 });

directives.directive('mapBaseDirective', function() {
	return {
		restrict: 'E',
		controller: 'MapBaseController',
		templateUrl: '/map/base'
	};
});

directives.directive('countyDirective', function() {
	return {
		restrict: 'E',
		controller: 'CountyController',
		templateUrl: '/map/county'
	}
})

directives.directive('districtDirective', function() {
	return {
		transclude: true,
		restrict: 'E',
		controller: 'DistrictController',
		templateUrl: '/map/county/districts'
	};
});

directives.directive('edDirective', function() {
	return {
		transclude: true,
		restrict: 'E',
		controller: 'DEDController',
		templateUrl: '/map/county/ed'
	};
})

directives.directive('electionStatDirective', function() {
	return {
		restrict: 'E',
		transclude: true,
		controller: 'ElectionStatController',
		templateUrl: "/templates/electionStat.html"
	};
});

directives.directive('itemDirective', function() {
	return {
		require: '^electionStatDirective',
		restrict: 'E',
		transclude: true,
		link: function(scope, element, attrs, eleCtrl) {
			eleCtrl.addTable(scope);
		},
		templateUrl: '/templates/constituencyTable.html'
	};
});

directives.directive('statTab', function() {
	return {
		restrict: 'E',
		transclude: true,
		scope: {},
		controller: function($scope) {
			var panes = $scope.panes = [];

			$scope.select = function(pane) {
				angular.forEach(panes, function(pane) {
					pane.selected = false;
				});

				pane.selected = true;
			};

			this.addPane = function(pane) {
				if (panes.length == 0) {
					$scope.select(pane);
				}

				panes.push(pane);
			};
		},

		templateUrl: '/templates/statTab.html'
	};
});

directives.directive('statPane', function() {
	return {
		require: '^statTab',
		restrict: 'E',
		transclude: true,
		scope: {
			title: '@'
		},
		link: function(scope, element, attrs, tabsCtrl) {
			tabsCtrl.addPane(scope);
		},
		templateUrl: '/templates/statPane.html'
	};
});

directives.directive('visDirective',function() {
	return {
		controller: 'VisualizationController'
	};
});