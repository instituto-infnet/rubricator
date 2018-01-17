function onRequest(request, sender, sendResponse) {
  if (request.action == 'show')
    chrome.pageAction.show(sender.tab.id);
  sendResponse({});
};
chrome.extension.onRequest.addListener(onRequest);

