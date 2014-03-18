(function($) {

	'use strict';

	var $candidatesContainer = $('#candidates'),

		$candidates = $candidatesContainer.find('.candidate-entry'),

		$confirmTally = $('#confirm-tally'),

		$infoContainer = $('#error-info'),

		CONFIRM_TALLY_URI = '/tally/vote',

		CONFIRM_TALLY_WAIT_MSG = 'Please wait...',

		CONFIRM_TALLY_ACTIVE_MSG = 'Publish',

		CONFIRM_TALLY_DONE_MSG = 'Published...',

		INFO_SUCCESS_PUBLISH_ANOTHER = $('<br /><a href="/tally/logout">want to tally another ED?</a>'),

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
		},

		buildXhrResponse = function(outer, inner, msg, after) {
			var containerOuter = $('<div class="alert"></div>'),
				containerInner = $('<p></p>');

			containerOuter.addClass(outer);
			containerInner.addClass(inner);

			var contentInner = containerInner.append(msg),
				message = containerOuter.append(contentInner);

			$infoContainer.empty()
				.append(message);

			if(after) after();
		};

	// set up candidates...
	$candidates.each(function(k, d) {
		this.candidateId = $(this).data('candidate-id');
		this.candidateName = $(this).data('candidate-name');
		this.candidateParty = $(this).data('candidate-party');
		this.candidateTally = $(this).data('tally');

		$(this).find('.candidate-name').text(this.candidateName +
			' (' + this.candidateParty + ')');

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

		$.ajax({
			type: 'POST',
			url: CONFIRM_TALLY_URI,
			data: JSON.stringify(tally),
			contentType: 'application/json',
			dataType: 'json',
			beforeSend: function() {
				$confirmTally.attr('disabled', true)
					.text(CONFIRM_TALLY_WAIT_MSG);
			},
			statusCode: {
				200: function(xhr) {
					var msg = $('<span></span>');
					msg.text(xhr.responseText);
					msg.append(INFO_SUCCESS_PUBLISH_ANOTHER);

					buildXhrResponse('alert-success', 'text-success', msg,
						function() {
							$confirmTally.text(CONFIRM_TALLY_DONE_MSG);
							$candidates.off('click', function(e) { e.preventDefault(); });
						});
				},

				400: function(xhr) {
					buildXhrResponse('alert-danger', 'text-danger', xhr.responseText,
					function() {
						$confirmTally.attr('disabled', false)
							.text(CONFIRM_TALLY_ACTIVE_MSG);
					});
				},

				401: function(xhr) {
					buildXhrResponse('alert-danger', 'text-danger', xhr.responseText);
				},

				500: function(xhr) {
					buildXhrResponse('alert-danger', 'text-danger', xhr.responseText,
					function() {
						$confirmTally.attr('disabled', false)
							.text(CONFIRM_TALLY_ACTIVE_MSG);
					});
				}
			}
		});
	});

})($);