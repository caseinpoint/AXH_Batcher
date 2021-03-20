$(document).ready(() => {
	console.log('"content.js" injected');

	const csvColumns = 'pickup_street,pickup_street2,pickup_city,pickup_state,pickup_zipcode,order_id,dropoff_street,dropoff_street2,dropoff_city,dropoff_state,dropoff_zipcode,dropoff_earliest_datetime,dropoff_latest_datetime,dropoff_buffer,customer_name,customer_email,customer_phone_number,pickup_notes,dropoff_notes,delivery_items,signature_required,delivery_proof_photo_required,sms_enabled,dimension_unit,height,width,length,weight_unit,weight'.split(',');

	// scrape and return customer name/phone/email/address:
	function scrapeDropoffInfo() {
		var dropoffInfo = {};

		const emailRegex = /\S+@\S+\.\S+/;
		dropoffInfo['customer_email'] = $('.BillingAddress').text().match(emailRegex)[0];

		dropoffInfo['customer_name'] = $('.ShippingAddress').children()[1].innerText;

		return dropoffInfo;
	}

	// listen for message from extension:
	chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
		sendResponse('"content.js" recieved data');
		console.log(msg);

		var dropoffInfo = scrapeDropoffInfo();

	});
});
