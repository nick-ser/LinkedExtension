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
                    <div style="display: flex; margin-top: 10px; margin-bottom: 5px;">
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
                                <div style="display: flex; margin-left: 20px; margin-bottom: 10px;">
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
                                <div style="height: 40vh; overflow-y: auto;">
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
            launchBtn.onclick = function()
            {
                if(this.source.message == '')
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
                if(this.currentView == CurrentViewEnum.invitationView)
                    this.startInvitationCampaign();
                else if(this.currentView == CurrentViewEnum.messageView)
                    this.startMessagingCampaign();
            }.bind(this);

            stopBtn.onclick = function()
            {
                stopBtn.disabled = true;
                stopBtn.style = 'background-color: gray';                
                launchBtn.disabled = false;
                launchBtn.style = 'background-color: #39c';
                this.setState(CollectStateEnum.none);
                _isCanceld = true;
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

            _filterByName.addEventListener("change", function ()
            {
                this.doFiltration(FiltrationEnum.byName, _filterByName.value);
            }.bind(this), false);

            _filterByPos.addEventListener("change", function ()
            {
                this.doFiltration(FiltrationEnum.byPosition, _filterByPos.value);
            }.bind(this), false);

            _filterByLocation.addEventListener("change", function ()
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
            p1.innerText = "Sent";
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
            this.filteredSource = this.source.people.filter(person => person.firstName.toLowerCase().indexOf(filter) != -1
                || person.lastName.toLowerCase().indexOf(filter) != -1);
        else if (flag == FiltrationEnum.byPosition)
            this.filteredSource = this.source.people.filter(person => person.position.toLowerCase().indexOf(filter) != -1);
        else if (flag == FiltrationEnum.byLocation)
            this.filteredSource = this.source.people.filter(person => person.location.toLowerCase().indexOf(filter) != -1);
        this.updateTable();
    };

    this.getDelay = function()
    {
        switch(this.securityLevel)
        {
            case SecurityLevelEnum.safe:
                return Math.random() * (300000 - 180000) + 180000;
            break;
            case SecurityLevelEnum.medium:
                return Math.random() * (240000 - 120000) + 120000;
            break;
            case SecurityLevelEnum.low:
                return Math.random() * (180000 - 60000) + 60000;
            break;
        }
    }.bind(this);

    this.showInvitedList = function (state, source, securityLevel, currentView)
    {
        this.source = source;
        this.filteredSource = source.people;
        this.securityLevel = securityLevel;
        this.currentView = currentView;

        var canclelBtn = document.getElementById('stopInvitation');
        var launchBtn = document.getElementById('launchInvitation');
        if(state != CollectStateEnum.invitation)
        {
            canclelBtn.disabled = true;
            canclelBtn.style = 'background-color: gray';
            
            launchBtn.disabled = false;
            launchBtn.style = 'background-color: #39c';
        }
        else
        {
            canclelBtn.disabled = false;
            canclelBtn.style = 'background-color: #39c';
            
            launchBtn.disabled = true;
            launchBtn.style = 'background-color: green';
        }

        if (this.source.people == undefined)
            return;

        this.updateTable();
        this.progressBarInit();
        this.initOutput();
        _txtArea.value = this.source.message;

        if(this.currentView == CurrentViewEnum.invitationView)
        {
            document.getElementById("txtArea").setAttribute('maxlength', 300);
            this.calcMessageLetters();
            document.getElementById("msgLettersCounter").style.visibility = 'visible';
            document.getElementById("resendMsgDiv").style.visibility = 'hidden';
        }
        else if(this.currentView == CurrentViewEnum.messageView)
        {
            document.getElementById("txtArea").removeAttribute('maxLength');
            document.getElementById("msgLettersCounter").style.visibility = 'hidden';
            document.getElementById("resendMsgDiv").style.visibility = 'visible';
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
            if(count % 3 == 0)
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
                var delay = Math.round(this.getDelay()) / 3;
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
                await sleep(delay);

                var msgDiv = document.getElementsByClassName(MsgTextAreaClass)[0];
                if(msgDiv == undefined)
                    throw("Message text area hasn't been found.");
                SetTextToLinkedinMsgWnd(msgDiv, msg); 
                
                await sleep(5000);
                var sentBtn = document.getElementsByClassName(DoSendMsgBtnClass)[0];
                if(sentBtn == undefined)
                    throw("Msg sent button hasn't been found.");
                if(sentBtn.disabled)
                    throw("Msg sent button is disabled.")
                sentBtn.click();

                await sleep(delay);
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

            if(count % 3 == 0)
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
                console.log("Invitation sending delay: " + delay);
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

                var addNoteBtn = document.getElementsByClassName(AddNoteBtnClass)[0];
                if(addNoteBtn == undefined)
                    throw("Add Note button hasn't been found.");
                addNoteBtn.click();

                var textArea = document.getElementsByClassName(TextAreaClass)[0];
                if(textArea == undefined)
                    throw("Text area hasn't been found.");
                setTextToLinkedinInput(textArea, msg); 
                
                var sentBtn = document.getElementsByClassName(SentButtonClass)[0];
                if(sentBtn == undefined)
                    throw("Sent button hasn't been found.");
                if(sentBtn.disabled)
                    throw("Sent button is disabled.")
                sentBtn.click();
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
        await saveInvitationCount(count);
        this.setState(CollectStateEnum.none);
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