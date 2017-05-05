$(document).on('ready', function(){
	$.validator.addMethod("atLeastOneLowercaseLetter", function (value, element) {
		return this.optional(element) || /[a-z]+/.test(value);
	}, "Debe tener mínimo una letra minúscula");
	$.validator.addMethod("atLeastOneUppercaseLetter", function (value, element) {
		return this.optional(element) || /[A-Z]+/.test(value);
	}, "Debe tener mínimo una letra mayúscula");
	$.validator.addMethod("atLeastOneNumber", function (value, element) {
		return this.optional(element) || /[0-9]+/.test(value);
	}, "Debe tener mínimo un número");

	$('.forgot form').validate({
		submitHandler: function(form,e){
			console.log("Form", form);
			console.log("Event", e );
			$(form).submit();
    	},
		rules: {
			password: {
				required: true,
				atLeastOneLowercaseLetter: true,
				atLeastOneUppercaseLetter: true,
				atLeastOneNumber: true,
				minlength: 8,
			},
			password_again: {
				equalTo: "#password"
			}
		},
		messages: {
			password: {
				required: 'Requerido',
				minlength: "Mínimo de 8 caracteres."
			},
			password_again: {
				required: 'Requerido',

			}
		}
	});
});