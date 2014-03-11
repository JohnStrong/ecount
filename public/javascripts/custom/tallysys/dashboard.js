(function($) {

	'use strict';

	var $candidates = $('#candidates').find('.candidate-entry'),
		
		$confirmTally = $('#confirm-tally'),

		CONFIRM_TALLY_URI = '/tally/vote',

		candidatesToJson = function() {
			var candidatesArr = [];

			$candidates.each(function(k, candidate) {
				var candidateJson = {};

				candidateJson['id'] = this.candidateId;
				candidateJson['name'] = this.candidateName;
				candidateJson['tally'] = this.candidateTally;


				candidatesArr.push(candidateJson);
			});

			return candidatesArr;
		};


	// set up candidates...
	$candidates.each(function(k, d) {
		this.candidateId = $(this).data('candidate-id');
		this.candidateName = $(this).data('candidate-name');
		this.candidateTally = $(this).data('tally');

		$(this).find('.candidate-name').text(this.candidateName);
		$(this).find('.candidate-tally').text(this.candidateTally);
	});

	// events for candidate elements
	$candidates.click(function(e) {
		e.preventDefault();
		
		this.candidateTally = this.candidateTally + 1;
		$(this).find('.candidate-tally')
			.text(this.candidateTally);
	}).hover(function() {
		// todo: hover in...
	}, function() {
		// todo: hover out...
	});


	// fired event user clicks complete button in #dash-main...
	$confirmTally.click(function(e) {
		var tally = {};
			
		tally.candidates = candidatesToJson();
			
		console.log(tally);

		$.ajax({
			type: 'POST',
			url: CONFIRM_TALLY_URI,
			data: JSON.stringify(tally),
			contentType: 'application/json',
			dataType: 'json'
		}).done(function(msg) {
			console.log(msg);
		});
	});

})($);