var account = angular.module('Ecount.Account',
	['Ecount.Account.Util']);

account.directive('accountDirective', function() {
	return {
		restrict: 'E',
		controller: 'AccountController',
		templateUrl: '/templates/core/home/templates/account.html'
	}
});

account.controller('AccountController',
	['$scope', 'AccountDispatch',
	function($scope, AccountDispatch) {
		// TODO: implement various account actions
	}
]);