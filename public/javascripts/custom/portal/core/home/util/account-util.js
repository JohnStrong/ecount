var accountUtil = angular.module('Ecount.Account.Util', []);

accountUtil.factory('AccountDispatch',
		['$http',
		function($http) {

			return {
				getAccountDetails: function(callback) {
					return $http.get('/portal/account')
						.success(function(user) {
							callback(user);
						});
				}
			}
		}
	]);