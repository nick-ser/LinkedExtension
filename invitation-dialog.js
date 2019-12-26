function invitationDialog()
{
    var _dialog;
    init = function ()
    {
        _dialog = document.querySelector(".modalInvitationDlg");
        if (_dialog == null)
        {
            _dialog = document.createElement('div')
            _dialog.style.zIndex = 1;
            _dialog.className = 'modalInvitationDlg';
            _dialog.innerHTML = `<div class="modal-content">
                        <p align="center">From which page do you want to collect</p>
                        <div class="buttons" style="margin-top: 10px;">
                          <button class="generalPageBtn" name="collect">General Search Page</button>
                        </div>
                        <div class="cancelpane">
                          <button class="close-btn" name="cancel">Cancel</button>
                        </div>
                    </div>`;
            document.body.appendChild(_dialog);
        }        
        _dialog.style.display = "none";

        var generalPageBtn = document.querySelector(".generalPageBtn");
        generalPageBtn.onclick = browseUrl;
        var closeBtn = document.querySelector(".close-btn");
        closeBtn.onclick = closeDialog;
    };

    showInvitationDialog = function ()
    {
        _dialog.style.display = 'block';
    };

    function closeDialog()
    {
        _dialog.style.display = "none"
    };

    function browseUrl()
    {
        window.history.pushState(null, null, 'https://www.linkedin.com/search/results/people/?facetNetwork=%5B%22S%22%5D&origin=FACETED_SEARCH/');
        setTimeout(() => window.history.back(), 50);
        setTimeout(() => window.history.forward(), 70);
        closeDialog();
    };

    init();    
    this.showInvitationDialog = showInvitationDialog;
    return this;
}