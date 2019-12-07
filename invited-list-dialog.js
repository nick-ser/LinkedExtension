function invitedList(source)
{
    const FiltrationEnum = Object.freeze({ "byName": 1, "byPosition": 2, "byLocation": 3 })
    let _table = null,
        _rootDiv = null,
        _filterByName = null,
        _filterByPos = null,
        _filterByLocation = null
        _invitedOnlyCheckbox = null,
        _closeRef = null;

    this.init = function () {
        _rootDiv = document.getElementById("parsedPeopleTbl");
        if (_rootDiv == undefined)
        {
            _rootDiv = document.createElement('div')
            _rootDiv.id = 'parsedPeopleTbl';
            _rootDiv.className = 'parsedPeoplePanel';
            _rootDiv.innerHTML = 
                `<div class="invatationTabelPanel" style="margin: 15px;">
                    <div style="float: right; margin-right: 20px;">
                        <a id="closeRef" href="#" class="close" style="margin-top: -22px;"></a>
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
                    <div style="display: flex; margin-top: 10px; margin-bottom: 5px;    margin-left: 8px">
                        <input id="invitedOnly" type="checkbox" class="checkbox" style="margin-right: 10px; margin-top:2px" /><p>Show 'Not invited' only</p>
                    </div>
                    <div style="height: 80vh; overflow-y: auto;">
                        <table id="invitedTable" style="border-collapse: collapse; width: 48vw;" border="1" rules="all" cellspacing="0"></table>
                    </div>
                    <div style="display: flex; margin-top: 10px; margin-right: 20px; float: right;">
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
            var delButton = document.getElementById("deleteInvitation");
            delButton.onclick = function ()
            {
                this.deleteInvitations();
            }.bind(this);

            _closeRef.addEventListener("click", function ()
            {
                this.closeInvitedList();
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
        for (var i = 0; i < this.source.length; i++)
        {
            if (this.source[i].isSelected)
            {
                this.source.splice(i, 1);
                i--;
            }
        }
    };

    this.showInvitedOnly = function ()
    {
        if (_invitedOnlyCheckbox.checked)
            this.filteredSource = this.source.filter(person => !person.isInvited);
        else
            this.filteredSource = this.source;
        this.updateTable();
    }

    this.doFiltration = function (flag, filter)
    {
        if (filter == "")
            this.filteredSource = this.source;         
        else if (flag == FiltrationEnum.byName)
            this.filteredSource = this.source.filter(person => person.firstName.toLowerCase().indexOf(filter) != -1
                || person.lastName.toLowerCase().indexOf(filter) != -1);
        else if (flag == FiltrationEnum.byPosition)
            this.filteredSource = this.source.filter(person => person.position.toLowerCase().indexOf(filter) != -1);
        else if (flag == FiltrationEnum.byLocation)
            this.filteredSource = this.source.filter(person => person.location.toLowerCase().indexOf(filter) != -1);
        this.updateTable();
    }

    this.showInvitedList = function ()
    {
        if (this.source == undefined || this.source.length == 0)
            return;

        this.updateTable();
        _rootDiv.style.display = 'block';
    }.bind(this);

    this.updateTable = function ()
    {
        _table.innerHTML = "";
        if (this.filteredSource == undefined)
            return;

        for (var i = 0; i < this.filteredSource.length; i++)
            addRow(this.filteredSource[i]);
    }

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
    }

    function updateRow(person, tr)
    {
        for (var i = 0; i < tr.cells.length; ++i)
        {
            tr.cells[i].remove();
            i--;
        }
        fillExistingRow(tr, person);
    }

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
    }

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
    }

    this.closeInvitedList = function ()
    {
        _rootDiv.style.display = "none"
    };

    this.source = source;
    this.filteredSource = source;
    this.init();
    return this;
}