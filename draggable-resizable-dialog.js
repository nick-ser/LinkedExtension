function DialogBox(id, callback)
{
    const CollectStateEnum = Object.freeze({ "none": 1, "collect": 2, "stopCollection": 3, "invitation": 4 });
    const SecurityLevelEnum = Object.freeze({ "safe": "Safe", "medium": "Medium", "low": "Low" });
    const CurrentViewEnum = Object.freeze({ "invitationView": 1, "messageView": 2, "csvView": 3 });
    const DocumentScrollDelta = 3;
    const invitationsList = "invitationsList";
    const messageList = "msgList";
    const csvList = "csvList";
    const minMilsecWaiting = 8000;
    const maxMilsecWaiting = 15000;
    let _minW = 100, // The exact value get's calculated
        _minH = 1, // The exact value get's calculated
        _resizePixel = 5,
        _hasEventListeners = !!window.addEventListener,
        _last_known_scroll_position = 0,
        _dialog,
        _dialogTitle,
        _dialogContent,
        _dialogButtonPane,
        _maxX, _maxY,
        _startX, _startY,
        _startW, _startH,
        _invitaionDlg = null,
        _invitedList = null,
        _leftPos, _topPos,
        _isDrag = false,
        _isMinimized = false,
        _isButton = false,
        _state = CollectStateEnum.none,
        _isButtonHovered = false, // Let's use standard hover (see css)
        _whichButton,
        _buttons,
        _tabBoundary,
        _callback, // Callback function which transfers the name of the selected button to the caller
        _zIndex, // Initial zIndex of this dialog box 
        _zIndexFlag = false, // Bring this dialog box to front 
        setCursor, // Forward declaration to get access to this function in the closure
        whichClick, // Forward declaration to get access to this function in the closure
        setDialogContent, // Forward declaration to get access to this function in the closure
        _invitationLists = [],
        _messageList = [],
        _csvList = [],
        _currentInvitationList = null,
        _currentMessageList = null,
        _currentCsvList = null,
        _createListDialog = null,
        _maxInvitationNum = 10,
        _maxMsgNum = 10,
        _maxCsvNum = 10,
        _securityLevel = SecurityLevelEnum.safe,
        _setupDialog = null,
        _currentView = CurrentViewEnum.invitationView,
        _delimiter = ',';
	
	addEvent = function(elm, evt, callback)
    {
		if (elm == null || typeof(elm) == undefined)
			return;
		if (_hasEventListeners)
			elm.addEventListener(evt, callback, false);
		else if (elm.attachEvent)
			elm.attachEvent('on' + evt, callback);
		else
			elm['on' + evt] = callback;
	};
	
	returnEvent = function(evt)
    {
		if (evt.stopPropagation)
			evt.stopPropagation();
		if (evt.preventDefault)
			evt.preventDefault();
        else
        {
			evt.returnValue = false;
			return false;
		}
	};
	
    adjustFocus = function (evt)
    {
		evt = evt || window.event;
		if (evt.target === _dialogTitle)
			_buttons[_buttons.length - 1].focus();
		else
			_buttons[0].focus();
		return returnEvent(evt);
	};
	
    onFocus = function (evt)
    {
        evt = evt || window.event;
        evt.target.classList.add('focus');
        return returnEvent(evt);
    };
	
    onBlur = function (evt)
    {
        evt = evt || window.event;
        evt.target.classList.remove('focus');
        return returnEvent(evt);
    };
	
    onClick = function (evt)
    {
        evt = evt || window.event;
        whichClick(evt.target);
        return returnEvent(evt);
    };
	
    onMouseDown = function (evt)
    {
        evt = evt || window.event;
        _zIndexFlag = true;
        // mousedown might happen on any place of the dialog box, therefore 
        // we need to take care that this does not to mess up normal events 
        // on the content of the dialog box, i.e. to copy text
        if (!(evt.target === _dialog || evt.target === _dialogTitle || evt.target === _buttons[0]))
            return;
        var rect = getOffset(_dialog);
        _maxX = Math.max(
            document.documentElement["clientWidth"],
            document.body["scrollWidth"],
            document.documentElement["scrollWidth"],
            document.body["offsetWidth"],
            document.documentElement["offsetWidth"]
        );
        _maxY = Math.max(
            document.documentElement["clientHeight"],
            document.body["scrollHeight"],
            document.documentElement["scrollHeight"],
            document.body["offsetHeight"],
            document.documentElement["offsetHeight"]
        );
        if (rect.right > _maxX)
            _maxX = rect.right;
        if (rect.bottom > _maxY)
            _maxY = rect.bottom;
        _startX = evt.pageX;
        _startY = evt.pageY;
        _startW = _dialog.clientWidth;
        _startH = _dialog.clientHeight;
        _leftPos = rect.left;
        _topPos = rect.top;
        if (_isButtonHovered)
        {
            _whichButton.classList.remove('focus');
            _whichButton.classList.add('active');
            _isButtonHovered = false;
            _isButton = true;
        }
        else if (evt.target === _dialogTitle)
        {
            setCursor('move');
            _isDrag = true;
        }
            
        return returnEvent(evt);
    };

    function dragging(evt)
    {
        var dx = _startX - evt.pageX,
            dy = _startY - evt.pageY,
            left = _leftPos - dx,
            top = _topPos - dy,
            scrollL = Math.max(document.body.scrollLeft, document.documentElement.scrollLeft),
            scrollT = Math.max(document.body.scrollTop, document.documentElement.scrollTop);
        if (dx < 0) {
            if (left + _startW > _maxX)
                left = _maxX - _startW;
        }
        if (dx > 0) {
            if (left < 0)
                left = 0;
        }
        if (dy < 0) {
            if (top + _startH > _maxY)
                top = _maxY - _startH;
        }
        if (dy > 0) {
            if (top < 0)
                top = 0;
        }
        _dialog.style.left = left + 'px';
        _dialog.style.top = top + 'px';
        if (evt.clientY > window.innerHeight - 32)
            scrollT += 32;
        else if (evt.clientY < 32)
            scrollT -= 32;
        if (evt.clientX > window.innerWidth - 32)
            scrollL += 32;
        else if (evt.clientX < 32)
            scrollL -= 32;
        if (top + _startH == _maxY)
            scrollT = _maxY - window.innerHeight + 20;
        else if (top == 0)
            scrollT = 0;
        if (left + _startW == _maxX)
            scrollL = _maxX - window.innerWidth + 20;
        else if (left == 0)
            scrollL = 0;
        if (_startH > window.innerHeight) {
            if (evt.clientY < window.innerHeight / 2)
                scrollT = 0;
            else
                scrollT = _maxY - window.innerHeight + 20;
        }
        if (_startW > window.innerWidth) {
            if (evt.clientX < window.innerWidth / 2)
                scrollL = 0;
            else
                scrollL = _maxX - window.innerWidth + 20;
        }
        window.scrollTo(scrollL, scrollT);
        saveDialogSettings();
    };

    onMouseMove = function (evt)
    {
		evt = evt || window.event;
		// mousemove might run out of the dialog box during drag or resize, therefore we need to 
		// attach the event to the whole document, but we need to take care that this  
		// does not to mess up normal events outside of the dialog box.
		if ( !(evt.target === _dialog || evt.target === _dialogTitle || evt.target === _buttons[0]) && !_isDrag)
			return;
        if (_isDrag)
            dragging(evt);
        else if (!_isButton)
        {
            if (evt.target != _buttons[0] && evt.target.tagName.toLowerCase() == 'button' || evt.target === _buttons[0])
            {
                if (!_isButtonHovered || _isButtonHovered && evt.target != _whichButton)
                {
					_whichButton = evt.target;
					_isButtonHovered = true;
				}
			}
            else if (_isButtonHovered)
				_isButtonHovered = false;
        }
		return returnEvent(evt);
	};
	
    onMouseUp = function (evt)
    {
        evt = evt || window.event;
        if (_zIndexFlag)
        {
            _dialog.style.zIndex = _zIndex + 1;
            _zIndexFlag = false;
        }
        else 
            _dialog.style.zIndex = _zIndex;
        
        // mousemove might run out of the dialog box during drag or resize, therefore we need to 
        // attach the event to the whole document, but we need to take care that this  
        // does not to mess up normal events outside of the dialog box.
        if (!(evt.target === _dialog || evt.target === _dialogTitle || evt.target === _buttons[0]) && !_isDrag)
            return;

        if (_isDrag)
        {
            setCursor('');
            _isDrag = false;
        }
        else if (_isButton)
        {
            _whichButton.classList.remove('active');
            _isButton = false;
        }
        return returnEvent(evt);
    };

    function openPanel(name, btn)
    {
        var x = document.getElementsByClassName("custonDialogPanels");
        for (var i = 0; i < x.length; i++)
            x[i].style.display = "none";
        
        var tablinks = document.getElementsByClassName("tablink");
        for (i = 0; i < tablinks.length; i++)
            tablinks[i].style.backgroundColor = "";

        btn.style.backgroundColor = '#39c';
        switch(btn.id)
        {
            case 'msgBtn':
                _currentView = CurrentViewEnum.messageView;
            break;
            case 'csvBtn':
                _currentView = CurrentViewEnum.csvView;
            break;
            default:
                _currentView = CurrentViewEnum.invitationView;
            break;
        }

        document.getElementById(name).style.display = "block";  
    }

    minimizeDialogContent = function () 
    {
        _dialog.style.minHeight = 34 + 'px';
        _dialog.style.height = 34 + 'px';
        _dialog.style.minWidth = 203 + 'px';
        _dialog.style.width = 203 + 'px';
        
        _dialogContent.style.visibility = 'hidden';
        _dialogContent.style.display = 'none';

        if (_dialogButtonPane) {
            _dialogButtonPane.style.visibility = 'hidden';
            _dialogButtonPane.style.display = 'none';
        }
        _dialogTitle.style.width = 170 + 'px';
    },

    maximizeDialogContent = function ()
    {   
        _dialog.style.height = '195px';
        _dialog.style.width = '304px';
        _dialog.style.top = (window.innerHeight - (window.innerHeight - _dialog.style.height) + window.scrollY) - 51 + 'px';
        _dialogContent.style.visibility = 'visible';
        _dialogContent.style.display = 'block';

        if (_dialogButtonPane)
        {
            _dialogButtonPane.style.visibility = 'visible';
            _dialogButtonPane.style.display = 'block';
        }
        setDialogContent();
    }

    function smoothScrollCurrentDocument()
    {
        var delta = document.body.scrollHeight / DocumentScrollDelta;
        var offset = 0.0;
        for (var i = 0; i < DocumentScrollDelta; i++)
        {
            setTimeout(function ()
            {
                if (_state == CollectStateEnum.stopCollection)
                    return;

                offset += delta;
                window.scrollTo(0, offset);
            }, i * 1000);
        }
    }

    parseFirstConnectionsPage = function(currentList, maxNum, saveFunc)
    {
        smoothScrollCurrentDocument();

        setTimeout(function ()
        {
            window.scrollTo(0, 0);
            setTimeout(function ()
            {
                var divs = document.getElementsByClassName("search-result__wrapper");
                if (divs == undefined || divs.length == 0)
                {
                    alert("There is no people");
                    setState(CollectStateEnum.stopCollection);
                    return;
                }
                for (var i = 0; i < divs.length; i++)
                {
                    if (_state == CollectStateEnum.stopCollection || currentList.people.length >= maxNum)
                    {
                        setState(CollectStateEnum.stopCollection);
                        return;
                    }
                    var div = divs[i];
                    var actionButton = div.getElementsByClassName("message-anywhere-button search-result__actions--primary artdeco-button artdeco-button--default artdeco-button--2 artdeco-button--secondary")[0];
                    if (actionButton == undefined || actionButton.disabled)
                        continue;
                    var url = div.getElementsByClassName("search-result__result-link ember-view")[0];
                    if (url == undefined || url.href === "")
                        continue;
                    var img = div.getElementsByClassName("ivm-view-attr__img--centered EntityPhoto-circle-4  presence-entity__image EntityPhoto-circle-4 lazy-image loaded ember-view")[0];
                    var name = TrimParsedString(div.getElementsByClassName("name actor-name")[0]);
                    var parsedName = ParseName(name);
                    var position = TrimParsedString(div.getElementsByClassName("subline-level-1 t-14 t-black t-normal search-result__truncate")[0]);
                    var location = TrimParsedString(div.getElementsByClassName("subline-level-2 t-12 t-black--light t-normal search-result__truncate")[0]);
                    if (currentList.people.find(p => p.url == url.href))
                        continue;
                    let person =
                    {
                        imgUri: img == undefined ? "https://www.oblgazeta.ru/static/images/no-avatar.png" : img.src,
                        name: name,
                        firstName: parsedName.split("/")[0],
                        lastName: parsedName.split("/")[1],
                        position: position,
                        location: location,
                        isInvited: false,
                        isSelected: false,
                        isError: false,
                        url: url.href,
                    };
                    currentList.people.push(person);
                }
                saveFunc();
                if (currentList.people.length < maxNum)
                    parseNextPageUrl();
                else
                    setState(CollectStateEnum.stopCollection);
            }, 1000);
        }, DocumentScrollDelta * 1000);
    };

    parseGeneralSearchPage = function ()
    {
        smoothScrollCurrentDocument();

        setTimeout(function ()
        {
            window.scrollTo(0, 0);
            setTimeout(function ()
            {
                var divs = document.getElementsByClassName("search-result__wrapper");
                if (divs == undefined || divs.length == 0)
                {
                    alert("There is no people");
                    setState(CollectStateEnum.stopCollection);
                    return;
                }
                for (var i = 0; i < divs.length; i++)
                {
                    if (_state == CollectStateEnum.stopCollection || _currentInvitationList.people.length >= _maxInvitationNum)
                    {
                        setState(CollectStateEnum.stopCollection);
                        return;
                    }
                    var div = divs[i];
                    var actionButton = div.getElementsByClassName("search-result__action-button search-result__actions--primary artdeco-button artdeco-button--default artdeco-button--2 artdeco-button--secondary")[0];
                    if (actionButton == undefined || actionButton.disabled)
                        continue;
                    var url = div.getElementsByClassName("search-result__result-link ember-view")[0];
                    if (url == undefined || url.href === "")
                        continue;
                    var img = div.getElementsByClassName("ivm-view-attr__img--centered EntityPhoto-circle-4  presence-entity__image EntityPhoto-circle-4 lazy-image loaded ember-view")[0];
                    var name = TrimParsedString(div.getElementsByClassName("name actor-name")[0]);
                    var parsedName = ParseName(name);
                    var position = TrimParsedString(div.getElementsByClassName("subline-level-1 t-14 t-black t-normal search-result__truncate")[0]);
                    var location = TrimParsedString(div.getElementsByClassName("subline-level-2 t-12 t-black--light t-normal search-result__truncate")[0]);
                    if (_currentInvitationList.people.find(p => p.url == url.href))
                        continue;
                    let person =
                    {
                        imgUri: img == undefined ? "https://www.oblgazeta.ru/static/images/no-avatar.png" : img.src,
                        name: name,
                        firstName: parsedName.split("/")[0],
                        lastName: parsedName.split("/")[1],
                        position: position,
                        location: location,
                        isInvited: false,
                        isSelected: false,
                        isError: false,
                        url: url.href,
                    };
                    _currentInvitationList.people.push(person);                    
                }
                saveCurrentInvitationList();
                if (_currentInvitationList.people.length < _maxInvitationNum)
                    parseNextPageUrl();
                else
                    setState(CollectStateEnum.stopCollection);
            }, 1000);
        }, DocumentScrollDelta * 1000);
    }

    function ParseName(fullName)
    {
        if (fullName === "")
            return "";
        var preps = new Array("Mr.", "mr.", "MR.", "mr", "MR", "Mr", "MBA ", "PhD. ", "PhD ", "Ph.D. ", "Dr. ", "Dr ", "dr. ", "dr ", "Prof ", "Prof. ", "prof ", "prof. ", "MD ", "MD. ", "md ", "md. ");
        preps.forEach(p => fullName = fullName.replace(p, ""));
        fullName.replace(/[^A-Za-z]/g, "")
        var namesArray = fullName.split(" ");
        if (namesArray.length < 1)
            return fullName + "/" + fullName;
        return namesArray[0] + "/" + namesArray[namesArray.length - 1];
    }

    function TrimParsedString(div)
    {
        if (div == undefined || div.textContent === "")
            return "";
        return div.textContent.trim();
    };

    function parseNextPageUrl()
    {
        var nextButton = document.getElementsByClassName("artdeco-pagination__button artdeco-pagination__button--next artdeco-button artdeco-button--muted artdeco-button--icon-right artdeco-button--1 artdeco-button--tertiary ember-view")[0];
        if (nextButton == undefined || nextButton.disabled)
        {
            alert("No more people");
            setState(CollectStateEnum.stopCollection);
            return;
        }
        nextButton.click();
    };
    	
	whichClick = function(btn)
    {   
        if (btn.name === "cancel")
        {
            setState(CollectStateEnum.stopCollection);
            return;
        }
        
        if (btn.name === 'collect')
        {
            if(_currentView == CurrentViewEnum.invitationView)
            {
                if (window.location.toString().indexOf("facetNetwork=%5B%22S%22%5D") == -1)
                    _invitaionDlg.showInvitationDialog();
                else
                {
                    parseGeneralSearchPage();
                    setState(CollectStateEnum.collect);
                }   
            }
            else if(_currentView == CurrentViewEnum.messageView)
            {
                if (window.location.toString().indexOf("facetNetwork=%5B%22F%22%5D") == -1)
                {
                    window.history.pushState(null, null, 'https://www.linkedin.com/search/results/people/?facetNetwork=%5B%22F%22%5D&origin=FACETED_SEARCH');
                    setTimeout(() => window.history.back(), 200);
                    setTimeout(() => window.history.forward(), 500);
                }
                else
                {
                    parseFirstConnectionsPage(_currentMessageList, _maxMsgNum, saveCurrentMessageList);
                    setState(CollectStateEnum.collect);
                }
            }
            else if(_currentView == CurrentViewEnum.csvView)
            {
                if (window.location.toString().indexOf("facetNetwork=%5B%22F%22%5D") == -1)
                {
                    window.history.pushState(null, null, 'https://www.linkedin.com/search/results/people/?facetNetwork=%5B%22F%22%5D&origin=FACETED_SEARCH');
                    setTimeout(() => window.history.back(), 200);
                    setTimeout(() => window.history.forward(), 500);
                }
                else
                {
                    parseFirstConnectionsPage(_currentCsvList, _maxCsvNum, saveCurrentCsvList);
                    setState(CollectStateEnum.collect);
                }
            }
        }

        if (btn.name === "open")
        {
            if(_currentView == CurrentViewEnum.invitationView)
                _invitedList.showInvitedList(_state, _currentInvitationList, _securityLevel, _currentView);
            else if(_currentView == CurrentViewEnum.messageView)
                _invitedList.showInvitedList(_state, _currentMessageList, _securityLevel, _currentView);
            else if(_currentView == CurrentViewEnum.csvView)
                _invitedList.showInvitedList(_state, _currentCsvList, _securityLevel, _currentView);
        }

		if (_callback)
			_callback(btn.name);
    };

    updateInvitationView = function()
    {
        var collectBtn = document.getElementById("collectBtn"); 
        var cancelBtn = document.getElementById("cancelCollectBtn");
        var inviteSelector = document.getElementById("invitationsList");
        var initationNum = document.getElementById("invitationNumber");
        switch(_state)
        {
            case CollectStateEnum.collect:
                collectBtn.disabled = true;
                collectBtn.style="background-color: green";
                cancelBtn.disabled = false;
                cancelBtn.style = "background-color: #39c";
                inviteSelector.disabled = true;
                initationNum.disabled = true;
                document.getElementById("msgBtn").disabled = true;
                document.getElementById("csvBtn").disabled = true;
                break;          
            case CollectStateEnum.stopCollection: 
                collectBtn.disabled = false;
                collectBtn.style="background-color: #39c";
                cancelBtn.disabled = true;
                cancelBtn.style = "background-color: gray";
                inviteSelector.disabled = false;
                initationNum.disabled = false;
                document.getElementById("msgBtn").disabled = false;
                document.getElementById("csvBtn").disabled = false;
                break;          
            case CollectStateEnum.none:
                cancelBtn.disabled = true;
                cancelBtn.style = "background-color: gray";
                collectBtn.disabled = false;
                collectBtn.style="background-color: #39c";
                inviteSelector.disabled = false;
                initationNum.disabled = false;
                document.getElementById("cancelMsgCollectBtn").disabled = true;
                document.getElementById("cancelCsvCollectBtn").disabled = true;
                document.getElementById("msgBtn").disabled = false;
                document.getElementById("csvBtn").disabled = false;
                break;
            case CollectStateEnum.invitation:
                cancelBtn.disabled = true;
                cancelBtn.style = "background-color: gray";
                collectBtn.disabled = true;
                collectBtn.style="background-color: gray";
                inviteSelector.disabled = true;
                initationNum.disabled = true;
                document.getElementById("msgBtn").disabled = true;
                document.getElementById("csvBtn").disabled = true;
                break;
          }
    };
    
    updateCsvView = function()
    {
        var collectBtn = document.getElementById("collectCsvBtn"); 
        var cancelBtn = document.getElementById("cancelCsvCollectBtn");
        var selector = document.getElementById("csvList");
        var num = document.getElementById("csvNumber");
        switch(_state)
        {
            case CollectStateEnum.collect:
                collectBtn.disabled = true;
                collectBtn.style="background-color: green";
                cancelBtn.disabled = false;
                cancelBtn.style = "background-color: #39c";
                selector.disabled = true;
                num.disabled = true;
                document.getElementById("invitationsBtn").disabled = true;
                document.getElementById("msgBtn").disabled = true;
                break;          
            case CollectStateEnum.stopCollection: 
                collectBtn.disabled = false;
                collectBtn.style="background-color: #39c";
                cancelBtn.disabled = true;
                cancelBtn.style = "background-color: gray";
                selector.disabled = false;
                num.disabled = false;
                document.getElementById("invitationsBtn").disabled = false;
                document.getElementById("msgBtn").disabled = false;
                break;          
            case CollectStateEnum.none:
                cancelBtn.disabled = true;
                cancelBtn.style = "background-color: gray";
                collectBtn.disabled = false;
                collectBtn.style="background-color: #39c";
                selector.disabled = false;
                num.disabled = false;
                document.getElementById("invitationsBtn").disabled = false;
                document.getElementById("msgBtn").disabled = false;
                document.getElementById("cancelCollectBtn").disabled = true;
                document.getElementById("cancelMsgCollectBtn").disabled = true;
                break;
            case CollectStateEnum.invitation:
                cancelBtn.disabled = true;
                cancelBtn.style = "background-color: gray";
                collectBtn.disabled = true;
                collectBtn.style="background-color: gray";
                selector.disabled = true;
                num.disabled = true;
                document.getElementById("invitationsBtn").disabled = true;
                document.getElementById("msgBtn").disabled = true;
                break;
          }
    };

    updateMessageView = function()
    {
        var collectBtn = document.getElementById("collectMsgBtn"); 
        var cancelBtn = document.getElementById("cancelMsgCollectBtn");
        var selector = document.getElementById("msgList");
        var num = document.getElementById("msgNumber");
        switch(_state)
        {
            case CollectStateEnum.collect:
                collectBtn.disabled = true;
                collectBtn.style="background-color: green";
                cancelBtn.disabled = false;
                cancelBtn.style = "background-color: #39c";
                selector.disabled = true;
                num.disabled = true;
                document.getElementById("invitationsBtn").disabled = true;
                document.getElementById("csvBtn").disabled = true;
                break;          
            case CollectStateEnum.stopCollection: 
                collectBtn.disabled = false;
                collectBtn.style="background-color: #39c";
                cancelBtn.disabled = true;
                cancelBtn.style = "background-color: gray";
                selector.disabled = false;
                num.disabled = false;
                document.getElementById("invitationsBtn").disabled = false;
                document.getElementById("csvBtn").disabled = false;
                break;          
            case CollectStateEnum.none:
                cancelBtn.disabled = true;
                cancelBtn.style = "background-color: gray";
                collectBtn.disabled = false;
                collectBtn.style="background-color: #39c";
                selector.disabled = false;
                num.disabled = false;
                document.getElementById("invitationsBtn").disabled = false;
                document.getElementById("csvBtn").disabled = false;
                document.getElementById("cancelCollectBtn").disabled = true;
                document.getElementById("cancelCsvCollectBtn").disabled = true;
                break;
            case CollectStateEnum.invitation:
                cancelBtn.disabled = true;
                cancelBtn.style = "background-color: gray";
                collectBtn.disabled = true;
                collectBtn.style="background-color: gray";
                selector.disabled = true;
                num.disabled = true;
                document.getElementById("invitationsBtn").disabled = true;
                document.getElementById("csvBtn").disabled = true;
                break;
          }
    };

    setState = function(state)
    {
        _state = state;
        if(_currentView == CurrentViewEnum.invitationView)
            updateInvitationView();
        else if(_currentView == CurrentViewEnum.messageView)
            updateMessageView();
        else if(_currentView == CurrentViewEnum.csvView)
            updateCsvView();
    }
    
	getOffset = function(elm)
    {
		var rect = elm.getBoundingClientRect(),
			offsetX = window.scrollX || document.documentElement.scrollLeft,
			offsetY = window.scrollY || document.documentElement.scrollTop;
		return{
			left: rect.left + offsetX,
			top: rect.top + offsetY,
			right: rect.right + offsetX,
			bottom: rect.bottom + offsetY
		}
	};
	
    setCursor = function (cur)
    {
        _dialog.style.cursor = cur;
        _dialogTitle.style.cursor = cur;
        _buttons[0].style.cursor = cur;
    };
	
    setDialogContent = function ()
    {
		// Let's try to get rid of some of constants in javascript but use values from css
		var	_dialogContentStyle = getComputedStyle(_dialogContent),
			_dialogButtonPaneStyle,
			_dialogButtonPaneStyleBefore;
        if (_buttons.length > 1)
        {
			_dialogButtonPaneStyle = getComputedStyle(_dialogButtonPane);
			_dialogButtonPaneStyleBefore = getComputedStyle(_dialogButtonPane, ":before");
		}

		var w = _dialog.clientWidth,
			h = _dialog.clientHeight - (parseInt(_dialogContentStyle.top) // .dialog .content { top: 48px } 
				+ 16 // ?
				+ (_buttons.length > 1 ? 
					+ parseInt(_dialogButtonPaneStyleBefore.borderBottom) // .dialog .buttonpane:before { border-bottom: 1px; }
					- parseInt(_dialogButtonPaneStyleBefore.top) // .dialog .buttonpane:before { height: 0; top: -16px; }
					+ parseInt(_dialogButtonPaneStyle.height) // .dialog .buttonset button { height: 32px; }
					+ parseInt(_dialogButtonPaneStyle.bottom) // .dialog .buttonpane { bottom: 16px; }
					: 0 )
				); // Ensure to get minimal height
		_dialogContent.style.width = w + 'px';
		_dialogContent.style.height = h + 'px';

		if (_dialogButtonPane) // The buttonpane is optional
			_dialogButtonPane.style.width = w + 'px';

		_dialogTitle.style.width = w + 'px';
	};
	
    showDialog = function ()
    {
		_dialog.style.display = 'block';
		if (_buttons[1]) // buttons are optional
			_buttons[1].focus();
		else
			_buttons[0].focus();
    };

    function getRandomArbitrary(min, max)
    {
        return Math.random() * (max - min) + min;
    }

    chrome.runtime.onMessage.addListener(request =>
    {
        if (request.type === 'linkedOpened' && _state == CollectStateEnum.collect)
        {
            setTimeout(() =>
            {
                if(_currentView == CurrentViewEnum.invitationView)
                    parseGeneralSearchPage();
                else if(_currentView == CurrentViewEnum.messageView)
                    parseFirstConnectionsPage(_currentMessageList, _maxMsgNum, saveCurrentMessageList);
                else if(_currentView == CurrentViewEnum.csvView)
                    parseFirstConnectionsPage(_currentCsvList, _maxCsvNum, saveCurrentCsvList);
            }, getRandomArbitrary(minMilsecWaiting, maxMilsecWaiting));
        }
    });

    this.invitationListChange = function (event)
    {
        if (event.target.value != "Create new list")
            loadInvitationList();
        else
            _createListDialog.showCreateListDialog(_invitationLists);
        saveCurrentInvitationListName(event.target.value);
    }.bind(this);

    this.messageListChange = function (event)
    {
        if (event.target.value != "Create new list")
            loadCurrentMessageList();
        else
            _createListDialog.showCreateListDialog(_messageList);
        saveCurrentMessageListName(event.target.value);
    }.bind(this);

    this.csvListChange = function (event)
    {
        if (event.target.value != "Create new list")
            loadCurrentCsvList();
        else
            _createListDialog.showCreateListDialog(_csvList);
        saveCurrentCsvListName(event.target.value);
    }.bind(this);

    this.createNewList = function (listName)
    {
        if(_currentView == CurrentViewEnum.invitationView)
        {
            _invitationLists.splice(_invitationLists.length - 1, 0, listName);
            var invitationsLst = document.getElementById(invitationsList);
            invitationsLst.innerHTML = '';
            _invitationLists.forEach(name =>
            {
                var option = document.createElement("option");
                option.text = name;
                option.value = name;
                invitationsLst.add(option);
            });
            invitationsLst.value = listName;
            chrome.storage.local.set(
            {
                [invitationsList]: _invitationLists
            });

            saveCurrentInvitationListName(listName);
            _currentInvitationList =
            {
                type: "invitation",
                name: listName,
                people: [],
                message: "",
            };
            saveCurrentInvitationList();
        }
        else if(_currentView == CurrentViewEnum.messageView)
        {
            _messageList.splice(_messageList.length - 1, 0, listName);
            var msgList = document.getElementById(messageList);
            msgList.innerHTML = '';
            _messageList.forEach(name =>
            {
                var option = document.createElement("option");
                option.text = name;
                option.value = name;
                msgList.add(option);
            });
            msgList.value = listName;
            chrome.storage.local.set(
            {
                [messageList]: _messageList
            });
            saveCurrentMessageListName(listName);
            _currentMessageList =
            {
                type: "message",
                name: listName,
                people: [],
                message: "",
            };
            saveCurrentMessageList();
        }
        else if(_currentView == CurrentViewEnum.csvView)
        {
            _csvList.splice(_csvList.length - 1, 0, listName);
            var csvList = document.getElementById('csvList');
            csvList.innerHTML = '';
            _csvList.forEach(name =>
            {
                var option = document.createElement("option");
                option.text = name;
                option.value = name;
                csvList.add(option);
            });
            csvList.value = listName;
            chrome.storage.local.set({ 'csvList': _csvList });
            saveCurrentCsvListName(listName);
            _currentCsvList =
            {
                type: "csv",
                name: listName,
                people: [],
                message: "",
            };
            saveCurrentCsvList();
        }
        
    }.bind(this);

    this.init = function (id, callback)
    {
		_dialog = document.getElementById(id);
		_callback = callback; // Register callback function
		_dialog.style.visibility = 'hidden'; // We dont want to see anything..
		_dialog.style.display = 'block'; // but we need to render it to get the size of the dialog box
		_dialogTitle = _dialog.querySelector('.titlebar');
		_dialogContent = _dialog.querySelector('.customRootPanel');
		_dialogButtonPane = _dialog.querySelector('.buttonpane');
        _buttons = _dialog.querySelectorAll('button');  // Ensure to get minimal width
        _invitaionDlg = new invitationDialog();
        _invitedList = new invitedList(setState);
        _createListDialog = new createInvitationListDialog(this.createNewList);
        _setupDialog = new createSetupDialog();
        document.getElementById('linkedExtenderShowSetup').onclick = function()
        {
            _setupDialog.showSetupDialog(_securityLevel, _delimiter, setSecurityLevel, setDelimiter);
        }.bind(this);

        document.getElementById('customDialogMinimizeBtn').onclick = function()
        {
            if (_isMinimized == false)
                minimizeDialogContent();
            else
                maximizeDialogContent();            
            _isMinimized = !_isMinimized;
            saveDialogSettings();
        }.bind(this);

        document.getElementById(invitationsList).addEventListener('change', (event) =>
        {
            this.invitationListChange(event);
        });

        document.getElementById(messageList).addEventListener('change', (event) =>
        {
            this.messageListChange(event);
        });
        document.getElementById(csvList).addEventListener('change', (event) =>
        {
            this.csvListChange(event);
        });

        this.loadAllLists();

        document.getElementById("cancelCollectBtn").disabled = true;
        document.getElementById("cancelCollectBtn").style = "background-color: gray";
        document.getElementById("cancelMsgCollectBtn").disabled = true;
        document.getElementById("cancelMsgCollectBtn").style = "background-color: gray";
        document.getElementById("cancelCsvCollectBtn").disabled = true;
        document.getElementById("cancelCsvCollectBtn").style = "background-color: gray";

        var invitationsBtn = document.getElementById("invitationsBtn");
        invitationsBtn.onclick = function ()
        {
            openPanel('invitePnl', invitationsBtn);
        };
        var msgBtn = document.getElementById("msgBtn");
        msgBtn.onclick = function()
        {
            openPanel('msgPnl', msgBtn);
        };
        var csvBtn = document.getElementById("csvBtn");
        csvBtn.onclick = function()
        {
            openPanel('csvPnl', csvBtn);
        };

        openPanel('invitePnl', invitationsBtn);

		// Let's try to get rid of some of constants in javascript but use values from css
		var dialogStyle = getComputedStyle(_dialog),			
			dialogContentStyle = getComputedStyle(_dialogContent),
			dialogButtonPaneStyle,
			dialogButtonPaneStyleBefore,
			dialogButtonStyle;
        if (_buttons.length > 1)
        {
			dialogButtonPaneStyle = getComputedStyle(_dialogButtonPane);
			dialogButtonPaneStyleBefore = getComputedStyle(_dialogButtonPane, ":before");
			dialogButtonStyle = getComputedStyle(_buttons[1]);
        }
                
		setDialogContent();		
		
		_dialog.style.display = 'none'; // Let's hide it again..
		_dialog.style.visibility = 'visible'; // and undo visibility = 'hidden'

        _dialogTitle.tabIndex = '0';
        loadDialogSettings();

        var iniviteNumInput = document.getElementById("invitationNumber");
        setInputFilter(iniviteNumInput, function(value) 
        {
            return /^\d*$/.test(value);
        });
        iniviteNumInput.addEventListener("change", function ()
        {
            if(iniviteNumInput.value == '')
                iniviteNumInput.value = 1;
            _maxInvitationNum = iniviteNumInput.value;
            saveInvitationNum();
        }.bind(this), false);

        var msgNumInput = document.getElementById('msgNumber');
        setInputFilter(msgNumInput, function(value) 
        {
            return /^\d*$/.test(value);
        });
        msgNumInput.addEventListener("change", function ()
        {
            if(msgNumInput.value == '')
                msgNumInput.value = 1;
            _maxMsgNum = msgNumInput.value;
            saveMsgNum();
        }.bind(this), false);

        var csvNumInput = document.getElementById('csvNumber');
        setInputFilter(csvNumInput, function(value) 
        {
            return /^\d*$/.test(value);
        });
        csvNumInput.addEventListener("change", function ()
        {
            if(csvNumInput.value == '')
                csvNumInput.value = 1;
            _maxCsvNum = csvNumInput.value;
            saveCsvNum();
        }.bind(this), false);

		_tabBoundary = document.createElement('div');
		_tabBoundary.tabIndex = '0';
		_dialog.appendChild(_tabBoundary);

		addEvent(_dialog, 'mousedown', onMouseDown);
		// mousemove might run out of the dialog during resize, therefore we need to 
		// attach the event to the whole document, but we need to take care not to mess 
		// up normal events outside of the dialog.
		addEvent(document, 'mousemove', onMouseMove);
		// mouseup might happen out of the dialog during resize, therefore we need to 
		// attach the event to the whole document, but we need to take care not to mess 
		// up normal events outside of the dialog.
		addEvent(document, 'mouseup', onMouseUp);
		if (_buttons[0].textContent == '') // Use default symbol X if no other symbol is provided
			_buttons[0].innerHTML = '&#x2716;'; // use of innerHTML is required to show  Unicode characters
        for (var i = 0; i < _buttons.length; i++)
        {
			addEvent(_buttons[i], 'click', onClick);
			addEvent(_buttons[i], 'focus', onFocus);
			addEvent(_buttons[i], 'blur', onBlur);
		}
		addEvent(_dialogTitle, 'focus', adjustFocus);
        addEvent(_tabBoundary, 'focus', adjustFocus);
        addEvent(window, 'scroll', function ()
        {
            var tmp = _last_known_scroll_position;
            _last_known_scroll_position = window.scrollY;
            calcDialogPos(_last_known_scroll_position - tmp);
        });

        _zIndex = _dialog.style.zIndex;        
    };

    function calcDialogPos(scroll_pos)
    {        
        if (_dialog != null)
        {
            var top = parseFloat(customDialog.style.top);
            if (isNaN(top))
                top = 50;
            _dialog.style.top = scroll_pos + top + 'px';
            saveDialogSettings();
        }
    };

    loadInvitationList = function ()
    {
        var element = document.getElementById(invitationsList);
        var listName = element.value;
        chrome.storage.local.get(listName + '_invitation', function (result)
        {
            if (result[listName + '_invitation'] == undefined)
            {
                _currentInvitationList =
                    {
                        type: "invitation",
                        name: listName,
                        people: [],
                        message: "",
                    };
            }
            else
                _currentInvitationList = result[listName + '_invitation'];
        });
    };

    loadCurrentMessageList = function ()
    {
        var element = document.getElementById(messageList);
        var listName = element.value;
        chrome.storage.local.get(listName + '_message', function (result)
        {
            if (result[listName + '_message'] == undefined)
            {
                _currentMessageList =
                    {
                        type: "message",
                        name: listName,
                        people: [],
                        message: "",
                    };
            }
            else
                _currentMessageList = result[listName + '_message'];
        });
    };

    loadCurrentCsvList = function ()
    {
        var element = document.getElementById(csvList);
        var listName = element.value;
        chrome.storage.local.get(listName + '_csv', function (result)
        {
            if (result[listName + '_csv'] == undefined)
            {
                _currentCsvList =
                    {
                        type: "csv",
                        name: listName,
                        people: [],
                        message: "",
                    };
            }
            else
                _currentCsvList = result[listName + '_csv'];
        });
    };

    saveCurrentInvitationListName = function (name)
    {
        chrome.storage.local.set({ "currentInvitationListName": name });
    };

    saveCurrentMessageListName = function (name)
    {
        chrome.storage.local.set({"currentMessageListName": name });
    };

    saveCurrentCsvListName = function (name)
    {
        chrome.storage.local.set({"currentCsvListName": name });
    }

    this.loadCurrentInvitationListName = function ()
    {
        chrome.storage.local.get("currentInvitationListName", function (result)
        {
            var element = document.getElementById(invitationsList);
            var name = result["currentInvitationListName"];            
            element.value = name;
            loadInvitationList();
        });

    }.bind(this);

    this.loadCurrentMessageListName = function()
    {
        chrome.storage.local.get("currentMessageListName", function (result)
        {
            var element = document.getElementById(messageList);
            var name = result["currentMessageListName"];            
            element.value = name;
            loadCurrentMessageList();
        });
    }.bind(this);

    this.loadCurrentCsvListName = function()
    {
        chrome.storage.local.get("currentCsvListName", function (result)
        {
            var element = document.getElementById(csvList);
            var name = result["currentCsvListName"];            
            element.value = name;
            loadCurrentCsvList();
        });
    }.bind(this);

    this.loadAllLists = function ()
    {
        let defaultListName = 'Default';
        chrome.storage.local.get([invitationsList], function (result)
        {
            let isFound = true;
            if (result[invitationsList] == undefined)
            {
                _invitationLists.push(defaultListName);
                _invitationLists.push('Create new list');
                _currentInvitationList =
                {
                    type: "invitation",
                    name: defaultListName,
                    people: [],
                    message: "",
                };
                saveCurrentInvitationListName(defaultListName);
                saveCurrentInvitationList();
                isFound = false;
            }
            else
                _invitationLists = result[invitationsList];            
            
            var invitationsSelector = document.getElementById(invitationsList);
            _invitationLists.forEach(listName => {
                var option = document.createElement("option");
                option.text = listName;
                option.value = listName;
                invitationsSelector.add(option);
            });
            if(!isFound)
                invitationsSelector.value = defaultListName;
        });
        chrome.storage.local.get([messageList], function(result)
        {
            let isFound = true;
            if(result[messageList] == undefined)
            {
                _messageList.push(defaultListName);
                _messageList.push('Create new list');
                _currentMessageList =
                {
                    type: "message",
                    name: defaultListName,
                    people: [],
                    message: "",
                };
                saveCurrentMessageListName(defaultListName);
                saveCurrentMessageList();
                isFound = false;
            }
            else
                _messageList = result[messageList];            
            
            var msgSelector = document.getElementById(messageList);
            _messageList.forEach(listName => {
                var option = document.createElement("option");
                option.text = listName;
                option.value = listName;
                msgSelector.add(option);
            });
            if(!isFound)
                msgSelector.value = defaultListName;
        });
        chrome.storage.local.get([csvList], function(result)
        {
            let isFound = true;
            if(result[csvList] == undefined)
            {
                _csvList.push(defaultListName);
                _csvList.push('Create new list');
                _currentCsvList =
                {
                    type: "csv",
                    name: defaultListName,
                    people: [],
                    message: "",
                };
                saveCurrentCsvListName(defaultListName);
                saveCurrentCsvList();
                isFound = false;
            }
            else
                _csvList = result[csvList];            
            
            var csvSelector = document.getElementById(csvList);
            _csvList.forEach(listName => {
                var option = document.createElement("option");
                option.text = listName;
                option.value = listName;
                csvSelector.add(option);
            });
            if(!isFound)
                csvSelector.value = defaultListName;
        });
        this.loadCurrentInvitationListName();
        this.loadCurrentMessageListName();
        this.loadCurrentCsvListName();
    };

    saveCurrentInvitationList = function ()
    {
        var name = _currentInvitationList.name + '_invitation';
        chrome.storage.local.set({ [name]: _currentInvitationList});
    };

    saveCurrentMessageList = function ()
    {
        var name = _currentMessageList.name + '_message';
        chrome.storage.local.set({ [name]: _currentMessageList});
    };

    saveCurrentCsvList = function ()
    {
        var name = _currentCsvList.name + '_csv';
        chrome.storage.local.set({ [name]: _currentCsvList});
    };

    function saveInvitationNum()
    {
        if (_dialog != null)
            chrome.storage.local.set({ 'invitationNum': _maxInvitationNum });
    }

    function saveMsgNum()
    {
        if (_dialog != null)
            chrome.storage.local.set({ 'msgNum': _maxMsgNum });
    }

    function saveCsvNum()
    {
        if (_dialog != null)
            chrome.storage.local.set({ 'csvNum': _maxCsvNum });
    }

    function saveDialogSettings()
    {
        if (_dialog != null)
        {
            chrome.storage.local.set({ 'relativeTop': (parseFloat(_dialog.style.top) - window.scrollY) / window.innerHeight });
            chrome.storage.local.set({ 'relativeLeft': (parseFloat(_dialog.style.left) - window.scrollX) / window.innerWidth });            
            chrome.storage.local.set({ 'dialogState': _isMinimized });
        }
    };

    function loadDialogSettings()
    {
        if (_dialog != null)
        {
            chrome.storage.local.get('dialogState', function (result)
            {
                _isMinimized = result.dialogState;
                if (_isMinimized == false)
                    maximizeDialogContent();
                else
                    minimizeDialogContent();
                _isMinimized != _isMinimized;
            });

            chrome.storage.local.get('relativeTop', function (result)
            {
                var relativeTop = result.relativeTop;
                _dialog.style.top = window.innerHeight * relativeTop + window.scrollY + 'px';
            });
            chrome.storage.local.get('relativeLeft', function (result)
            {
                var relativeLeft = result.relativeLeft;
                _dialog.style.left = window.innerWidth * relativeLeft + window.scrollX + 'px';
            });
            chrome.storage.local.get('invitationNum', function (result)
            {
                if(result['invitationNum'] == undefined || result['invitationNum'] == '')
                    _maxInvitationNum  = 10;
                else
                    _maxInvitationNum = result['invitationNum'];
                document.getElementById('invitationNumber').value = _maxInvitationNum
            });
            chrome.storage.local.get('msgNum', function (result)
            {
                if(result['msgNum'] == undefined || result['msgNum'] == '')
                    _maxMsgNum  = 10;
                else
                    _maxMsgNum = result['msgNum'];
                document.getElementById('msgNumber').value = _maxMsgNum
            });
            chrome.storage.local.get('csvNum', function (result)
            {
                if(result['csvNum'] == undefined || result['csvNum'] == '')
                    _maxCsvNum  = 10;
                else
                    _maxCsvNum = result['csvNum'];
                document.getElementById('csvNumber').value = _maxCsvNum
            });
            chrome.storage.local.get('linkedExtendreSecurityLevel', function (result)
            {
                if(result['linkedExtendreSecurityLevel'] == undefined)
                    _securityLevel = SecurityLevelEnum.safe;
                else
                    _securityLevel = result['linkedExtendreSecurityLevel'];
            });
            chrome.storage.local.get('linkedExtenderDelimiter', function (result)
            {
                if(result['linkedExtenderDelimiter'] == undefined)
                    _delimiter = ',';
                else
                    _delimiter = result['linkedExtenderDelimiter'];
            });
        }
    };

    function setInputFilter(textbox, inputFilter)
    {
        ["input", "keydown", "keyup", "mousedown", "mouseup", "select", "contextmenu", "drop"].forEach(function(event)
        {
            textbox.addEventListener(event, function()
            {
                if (inputFilter(this.value))
                {
                    this.oldValue = this.value;
                    this.oldSelectionStart = this.selectionStart;
                    this.oldSelectionEnd = this.selectionEnd;
                } 
                else if (this.hasOwnProperty("oldValue"))
                {
                    this.value = this.oldValue;
                    this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
                }
                else 
                {
                    this.value = "";
                }
            });
        });
    };

    function setSecurityLevel(level)
    {
        _securityLevel = level;
        saveSecurityLevel();
    }

    function setDelimiter(delimiter)
    {
        _delimiter = delimiter;
        saveDelimiter();
    }

    function saveDelimiter()
    {
        chrome.storage.local.set({ 'linkedExtenderDelimiter': _delimiter });
    }

    function saveSecurityLevel()
    {
        chrome.storage.local.set({ 'linkedExtendreSecurityLevel': _securityLevel });
    }

    // Execute constructor
	this.init(id, callback);

	// Public interface 
    this.showDialog = showDialog;
	return this;
}