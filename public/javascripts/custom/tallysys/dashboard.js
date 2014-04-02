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

		storage = {

			supported: function() {
				return true
			},

			create: function() {
				var tally = localStorage.getItem('tally');

				if(!tally) {
					localStorage.setItem('tally', JSON.stringify({}));
				}
			},

			persist: function(_candidate) {
				var tallies = localStorage.getItem('tally'),

					theTallies = JSON.parse(tallies) || {},

					candidate = {};


				if(!theTallies[_candidate.cid]) {
					theTallies[_candidate.cid] =  {};
				}

				candidate = theTallies[_candidate.cid];
				candidate.tally = _candidate.tally;

				localStorage.setItem('tally', JSON.stringify(theTallies));
			},

			getCandidateTally: function(cid) {
				var tallies = localStorage.getItem('tally'),

					theTallies = JSON.parse(tallies) || {},

					tally = 0;

				if(theTallies[cid]) {
					tally = theTallies[cid].tally;
				}

				return tally;
			},

			delete: function() {
				localStorage.removeItem('tally');
			}
		},

		candidatesToJson = function() {
			var candidatesArr = [];

			$candidates.each(function(k, candidate) {
				var candidateJson = {};

				candidateJson['id'] = this.candidate.cid;
				candidateJson['name'] = this.candidate.name;
				candidateJson['tally'] = this.candidate.tally;


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


	// create local store tally object...
	if(storage.supported()) {
		storage.create();
	}

	// prevents event an unbound candidate anchor from attempting to deep link...
	$('a').click(function(e) { e.preventDefault() });

	// set up candidates...
	$candidates.each(function(k, d) {
		this.candidate = {};

		this.candidate.cid = $(this).data('candidate-id');
		this.candidate.name = $(this).data('candidate-name');
		this.candidate.party = $(this).data('candidate-party');

		// get tally from local store or set to 0...
		this.candidate.tally = storage.getCandidateTally(this.candidate.cid);

		$(this).find('.candidate-name').text(this.candidate.name).addClass('party-' + this.candidate.party);

		//.closest('.candidate-left').addClass('party-' + this.candidate.party);

		$(this).find('.candidate-tally').text(this.candidate.tally);
	});

	// events for candidate elements
	$candidates.click(function(e) {
		e.preventDefault();

		this.candidate.tally = this.candidate.tally + 1;

		// store tally in local storage...
		storage.persist(this.candidate);

		$(this).find('.candidate-tally')
			.text(this.candidate.tally);
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

							// remove click event to add tallies
							$candidates.off('click');
						});

					// delete tally data...
					storage.delete();
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