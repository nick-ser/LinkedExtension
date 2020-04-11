function createSetupDialog(signout)
{
    const SecurityLevelEnum = Object.freeze({ "safe": "Safe", "medium": "Medium", "low": "Low" });
    this.init = function()
    {
        this.dialog = document.querySelector(".linkedExtenderSetupDialog");
        if(this.dialog == null)
        {
            this.dialog = document.createElement('div')
            this.dialog.style.zIndex = 9999;
            this.dialog.style.display = 'none';
            this.dialog.className = 'linkedExtenderSetupDialog';
            this.dialog.innerHTML = 
            `<div class='linkedExtenderSetupDialog'>
                <div class="setupDialogRoot">
                    <div style="margin-top: 10px; margin-left: 10px;">
                        <label style="display: inline; vertical-align: middle; color: #fff;">Security level:</label>
                        <select class="classic" id="securityLevelSelect" style="height: 26px; width: 180px; margin-left: 10px;">
                        </select>
                    </div>
                    <div style="margin-top: 10px; margin-left: 10px;">
                        <label style="display: inline; vertical-align: middle; color: #fff;" id="securityDescriptionLabel">
                        </label>
                    </div>
                    <div style="margin-top: 10px; margin-left: 10px;">
                        <label style="display: inline; vertical-align: middle; color: #fff;">Delimiter type:</label>
                        <select class="classic" id="delimiterSelect" style="height: 26px; width: 180px; margin-left: 10px;">
                            <option value=','>, - Google Sheets</option>
                            <option value=';'>; - Microsoft Excel</option>
                        </select>
                    </div>
                    <table style="margin-top: 10px;">
                        <tr style="display:flex;">
                        <td>
                            <div style="margin-top: 10px; margin-left: 10px;">
                                <label id="invitedLabelCount" style="display: inline; vertical-align: middle; color: #fff;">
                                </label>
                            </div>
                            <div style="margin-top: 10px; margin-left: 10px;">
                                <label id="messagedLabelCount" style="display: inline; vertical-align: middle; color: #fff;">
                                </label>
                            </div>
                            <div style="margin-top: 10px; margin-left: 10px;">
                                <label id="csvLabelCount" style="display: inline; vertical-align: middle; color: #fff;">
                                </label>
                            </div>
                            <div style="margin-top: 10px; margin-left: 10px;">
                                <label id="expireDateLabel" style="display: inline; vertical-align: middle; color: #fff;">
                                </label>
                            </div>
                        </td>
                        <!--
                        <td style="display:flex; flex-grow:1; align-items:center; justify-content:center;">
                            <button id="skipCountsBtn" style="width: 90px; height: 32px; margin-top: 6px; margin-left: 20px; display:flex; align-items:center; justify-content:center;">
                                Skip
                            </button>
                        </td>-->
                        </tr>
                    </table>
                    <div style="margin-top: 10px; margin-left: 10px;">
                        <button id="closeSetupDialogBtn" style="width: 90px; height: 32px; float: right; margin-right: -5px; margin-bottom:-5px;">
                            Close
                        </button>
                        <button id="signoutSetupDialogBtn" style="width: 90px; height: 32px; float: right; margin-right: 5px; margin-bottom:-5px;">
                            Sign Out
                        </button>
                    </div> 
                </div>
            </div>`;

            document.body.appendChild(this.dialog);
            var levelSelect = document.getElementById('securityLevelSelect');
            levelSelect.addEventListener('change', (event) =>
            {
                this.securityLevelChange(event);
            });
            document.getElementById("closeSetupDialogBtn").onclick = this.closeSetupDialog;
            document.getElementById("signoutSetupDialogBtn").onclick = function()
            {
                signout(false);
                this.closeSetupDialog();
            }.bind(this);
            document.getElementById('delimiterSelect').addEventListener('change', (event) =>
            {
                this.setDelimiter(event.target.value);;
            });

            var option1 = document.createElement("option");
            option1.text = SecurityLevelEnum.safe;
            option1.value = SecurityLevelEnum.safe;
            levelSelect.add(option1);

            var option2 = document.createElement("option");
            option2.text = SecurityLevelEnum.medium;
            option2.value = SecurityLevelEnum.medium;
            levelSelect.add(option2);

            var option3 = document.createElement("option");
            option3.text = SecurityLevelEnum.low;
            option3.value = SecurityLevelEnum.low;
            levelSelect.add(option3);
        }
    };

    this.securityLevelChange = function (event)
    {
        this.setSecurityLevel(event.target.value);
        this.refreshDescription(event.target.value);
    }.bind(this);



    this.refreshDescription = function (level)
    {
        var label = document.getElementById('securityDescriptionLabel');
        switch(level)
        {
            case SecurityLevelEnum.safe:
                label.innerHTML = 'Safe mode provides the maximum guarantee against the detection of automatic actions by the LinkedIns administration.';
            break;
            case SecurityLevelEnum.medium:
                label.innerHTML = 'Medium mode provides the best balance between the sending invitations speed  and the likelihood of being noticed by the administration.';
            break;
            case SecurityLevelEnum.low:
                label.innerHTML = 'Low security mode allows you to send invitations or messages at maximum speed.';
            break;
        }
    }.bind(this);

    this.showSetupDialog = async function (securityLevel, delimiter, setSecurityLevel, setDelimiter)
    {
        this.setSecurityLevel = setSecurityLevel;
        this.setDelimiter = setDelimiter;
        document.getElementById('securityLevelSelect').value = securityLevel;
        document.getElementById('delimiterSelect').value = delimiter;
        await loadInvitationCount();
        await loadMessageCount();
        await loadCsvCount();
        var info = await loadAccountInfo();
        if(info == null)
        {
            document.getElementById('signoutSetupDialogBtn').disabled = true;
            document.getElementById('expireDateLabel').innerText = "";
        }
        else
        {
            document.getElementById('signoutSetupDialogBtn').disabled = false;
            document.getElementById('expireDateLabel').innerText = "Expiry date: " + info.days + " days.";
        }
        this.refreshDescription(securityLevel);
        this.dialog.style.display = 'block';
    }.bind(this);

    function loadInvitationCount()
    {
        return new Promise(resolve => 
        {
            chrome.storage.local.get('invitationCount', function (result)
            {
                var count = 0;
                var tmp = result['invitationCount'];
                if (tmp == undefined)
                    count = 0;
                else
                {
                    var today = new Date();
                    var dd = String(today.getDate()).padStart(2, '0');
                    var mm = String(today.getMonth() + 1).padStart(2, '0');
                    var yyyy = today.getFullYear();
                    today = mm + '/' + dd + '/' + yyyy;
                    if(today == tmp.date)
                        count = tmp.count;
                }
                document.getElementById('invitedLabelCount').innerHTML = "Invited in current period: " + count;
                resolve();
            })
        });
    };

    function loadCsvCount()
    {
        return new Promise(resolve => 
        {
            chrome.storage.local.get('csvCount', function (result)
            {
                var count = 0;
                var tmp = result['csvCount'];
                if (tmp == undefined)
                    count = 0;
                else
                {
                    var today = new Date();
                    var dd = String(today.getDate()).padStart(2, '0');
                    var mm = String(today.getMonth() + 1).padStart(2, '0');
                    var yyyy = today.getFullYear();
                    today = mm + '/' + dd + '/' + yyyy;
                    if(today == tmp.date)
                        count = tmp.count;
                }
                document.getElementById('csvLabelCount').innerHTML = "Profiles parsed in current period: " + count;
                resolve();
            })
        });
    };

    function loadMessageCount()
    {
        return new Promise(resolve => 
        {
            chrome.storage.local.get('messagingCount', function (result)
            {
                var count = 0;
                var tmp = result['messagingCount'];
                if (tmp == undefined)
                    count = 0;
                else
                {
                    var today = new Date();
                    var dd = String(today.getDate()).padStart(2, '0');
                    var mm = String(today.getMonth() + 1).padStart(2, '0');
                    var yyyy = today.getFullYear();
                    today = mm + '/' + dd + '/' + yyyy;
                    if(today == tmp.date)
                        count = tmp.count;
                }
                document.getElementById('messagedLabelCount').innerHTML = "Messaged in current period: " + count;
                resolve();
            })
        });
    };

    this.closeSetupDialog = function()
    {
        this.dialog.style.display = 'none';
    }.bind(this);

    this.skipCounts = function()
    {
        saveInvitationCount();
        saveMessageCount();
        saveCsvCount();

        document.getElementById('invitedLabelCount').innerHTML = "Invited in current period: 0";
        document.getElementById('messagedLabelCount').innerHTML = "Messaged in current period: 0";
        document.getElementById('csvLabelCount').innerHTML = "Profiles parsed in current period: 0";
    }.bind(this);

    function saveInvitationCount()
    {
        return new Promise(resolve =>
        {
            var today = new Date();
            var dd = String(today.getDate()).padStart(2, '0');
            var mm = String(today.getMonth() + 1).padStart(2, '0');
            var yyyy = today.getFullYear();
            today = mm + '/' + dd + '/' + yyyy;
            let tmp = 
            {
                date: today,
                count: 0
            };
            chrome.storage.local.set({ 'invitationCount': tmp });
            resolve();
        });
    };

    function saveMessageCount()
    {
        return new Promise(resolve =>
        {
            var today = new Date();
            var dd = String(today.getDate()).padStart(2, '0');
            var mm = String(today.getMonth() + 1).padStart(2, '0');
            var yyyy = today.getFullYear();
            today = mm + '/' + dd + '/' + yyyy;
            let tmp = 
            {
                date: today,
                count: 0
            };
            chrome.storage.local.set({ 'messagingCount': tmp });
            resolve();
        });
    };

    function saveCsvCount()
    {
        return new Promise(resolve =>
            {
                var today = new Date();
                var dd = String(today.getDate()).padStart(2, '0');
                var mm = String(today.getMonth() + 1).padStart(2, '0');
                var yyyy = today.getFullYear();
                today = mm + '/' + dd + '/' + yyyy;
                let tmp = 
                {
                    date: today,
                    count: 0
                };
                chrome.storage.local.set({ 'csvCount': tmp });
                resolve();
            });
    };

    function loadAccountInfo()
    {
        return new Promise(resolve => 
        {
            chrome.storage.local.get('accountInfo', function (result)
            {
                var tmp = result['accountInfo'];
                if (tmp == undefined)
                    info = null;
                resolve(tmp);
            })
        });
    };

    this.init(signout);
}