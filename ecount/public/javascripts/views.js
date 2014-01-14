var ecount = angular.module('Ecount', ['ngRoute', 'IMap.base', 'IMap.county'],

	function($routeProvider, $locationProvider) {

		$routeProvider.when('/', {
			templateUrl: '/home',
			controller: HomeController,
			controllerAs: 'home'
		});
		$routeProvider.when('/map', {
			templateUrl: '/map'
		});
		$routeProvider.when('/about', {
			templateUrl: '/about',
			controller: AboutController,
			controllerAs: 'about'
		});
		$routeProvider.when('/map/county', {
			templateUrl: '/map/county',
			controller: CountyController,
			controllerAs: 'county'
		});

	// configure html5 to get links working on jsfiddle
	$locationProvider.html5Mode(true);
});

 /***********************************
 *
 *			DIRECTIVES
 *
 ***********************************/
ecount.directive('statTab', function() {
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

		template: '<div class="tabbable">' +
		    '<ul class="nav nav-tabs">' +
		    '<li ng-repeat="pane in panes" ng-class="{active:pane.selected}">' +
		    '<a href="" ng-click="select(pane)">{{pane.title}}</a>' +
		    '</li>' +
		    '</ul>' +
		    '<div class="tab-content" ng-transclude></div>' +
		    '</div>'
	};
});

ecount.directive('statPane', function() {
	return {
		require: '^statTab',
		restrict: 'E',
		transclude: 'true',
		scope: {
			title: '@'
		},
		link: function(scope, element, attrs, tabsCtrl) {
			tabsCtrl.addPane(scope);
		},
		template: '<div class="tab-pane"' +
		'ng-show="selected" ng-transclude>' +
    	'</div>'
	};
});

ecount.directive('homeFeatureDirective', function() {
	return {
		restrict: 'E',
		controller: HomeController,
		templateUrl: '/home'
	};
});

 ecount.directive('electionDirective', function() {
 	return {
 		restrict: 'E',
 		controller: ElectionController,
 		templateUrl: '/election'
 	};
 });

ecount.directive('imapDirective', function() {
	return {
		restrict: 'E',
		controller: MapController,
		templateUrl: '/imap'
	};
});

ecount.directive('linkDirective', function() {
	var links = [
		{title: 'Map', link: 'imap'},
		{title: 'Overview', link: 'overview'},
		{title: 'Party Statistics', link: 'party'}
	];

	var template = '<ul id="section-links" class="nav nav-list well">' +
		'<li class="active" ng-repeat="link in links">' +
		'<a href="" ng-click="goToLink(link)">' +
		'{{link.title}}'
		'<span class="glyphicon glyphicon-chevron-right"></span>' +
		'</a>' +
		'</li>' +
		'</ul>'

	return {
		restrict: 'E',
		controller: function($scope, $location) {
			$scope.links = links;

			$scope.goToLink = function(link) {
				$location.path().path('#' + link.link);
			}
		},
		template: template
	}
});

ecount.directive('visDirective',function(Visualize) {
	return function(scope, element, attr) {
		Visualize.init(scope.c.stats, scope.c.title);
		Visualize.firstPreferenceVotes(element[0]);
		Visualize.percentageVote(element[0]);
		Visualize.seats(element[0]);
	};
});



/************************************
 *
 *				FACTORY
 *
 ************************************/


function AboutController($scope) {

}

function HomeController($scope) {

}