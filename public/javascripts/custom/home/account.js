(function($) {

	'use strict';

	var URL_REGISTER_FAILED = '/auth/register',

		REGISTER_FORM_ID = 'register-form',
		LOGIN_FORM_ID = 'login-form',


		LOGIN_ELEM_DEEP_LINK = '#login',
		REGISTER_ELEM_DEEP_LINK = '#register-outer',

		MAYBE_LOGOUT_ALERT = '#logout',

		anim = Ecount.Anim(LOGIN_ELEM_DEEP_LINK, REGISTER_ELEM_DEEP_LINK, MAYBE_LOGOUT_ALERT);

	$(document).ready(function() {

		var url = Ecount.WhichView(),
			elemToHide = REGISTER_ELEM_DEEP_LINK;

		if(url && url[0] === URL_REGISTER_FAILED) {
			elemToHide = LOGIN_ELEM_DEEP_LINK;
		}

		$(elemToHide).hide();

		anim.logout();
	});

	$('a.primary').click('#auth-forms', function(e) {
		e.preventDefault();

		var formId = $(this).closest('form').attr('id');

		if(formId === LOGIN_FORM_ID) {
			anim.register();
		} else {
			anim.login();
		}
	});

})($);