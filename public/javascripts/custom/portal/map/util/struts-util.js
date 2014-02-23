var strutsUtil = angular.module('Ecount.Struts.Util', []);

//compares to objects...
strutsUtil.service('Compare', function() {

	// check if results are the same...
	function compareDistinctResults(ithResults, kthResults) {

		$.each(ithResults, function(ith, ithResult) {
			$.each(kthResults, function(kth, kthResult) {
				if(ithResult.dedId === kthResult.dedId &&
				!(ithResult.result === kthResult.result)) {
					return false;
				}
			});
		});

		return true;
	}

	return function(firstArr, secondArr) {

		if(firstArr.length === 0 || secondArr.length === 0) {
			return true;
		}

		$.each(firstArr, function(ith, ithElem) {
			$.each(secondArr, function(kth, kthElem) {

				if(ithElem.results.length === 0 || kthElem.results.length === 0) {
					return true;
				}

				// results are not the same...
				if(ithElem.id === kthElem.id &&
				!compareDistinctResults(ithElem.results, kthElem.results)) {
					return false;
				}
			});
		});

		return true;
	};
});

strutsUtil.service('Extend', function() {
	return function(subClass, superClass) {
		var F = function() {};
		F.prototype = superClass.prototype;
		subClass.prototype = new F();
		subClass.prototype.constructor = subClass;
	};
});