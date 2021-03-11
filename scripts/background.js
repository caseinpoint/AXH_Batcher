chrome.runtime.onInstalled.addListener(() => {
	chrome.storage.sync.set({
		pickup_street: '3868 Piedmont Ave',
		pickup_street2: '',
		pickup_city: 'Oakland',
		pickup_state: 'CA',
		pickup_zipcode: '94611',
		storeNumber: '3058',
		storePhone: '510-597-1234'
	}, () => {
		console.log('defaults set');
	});
});
