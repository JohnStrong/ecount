(function($) {
	'use strict';

	var REGISTER_FORM_ID = 'register-form',
		LOGIN_FORM_ID = 'login-form'

	$(document).ready(function() {
		$('#register').hide();
	});

	$('form').submit('#auth', function(e) {
		e.preventDefault();
		// do stuff...... ajax stuff
	});

	$('a.primary').click('#auth-forms', function(e) {
		e.preventDefault();

		var formId = $(this).closest('form').attr('id');

		if(formId === LOGIN_FORM_ID) {
			$('#login').hide();
			$('#register').show();
		} else {
			$('#register').hide();
			$('#login').show();
		}
	});

})($);