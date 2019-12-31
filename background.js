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
