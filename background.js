var _tabId = -1;

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab)
{
    if (changeInfo.status == 'complete')
    {
        if(tab.url == undefined && _tabId == tabId)
            _tabId = -1;

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

chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {hostEquals: 'developer.chrome.com'},
      })
      ],
          actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
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
    if (request.greeting == "goToUrl")
    {
        chrome.tabs.query({ currentWindow: false, active: false }, function (tab)
        {
            chrome.tabs.update(tab.id, { url: request.url });
        });
    }
    if (request.greeting == "signin")
    {
        getToken(request.login, request.password, sendResponse);
        return true;
    }

    if (request.greeting == "weather")
    {
        var url = "https://linkedextender2.azurewebsites.net/WeatherForecast";
        sendGetRequest(url, request.token, request.login, request.password, sendResponse);
        return true;
    }
    if(request.greeting == "subscriptioninfo")
    {
        var url = "https://linkedextender2.azurewebsites.net/account/subscriptioninfo";
        sendGetRequest(url, request.token, request.login, request.password, sendResponse);
        return true;
    }

});

function sendGetRequest(url, token, login, pwd, sendResponse)
{
    try
    {   
        let xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.setRequestHeader("Authorization", "Bearer " + token);
        xhr.onload = function()
        {
            if (xhr.readyState === 4)
            {
                if (xhr.status === 200 || xhr.status === 201 || xhr.status === 204)
                    sendResponse(xhr.responseText);
                else if(xhr.status === 401)
                {
                    var newToken = getToken(login, pwd);
                    if(newToken == '')
                    {
                        sendResponse('');
                        return;   
                    }
                    var obj = JSON.parse(newToken);
                    sendGetRequest(obj.token, login, pwd, sendResponse);
                }
                else 
                    sendResponse('');
            }
        }
        xhr.send();
    }
    catch(e)
    {
        console.log("Error while sending request: " + e);
    }
}

function getToken(login, password, sendResponse)
{
    try
    {   
        var url = "https://linkedextender2.azurewebsites.net/account/token?username=" + login + "&password=" + password;
        let xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.onload = function()
        {
            if (xhr.readyState === 4)
            {
                if (xhr.status === 200 || xhr.status === 201 || xhr.status === 204)
                    sendResponse(xhr.responseText);
                else 
                    sendResponse('');
            }
        }
        xhr.send();
    }
    catch(e)
    {
        console.log("Error while sending request: " + e);
    }
}