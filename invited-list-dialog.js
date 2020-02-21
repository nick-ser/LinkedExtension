function invitedList(setState)
{
    const SecurityLevelEnum = Object.freeze({ "safe": "Safe", "medium": "Medium", "low": "Low" })
    const FiltrationEnum = Object.freeze({ "byName": 1, "byPosition": 2, "byLocation": 3 })
    const InsertInfoEnum = Object.freeze({ "firstName": 1, "lastName": 2, "position" : 3, "location" : 4 })
    const CollectStateEnum = Object.freeze({ "none": 1, "collect": 2, "stopCollection": 3, "invitation": 4 })
    const CurrentViewEnum = Object.freeze({ "invitationView": 1, "messageView": 2, "csvView": 3 });
    const FirstNameDelimiter = "%FirstName%";
    const LastNameDelimiter = "%LastName%";
    const PositionDelimiter = "%Position%";
    const LocationDelimiter = "%Location%";
    const DocumentScrollDelta = 4;
    const InviteBtnClass = "pv-s-profile-actions pv-s-profile-actions--connect ml2 artdeco-button artdeco-button--2 artdeco-button--primary ember-view";
    const InviteBtnClass2 = "pv-s-profile-actions pv-s-profile-actions--connect pv-s-profile-actions__overflow-button full-width text-align-left ember-view";
    const AddNoteBtnClass = "mr1 artdeco-button artdeco-button--muted artdeco-button--3 artdeco-button--secondary ember-view";
    const TextAreaClass = "send-invite__custom-message mb3 ember-text-area ember-view";
    const SentButtonClass = "ml1 artdeco-button artdeco-button--3 artdeco-button--primary ember-view";
    const MaxInvitationSentCount = 100;
    const MaxMessagingCount = 100;
    const MaxCsvCount = 100;
    const SendMessageBtnClass = "pv-s-profile-actions pv-s-profile-actions--message ml2 artdeco-button artdeco-button--2 artdeco-button--primary ember-view";
    const CloseSendMsgWindowBtnClass = "msg-overlay-bubble-header__control js-msg-close artdeco-button artdeco-button--circle artdeco-button--inverse artdeco-button--1 artdeco-button--tertiary ember-view";
    const MsgTextAreaClass = "msg-form__contenteditable t-14 t-black--light t-normal flex-grow-1 notranslate";
    const DoSendMsgBtnClass = "msg-form__send-button artdeco-button artdeco-button--1";

    let _table = null,
    _rootDiv = null,
    _filterByName = null,
    _filterByPos = null,
    _filterByLocation = null
    _invitedOnlyCheckbox = null,
    _closeRef = null,
    _txtArea = null
    _msgLettersCounter = null,
    _isCanceld = false;
    
    this.init = function ()
    {
        _rootDiv = document.getElementById("parsedPeopleTbl");
        if (_rootDiv == undefined)
        {
            _rootDiv = document.createElement('div');
            _rootDiv.id = 'parsedPeopleTbl';
            _rootDiv.className = 'parsedPeoplePanel';
            _rootDiv.style = 'z-index:99999';
            _rootDiv.innerHTML = 
                `<div class="invatationTabelPanel" style="margin: 15px;">
                    <div style="float: right; margin-right: 20px;">
                        <span id="closeRef" class="close" style="margin-top: -22px;"></span>
                    </div>                    
                    <div class="filteringDiv" style="display: flex; margin-top: 15px;">
                        <div class="filteringByName" style="margin-right: 10px;">
                            <p>Name: <input id="filterByName" style="width: 150px; height: 24px; margin-top: 2px;" type="text" placeholder="Name" /></p>
                        </div>
                        <div class="filteringByPosition" style="margin-right: 10px;">
                            <p>Position: <input id="filterByPosition" style="width: 150px; height: 24px; margin-top: 2px;" type="text" placeholder="Position/company" /></p>
                        </div>
                        <div class="filteringByLocation" style="margin-right: 10px;">
                            <p>Location: <input id="filterByLocation" style="width: 150px; height: 24px; margin-top: 2px;" type="text" placeholder="Location" /></p>
                        </div>
                        <div class="deleteInvitationDiv"><button id="deleteInvitation" style="width: 80px; height: 30px;">Delete</button></div>
                    </div>
                    <div id="checkPnl" style="display: flex; margin-top: 10px; margin-bottom: 5px;">
                        <div id="invitedOnlyDiv" style="font-size: 16px;">
                            <input id="invitedOnly" type="checkbox" class="checkbox" style="margin-right: 10px; margin-top:2px; margin-left: -5px;">Show 'Not invited' only</input>
                        </div>
                        <div id="resendMsgDiv" style="font-size: 16px;">
                            <input id="resendMsg" type="checkbox" class="checkbox" style="margin-right: 10px; margin-top:2px; margin-left: 35px;">Resend messages</input>
                        </div>
                    </div>
                    <div style="float: right; margin-right: 30px;">
                        <table style="border-collapse: collapse;">
                            <tr>
                                <td>
                                <div id="greetingsPnl" style="display: flex; margin-left: 20px; margin-bottom: 10px;">
                                    <button id="firstNameInsert" style="width: 90px; height: 30px;">First Name</button>
                                    <button id="lastNameInsert" style="width: 90px; height: 30px; margin-left: 10px">Last Name</button>
                                    <button id="positionInsert" style="width: 90px; height: 30px; margin-left: 10px">Position</button>
                                    <button id="locationInsert" style="width: 90px; height: 30px; margin-left: 10px">Location</button>
                                </div>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <textarea maxlength="300" id="txtArea" style="width: 33vw; height: 200px;resize: none; margin-left: 20px; float: right;" placeholder="Type message..."></textarea>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <label id="msgLettersCounter" style="float: right; color: #777a7d; margin-top: 5px; font-size: 1.4rem">300 / 300</label>
                                </td>
                            </tr>
                        <tr>
                            <td>
                                <progress id="progressBar"></progress> 
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <label id="progressBarLabel" style="float: right; color: #777a7d; margin-top: 5px; font-size: 1.4rem"></label>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div id="outputDiv" style="height: 40vh; overflow-y: auto; margin-top: 10px;">
                                    <table id="outputTbl" style="float: right; width: 33vw; margin-top: 10px;" rules="all" cellspacing="0"></table>
                                </div>
                            </td>
                        </tr>
                      </table>
                    </div>
                    </div>
                    <div style="height: 82vh; overflow-y: auto;">
                        <table id="invitedTable" style="border-collapse: collapse; width: 55vw;" border="1" rules="all" cellspacing="0"></table>
                    </div>
                    <div style="display: flex; margin-right: 35px; float: right;">
                        <button id="launchInvitation" style="width: 80px; height: 30px;">Launch</button>
                        <button id="stopInvitation" style="width: 80px; height: 30px; margin-left: 10px;">Stop</button>
                        <button id="dwnldCsv">Download</button>
                    </div>
                </div>`;
            document.body.appendChild(_rootDiv);
            _table = document.getElementById("invitedTable"); 
            _filterByName = document.getElementById("filterByName");
            _filterByPos = document.getElementById("filterByPosition");
            _filterByLocation = document.getElementById("filterByLocation");
            _invitedOnlyCheckbox = document.getElementById("invitedOnly");
            _closeRef = document.getElementById("closeRef");
            _txtArea = document.getElementById("txtArea");
            _msgLettersCounter = document.getElementById("msgLettersCounter");

            var launchBtn = document.getElementById("launchInvitation");
            var stopBtn = document.getElementById("stopInvitation");
            var downloadBtn = document.getElementById("dwnldCsv");
            launchBtn.onclick = function()
            {
                if(this.currentView != CurrentViewEnum.csvView && this.source.message == '')
                {
                    alert('You have to set a message.');
                    return;
                }
                this.setState(CollectStateEnum.invitation);
                _isCanceld = false;                
                stopBtn.disabled = false;
                stopBtn.style = 'background-color: #39c';                
                launchBtn.disabled = true;
                launchBtn.style = 'background-color: green';
                downloadBtn.disabled = true;
                downloadBtn.style = 'background-color: gray';
                if(this.currentView == CurrentViewEnum.invitationView)
                {
                    downloadBtn.style.display = 'none';
                    this.startInvitationCampaign();
                }
                else if(this.currentView == CurrentViewEnum.messageView)
                {
                    downloadBtn.style.display = 'none';
                    this.startMessagingCampaign();
                }
                else if(this.currentView == CurrentViewEnum.csvView)
                    this.startCsvCampaign();
            }.bind(this);

            stopBtn.onclick = function()
            {
                stopBtn.disabled = true;
                stopBtn.style = 'background-color: gray';                
                launchBtn.disabled = false;
                launchBtn.style = 'background-color: #39c';

                var invited = this.source.people.filter(person => person.isInvited);
                if(invited != undefined && invited.length > 0)
                {
                    downloadBtn.disabled = false;
                    downloadBtn.style = 'background-color: #39c';
                }
                else
                {
                    downloadBtn.disabled = true;
                    downloadBtn.style = 'background-color: gray'; 
                }
                this.setState(CollectStateEnum.none);
                _isCanceld = true;
            }.bind(this);

            downloadBtn.onclick = function()
            {
                var csv = [];
                csv[0] = 'Name' + this.delimiter + 'Url' + this.delimiter + 'Postion' + this.delimiter + 'Company name'
                    + this.delimiter + 'Websites' + this.delimiter + 'Phone' + this.delimiter + 'Address'
                    + this.delimiter + 'Email' + this.delimiter + 'IM' + this.delimiter + 'Twitter' + this.delimiter + 'Birthday';
                var parsedProfiles = this.source.people.filter(person => person.isInvited);
                for(var i=0; i<parsedProfiles.length; i++)
                    csv.push(this.GetPlainPersonInfo(parsedProfiles[i]));
                
                chrome.runtime.sendMessage({ greeting: 'downloadFile', content: [csv] }, function (response)
                {
                    console.log("Request has been sent");
                });                
            }.bind(this);

            var delButton = document.getElementById("deleteInvitation");
            delButton.onclick = function ()
            {
                this.deleteInvitations();
            }.bind(this);

            document.getElementById("firstNameInsert").onclick = function ()
            {
                this.insertPrepInfo(InsertInfoEnum.firstName);
            }.bind(this);

            document.getElementById("lastNameInsert").onclick = function ()
            {
                this.insertPrepInfo(InsertInfoEnum.lastName);
            }.bind(this);

            document.getElementById("positionInsert").onclick = function ()
            {
                this.insertPrepInfo(InsertInfoEnum.position);
            }.bind(this);

            document.getElementById("locationInsert").onclick = function ()
            {
                this.insertPrepInfo(InsertInfoEnum.location);
            }.bind(this);

            _closeRef.addEventListener("click", function ()
            {
                this.closeAndSave();
            }.bind(this), false);

            _txtArea.addEventListener("keyup", function ()
            {
                this.source.message = _txtArea.value;
                this.calcMessageLetters();
            }.bind(this), false);

            _invitedOnlyCheckbox.addEventListener("change", function ()
            {
                this.showInvitedOnly();
            }.bind(this), false);

            _filterByName.addEventListener("input", function ()
            {
                this.doFiltration(FiltrationEnum.byName, _filterByName.value);
            }.bind(this), false);

            _filterByPos.addEventListener("input", function ()
            {
                this.doFiltration(FiltrationEnum.byPosition, _filterByPos.value);
            }.bind(this), false);

            _filterByLocation.addEventListener("input", function ()
            {
                this.doFiltration(FiltrationEnum.byLocation, _filterByLocation.value);
            }.bind(this), false);
            _rootDiv.style.display = "none";
        }
    };

    this.closeAndSave = async function ()
    {
        if(this.currentView == CurrentViewEnum.invitationView)
            await this.saveCurrentInvitationList();
        else if(this.currentView == CurrentViewEnum.messageView)
            await this.saveCurrentMessageList();
        else if(this.currentView == CurrentViewEnum.csvView)
            await this.saveCurrentCsvList();
        this.closeInvitedList();
    }.bind(this);

    this.initOutput = function ()
    {
        var tbl = document.getElementById("outputTbl");
        if (tbl == undefined)
            return;
        tbl.innerHTML = '';
        var invited = this.source.people.filter(person => person.isInvited || person.isError);

        if (invited == undefined || invited.length == 0)
            return;
        invited.forEach(p => this.addOutputInfo(p));
    };

    this.addOutputInfo = function (person)
    {
        var tbl = document.getElementById("outputTbl");
        if (tbl == undefined || person == undefined || (!person.isInvited && !person.isError))
            return;
        var tr = document.createElement('tr');
        var td = document.createElement('td');
        td.setAttribute("style", "width: 200px;");
        var p = document.createElement('p');
        p.innerText = person.firstName + " " + person.lastName;
        td.appendChild(p);
        tr.appendChild(td);
        var td1 = document.createElement('td');
        td1.setAttribute("style", "width: 60px;");
        var p1 = document.createElement('p');
        var p1 = document.createElement('p');
        if (person.isError)
        {
            p1.className = "errorOutputParagraph";
            p1.innerText = "Error";
        }
        else
        {
            p1.className = "outputParagraph";
            p1.innerText = this.currentView != CurrentViewEnum.csvView ? "Sent" : "Parsed";
        }
        td1.appendChild(p1);
        tr.appendChild(td1);
        tbl.appendChild(tr);
    };

    this.progressBarInit = function ()
    {
        var progressBar = document.getElementById("progressBar");
        if (progressBar == undefined)
            return;
        var invitedList = this.source.people.filter(person => person.isInvited);
        progressBar.max = this.source.people.length;
        progressBar.value = invitedList == undefined ? 0 : invitedList.length;
        document.getElementById("progressBarLabel").innerHTML = "Total sent: " + progressBar.value + " / " + progressBar.max;
    };

    this.insertPrepInfo = function (flag)
    {
        var newText = "";
        if (flag == InsertInfoEnum.firstName)
            newText = FirstNameDelimiter;
        if (flag == InsertInfoEnum.lastName)
            newText = LastNameDelimiter;
        if (flag == InsertInfoEnum.position)
            newText = PositionDelimiter;
        if (flag == InsertInfoEnum.location)
            newText = LocationDelimiter;
        var start = _txtArea.selectionStart;
        var end = _txtArea.selectionEnd;
        var text = _txtArea.value;
        var before = text.substring(0, start);
        var after = text.substring(end, text.length);
        _txtArea.value = (before + newText + after);
        _txtArea.selectionStart = _txtArea.selectionEnd = start + newText.length;

        this.calcMessageLetters();
        this.source.message = _txtArea.value;
        _txtArea.focus();
    };

    this.calcMessageLetters = function()
    {
        var lettersNum = _txtArea.value.length;
        _msgLettersCounter.innerHTML = 300-lettersNum + " / 300";
    };

    this.deleteInvitations = function ()
    {
        for (var i = 0; i < this.filteredSource.length; i++)
        {
            if (this.filteredSource[i].isSelected)
            {
                _table.deleteRow(i);                
                this.filteredSource.splice(i, 1);
                i--;
            }
        }
        for (var i = 0; i < this.source.people.length; i++)
        {
            if (this.source.people[i].isSelected)
            {
                this.source.people.splice(i, 1);
                i--;
            }
        }
    };

    this.showInvitedOnly = function ()
    {
        if (_invitedOnlyCheckbox.checked)
            this.filteredSource = this.source.people.filter(person => !person.isInvited);
        else
            this.filteredSource = this.source.people;
        this.updateTable();
    };

    this.doFiltration = function (flag, filter)
    {
        if (filter == "")
            this.filteredSource = this.source.people;         
        else if (flag == FiltrationEnum.byName)
        {
            this.filteredSource = this.source.people.filter(person => person.name.toLowerCase().indexOf(filter.toLowerCase()) != -1);
                //|| person.lastName.toLowerCase().indexOf(filter) != -1);
        }
        else if (flag == FiltrationEnum.byPosition)
            this.filteredSource = this.source.people.filter(person => person.position.toLowerCase().indexOf(filter.toLowerCase) != -1);
        else if (flag == FiltrationEnum.byLocation)
            this.filteredSource = this.source.people.filter(person => person.location.toLowerCase().indexOf(filter.toLowerCase) != -1);
        this.updateTable();
    };

    this.getDelay = function()
    {
        switch(this.securityLevel)
        {
            case SecurityLevelEnum.safe:
                return Math.random() * (110000 - 90000) + 90000;
            break;
            case SecurityLevelEnum.medium:
                return Math.random() * (80000 - 60000) + 60000;
            break;
            case SecurityLevelEnum.low:
                return Math.random() * (50000 - 30000) + 30000;
            break;
        }
    }.bind(this);

    loadDelimiterCount = function ()
    {
        return new Promise(resolve => 
        {
            chrome.storage.local.get('linkedExtenderDelimiter', function (result)
            {
                var delimiter = ',';
                if(result['linkedExtenderDelimiter'] == undefined)
                    delimiter = ',';
                else
                    delimiter = result['linkedExtenderDelimiter'];
                resolve(delimiter);
            })
        });
    };

    this.showInvitedList = async function (state, source, securityLevel, currentView)
    {
        this.source = source;
        this.filteredSource = source.people;
        this.securityLevel = securityLevel;
        this.currentView = currentView;
        this.delimiter = await loadDelimiterCount();

        var canclelBtn = document.getElementById('stopInvitation');
        var launchBtn = document.getElementById('launchInvitation');
        var downloadBtn = document.getElementById('dwnldCsv');
        canclelBtn.disabled = true;
        canclelBtn.style = 'background-color: gray';
        launchBtn.disabled = false;
        launchBtn.style = 'background-color: #39c';
        if(state == CollectStateEnum.invitation)
        {
            canclelBtn.disabled = false;
            canclelBtn.style = 'background-color: #39c';
            launchBtn.disabled = true;
            launchBtn.style = 'background-color: green';
            downloadBtn.disabled = true;
            downloadBtn.style = 'background-color: gray';
        }

        if (this.source.people == undefined)
            return;

        this.updateTable();
        this.progressBarInit();
        this.initOutput();
        _txtArea.value = this.source.message;
        var invited = this.source.people.filter(person => person.isInvited);
        if(invited != undefined && invited.length > 0)
        {
            downloadBtn.disabled = false;
            downloadBtn.style = 'background-color: #39c';
        }
        else
        {
            downloadBtn.disabled = true;
            downloadBtn.style = 'background-color: gray'; 
        }

        if(this.currentView == CurrentViewEnum.invitationView)
        {
            document.getElementById("txtArea").style.display = 'block';
            document.getElementById("greetingsPnl").style.display = 'block';
            document.getElementById("txtArea").setAttribute('maxlength', 300);
            document.getElementById("outputDiv").style.height = "40vh";
            this.calcMessageLetters();
            document.getElementById("msgLettersCounter").style.display = 'block';
            document.getElementById("resendMsgDiv").style.display = 'none';
            document.getElementById("checkPnl").style.display = 'block';
            downloadBtn.style.display = 'none';
        }
        else if(this.currentView == CurrentViewEnum.messageView)
        {
            document.getElementById("outputDiv").style.height = "40vh";
            document.getElementById("txtArea").style.display = 'block';
            document.getElementById("greetingsPnl").style.display = 'block';
            document.getElementById("txtArea").removeAttribute('maxLength');
            document.getElementById("msgLettersCounter").style.display = 'none';
            document.getElementById("resendMsgDiv").style.display = 'block';
            document.getElementById("checkPnl").style.display = 'flex';
            downloadBtn.style.display = 'none';
        }
        else if(this.currentView == CurrentViewEnum.csvView)
        {
            document.getElementById("txtArea").style.display = 'none';
            document.getElementById("msgLettersCounter").style.display = 'none';
            document.getElementById("greetingsPnl").style.display = 'none';
            document.getElementById("outputDiv").style.height = "69vh";
            document.getElementById("checkPnl").style.display = 'none';
            downloadBtn.style.display = 'block';
        }

        _rootDiv.style.display = 'block';
    }.bind(this);

    this.updateTable = function ()
    {
        _table.innerHTML = "";
        if (this.filteredSource == undefined)
            return;

        for (var i = 0; i < this.filteredSource.length; i++)
            this.addRow(this.filteredSource[i]);
    };

    this.addInvitationFlagCell = function (tr, person)
    {
        var td = document.createElement('td');
        td.className = "row";
        td.setAttribute("style", "width: 120px;");
        var p = document.createElement('p');
        if (!person.isInvited)
        {
            p.className = "notInvitedParagraph";
            if(this.currentView == CurrentViewEnum.invitationView)
                p.innerText = "Not invited";
            else if(this.currentView == CurrentViewEnum.messageView)
                p.innerText = "Not sent";
        }
        else
        {
            p.className = "invitedParagraph";
            if(this.currentView == CurrentViewEnum.invitationView)
                p.innerText = "Invited";
            else if(this.currentView == CurrentViewEnum.messageView)
                p.innerText = "Message sent";
        }       
        td.appendChild(p);
        tr.appendChild(td);
    }.bind(this);

    this.updateRow = function (person, tr)
    {
        for (var i = 0; i < tr.cells.length; ++i)
        {
            tr.cells[i].remove();
            i--;
        }
        this.fillExistingRow(tr, person);
    }.bind(this);

    this.addButtonCell = function (tr, person)
    {
        var td = document.createElement('td');
        td.className = "row";
        td.setAttribute("style", "width: 90px;");
        var button = document.createElement('button');
        button.person = person;
        button.setAttribute("style", "width: 100px; height: 30px;");
        button.onclick = function ()
        {
            personDataDlg = new personDataDialog(button.person, this.updateRow, tr);
            personDataDlg.showPersonDataDialog();
        }.bind(this);
        button.innerHTML = "Edit profile";
        td.appendChild(button);
        tr.appendChild(td);
    }.bind(this);

    function addCheckboxCell(tr, person)
    {
        var td = document.createElement('td');
        td.className = "row";
        td.setAttribute("style", "width: 15px;");
        var checkBox = document.createElement('input');
        checkBox.checked = person.isSelected;
        checkBox.person = person;
        checkBox.addEventListener('change', function ()
        {
            if (checkBox.checked)
            {
                td.parentElement.className = "selectedRow";
                person.isSelected = true;
            }
            else
            {
                td.parentElement.className = "";
                person.isSelected = false;
            }
        });
        checkBox.setAttribute('type', 'checkbox');
        checkBox.className = "checkbox";
        td.appendChild(checkBox);
        tr.appendChild(td);
    };

    function addImage(tr, person)
    {
        var td = document.createElement('td');
        td.className = "row";
        td.setAttribute("style", "width: 60px;");
        var img = document.createElement('img');
        img.src = person.imgUri;
        img.className = "img";
        td.appendChild(img);
        tr.appendChild(td);
    };

    function addPersonInfoCell(tr, person)
    {
        var td = document.createElement('td');        
        td.className = "row";
        var div = document.createElement('div');
        div.setAttribute("style", "float: left;");

        var p1 = document.createElement('p');
        p1.className = "nameParagraph";
        p1.innerHTML = person.firstName + " " + person.lastName;

        var p2 = document.createElement('p');
        p2.className = "positionParagraph";
        p2.innerHTML = person.position;

        var p3 = document.createElement('p');
        p3.className = "locationParagraph";
        p3.innerHTML = person.location;
        div.appendChild(p1);
        div.appendChild(p2);
        div.appendChild(p3);
                
        td.appendChild(div);
        tr.appendChild(td)
    };

    this.addRow = function (person)
    {
        var tr = document.createElement('tr');
        tr.id = person.url;
        this.fillExistingRow(tr, person);
        _table.appendChild(tr);
    }.bind(this);

    this.updateRow = function (person)
    {
        var tr = document.getElementById(person.url);
        tr.innerHTML = '';
        this.fillExistingRow(tr, person);
    }.bind(this);

    this.fillExistingRow = function (tr, person)
    {
        addCheckboxCell(tr, person);
        addImage(tr, person);
        addPersonInfoCell(tr, person);
        this.addInvitationFlagCell(tr, person);
        this.addButtonCell(tr, person);
    }.bind(this);

    this.closeInvitedList = function ()
    {
        _rootDiv.style.display = "none"
    };

    this.saveCurrentInvitationList = function ()
    {
        return new Promise(resolve =>
            {
                var name = this.source.name + '_invitation';
                try
                {
                    chrome.storage.local.set({ [name]: this.source });
                }
                catch(e)
                {
                    console.log(e);
                }
                resolve();
            });
    };

    this.saveCurrentCsvList = function ()
    {
        return new Promise(resolve =>
            {
                var name = this.source.name + '_csv';
                try
                {
                    chrome.storage.local.set({ [name]: this.source });
                }
                catch(e)
                {
                    console.log(e);
                }
                resolve();
            });
    };

    this.saveCurrentMessageList = function ()
    {
        return new Promise(resolve =>
            {
                var name = this.source.name + '_message';
                try
                {
                    chrome.storage.local.set({ [name]: this.source });
                }
                catch(e)
                {
                    console.log(e);
                }
                resolve();
            });
    };

    function SetTextToLinkedinMsgWnd(div, text)
    {
        div.innerHTML = "<p>" + text + "</p>";
        function simulateKey(keyCode, type, modifiers)
        {
            var evtName = (typeof (type) === "string") ? "key" + type : "keydown";
            var modifier = (typeof (modifiers) === "object") ? modifier : {};
            var event = document.createEvent("HTMLEvents");
            event.initEvent(evtName, true, false);
            event.keyCode = keyCode;
            for (var i in modifiers)
                event[i] = modifiers[i];
            div.dispatchEvent(event);
        }
        simulateKey(38);
        simulateKey(38, "up");
        var event = new Event('input',
        {
            bubbles: true,
            cancelable: true,
        });
        div.dispatchEvent(event);
    };

    function setTextToLinkedinInput(textArea, text)
    {
        textArea.value = text;
        function simulateKey(keyCode, type, modifiers)
        {
            var evtName = (typeof (type) === "string") ? "key" + type : "keydown";
            var modifier = (typeof (modifiers) === "object") ? modifier : {};
            var event = document.createEvent("HTMLEvents");
            event.initEvent(evtName, true, false);
            event.keyCode = keyCode;
            for (var i in modifiers)
                event[i] = modifiers[i];
                textArea.dispatchEvent(event);
        }
        simulateKey(38);
        simulateKey(38, "up");
        var event = new Event('input',
        {
            bubbles: true,
            cancelable: true,
        });
        textArea.dispatchEvent(event);
    };

    function sleep(ms)
    {
        return new Promise(resolve => setTimeout(resolve, ms));
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
                resolve(count);
            })
        });
    };

    function saveCsvCount(count)
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
                count: count
            };
            chrome.storage.local.set({ 'csvCount': tmp });
            resolve();
        });
    };

    this.startCsvCampaign = async function()
    {
        var notParsedPeople = this.source.people.filter(person => !person.isInvited);
        var count = await loadCsvCount();
        for(let i=0; i<notParsedPeople.length; i++)
        {
            if(_isCanceld)
                break;
            if(count > MaxCsvCount)
            {
                alert('You have reached the limit for parsing profiles.');
                this.setState(CollectStateEnum.none);
                return;   
            }
            await saveCsvCount(count);
            var person = notParsedPeople[i];
            try
            {
                person.isError = false;
                await sleep(5000);                
                window.history.pushState(null, null, person.url);
                await sleep(5000);
                window.history.back();
                await sleep(1000);
                window.history.forward();
                var delay = Math.round(this.getDelay()) / 2;
                await sleep(delay);
                
                var delta = document.body.scrollHeight / DocumentScrollDelta;
                var offset = 0.0;
                for (let j = 0; j < DocumentScrollDelta; j++)
                {
                    offset += delta;
                    window.scrollTo(0, offset);
                    await sleep(j*1000);
                }
                window.scrollTo(0, 0);
                
                var experienceSection = document.getElementsByClassName('pv-profile-section experience-section ember-view')[0];
                if(experienceSection != undefined)
                {
                    var currentJobDiv = experienceSection.getElementsByClassName('pv-entity__summary-info pv-entity__summary-info--background-section')[0];
                    if(currentJobDiv != undefined)
                    {
                        var positonElem = currentJobDiv.getElementsByClassName('t-16 t-black t-bold')[0];
                        person.position = positonElem != undefined ? positonElem.innerText : '';
                        var compElem = currentJobDiv.getElementsByClassName('pv-entity__secondary-title t-14 t-black t-normal')[0];
                        person.companyName = compElem != undefined ? compElem.innerText : '';
                    }
                }
                
                await sleep(5000);                
                window.history.pushState(null, null, person.url + 'detail/contact-info/');
                await sleep(5000);
                window.history.back();
                await sleep(1000);
                window.history.forward();
                await sleep(delay);
                if(_isCanceld)
                    break;
                //websites
                var websitesSection = document.getElementsByClassName('pv-contact-info__contact-type ci-websites')[0];
                if(websitesSection != undefined)
                {
                    var websitesElems = websitesSection.getElementsByClassName('pv-contact-info__ci-container');
                    if(websitesElems != undefined)
                    {
                        if(websitesElems.length > 1)
                        {
                           var websites = ''; 
                            for(let j=0; j<websitesElems.length; j++)
                            {
                                websites += websitesElems[j].innerText;
                                if(j<websitesElems.length-1)
                                    websites += ' | ';
                            }
                            person.websites = websites;
                        }
                        else if(websitesElems.length == 1)
                            person.websites = websitesElems[0].innerText;
                    }
                }
                //phones
                var phonesSection = document.getElementsByClassName('pv-contact-info__contact-type ci-phone')[0];
                if(phonesSection != undefined)
                {
                    var phonesElems = phonesSection.getElementsByClassName('pv-contact-info__ci-container');
                    if(phonesElems != undefined)
                    {
                        if(phonesElems.length > 1)
                        {
                           var phones = ''; 
                            for(let j=0; j<phonesElems.length; j++)
                            {
                                phones += phonesElems[j].innerText ;
                                if(j<phonesElems.length-1)
                                    phones += ' | ';
                            }
                            person.phones = phones;
                        }
                        else if(phonesElems.length == 1)
                            person.phones = phonesElems[0].innerText;
                    }
                }
                //addresses
                var addressesSection = document.getElementsByClassName('pv-contact-info__contact-type ci-address')[0];
                if(addressesSection != undefined)
                {
                    var addressesElems = addressesSection.getElementsByClassName('pv-contact-info__ci-container');
                    if(addressesElems != undefined)
                    {
                        if(addressesElems.length > 1)
                        {
                           var addresses = ''; 
                            for(let j=0; j<addressesElems.length; j++)
                            {
                                addresses += addressesElems[j].innerText;
                                if(j<addressesElems.length-1)
                                    addresses += ' | ';
                            }
                            person.addresses = addresses;
                        }
                        else if(addressesElems.length == 1)
                            person.addresses = addressesElems[0].innerText;
                    }
                }
                //emails
                var emailsSection = document.getElementsByClassName('pv-contact-info__contact-type ci-email')[0];
                if(emailsSection != undefined)
                {
                    var emailsElems = emailsSection.getElementsByClassName('pv-contact-info__ci-container');
                    if(emailsElems != undefined)
                    {
                        if(emailsElems.length > 1)
                        {
                           var emails = ''; 
                            for(let j=0; j<emailsElems.length; j++)
                            {
                                emails += emailsElems[j].innerText;
                                if(j<emailsElems.length-1)
                                    emails += ' | ';
                            }
                            person.emails = emails;
                        }
                        else if(emailsElems.length == 1)
                            person.emails = emailsElems[0].innerText;
                    }
                }
                //messengers
                var imsSection = document.getElementsByClassName('pv-contact-info__contact-type ci-ims')[0];
                if(imsSection != undefined)
                {
                    var imsElems = imsSection.getElementsByClassName('pv-contact-info__ci-container');
                    if(imsElems != undefined)
                    {
                        if(imsElems.length > 1)
                        {
                           var ims = ''; 
                            for(let j=0; j<imsElems.length; j++)
                            {
                                ims += imsElems[j].innerText + ' | ';
                                if(j<imsElems.length-1)
                                    ims += ' | ';
                            }
                            person.ims = ims;
                        }
                        else if(imsElems.length == 1)
                            person.ims = imsElems[0].innerText;
                    }
                }
                //twitter
                var twitterSection = document.getElementsByClassName('pv-contact-info__contact-type ci-twitter')[0];
                if(twitterSection != undefined)
                {
                    var twitterElems = twitterSection.getElementsByClassName('pv-contact-info__ci-container');
                    if(twitterElems != undefined)
                    {
                        if(twitterElems.length > 1)
                        {
                           var twitter = ''; 
                            for(let j=0; j<twitterElems.length; j++)
                            {
                                twitter += twitterElems[j].innerText;
                                if(j<twitterElems.length-1)
                                    twitter += ' | ';
                            }
                            person.twitter = twitter;
                        }
                        else if(twitterElems.length == 1)
                            person.twitter = twitterElems[0].innerText;
                    }
                }
                //birthday
                var birthdaySection = document.getElementsByClassName('pv-contact-info__contact-type ci-birthday')[0];
                if(birthdaySection != undefined)
                {
                    var birthdayElems = birthdaySection.getElementsByClassName('pv-contact-info__ci-container');
                    if(birthdayElems != undefined)
                    {
                        if(birthdayElems.length > 0)
                            person.birthday = birthdayElems[0].innerText;
                    }
                }
            }
            catch(e)
            {
                console.log(person.name + ": " + e);
                person.isError = true;
            }
            if(!person.isError)
            {
                person.isInvited = true;
                count++;
                this.progressBarInit();
                this.updateRow(person);
            }
            this.addOutputInfo(person);
            await this.saveCurrentCsvList();
        }
        await saveCsvCount(count);
        this.setState(CollectStateEnum.none);
        var invited = this.source.people.filter(person => person.isInvited);
        var downloadBtn = document.getElementById('dwnldCsv');
        if(invited != undefined && invited.length > 0)
        {
            downloadBtn.disabled = false;
            downloadBtn.style = 'background-color: #39c';
            downloadBtn.style.display = 'block';
        }
        else
        {
            downloadBtn.disabled = true;
            downloadBtn.style = 'background-color: gray';
            downloadBtn.style.display = 'block';
        }
        document.getElementById('stopInvitation').disabled = true;
        document.getElementById('stopInvitation').style = 'background-color: gray';                
        document.getElementById('launchInvitation').disabled = false;
        document.getElementById('launchInvitation').style = 'background-color: #39c';
        alert(notParsedPeople.filter(person => person.isInvited).length + ' profiles have been parsed!');
    }

    this.GetPlainPersonInfo = function (person)
    {
        return '\n' + isNullOrHaveDelimiter(person.name) + this.delimiter + isNullOrHaveDelimiter(person.url)
            + this.delimiter + isNullOrHaveDelimiter(person.position)  + this.delimiter + isNullOrHaveDelimiter(person.companyName)
            + this.delimiter + isNullOrHaveDelimiter(person.websites) + this.delimiter + isNullOrHaveDelimiter(person.phones)
            + this.delimiter + isNullOrHaveDelimiter(person.addresses) + this.delimiter + isNullOrHaveDelimiter(person.emails)
            + this.delimiter + isNullOrHaveDelimiter(person.ims) + this.delimiter + isNullOrHaveDelimiter(person.twitter)
            + this.delimiter + isNullOrHaveDelimiter(person.birthday);
    }.bind(this);

    isNullOrHaveDelimiter = function (str)
    {
        str = str == undefined ? '' : str;
        return str.replace(this.delimiter, '');
    }.bind(this);

    this.startMessagingCampaign = async function()
    {
        var notMessagedPeople = null;
        if(!document.getElementById('resendMsg').checked)
            notMessagedPeople = this.source.people.filter(person => !person.isInvited);
        else
        {
            this.source.people.forEach(p => p.isInvited = false);
            notMessagedPeople = this.source.people;
        }
        var count = await loadMessagingCount();
        for(let i =0; i<notMessagedPeople.length; i++)
        {
            if(_isCanceld)
                break;
            if(count > MaxMessagingCount)
            {
                alert('You have reached the limit for sending messages.');
                this.setState(CollectStateEnum.none);
                return;   
            }
            await saveMessagingCount(count);
            var person = notMessagedPeople[i];
            try
            {
                person.isError = false;
                var msg = this.source.message.replace(FirstNameDelimiter, person.firstName);
                msg = msg.replace(LastNameDelimiter, person.lastName);
                msg = msg.replace(PositionDelimiter, person.position);
                msg = msg.replace(LocationDelimiter, person.location);

                await sleep(5000);                
                window.history.pushState(null, null, person.url);
                await sleep(5000);
                window.history.back();
                await sleep(1000);
                window.history.forward();
                var delay = Math.round(this.getDelay());
                await sleep(delay);

                var delta = document.body.scrollHeight / DocumentScrollDelta;
                var offset = 0.0;
                for (let j = 0; j < DocumentScrollDelta; j++)
                {
                    offset += delta;
                    window.scrollTo(0, offset);
                    await sleep(j*1000);
                }
                window.scrollTo(0, 0);

                var sendMsgBtn = document.getElementsByClassName(SendMessageBtnClass)[0];
                if(sendMsgBtn == undefined)
                    throw("Send msg button hasn't been found.");
                if(sendMsgBtn.disabled)
                    throw("Send msg button is disabled.")
                sendMsgBtn.click();
                await sleep(1000);

                var msgDiv = document.getElementsByClassName(MsgTextAreaClass)[0];
                if(msgDiv == undefined)
                    throw("Message text area hasn't been found.");
                SetTextToLinkedinMsgWnd(msgDiv, msg);
                await sleep(1000);
                var sentBtn = document.getElementsByClassName(DoSendMsgBtnClass)[0];
                if(sentBtn == undefined)
                    throw("Msg sent button hasn't been found.");
                if(sentBtn.disabled)
                    throw("Msg sent button is disabled.")
                sentBtn.click();

                await sleep(1000);
                var closeSendMsgBtn = document.getElementsByClassName(CloseSendMsgWindowBtnClass)[0];
                if(closeSendMsgBtn == undefined)
                    throw("Close send msg window button hasn't been found.");
                closeSendMsgBtn.click();
            }
            catch(e)
            {
                console.log(person.name + ": " + e);
                person.isError = true;
            }
            if(!person.isError)
            {
                person.isInvited = true;
                count++;
                this.progressBarInit();
                this.updateRow(person);
            }
            this.addOutputInfo(person);
            await this.saveCurrentMessageList();
        }
        await saveMessagingCount(count);
        this.setState(CollectStateEnum.none);
        document.getElementById('stopInvitation').disabled = true;
        document.getElementById('stopInvitation').style = 'background-color: gray';                
        document.getElementById('launchInvitation').disabled = false;
        document.getElementById('launchInvitation').style = 'background-color: #39c';
        alert(notMessagedPeople.filter(person => person.isInvited).length + ' messages have been sent!');
    };

    this.startInvitationCampaign = async function ()
    {
        var notInvitetedPeople = this.source.people.filter(person => !person.isInvited);
        var count = await loadInvitationCount();
        for(let i=0; i<notInvitetedPeople.length; i++)
        {
            if(_isCanceld)
                break;
            if(count > MaxInvitationSentCount)
            {
                alert('You have reached the limit for sending invitations.');
                this.setState(CollectStateEnum.none);
                return;   
            }

            await saveInvitationCount(count);
            var person = notInvitetedPeople[i];
            try
            {
                person.isError = false;
                var msg = this.source.message.replace(FirstNameDelimiter, person.firstName);
                msg = msg.replace(LastNameDelimiter, person.lastName);
                msg = msg.replace(PositionDelimiter, person.position);
                msg = msg.replace(LocationDelimiter, person.location);

                await sleep(5000);                
                window.history.pushState(null, null, person.url);
                await sleep(5000);
                window.history.back();
                await sleep(1000);
                window.history.forward();
                var delay = this.getDelay();
                await sleep(delay);

                var delta = document.body.scrollHeight / DocumentScrollDelta;
                var offset = 0.0;
                for (let j = 0; j < DocumentScrollDelta; j++)
                {
                    offset += delta;
                    window.scrollTo(0, offset);
                    await sleep(j*1000);
                }
                window.scrollTo(0, 0);

                if(!person.isSalesNavigator)
                {
                    var inviteBtn = document.getElementsByClassName(InviteBtnClass)[0];
                    if(inviteBtn == undefined)
                    {
                        inviteBtn = document.getElementsByClassName(InviteBtnClass2)[0];
                        if(inviteBtn == undefined)
                            throw("Invite button hasn't been found.");
                    }
                    if(inviteBtn.disabled)
                        throw("Invite button is disabled.")
                    inviteBtn.click();
                    await sleep(1000);
                    var addNoteBtn = document.getElementsByClassName(AddNoteBtnClass)[0];
                    if(addNoteBtn == undefined)
                        throw("Add Note button hasn't been found.");
                    addNoteBtn.click();
                    await sleep(1000);
                    var textArea = document.getElementsByClassName(TextAreaClass)[0];
                    if(textArea == undefined)
                        throw("Text area hasn't been found.");
                    setTextToLinkedinInput(textArea, msg); 
                    await sleep(1000);
                    var sentBtn = document.getElementsByClassName(SentButtonClass)[0];
                    if(sentBtn == undefined)
                        throw("Sent button hasn't been found.");
                    if(sentBtn.disabled)
                        throw("Sent button is disabled.")
                    sentBtn.click();
                }
                else
                {
                    var inviteBtn = document.getElementsByClassName('inverse-link-on-a-light-background artdeco-dropdown__item artdeco-dropdown__item--is-dropdown ember-view')[0];
                    if(inviteBtn == undefined)
                        throw("Invite button hasn't been found.");
                    if(inviteBtn.disabled)
                        throw("Invite button is disabled.")
                    inviteBtn.click();
                    await sleep(1000);
                    var textArea = document.getElementsByClassName('ember-text-area ember-view')[0];
                    if(textArea == undefined)
                        throw("Text area hasn't been found.");
                    setTextToLinkedinInput(textArea, msg);
                    await sleep(1000);
                    var sentBtn = document.getElementsByClassName('button-primary-medium connect-cta-form__send')[0];
                    if(sentBtn == undefined)
                        throw("Sent button hasn't been found.");
                    if(sentBtn.disabled)
                        throw("Sent button is disabled.")
                    sentBtn.click();
                }
            }
            catch(e)
            {   
                console.log(person.name + ": " + e);
                person.isError = true;
            }
            if(!person.isError)
            {
                person.isInvited = true;
                count++;
                this.progressBarInit();
                this.updateRow(person);
            }
            this.addOutputInfo(person);
            await this.saveCurrentInvitationList();
        }
        this.setState(CollectStateEnum.none);
        document.getElementById('stopInvitation').disabled = true;
        document.getElementById('stopInvitation').style = 'background-color: gray';                
        document.getElementById('launchInvitation').disabled = false;
        document.getElementById('launchInvitation').style = 'background-color: #39c';
        alert(notInvitetedPeople.filter(person => person.isInvited).length + ' invitations have been sent!');
    };

    function saveMessagingCount(count)
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
                count: count
            };
            chrome.storage.local.set({ 'messagingCount': tmp });
            resolve();
        });
    };

    function saveInvitationCount(count)
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
                count: count
            };
            chrome.storage.local.set({ 'invitationCount': tmp });
            resolve();
        });
    };

    function loadMessagingCount()
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
                    resolve(count);
                })
            });
    };

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
                resolve(count);
            })
        });
    };
        
    this.setState = setState;
    this.init();
    return this;
}