let last_known_scroll_position = 0;
let ticking = false;
let dialog;

function doSomething(scroll_pos)
{
    var dialog = document.getElementById('customDialog');
    if (dialog != null)
    {
        var top = parseFloat(dialog.style.top);        
        if (isNaN(top))
            top = 50;
        dialog.style.top = scroll_pos + top + 'px';
    }
    
}

window.addEventListener('scroll', function (e)
{
    var tmp = last_known_scroll_position;
    last_known_scroll_position = window.scrollY;
    doSomething(last_known_scroll_position - tmp);
});

chrome.runtime.onMessage.addListener(request => {
    if (request.type === 'linkedOpened' && dialog == null)
    {        
        var div = document.createElement('div')
        div.setAttribute("style", "min-width:400px; min-height:280px;");
        div.setAttribute("role", "main");
        div.className = 'dialog';        
        div.id = 'customDialog';
       
        div.innerHTML = `<div class="titlebar">Dialog Title...</div>
                <button name="minimize">-</button>
                <div class="content">
                    <button name="collect">Collect</button>
                </div>
                <div class="buttonpane">
                </div>`;
        document.body.appendChild(div);

        var id = 'customDialog';
        dialog = new DialogBox(id, callbackDialog);
        dialog.showDialog();
    }
});

function callbackDialog(btnName)
{
}