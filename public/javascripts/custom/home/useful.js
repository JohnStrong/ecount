(function($) {

	'use strict';

	var CHECKBOX_MARKUP = '<div class="checkbox">' +
		'<label>' +
		'<input type="checkbox" name="human" id="human" value=1>' +
		'yes, I am Human' +
		'</label>' +
		'</div>';

	$(document).ready(function() {
		var registerSubmit = $('#register-form').find('button.submit');

		registerSubmit.attr('disabled', true);

		$('#register-form .form-body')
			.append(CHECKBOX_MARKUP);

		$('#register-form input:checkbox').click(function() {
			if($(this).is(':checked')) {
				registerSubmit.attr('disabled', false);
			} else {
				registerSubmit.attr('disabled', true);
			}
		})
	});
})($);