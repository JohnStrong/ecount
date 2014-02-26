(function($) {
	'use strict';

	var URL_REGISTER_FAILED = '/auth/register',

		REGISTER_FORM_ID = 'register-form',
		LOGIN_FORM_ID = 'login-form',


		LOGIN_ELEM_DEEP_LINK = '#login',
		REGISTER_ELEM_DEEP_LINK = '#register';

	$(document).ready(function() {

		var getWhichView = function() {
			var findURL = new RegExp('/\\w+/\\w+$', 'g');
			return findURL.exec(document.URL);
		}
		
		var url = getWhichView(),
			elemToHide = REGISTER_ELEM_DEEP_LINK;

		if(url && url[0] === URL_REGISTER_FAILED) {
			elemToHide = LOGIN_ELEM_DEEP_LINK;
		}
		
		$(elemToHide).hide();
	});

	// utility for applying jquery animations to auth forms...
	var show = (function() {
		
		var ANIMATE_TIMER = 500;

		return {
			register: function() {
				$(LOGIN_ELEM_DEEP_LINK).animate({
					'opacity': 0
				}, ANIMATE_TIMER, function() {
					
					$(this).hide();
					
					$(REGISTER_ELEM_DEEP_LINK).show()
						.css({'opacity' : 1});	
				});
				
			},

			login: function() {
				$(REGISTER_ELEM_DEEP_LINK).animate({
					'opacity': 0
				}, ANIMATE_TIMER, function() {
					
					$(this).hide();

					$(LOGIN_ELEM_DEEP_LINK).show()
						.css({'opacity' : 1});
				});
			}
		};
	})();

	$('a.primary').click('#auth-forms', function(e) {
		e.preventDefault();

		var formId = $(this).closest('form').attr('id');

		if(formId === LOGIN_FORM_ID) {
			show.register();
		} else {
			show.login();
		}
	});

})($);