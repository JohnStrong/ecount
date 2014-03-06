(function($) {

	'use strict';

	var $candidates = $('#candidates').find('.candidate-entry');

	// set up candidates...
	$candidates.each(function(k, d) {
		this.candidateName = $(this).data('candidate-name');
		this.candidateTally = $(this).data('tally');

		$(this).find('.candidate-name').text(this.candidateName);
		$(this).find('.candidate-tally').text(this.candidateTally);
	});

	$candidates.click(function(e) {
		e.preventDefault();

		this.candidateTally++;
		$(this).find('.candidate-tally').text(this.candidateTally);
	}).hover(function() {
		// todo: hover in...
	}, function() {
		// todo: hover out...
	});

})($);