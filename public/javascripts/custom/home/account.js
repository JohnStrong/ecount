(function($) {
	'use strict';

	var URL_REGISTER_FAILED = '/auth/register',
		URL_LOGIN_FAILED = '/auth/login',

		REGISTER_FORM_ID = 'register-form',
		LOGIN_FORM_ID = 'login-form'

	$(document).ready(function() {
		var elemToHide = '#register';

		console.log(document.URL);

		if(document.URL === URL_REGISTER_FAILED) {
			elemToHide = '#login';
		}
		$(elemToHide).hide();
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