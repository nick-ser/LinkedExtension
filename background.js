var _tabId = -1;
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab)
{
    if (changeInfo.status == 'complete')
    {
        if (tab.url.indexOf("linkedin.com") != -1)
        {
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs)
            {
                if(_tabId != -1 && _tabId != tabId)
                    return;
                chrome.tabs.sendMessage(tab.id, { type: 'linkedOpened' });
                _tabId = tabId;
            });
        }
    }   	
});

chrome.tabs.onRemoved.addListener(function (tabId, changeInfo)
{
    if(_tabId == tabId)
        _tabId = -1;
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse)
{
    if (request.greeting == "SetUrl")
    {
        var url = request.url;
        alert('Push state: ' + url);
        window.history.pushState(null, null, url);
        /*chrome.tabs.query({ currentWindow: false, active: false }, function (tab)
        {
            chrome.tabs.update(tab.id, { url: url });
        });*/
    }
});
