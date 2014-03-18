(function($) {

	'use strict';

	var URI_LOGIN_FAILED = '/tally/login',

		LOGIN_FORM_ID = 'login-form',
		REGISTER_FORM_ID = 'register-form',

		LOGIN_FORM = '#login',
		REGISTER_FORM = '#register',

		anim = Ecount.Anim(LOGIN_FORM, REGISTER_FORM, '');

	$(document).ready(function() {

		var uri = Ecount.WhichView(),
			elemToHide = LOGIN_FORM;

		if(uri && uri[0] === URI_LOGIN_FAILED) {
			elemToHide = REGISTER_FORM
		}

		$(elemToHide).hide();
	});

	$('a.switch').click(function(e) {
		e.preventDefault();

		var formId = $(this).closest('form').attr('id');

		if(formId === LOGIN_FORM_ID) {
			anim.register();
		} else if(formId === REGISTER_FORM_ID) {
			anim.login();
		}
	});

})($);