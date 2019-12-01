chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab)
{
    if (changeInfo.status == 'complete')
    {
        if (tab.url.indexOf("linkedin.com") != -1)
        {
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs)
            {
                chrome.tabs.sendMessage(tab.id, { type: 'linkedOpened' });
            });
        }
    }   	
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse)
{
    if (request.greeting == "SetUrl")
    {
        var url = request.url;
        chrome.tabs.query({ currentWindow: false, active: false }, function (tab)
        {
            chrome.tabs.update(tab.id, { url: url });
        });
    }
});