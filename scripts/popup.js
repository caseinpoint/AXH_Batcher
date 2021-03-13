$(document).ready(() => {
	// get pickup info from settings
	var storeInfo = {};
	chrome.storage.sync.get(['pickup_street', 'pickup_street2', 'pickup_city', 'pickup_state', 'pickup_zipcode', 'storeNumber', 'storePhone'], (result) => {
		console.log(result);
		storeInfo = result;
	});

	// scrape invoice and return dropoff info
	function getDropoffInfo() {

	}

	// build csv and return encoded URI
	function getCSV(dropoffInfo, numBags, numBoxes) {
		const csvColumns = 'pickup_street,pickup_street2,pickup_city,pickup_state,pickup_zipcode,order_id,dropoff_street,dropoff_street2,dropoff_city,dropoff_state,dropoff_zipcode,dropoff_earliest_datetime,dropoff_latest_datetime,dropoff_buffer,customer_name,customer_email,customer_phone_number,pickup_notes,dropoff_notes,delivery_items,signature_required,delivery_proof_photo_required,sms_enabled,dimension_unit,height,width,length,weight_unit,weight';

	}

	// handle batch_form submit
	$('#batch_form').submit((event) => {
		event.preventDefault();
	});
});