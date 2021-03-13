$(document).ready(() => {
	// populate current values:
	chrome.storage.sync.get(['pickup_street', 'pickup_street2', 'pickup_city', 'pickup_state', 'pickup_zipcode', 'storeNumber', 'storePhone'], (result) => {
		for (let key in result) {
			$('#'+key).val(result[key]);
		}
	});

	// handle submit and save values
	$('#options_form').submit((event) => {
		event.preventDefault();
		let options = {};
		const inputs = $('#options_form').serializeArray();
		for (let input of inputs) {
			options[input['name']] = input['value'];
		}
		chrome.storage.sync.set(options, () => {
			$('#success').removeClass('visually-hidden');
		});
	});
});
