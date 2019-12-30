function invitedList(setState)
{
    const FiltrationEnum = Object.freeze({ "byName": 1, "byPosition": 2, "byLocation": 3 })
    const InsertInfoEnum = Object.freeze({ "firstName": 1, "lastName": 2, "position" : 3, "location" : 4 })
    const CollectStateEnum = Object.freeze({ "none": 1, "collect": 2, "stopCollection": 3, "invitation": 4 })
    const FirstNameDelimiter = "%FirstName%";
    const LastNameDelimiter = "%LastName%";
    const PositionDelimiter = "%Position%";
    const LocationDelimiter = "%Location%";
    const DocumentScrollDelta = 4;
    const InviteBtnClass = "pv-s-profile-actions pv-s-profile-actions--connect ml2 artdeco-button artdeco-button--2 artdeco-button--primary ember-view";
    const AddNoteBtnClass = "mr1 artdeco-button artdeco-button--muted artdeco-button--3 artdeco-button--secondary ember-view";
    const TextAreaClass = "send-invite__custom-message mb3 ember-text-area ember-view";
    const SentButtonClass = "ml1 artdeco-button artdeco-button--3 artdeco-button--primary ember-view";
    const MaxInvitationSentCount = 100;

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
                        <input id="invitedOnly" type="checkbox" class="checkbox" style="margin-right: 10px; margin-top:2px; margin-left: -5px;" /><p>Show 'Not invited' only</p>
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
                this.setState(CollectStateEnum.invitation);
                _isCanceld = false;                
                stopBtn.disabled = false;
                stopBtn.style = 'background-color: #39c';                
                launchBtn.disabled = true;
                launchBtn.style = 'background-color: green';
                this.startInvitationCampaign();
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
                this.saveCurrentInvitationList();
                this.closeInvitedList();
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

    this.initOutput = function ()
    {
        var tbl = document.getElementById("outputTbl");
        if (tbl == undefined)
            return;
        tbl.innerHTML = '';
        var invited = this.source.people.filter(person => person.isInvited);

        if (invited == undefined || invited.length == 0)
            return;
        invited.forEach(p => this.addOutputInfo(p));
    };

    this.addOutputInfo = function (person)
    {
        var tbl = document.getElementById("outputTbl");
        if (tbl == undefined || person == undefined || !person.isInvited)
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

    this.showInvitedList = function (state, source)
    {
        this.source = source;
        this.filteredSource = source.people;

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

        _rootDiv.style.display = 'block';
    }.bind(this);

    this.updateTable = function ()
    {
        _table.innerHTML = "";
        if (this.filteredSource == undefined)
            return;

        for (var i = 0; i < this.filteredSource.length; i++)
            addRow(this.filteredSource[i]);
    };

    function addInvitationFlagCell(tr, person)
    {
        var td = document.createElement('td');
        td.className = "row";
        td.setAttribute("style", "width: 120px;");
        var p = document.createElement('p');
        if (!person.isInvited)
        {
            p.className = "notInvitedParagraph";
            p.innerText = "Not invited";
        }
        else
        {
            p.className = "invitedParagraph";
            p.innerText = "Invited";
        }       
        td.appendChild(p);
        tr.appendChild(td);
    };

    function updateRow(person, tr)
    {
        for (var i = 0; i < tr.cells.length; ++i)
        {
            tr.cells[i].remove();
            i--;
        }
        fillExistingRow(tr, person);
    };

    function addButtonCell(tr, person)
    {
        var td = document.createElement('td');
        td.className = "row";
        td.setAttribute("style", "width: 90px;");
        var button = document.createElement('button');
        button.person = person;
        button.setAttribute("style", "width: 100px; height: 30px;");
        button.onclick = function ()
        {
            personDataDlg = new personDataDialog(button.person, updateRow, tr);
            personDataDlg.showPersonDataDialog();
        };
        button.innerHTML = "Edit profile";
        td.appendChild(button);
        tr.appendChild(td);
    };

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

    function addRow(person)
    {
        var tr = document.createElement('tr');        
        fillExistingRow(tr, person);
        _table.appendChild(tr);
    };

    function fillExistingRow(tr, person)
    {
        addCheckboxCell(tr, person);
        addImage(tr, person);
        addPersonInfoCell(tr, person);
        addInvitationFlagCell(tr, person);
        addButtonCell(tr, person);
    };

    this.closeInvitedList = function ()
    {
        _rootDiv.style.display = "none"
    };

    this.saveCurrentInvitationList = function ()
    {
        var name = this.source.name;
        chrome.storage.local.set({ [name]: this.source });
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

    this.startInvitationCampaign = async function ()
    {
        var notInvitetedPeople = this.source.people.filter(person => !person.isInvited);
        var count = await loadInvitationCount();
        for(let i=0; i<notInvitetedPeople.length; i++)
        {
            if(_isCanceld)
                break;
            if(count++ > MaxInvitationSentCount)
            {
                alert('You have reached the limit for sending invitations.');
                this.setState(CollectStateEnum.none);
                return;   
            }

            await saveInvitationCount(count);
            var person = notInvitetedPeople[i];
            try
            {
                var msg = this.source.message.replace(FirstNameDelimiter, person.firstName);
                msg = msg.replace(LastNameDelimiter, person.lastName);
                msg = msg.replace(PositionDelimiter, person.position);
                msg = msg.replace(LocationDelimiter, person.location);
                
                window.history.pushState(null, null, person.url);
                await sleep(50);
                window.history.back();
                await sleep(70);
                window.history.forward();

                // TODO: Get from settings!!!!!!
                await sleep(5000);

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
                    throw("Invite button hasn't been found.");
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
            person.isInvited = true;
            this.addOutputInfo(person);
            this.progressBarInit();
            this.saveCurrentInvitationList();
        }
        this.setState(CollectStateEnum.none);
    };

    function saveInvitationCount(count)
    {
        return new Promise(resolve =>
        {
            var today = new Date();
            var dd = String(today.getDate()).padStart(2, '0');
            var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
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

    function loadInvitationCount()
    {
        return new Promise(resolve => 
        {
            chrome.storage.local.get('invitationCount', function (result)
            {
                var tmp = result['invitationCount'];
                if (tmp == undefined)
                    resolve(0);
                resolve(tmp.count);
            })
        });
    };
        
    this.setState = setState;
    this.init();
    return this;
}