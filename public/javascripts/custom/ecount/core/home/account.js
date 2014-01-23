var account = angular.module('Ecount.Account', 
	['Ecount.Account.Util']);

account.directive('accountDirective', function() {
	return {
		restrict: 'E',
		controller: 'AccountController',
		templateUrl: '/templates/core/home/templates/account.html'
	}
});

account.controller('AccountControler', 
	['$scope', function($scope, AccountDispatch) {
		
		$scope.user = null;

		$scope.getAccountDetails = function() {
			AccountDispatch.getAccountDetails()
				.success(function(data) {
					console.log(data);
					$scope.user = data;
				})
				.error(function(err) {
					// defer error
				});
		}
	}
]);