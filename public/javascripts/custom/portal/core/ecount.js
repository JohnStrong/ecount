var ecount = angular.module('Ecount',
[
'ngRoute',
'ngAnimate',
'Ecount.Account',
'Ecount.Map',
'Ecount.Map.County',
'Ecount.Map.Elections',
'Ecount.Map.County.Vis'
]);

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
					action: 'map.base'
				}
			)
			.when(
				'/map/county/:cid',
				{
					action: 'map.county.districts'
				}
			)
			.when(
				'/map/county/districts/:gid',
				{
					action: 'map.county.ded'
				}
			)
			.otherwise(
				{
					redirectTo: '/home'
				}
			);
		}
]);

ecount.controller('AppController',
	['$scope', '$route', '$routeParams',
	function($scope, $route, $routeParams) {

		$scope.user = {};

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