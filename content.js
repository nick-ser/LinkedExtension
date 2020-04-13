chrome.runtime.onMessage.addListener(request =>
{
    buildDialog(request.type);
});

async function buildDialog(type)
{
    var dialog = document.getElementById("customDialog");
    if (type === 'linkedOpened' && dialog == null)
    {
        var credentials = await loadCredentials();
        let needSignin = false;
        if(credentials == null)
            needSignin = true;

        prevHeight = window.innerHeight;
        prevWidth = window.innerWidth;
        var rootDiv = document.createElement('div')
        rootDiv.setAttribute("style", "width:230px; height:32px;");
        rootDiv.setAttribute("role", "main");
        rootDiv.className = 'dialog';        
        rootDiv.id = 'customDialog';
       
        rootDiv.innerHTML = `<div class="titlebar">LinkedExtender
                    <button style="visibility:hidden; margin-right: 66px; color: Red; cursor: pointer; font-size: 1.2em;" id="linkedExtenderUpdate" title="There is an update. Click to download">
                        !
                    </button>
                    <button style="margin-right: 33px;" id="linkedExtenderShowSetup">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/6/6d/Windows_Settings_app_icon.png" 
                            style="margin-bottom:3px; width: 15px; height: 15px;vertical-align: middle;"></img>
                    </button>
                    <button id="customDialogMinimizeBtn">
                        <img src="https://www.pngrepo.com/png/202039/170/minimize.png" style="margin-bottom:3px; width: 15px; height: 15px;vertical-align: middle;"></img>
                    </button>
                </div>
                <div class="signinRootPanel" style="visibility:hidden;">
                    <div style="margin-top: 10px;">
                        <label style="display: inline; vertical-align: middle; margin-left: 10px; color: #fff;"> Login: </label>
                        <input id="loginInput" style="height: 26px; width: 180px; margin-left: 51px;"></input>
                    </div>
                    <div style="margin-top: 10px;">
                        <label style="display: inline; vertical-align: middle; margin-left: 10px; color: #fff;"> Password: </label>
                        <input id="passwordInput" type="password" style="height: 26px; width: 180px; margin-left: 23px;"></input>
                    </div>
                    <div style="margin-top: 10px;">
                        <label id='wrongPwdLabel' style="font-size: 1em; display: inline; vertical-align: middle; visibility: hidden; margin-left: 10px; color: red;">
                        Wrong login/password or your license expired. </label>
                    </div>
                    <div style="margin-top: 15px; margin-left: 190px;">
                        <button class="signin" type=submit name="signin">Sign In</button>
                    </div>
                </div>
                <div class="customRootPanel"  style="visibility:hidden; display:none">
                    <div style="margin-top: 1px; height: 32px;">
                        <button id="invitationsBtn" style="margin-right: 1px;" class="tablink">Invitations</button>
                        <button id="msgBtn" class="tablink" style="margin-right: 1px;">Messages</button>
                        <button id="csvBtn" class="tablink">CSV file</button>
                    </div>
                    <div class="content">
                        <div style="margin-top: 10px; display: none" id="invitePnl" class='custonDialogPanels'>
                            <div>
                                <label style="display: inline; vertical-align: middle; margin-left: 10px; color: #fff;"> List name: </label>
                                <select class="classic" id="invitationsList" style="height: 26px; width: 200px;"></select>
                            </div>
                            <div style="margin-top: 10px;">
                                <label style="display: inline; vertical-align: middle; margin-left: 10px; color: #fff;"> How many profiles to invite: </label>
                                <input id="invitationNumber" style="height: 26px; width: 52px; margin-left: 23px;" value="50"></input>
                            </div>
                            <div style="margin-top: 10px; margin-left: 10px;">
                                <button id="collectBtn" name="collect">Collect</button>
                                <button id="cancelCollectBtn" name="cancel">Cancel</button>
                                <button name="open">Open</button>
                            </div>
                        </div>
                        <div style="margin-top: 10px; display: none" id="msgPnl" class='custonDialogPanels'>
                            <div>
                                <label style="display: inline; vertical-align: middle; margin-left: 10px; color: #fff;"> List name: </label>
                                <select class="classic" id="msgList" style="height: 26px; width: 200px;"></select>
                            </div>
                            <div style="margin-top: 10px;">
                                <label style="display: inline; vertical-align: middle; margin-left: 10px; color: #fff;"> How many profiles to message: </label>
                                <input id="msgNumber" style="height: 26px; width: 52px;" value="50"></input>
                                </div>
                            <div style="margin-top: 10px; margin-left: 10px;">
                                <button id="collectMsgBtn" name="collect">Collect</button>
                                <button id="cancelMsgCollectBtn" name="cancel">Cancel</button>
                                <button name="open">Open</button>
                            </div>
                        </div>
                        <div style="margin-top: 10px; display: none" id="csvPnl" class='custonDialogPanels'>
                            <div>
                                <label style="display: inline; vertical-align: middle; margin-left: 10px; color: #fff;"> List name: </label>
                                <select class="classic" id="csvList" style="height: 26px; width: 200px;"></select>
                            </div>
                            <div style="margin-top: 10px;">
                                <label style="display: inline; vertical-align: middle; margin-left: 10px; color: #fff;"> How many profiles to parse: </label>
                                <input id="csvNumber" style="height: 26px; width: 52px; margin-left: 23px;" value="50"></input>
                                </div>
                            <div style="margin-top: 10px; margin-left: 10px;">
                                <button id="collectCsvBtn" name="collect">Collect</button>
                                <button id="cancelCsvCollectBtn" name="cancel">Cancel</button>
                                <button name="open">Open</button>
                            </div>
                        </div>
                    </div>
                </div>`;
        document.body.appendChild(rootDiv);
        let rootPanel = document.getElementsByClassName('customRootPanel')[0];
        let signinPanel = document.getElementsByClassName('signinRootPanel')[0];
        if(needSignin)
        {
            rootPanel.style = 'visibility:hidden;'
            signinPanel.style = 'visibility:visible;'
        }
        
        dialog = new DialogBox('customDialog', needSignin);
        dialog.showDialog();
    }
};

function loadCredentials()
{
    return new Promise(resolve => 
    {
        chrome.storage.local.get('credentials', function (result)
        {
            var credentials = result['credentials'];
            if (credentials == undefined)
                resolve(null);
            resolve(credentials);
        })
    });
};
