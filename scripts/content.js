console.log('"content.js" injected');

const csvColumns = 'pickup_street,pickup_street2,pickup_city,pickup_state,pickup_zipcode,order_id,dropoff_street,dropoff_street2,dropoff_city,dropoff_state,dropoff_zipcode,dropoff_earliest_datetime,dropoff_latest_datetime,dropoff_buffer,customer_name,customer_email,customer_phone_number,pickup_notes,dropoff_notes,delivery_items,signature_required,delivery_proof_photo_required,sms_enabled,dimension_unit,height,width,length,weight_unit,weight';

function scrapeDropoffInfo() {
	var dropoffInfo = {};

	// dropoffInfo['customer_name'] = $('.ShippingAddress').children()[1].innerText;

	return dropoffInfo;
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
	sendResponse('"content.js" recieved data');
	console.log(msg);

	var dropoffInfo = scrapeDropoffInfo();

});
