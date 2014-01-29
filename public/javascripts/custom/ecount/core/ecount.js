var ecount = angular.module('Ecount',
	['ngRoute', 'ngAnimate', 'Ecount.Map',
	'Ecount.Map.County', 'Ecount.Map.Elections',
	'Ecount.Map.County.Vis']);

ecount.config(
	['$routeProvider',
	function($routeProvider) {

		$routeProvider
			.when(
				'/',
				{
					redirectTo: '/home'
				}
			)
			.when(
				'/home',
				{
					action: 'home'
				}
			)
			.when(
				'/map',
				{
					action: 'map.base'
				}
			)
			.when(
				'/about',
				{
					action: 'about'
				}
			)
			.when(
				'/map/election/:eid/county/:cid',
				{
					action: 'map.county.ded'
				}
			)
			.when(
				'/map/county/districts/:gid',
				{
					action: 'map.county.ed'
				}
			)
			.otherwise(
				{
					redirectTo: '/home'
				}
			);
		}
]);

ecount.directive('homeDirective', function() {
	return {
		restrict: 'E',
		templateUrl: '/templates/core/templates/home.html'
	}
});

ecount.controller('AppController',
	['$scope', '$route', '$routeParams',
	function($scope, $route, $routeParams) {

		var render = function() {

			var renderAction = $route.current.action || '',
				renderPath = renderAction.split('.');

			$scope.renderAction = renderAction;
			$scope.renderPath = renderPath;
		};

		$scope.$on('$routeChangeSuccess',
			function($currentRoute, $previousRoute) {
				render();
			}
		);
	}
]);