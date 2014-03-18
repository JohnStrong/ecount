// utility for applying jquery animations to auth forms...
window.Ecount = {};

window.Ecount.WhichView = function() {
	var findURL = new RegExp('/\\w+/\\w+$', 'g');
	return findURL.exec(document.URL);
};

window.Ecount.Anim = function(_login, _register, _logout) {

	'use strict';

	var LOGIN_ELEM_DEEP_LINK = _login,
		REGISTER_ELEM_DEEP_LINK = _register,
		MAYBE_LOGOUT_ALERT = _logout,

		ELEM_ANIMATE_TIMER = 300,
		ALERT_ANIM_WAIT = 3000;

	return {
		register: function() {
			$(LOGIN_ELEM_DEEP_LINK).animate({
				'opacity': 0
			}, ELEM_ANIMATE_TIMER, function() {

				$(this).hide();

				$(REGISTER_ELEM_DEEP_LINK).show()
					.css({'opacity' : 1});
			});

		},

		login: function() {
			$(REGISTER_ELEM_DEEP_LINK).animate({
				'opacity': 0
			}, ELEM_ANIMATE_TIMER, function() {

				$(this).hide();

				$(LOGIN_ELEM_DEEP_LINK).show()
					.css({'opacity' : 1});
			});
		},

		logout: function() {
			var logoutAlert = $(MAYBE_LOGOUT_ALERT);

			if(logoutAlert) {
				setTimeout(function() {
					logoutAlert.animate({
						'opacity' : 0
					}, ELEM_ANIMATE_TIMER, function() {
						$(this).hide();
					});
				}, ALERT_ANIM_WAIT);
			}
		}
	};
};