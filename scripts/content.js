$(document).ready(() => {
	console.log('PFE to AXH Batcher injected content.js');

	const REGEX_ID = /\d{6,}/;
	const REGEX_EMAIL = /\S+@\S+\.\S+/;
	const REGEX_PHONE = /(\d{3}-\d{3}-\d{4})|(\d{10})/g;
	const MONTHS = { 'January,': '1', 'February,': '2', 'March,': '3', 'April,': '4', 'May,': '5', 'June,': '6',
		'July,': '7', 'August,': '8', 'September,': '9', 'October,': '10', 'November,': '11', 'December,': '12' };

	const CSV_COLUMNS = 'pickup_street,pickup_street2,pickup_city,pickup_state,pickup_zipcode,order_id,dropoff_street,dropoff_street2,dropoff_city,dropoff_state,dropoff_zipcode,dropoff_earliest_datetime,dropoff_latest_datetime,dropoff_buffer,customer_name,customer_email,customer_phone_number,pickup_notes,dropoff_notes,delivery_items,signature_required,delivery_proof_photo_required,sms_enabled,dimension_unit,height,width,length,weight_unit,weight';

	// build .csv file for download from required info:
	function makeCSV(batchInfo, storeInfo, invoiceInfo) {
		var allInfo = {...storeInfo, ...invoiceInfo};

		// hardcode certain values:
		allInfo['dropoff_buffer'] = '60';
		allInfo['signature_required'] = '0';
		allInfo['delivery_proof_photo_required'] = allInfo['sms_enabled'] = '1';
		allInfo['dimension_unit'] = 'in';
		allInfo['weight_unit'] = 'lb';
		allInfo['height'] = allInfo['width'] = allInfo['length'] = allInfo['weight'] = '';
		allInfo['pickup_notes'] = '';
	}

	// input 12 hour format time string, output 24 hour format:
	function get24Hr(timeStr) {
		var meridiem = timeStr.slice(-2); // am or pm
		var timeSplit = timeStr.split(/\D+/);
		var hour = parseInt(timeSplit[0]);
		if (meridiem === 'pm' && hour < 12) hour += 12;
		return hour.toString() + ':' + timeSplit[1];
	}

	// scrape and return info needed from invoice:
	function scrapeInvoice(storeInfo) {
		var invoiceInfo = {};

		invoiceInfo['order_id'] = $('.InvoiceTitle').text().match(REGEX_ID)[0] + '/' + storeInfo['storeNumber'];

		var addressSplit = $('.ShippingAddress')[0].innerText.split('\n');

		invoiceInfo['dropoff_street'] = addressSplit[2];

		var idxUS = addressSplit.indexOf('United States');

		// idxUS === 5 indicates dropoff_street2 exists:
		invoiceInfo['dropoff_street2'] = (idxUS === 5) ? addressSplit[3] : '';

		var cityStateZip = addressSplit[idxUS - 1].split(', ');

		invoiceInfo['dropoff_city'] = cityStateZip[0];

		invoiceInfo['dropoff_state'] = cityStateZip[1].split(' ')[0];

		invoiceInfo['dropoff_zipcode'] = cityStateZip[1].split(' ')[1];

		invoiceInfo['customer_name'] = addressSplit[1];

		invoiceInfo['customer_email'] = $('.BillingAddress').text().match(REGEX_EMAIL)[0];

		var phoneMatch = $('.ShippingAddress').text().match(REGEX_PHONE);
		// last number for mobile if exists, storePhone if no matches:
		invoiceInfo['customer_phone_number'] = (phoneMatch !== null) ? phoneMatch[phoneMatch.length - 1] : storeInfo['storePhone'];

		// AXH requested datetime format: m/d/yyyy hh:mm (24hr)
		var dateSplit = addressSplit[addressSplit.length-1].split(' ');
		var date = MONTHS[dateSplit[4]] + '/'; // month
		date += dateSplit[3] + '/'; // day
		date += dateSplit[5].slice(0,-1) + ' '; // year (slice the period)

		invoiceInfo['dropoff_earliest_datetime'] = date + get24Hr(dateSplit[8]);

		invoiceInfo['dropoff_latest_datetime'] = date + get24Hr(dateSplit[10]);

		var idxNotes = addressSplit.indexOf('Special Instructions for Delivery') + 1;
		invoiceInfo['dropoff_notes'] = (addressSplit[idxNotes] !== 'Delivery Preference') ? addressSplit[idxNotes] : '';

		return invoiceInfo;
	}

	// listen for message from extension:
	chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
		sendResponse('"content.js" recieved data');
		console.log(msg);

		var invoiceInfo = scrapeInvoice(msg['storeInfo']);
		console.log(invoiceInfo);

		makeCSV(msg['batchInfo'], msg['storeInfo'], invoiceInfo);
	});
});
