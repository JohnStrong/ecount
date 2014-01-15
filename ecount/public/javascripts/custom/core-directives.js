var directives = angular.module('Core.Directive', []);

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

directives.directive('statPane', function() {
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

directives.directive('homeFeatureDirective', function() {
	return {
		restrict: 'E',
		controller: HomeController,
		templateUrl: '/home'
	};
});

 directives.directive('electionDirective', function() {
 	return {
 		restrict: 'E',
 		controller: ElectionController,
 		templateUrl: '/election'
 	};
 });

directives.directive('imapDirective', function() {
	return {
		restrict: 'E',
		controller: MapController,
		templateUrl: '/imap'
	};
});

directives.directive('linkDirective', function() {
	var links = [
		{title: 'Map', link: 'imap'},
		{title: 'Overview', link: 'overview'},
		{title: 'Party Statistics', link: 'party'}
	];

	var template = '<ul id="section-links" class="nav nav-list well">' +
		'<li class="nav-header">Quick Links</li>' +
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
	};
});

directives.directive('visDirective',function() {
	return {
		controller: VisualizationController
	};
});