$(document).ready(() => {
	console.log('"content.js" injected');

	const REGEX_EMAIL = /\S+@\S+\.\S+/;
	const REGEX_PHONE = /(\d{3}-\d{3}-\d{4})|(\d{10})/g;

	const CSV_COLUMNS = 'pickup_street,pickup_street2,pickup_city,pickup_state,pickup_zipcode,order_id,dropoff_street,dropoff_street2,dropoff_city,dropoff_state,dropoff_zipcode,dropoff_earliest_datetime,dropoff_latest_datetime,dropoff_buffer,customer_name,customer_email,customer_phone_number,pickup_notes,dropoff_notes,delivery_items,signature_required,delivery_proof_photo_required,sms_enabled,dimension_unit,height,width,length,weight_unit,weight'.split(',');

	// scrape and return info needed from invoice:
	function scrapeInvoice(storePhone) {
		var invoiceInfo = {};

		invoiceInfo['customer_name'] = $('.ShippingAddress').children()[1].innerText;

		invoiceInfo['customer_email'] = $('.BillingAddress').text().match(REGEX_EMAIL)[0];

		let phoneMatch = $('.ShippingAddress').text().match(REGEX_PHONE);
		if (phoneMatch !== null) {
			// last match will be mobile number if present:
			invoiceInfo['customer_phone_number'] = phoneMatch[phoneMatch.length - 1];
		} else {
			// no match means no valid phone numbers, so use store's:
			invoiceInfo['customer_phone_number'] = storePhone;
		}

		// TODO: dropoff_notes

		return invoiceInfo;
	}

	// listen for message from extension:
	chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
		sendResponse('"content.js" recieved data');
		console.log(msg);

		var invoiceInfo = scrapeInvoice(msg['storeInfo']['storePhone']);
		console.log(invoiceInfo);
	});
});
