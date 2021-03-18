console.log('"content.js" injected');

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
	console.log(msg);
	sendResponse('"content.js" recieved data');
});
