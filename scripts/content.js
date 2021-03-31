$(document).ready(() => {
	console.log('PFE to AXH Batcher injected content.js');

	const REGEX_ID = /\d{6,}/;
	const REGEX_EMAIL = /\S+@\S+\.\S+/;
	const REGEX_PHONE = /(\d{3}-\d{3}-\d{4})|(\d{10})/g;
	const MONTHS = { 'January': '1', 'February': '2', 'March': '3', 'April': '4', 'May': '5', 'June': '6',
		'July': '7', 'August': '8', 'September': '9', 'October': '10', 'November': '11', 'December': '12' };

	const CSV_COLUMNS = 'pickup_street,pickup_street2,pickup_city,pickup_state,pickup_zipcode,order_id,dropoff_street,dropoff_street2,dropoff_city,dropoff_state,dropoff_zipcode,dropoff_earliest_datetime,dropoff_latest_datetime,dropoff_buffer,customer_name,customer_email,customer_phone_number,pickup_notes,dropoff_notes,delivery_items,signature_required,delivery_proof_photo_required,sms_enabled,dimension_unit,height,width,length,weight_unit,weight'.split(',');

	// build .csv file for download from required info:
	function makeCSV(batchInfo, storeInfo, invoiceInfo) {
		let allInfo = {...storeInfo, ...invoiceInfo};

		// hardcode certain values:
		allInfo['dropoff_buffer'] = '';
		allInfo['signature_required'] = '0';
		allInfo['delivery_proof_photo_required'] = allInfo['sms_enabled'] = '1';
		allInfo['dimension_unit'] = 'in';
		allInfo['weight_unit'] = 'lb';
		allInfo['height'] = allInfo['width'] = allInfo['length'] = allInfo['weight'] = '';
		allInfo['pickup_notes'] = '';

		let csvText = CSV_COLUMNS.join(',') + '\n';

		allInfo['delivery_items'] = '';
		if (batchInfo['numBags'] > 0) allInfo['delivery_items'] += batchInfo['numBags'] + ' Bag(s) ';
		if (batchInfo['numBoxes'] > 0) allInfo['delivery_items'] += batchInfo['numBoxes'] + ' Box(es) ';
		if (batchInfo['frozen']) allInfo['delivery_items'] += '[frozen]';

		let line = allInfo[CSV_COLUMNS[0]];
		for (let i = 1; i < CSV_COLUMNS.length; i++) {
			// replaceAll commas with semicolons for .csv:
			line += ',' + allInfo[CSV_COLUMNS[i]].replaceAll(',', ';');
		}
		csvText += line;

		// encodeURI gets tripped up on hashtags:
		csvText = csvText.replaceAll('#', '♯');

		// make .csv file and download:
		let hiddenElement = document.createElement('a');
		hiddenElement.href = 'data:text/csv/charset=utf-8,' + encodeURI(csvText);
		hiddenElement.target = '_blank';
		hiddenElement.download = allInfo['order_id'].replace('/', '_') + '.csv';
		hiddenElement.click();
	}

	// input 12 hour format time string, output 24 hour format:
	function get24Hr(timeStr) {
		let meridiem = timeStr.slice(-2); // am or pm
		let timeSplit = timeStr.split(/\D+/);
		let hour = parseInt(timeSplit[0]);
		if (meridiem === 'pm' && hour < 12) hour += 12;
		return hour.toString() + ':' + timeSplit[1];
	}

	// scrape and return info needed from invoice:
	function scrapeInvoice(storeInfo) {
		let invoiceInfo = {};

		invoiceInfo['order_id'] = $('.InvoiceTitle').text().match(REGEX_ID)[0] + '/' + storeInfo['storeNumber'];

		let addressSplit = $('.ShippingAddress')[0].innerText.split('\n');

		// replaceAll (potential) commas with semicolons for csv:
		invoiceInfo['dropoff_street'] = addressSplit[2];

		let idxUS = addressSplit.indexOf('United States');

		// idxUS === 5 indicates dropoff_street2 exists:
		invoiceInfo['dropoff_street2'] = (idxUS === 5) ? addressSplit[3].replaceAll(',', ';') : '';

		// [city, state zip]:
		let cityStateZip = addressSplit[idxUS - 1].split(', ');

		invoiceInfo['dropoff_city'] = cityStateZip[0];

		// invoiceInfo['dropoff_state'] = cityStateZip[1].split(' ')[0];
		invoiceInfo['dropoff_state'] = 'CA';

		invoiceInfo['dropoff_zipcode'] = cityStateZip[1].split(' ')[1];

		invoiceInfo['customer_name'] = addressSplit[1];

		invoiceInfo['customer_email'] = $('.BillingAddress').text().match(REGEX_EMAIL)[0];

		let phoneMatch = $('.ShippingAddress').text().match(REGEX_PHONE);
		// last number for mobile if exists, storePhone if no matches:
		invoiceInfo['customer_phone_number'] = (phoneMatch !== null) ? phoneMatch[phoneMatch.length - 1] : storeInfo['storePhone'];

		// AXH sample csv datetime format: m/d/yyyy hh:mm (24hr)
		let dateSplit = addressSplit[addressSplit.length-1].split(' ');
		let date = MONTHS[dateSplit[4].slice(0,-1)] + '/'; // month (slice the comma)
		date += dateSplit[3] + '/'; // day
		date += dateSplit[5].slice(0,-1) + ' '; // year (slice the period)

		invoiceInfo['dropoff_earliest_datetime'] = date + get24Hr(dateSplit[8]);

		invoiceInfo['dropoff_latest_datetime'] = date + get24Hr(dateSplit[10]);

		let idxNotes = addressSplit.indexOf('Special Instructions for Delivery') + 1;
		invoiceInfo['dropoff_notes'] = (addressSplit[idxNotes] !== 'Delivery Preference') ? addressSplit[idxNotes] : '';

		return invoiceInfo;
	}

	// listen for message from extension:
	chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
		sendResponse('"content.js" recieved data');

		let invoiceInfo = scrapeInvoice(msg['storeInfo']);

		makeCSV(msg['batchInfo'], msg['storeInfo'], invoiceInfo);
	});
});
