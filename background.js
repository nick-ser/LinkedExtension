chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab)
{
    if (changeInfo.status == 'complete')
    {
        if (tab.url.indexOf("linkedin.com") != -1) {
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, { type: 'linkedOpened' });
            });
        }
    }   	
});

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.greeting == "SetUrl") {
            chrome.tabs.query({ currentWindow: true, active: true }, function (tab) {
                chrome.tabs.update(tab.id, { url: "https://www.linkedin.com/search/results/people/?facetNetwork=%5B%22S%22%5D&origin=FACETED_SEARCH/    " });
            });
            //sendResponse({ farewell: "goodbye" });
        }
    });