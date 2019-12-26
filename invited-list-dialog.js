function invitedList(setState)
{
    const FiltrationEnum = Object.freeze({ "byName": 1, "byPosition": 2, "byLocation": 3 })
    const InsertInfoEnum = Object.freeze({ "firstName": 1, "lastName": 2, "position" : 3, "location" : 4 })
    const CollectStateEnum = Object.freeze({ "none": 1, "collect": 2, "stopCollection": 3, "invitation": 4 })

    let _table = null,
    _rootDiv = null,
    _filterByName = null,
    _filterByPos = null,
    _filterByLocation = null
    _invitedOnlyCheckbox = null,
    _closeRef = null,
    _txtArea = null
    _msgLettersCounter = null;
    
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
            launchBtn.onclick = function()
            {
                this.setState(CollectStateEnum.invitation);
            }.bind(this);

            var stopInvitationBtn = document.getElementById("stopInvitation");
            stopInvitationBtn.onclick = function()
            {
                this.setState(CollectStateEnum.none);
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
            newText = "%FirstName%";
        if (flag == InsertInfoEnum.lastName)
            newText = "%LastName%";
        if (flag == InsertInfoEnum.position)
            newText = "%Position%";
        if (flag == InsertInfoEnum.location)
            newText = "%Location%";
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

    this.showInvitedList = function (source)
    {
        this.source = source;
        this.filteredSource = source.people;

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
        
    this.setState = setState;
    this.init();
    return this;
}