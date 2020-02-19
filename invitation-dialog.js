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
                        <p align="center" style="color: #fff;">From which page do you want to collect</p>
                        <div class="buttons" style="margin-top: 10px;">
                            <div>
                                <button style="padding: 0px 15px;" class="generalPageBtn" name="collect">LinkedIn General Search Page</button>
                            </div>
                            <div>
                                <button style="padding: 0px 15px; margin-top: 15px;" class="salesNavPageBtn" name="collect">Sales Navigator Search Page</button>
                            </div>
                        </div>
                        <div class="cancelpane">
                          <button class="close-btn" name="cancel">Cancel</button>
                        </div>
                    </div>`;
            document.body.appendChild(_dialog);
        }        
        _dialog.style.display = "none";

        document.querySelector(".generalPageBtn").onclick = browseUrl;
        document.querySelector('.salesNavPageBtn').onclick = browseToSaleNav;
        document.querySelector(".close-btn").onclick = closeDialog;
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
        chrome.runtime.sendMessage({ greeting: 'goToUrl', url: 'https://www.linkedin.com/search/results/people/?facetNetwork=%5B%22S%22%5D&origin=FACETED_SEARCH/' }, null);  
        closeDialog();
    };

    function browseToSaleNav()
    {
        chrome.runtime.sendMessage({ greeting: 'goToUrl', url: 'https://www.linkedin.com/sales/search/people' }, null);  
        closeDialog();
    };

    init();    
    this.showInvitationDialog = showInvitationDialog;
    return this;
}