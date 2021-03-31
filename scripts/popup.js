$(document).ready(() => {
	// get pickup info from settings:
	let storeInfo = {};
	chrome.storage.sync.get(['pickup_street', 'pickup_street2', 'pickup_city', 'pickup_state', 'pickup_zipcode', 'storeNumber', 'storePhone'], (result) => {
		storeInfo = result;
	});

	// handle batch_form submit:
	$('#batch_form').submit((event) => {
		event.preventDefault();

		let batchInfo = {};
		batchInfo['numBags'] = parseInt($('#numBags').val());
		batchInfo['numBoxes'] = parseInt($('#numBoxes').val());
		batchInfo['frozen'] = ($('#batch_form').serializeArray().length == 3) ? true : false;

		// validate form:
		if (batchInfo['numBags'] === 0 && batchInfo['numBoxes'] === 0) {
			$('#error').removeClass('visually-hidden');
		} else {
			if (!$('#error').hasClass('visually-hidden')) {
				$('#error').addClass('visually-hidden');
			}
			// get active tab and send data to content script:
			chrome.tabs.query({ active: true, currentWindow: true }, (results) => {
				console.log('tab id: ' + results[0].id);
				chrome.tabs.sendMessage(results[0].id, { storeInfo: storeInfo, batchInfo: batchInfo }, (response) => {
					console.log(response);
				});
			});
		}
	});
});
