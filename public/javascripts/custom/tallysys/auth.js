(function($) {

	'use strict';

	var LOGIN_FORM_ID = '#login',
		REGISTER_FORM_ID = '#register',

		$loginForm = $(LOGIN_FORM_ID),
		$registerForm = $(REGISTER_FORM_ID);

	$loginForm.hide();

	$('a.switch').click(function(e) {
		e.preventDefault();

		var formId = $(this).closest('form').attr('id');

		if(formId === LOGIN_FORM_ID) {
			console.log('to register');
		} else if(formId === REGISTER_FORM_ID) {
			console.log('to login');
		}
	});

})($);