function createInvitationListDialog(createListFunc)
{
    var _listInput = null;
    this.init = function ()
    {
        this.dialog = document.querySelector(".modalCreateListDlg");
        if (this.dialog == null)
        {
            this.dialog = document.createElement('div')
            this.dialog.style.zIndex = 9999;
            this.dialog.className = 'modalCreateListDlg';
            this.dialog.innerHTML =
                `<div class="modal-create-list">
                  <div>
                    <div>
                      <label style="color: #fff; font-weight: 400; font-size: 16px; margin-top: 0px">Create new list</label>
                    </div>
                    <input id="listNameInput" style="width: 242px; height: 26px; margin-top: 8px;background: white;" type="text" />
                    <div>
                      <label id="listError" style="color: red; display: none; font-weight: 600;">An invitation list with the same name already exists.</label>
                    </div>
                  </div>
                  <div style="margin-top: 20px; margin-right: -1px; float: right;"}>
                    <button class="buttonClose" id="closeCreateListDialog">Close</button>
                  </div>
                </div>`;
        }
        document.body.appendChild(this.dialog);
        var closeBtn = document.getElementById("closeCreateListDialog");
        closeBtn.onclick = this.closeCreateListDialog;

        _listInput = document.getElementById("listNameInput");
        _listInput.addEventListener("keyup", function ()
        {
            this.listNameChanged();
        }.bind(this), false);
    };

    this.listNameChanged = function ()
    {
        if(_listInput.value == '')
        {
          document.getElementById('closeCreateListDialog').disabled = true;
          return;
        }
        var lst = this.lists.find(l => l == _listInput.value)
        if (lst != undefined)
        {
            document.getElementById("listError").style.display = 'block';
            document.getElementById("closeCreateListDialog").disabled = true;
        }
        else
        {
            document.getElementById("listError").style.display = 'none';
            document.getElementById("closeCreateListDialog").disabled = false;
        }
    };

    this.showCreateListDialog = function (lists)
    {
        this.lists = lists;
        document.getElementById('closeCreateListDialog').disabled = true;
        this.dialog.style.display = 'block';
        document.getElementById("listNameInput").focus();
    };

    this.closeCreateListDialog = function ()
    {
        this.dialog.style.display = 'none';
        var listNameInput = document.getElementById("listNameInput");
        if (listNameInput.value != "")
            this.createListFunc(listNameInput.value);
    }.bind(this);

    this.createListFunc = createListFunc;
    this.init();
};