var accountUtil = angular.module('Ecount.Account.Util', []);

accountUtil.factory('AccountDispatch', 
		['$http',
		function($http) {

			return {
				getAccountDetails: function() {
					return $http.get('/portal/account');
				}
			}
		}
	]);