chrome.runtime.onMessage.addListener(request =>
{
    var _dialog;
    if (request.type === 'linkedOpened' && _dialog == null)
    {        
        prevHeight = window.innerHeight;
        prevWidth = window.innerWidth;
        var div = document.createElement('div')
        div.setAttribute("style", "min-width:400px; min-height:280px;");
        div.setAttribute("role", "main");
        div.className = 'dialog';        
        div.id = 'customDialog';
       
        div.innerHTML = `<div class="titlebar">Dialog Title...</div>
                <button name="minimize">-</button>
                <div class="content">
                    <button name="collect">Collect</button>
                    <button name="cancel">Cancel</button>
                </div>
                <div class="buttonpane">
                </div>`;
        document.body.appendChild(div);
        
        _dialog = new DialogBox('customDialog', callbackDialog);
        _dialog.showDialog();
    }
});

function callbackDialog(btnName)
{
}
