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


strutsUtil.service('Updater', function() {

	function updateDEDResult(old, update, target) {
		
		$.each(old, function(ith, dedResult) {
			if(dedResult.id = update.id) {
				dedResult.result += update.tally;
				return;
			}
		});
	}

	return function(structure, newSet) {

		var constituencyFilter = structure.filter(function(entry) {
			return entry.id === newSet.cid;
		});

		$.each(constituencyFilter[0].results, function(ith, entryResult) {
			
			$.each(newSet.results, function(kth, newResult) {
				
				if(entryResult.id === newResult.id) {
					updateDEDResult(entryResult.results, newResult, newSet.dedId);
				}
			});
		});

		for(var ith in structure) {
			if(structure[ith].id === constituencyFilter[0].id) {
				structure[ith] = constituencyFilter[0];
			}
		};

		return structure;
	}
});

strutsUtil.service('Extend', function() {
	return function(subClass, superClass) {
		var F = function() {};
		F.prototype = superClass.prototype;
		subClass.prototype = new F();
		subClass.prototype.constructor = subClass;
	};
});