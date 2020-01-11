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
    if (request.greeting == "downloadFile")
    {
        var url = window.webkitURL || window.URL;
       
        var blob = new Blob([request.content], {type: 'text/csv'});
        var href = url.createObjectURL(blob);
        chrome.downloads.download({url:href, filename:'Hello.csv'},function(downloadId)
        {
            console.log("download begin, the downId is:" + downloadId);
        })
    }
});
