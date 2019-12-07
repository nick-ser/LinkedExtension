function personDataDialog(person, updateRowCallback, tr)
{
    const PersonDataEnum = Object.freeze({ "firstName": 1, "lastName": 2, "position": 3, "location" : 4 })
    var _firstName = null,
        _lastName = null,
        _position = null,
        _location = null;

    this.init = function ()
    {
        this.dialog = document.querySelector(".modalPersonDataDlg");
        if (this.dialog == null) {
            this.dialog = document.createElement('div')
            this.dialog.style.zIndex = 9999;
            this.dialog.className = 'modalPersonDataDlg';
            this.dialog.innerHTML = `<div class="modal-persondata">
                        <div class="filteringDiv" style="margin-top: 5px;">                            
                            <table id="invitedTable" style="border-collapse: collapse; margin:0 auto;" border="1" rules="all" cellspacing="0">
                                <tr>
                                    <td style="padding-right:15px">
                                        <p>First Name:</p>
                                    </td>
                                    <td>
                                        <input id="firstName" style="width: 13vw; height: 26px; margin-bottom: 5px;" type="text" />
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-right:15px">
                                        <p>Last Name:</p>
                                    </td>
                                    <td>
                                        <input id="lastName" style="width: 13vw; height: 26px; margin-bottom: 5px;" type="text" />
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-right:15px">
                                        <p>Position:</p>
                                    </td>
                                    <td>
                                        <input id="position" style="width: 13vw; height: 26px; margin-bottom: 5px;" type="text" />
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-right:15px">
                                        <p>Location:</p>
                                    </td>
                                    <td>
                                        <input id="location" style="width: 13vw; height: 26px; margin-bottom: 5px;" type="text" />
                                    </td>
                                </tr>
                            </table>
                        </div>
                        <div class="cancelpane">
                          <button class="closePersonDataDialog" name="cancel">Close</button>
                        </div>
                    </div>`;
            document.body.appendChild(this.dialog);
            _firstName = document.getElementById("firstName");
            _lastName = document.getElementById("lastName");
            _position = document.getElementById("position");
            _location = document.getElementById("location");            
        }
        else
        {
            _firstName = document.getElementById("firstName");
            _lastName = document.getElementById("lastName");
            _position = document.getElementById("position");
            _location = document.getElementById("location");
        }
        _firstName.value = this.person.firstName;
        _lastName.value = this.person.lastName;
        _position.value = this.person.position;
        _location.value = this.person.location;

        _firstName.addEventListener("change", function ()
        {
            this.doChangePersonData(PersonDataEnum.firstName, _firstName.value);
        }.bind(this), false);
        _lastName.addEventListener("change", function ()
        {
            this.doChangePersonData(PersonDataEnum.lastName, _lastName.value);
        }.bind(this), false);
        _position.addEventListener("change", function ()
        {
            this.doChangePersonData(PersonDataEnum.position, _position.value);
        }.bind(this), false);
        _location.addEventListener("change", function ()
        {
            this.doChangePersonData(PersonDataEnum.location, _location.value);
        }.bind(this), false);

        this.dialog.style.display = "none";

        var closeBtn = document.querySelector(".closePersonDataDialog");
        closeBtn.onclick = this.closeDialog;
    };

    this.doChangePersonData = function (flag, value)
    {
        if (flag == PersonDataEnum.firstName)
            this.person.firstName = value;
        if (flag == PersonDataEnum.lastName)
            this.person.lastName = value;
        if (flag == PersonDataEnum.position)
            this.person.position = value;
        if (flag == PersonDataEnum.location)
            this.person.location = value;
    }

    this.showPersonDataDialog = function ()
    {
        this.dialog.style.display = 'block';
    };

    this.closeDialog = function()
    {
        this.updateRowCallback(person, this.tr);
        this.dialog.style.display = "none"
    }.bind(this);

    this.updateRowCallback = updateRowCallback;
    this.person = person;
    this.tr = tr;
    this.init();
    return this;
}