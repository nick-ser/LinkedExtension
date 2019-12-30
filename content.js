chrome.runtime.onMessage.addListener(request =>
{
    var dialog = document.getElementById("customDialog");
    if (request.type === 'linkedOpened' && dialog == null)
    {        
        prevHeight = window.innerHeight;
        prevWidth = window.innerWidth;
        var div = document.createElement('div')
        div.setAttribute("style", "width:304px; height:195px;");
        div.setAttribute("role", "main");
        div.className = 'dialog';        
        div.id = 'customDialog';
       
        div.innerHTML = `<div class="titlebar">LinkedExtender
                    <button name="minimize">-</button>
                </div>
                <div class="customRootPanel">
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
                                <input id="invitationNumber" style="height: 26px; width: 52px; margin-left: 22px;"></input>
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
                                <input id="msgNumber" style="height: 26px; width: 52px;"></input>
                                </div>
                            <div style="margin-top: 10px; margin-left: 10px;">
                                <button id="collectMsgBtn" name="collect">Collect</button>
                                <button id="cancelMsgCollectBtn" name="cancel">Cancel</button>
                                <button name="open">Open</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="buttonpane">
                </div>`;
        document.body.appendChild(div);
        
        dialog = new DialogBox('customDialog', callbackDialog);
        dialog.showDialog();
    }
});

function callbackDialog(btnName)
{
}
