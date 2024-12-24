import Browser from 'webextension-polyfill';

// Listen for messages from the popup
Browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_PAGE_CONTENT') {
    sendResponse(document.body.innerText);
  }
});