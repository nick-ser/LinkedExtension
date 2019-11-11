const CollectStateEnum = Object.freeze({ "chooseSource": 1, "collect": 2, "stopCollection": 3 })
const SetUrlRequest = "SetUrl";

function DialogBox(id, callback) {
let	_minW = 100, // The exact value get's calculated
	_minH = 1, // The exact value get's calculated
	_resizePixel = 5,
	_hasEventListeners = !!window.addEventListener,
    _last_known_scroll_position = 0,
    _dialog,
    _prevHeight = Number.NaN,
    _prevWidth = Number.NaN,
	_dialogTitle,
	_dialogContent,
	_dialogButtonPane,
	_maxX, _maxY,
	_startX, _startY,
	_startW, _startH,
	_leftPos, _topPos,
    _isDrag = false,
    _isMinimized = false,
	_isResize = false,
	_isButton = false,
	_isButtonHovered = false, // Let's use standard hover (see css)
	//_isClickEvent = true, // Showing several dialog boxes work better if I do not use this variable
	_resizeMode = '',
	_whichButton,
	_buttons,
	_tabBoundary,
	_callback, // Callback function which transfers the name of the selected button to the caller
	_zIndex, // Initial zIndex of this dialog box 
	_zIndexFlag = false, // Bring this dialog box to front 
	_setCursor, // Forward declaration to get access to this function in the closure
	_whichClick, // Forward declaration to get access to this function in the closure
	_setDialogContent, // Forward declaration to get access to this function in the closure
	
	_addEvent = function(elm, evt, callback) {
		if (elm == null || typeof(elm) == undefined)
			return;
		if (_hasEventListeners)
			elm.addEventListener(evt, callback, false);
		else if (elm.attachEvent)
			elm.attachEvent('on' + evt, callback);
		else
			elm['on' + evt] = callback;
	},
	
	_returnEvent = function(evt) {
		if (evt.stopPropagation)
			evt.stopPropagation();
		if (evt.preventDefault)
			evt.preventDefault();
		else {
			evt.returnValue = false;
			return false;
		}
	},
	
	_adjustFocus = function(evt) {
		evt = evt || window.event;
		if (evt.target === _dialogTitle)
			_buttons[_buttons.length - 1].focus();
		else
			_buttons[0].focus();
		return _returnEvent(evt);
	},
	
	_onFocus = function(evt) {
		evt = evt || window.event;
		evt.target.classList.add('focus');
		return _returnEvent(evt);
	},
	
	_onBlur = function(evt) {
		evt = evt || window.event;
		evt.target.classList.remove('focus');
		return _returnEvent(evt);
	},
	
	_onClick = function(evt) {
		evt = evt || window.event;
        //if (_isClickEvent)
			_whichClick(evt.target);
		//else
		//	_isClickEvent = true;
		return _returnEvent(evt);
	},
	
	_onMouseDown = function(evt) {
		evt = evt || window.event;
		_zIndexFlag = true;
		// mousedown might happen on any place of the dialog box, therefore 
		// we need to take care that this does not to mess up normal events 
		// on the content of the dialog box, i.e. to copy text
		if ( !(evt.target === _dialog || evt.target === _dialogTitle || evt.target === _buttons[0]))
			return;
		var rect = _getOffset(_dialog);
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
		if (_isButtonHovered) {
			//_whichButton.classList.remove('hover');
			_whichButton.classList.remove('focus');
			_whichButton.classList.add('active');
			_isButtonHovered = false;
			_isButton = true;
		}
		else if (evt.target === _dialogTitle && _resizeMode == '') {
			_setCursor('move');
			_isDrag = true;
		}
		else if (_resizeMode != '') {
			_isResize = true;
		}	
		var r = _dialog.getBoundingClientRect();
		return _returnEvent(evt);
	},
	
	_onMouseMove = function(evt) {
		evt = evt || window.event;
		// mousemove might run out of the dialog box during drag or resize, therefore we need to 
		// attach the event to the whole document, but we need to take care that this  
		// does not to mess up normal events outside of the dialog box.
		if ( !(evt.target === _dialog || evt.target === _dialogTitle || evt.target === _buttons[0]) && !_isDrag && _resizeMode == '')
			return;
		if (_isDrag) {
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
		}
		else if (_isResize) {
			var dw, dh, w, h;
            if (_resizeMode == 'w') {
				dw = _startX - evt.pageX;
				if (_leftPos - dw < 0)
					dw = _leftPos;
				w = _startW + dw;
				if (w < _minW) {
					w = _minW;
					dw = w - _startW;
				}
				_dialog.style.width = w + 'px';
				_dialog.style.left = (_leftPos - dw) + 'px'; 
			}
            else if (_resizeMode == 'e') {
				dw = evt.pageX - _startX;
				if (_leftPos + _startW + dw > _maxX)
					dw = _maxX - _leftPos - _startW;
				w = _startW + dw;
				if (w < _minW)
					w = _minW;
				_dialog.style.width = w + 'px';
			}
            else if (_resizeMode == 'n') {
				dh = _startY - evt.pageY;
				if (_topPos - dh < 0)
					dh = _topPos;
				h = _startH + dh;
				if (h < _minH) {
					h = _minH;
					dh = h - _startH;
				}
				_dialog.style.height = h + 'px';
				_dialog.style.top = (_topPos - dh) + 'px';
			}
            else if (_resizeMode == 's') {
				dh = evt.pageY - _startY;
				if (_topPos + _startH + dh > _maxY)
					dh = _maxY - _topPos - _startH;
				h = _startH + dh;
				if (h < _minH)
					h = _minH;
				_dialog.style.height = h + 'px';
			}
            else if (_resizeMode == 'nw') {
				dw = _startX - evt.pageX;
				dh = _startY - evt.pageY;
				if (_leftPos - dw < 0)
					dw = _leftPos;
				if (_topPos - dh < 0)
					dh = _topPos;
				w = _startW + dw;
				h = _startH + dh;
				if (w < _minW) {
					w = _minW;
					dw = w - _startW;
				}
				if (h < _minH) {
					h = _minH;
					dh = h - _startH;
				}
				_dialog.style.width = w + 'px';
				_dialog.style.height = h + 'px';
				_dialog.style.left = (_leftPos - dw) + 'px'; 
				_dialog.style.top = (_topPos - dh) + 'px';
			}
            else if (_resizeMode == 'sw') {
				dw = _startX - evt.pageX;
				dh = evt.pageY - _startY;
				if (_leftPos - dw < 0)
					dw = _leftPos;
				if (_topPos + _startH + dh > _maxY)
					dh = _maxY - _topPos - _startH;
				w = _startW + dw;
				h = _startH + dh;
				if (w < _minW) {
					w = _minW;
					dw = w - _startW;
				}
				if (h < _minH)
					h = _minH;
				_dialog.style.width = w + 'px';
				_dialog.style.height = h + 'px';
				_dialog.style.left = (_leftPos - dw) + 'px'; 
			}
            else if (_resizeMode == 'ne') {
				dw = evt.pageX - _startX;
				dh = _startY - evt.pageY;
				if (_leftPos + _startW + dw > _maxX)
					dw = _maxX - _leftPos - _startW;
				if (_topPos - dh < 0)
					dh = _topPos;
				w = _startW + dw;
				h = _startH + dh;
				if (w < _minW)
					w = _minW;
				if (h < _minH) {
					h = _minH;
					dh = h - _startH;
				}
				_dialog.style.width = w + 'px';
				_dialog.style.height = h + 'px';
				_dialog.style.top = (_topPos - dh) + 'px';
			}
            else if (_resizeMode == 'se') {
				dw = evt.pageX - _startX;
				dh = evt.pageY - _startY;
				if (_leftPos + _startW + dw > _maxX)
					dw = _maxX - _leftPos - _startW;
				if (_topPos + _startH + dh > _maxY)
					dh = _maxY - _topPos - _startH;
				w = _startW + dw;
				h = _startH + dh;
				if (w < _minW)
					w = _minW;
				if (h < _minH)
					h = _minH;
				_dialog.style.width = w + 'px';
                _dialog.style.height = h + 'px';
                _setDialogContent();
            }
            resizeDialogTitle();
            saveDialogSettings();
        }
		else if (!_isButton) {
			var cs, rm = '';
			if (evt.target === _dialog || evt.target === _dialogTitle || evt.target === _buttons[0]) {
				var rect = _getOffset(_dialog);
				if (evt.pageY < rect.top + _resizePixel)
					rm = 'n';
				else if (evt.pageY > rect.bottom - _resizePixel)
					rm = 's';
				if (evt.pageX < rect.left + _resizePixel)
					rm += 'w';
				else if (evt.pageX > rect.right - _resizePixel)
					rm += 'e';
			}
			if (rm != '' && _resizeMode != rm) {
				if (rm == 'n' || rm == 's')
					cs = 'ns-resize';
				else if (rm == 'e' || rm == 'w')
					cs = 'ew-resize';
				else if (rm == 'ne' || rm == 'sw')
					cs = 'nesw-resize';
				else if (rm == 'nw' || rm == 'se')
					cs = 'nwse-resize';
				_setCursor(cs);
				_resizeMode = rm;
			}
			else if (rm == '' && _resizeMode != '') {
				_setCursor('');
				_resizeMode = '';
			}
			if (evt.target != _buttons[0] && evt.target.tagName.toLowerCase() == 'button' || evt.target === _buttons[0] && rm == '') {
				if (!_isButtonHovered || _isButtonHovered && evt.target != _whichButton) {
					_whichButton = evt.target;
					//_whichButton.classList.add('hover');
					_isButtonHovered = true;
				}
			}
			else if (_isButtonHovered) {
				//_whichButton.classList.remove('hover');
				_isButtonHovered = false;
			}
        }
		return _returnEvent(evt);
	};

    function resizeDialogTitle() {
        if (_dialogTitle != null) {
            _dialogTitle.style.width = parseFloat(_dialog.style.width) - 32 + 'px';
        }
    };
	
    _onMouseUp = function (evt) {
        evt = evt || window.event;
        if (_zIndexFlag) {
            _dialog.style.zIndex = _zIndex + 1;
            _zIndexFlag = false;
        } else {
            _dialog.style.zIndex = _zIndex;
        }
        // mousemove might run out of the dialog box during drag or resize, therefore we need to 
        // attach the event to the whole document, but we need to take care that this  
        // does not to mess up normal events outside of the dialog box.
        if (!(evt.target === _dialog || evt.target === _dialogTitle || evt.target === _buttons[0]) && !_isDrag && _resizeMode == '')
            return;
        //_isClickEvent = false;
        if (_isDrag) {
            _setCursor('');
            _isDrag = false;
        }
        else if (_isResize) {
            _setCursor('');
            _isResize = false;
            _resizeMode = '';
        }
        else if (_isButton) {
            _whichButton.classList.remove('active');
            _isButton = false;
        }
        //else
        //_isClickEvent = true;
        return _returnEvent(evt);
    },

    _minimizeDialogContent = function () {
        _prevHeight = _dialog.style.height;
        _dialog.style.minHeight = 34 + 'px';
        _dialog.style.height = 34 + 'px';
        _prevWidth = _dialog.style.width;
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

    _maximizeDialogContent = function () {
        _dialog.style.minHeight = '280px';
        _dialog.style.minWidth = '400px';
        if (isNaN(parseFloat(_prevHeight)))
            _dialog.style.height = _dialog.style.minHeight;
        else
            _dialog.style.height = _prevHeight;
        if (isNaN(parseFloat(_prevWidth)))
            _dialog.style.width = _dialog.style.minWidth;
        else
            _dialog.style.width = _prevWidth;
        _dialog.style.top = (window.innerHeight - (window.innerHeight - _dialog.style.height) + window.scrollY) - 51 + 'px';
        _dialogContent.style.visibility = 'visible';
        _dialogContent.style.display = 'block';

        if (_dialogButtonPane) {
            _dialogButtonPane.style.visibility = 'visible';
            _dialogButtonPane.style.display = 'block';
        }
        _setDialogContent();
    }
	
	_whichClick = function(btn)
    {        
        if (btn.name === 'minimize')
        {
            if (_isMinimized == false)
                _minimizeDialogContent();
            else
                _maximizeDialogContent();            
            _isMinimized = !_isMinimized;
            saveDialogSettings();
        }
        if (btn.name === 'collect')
        {
            if (window.location.toString().indexOf("linkedin.com/search/results/people/") == -1) {
                var dlg = document.querySelector(".modalInvitationDlg");
                if (dlg == null) {
                    var div = document.createElement('div')
                    div.style.zIndex = 1;
                    div.className = 'modalInvitationDlg';
                    div.innerHTML = `<div class="modal-content">
                    <p align="center">From which page do you want to collect</p>
                    <div class="buttons">
                      <button class="generalPageBtn" name="collect">Go to General LinkedIn Search Page</button>
                    </div>
                    <div class="cancelpane">
                      <button class="close-btn" name="cancel">Cancel</button>
                    </div>
                    </div>
                  </div>`;
                    document.body.appendChild(div);
                    div.style.display = "block";
                    var generalPageBtn = document.querySelector(".generalPageBtn");
                    generalPageBtn.onclick = function () {
                        chrome.runtime.sendMessage({ greeting: SetUrlRequest });
                    }
                    var closeBtn = document.querySelector(".close-btn");
                    closeBtn.onclick = function () {
                        div.style.display = "none"
                    }
                }
                else {
                    dlg.style.display = "block";
                }
                btn.state = CollectStateEnum.chooseSource;
            }
            else if (btn.state == undefined || btn.state == CollectStateEnum.chooseSource) {
                alert("Start collection");
                btn.state = CollectStateEnum.collect;
            }
            else if (btn.state == CollectStateEnum.collect) {
                alert("Stop collection");
                btn.state = CollectStateEnum.stopCollection;
            }
        }

		if (_callback)
			_callback(btn.name);
	},
	
	_getOffset = function(elm) {
		var rect = elm.getBoundingClientRect(),
			offsetX = window.scrollX || document.documentElement.scrollLeft,
			offsetY = window.scrollY || document.documentElement.scrollTop;
		return {
			left: rect.left + offsetX,
			top: rect.top + offsetY,
			right: rect.right + offsetX,
			bottom: rect.bottom + offsetY
		}
	},
	
	_setCursor = function(cur) {
		_dialog.style.cursor = cur;
		_dialogTitle.style.cursor = cur;
		_buttons[0].style.cursor = cur;
	},
	
	_setDialogContent = function() {
		// Let's try to get rid of some of constants in javascript but use values from css
		var	_dialogContentStyle = getComputedStyle(_dialogContent),
			_dialogButtonPaneStyle,
			_dialogButtonPaneStyleBefore;
		if (_buttons.length > 1) {
			_dialogButtonPaneStyle = getComputedStyle(_dialogButtonPane);
			_dialogButtonPaneStyleBefore = getComputedStyle(_dialogButtonPane, ":before");
		}

		var w = _dialog.clientWidth 
				- parseInt( _dialogContentStyle.left) // .dialog .content { left: 16px; }
				- 16 // right margin?
				,
			h = _dialog.clientHeight - (
				parseInt(_dialogContentStyle.top) // .dialog .content { top: 48px } 
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
	},
	
	_showDialog = function() {
		_dialog.style.display = 'block';
		if (_buttons[1]) // buttons are optional
			_buttons[1].focus();
		else
			_buttons[0].focus();
	},
	
	_init = function(id, callback) {
		_dialog = document.getElementById(id);
		_callback = callback; // Register callback function

		_dialog.style.visibility = 'hidden'; // We dont want to see anything..
		_dialog.style.display = 'block'; // but we need to render it to get the size of the dialog box

		_dialogTitle = _dialog.querySelector('.titlebar');
		_dialogContent = _dialog.querySelector('.content');
		_dialogButtonPane = _dialog.querySelector('.buttonpane');
		_buttons = _dialog.querySelectorAll('button');  // Ensure to get minimal width

		// Let's try to get rid of some of constants in javascript but use values from css
		var dialogStyle = getComputedStyle(_dialog),			
			dialogContentStyle = getComputedStyle(_dialogContent),
			dialogButtonPaneStyle,
			dialogButtonPaneStyleBefore,
			dialogButtonStyle;
		if (_buttons.length > 1) {
			dialogButtonPaneStyle = getComputedStyle(_dialogButtonPane);
			dialogButtonPaneStyleBefore = getComputedStyle(_dialogButtonPane, ":before");
			dialogButtonStyle = getComputedStyle(_buttons[1]);
		}
        
		// Calculate minimal width
		_minW = Math.max(_dialog.clientWidth, _minW, 
			+ (_buttons.length > 1 ? 
				+ (_buttons.length - 1) * parseInt(dialogButtonStyle.width) // .dialog .buttonset button { width: 64px; }
				+ (_buttons.length - 1 - 1) * 16 // .dialog .buttonset button { margin-left: 16px; } // but not for first-child
				+ (_buttons.length - 1 - 1) * 16 / 2 // The formula is not correct, however, with fixed value 16 for margin-left: 16px it works
				: 0 )
			);
		_dialog.style.width = _minW + 'px';
		
		// Calculate minimal height
		_minH = Math.max(_dialog.clientHeight, _minH, 
			+ parseInt(dialogContentStyle.top) // .dialog .content { top: 48px } 
			+ (2 * parseInt(dialogStyle.border)) // .dialog { border: 1px }
			+ 16 // ?
			+ 12 // .p { margin-block-start: 1em; } // default
			+ 12 // .dialog { font-size: 12px; } // 1em = 12px
			+ 12 // .p { margin-block-end: 1em; } // default
			+(_buttons.length > 1 ?
				+ parseInt(dialogButtonPaneStyleBefore.borderBottom) // .dialog .buttonpane:before { border-bottom: 1px; }
				- parseInt(dialogButtonPaneStyleBefore.top) // .dialog .buttonpane:before { height: 0; top: -16px; }
				+ parseInt(dialogButtonPaneStyle.height) // .dialog .buttonset button { height: 32px; }
				+ parseInt(dialogButtonPaneStyle.bottom) // .dialog .buttonpane { bottom: 16px; }
				: 0 )
			);
		_dialog.style.height = _minH + 'px';

		_setDialogContent();		
		
		_dialog.style.display = 'none'; // Let's hide it again..
		_dialog.style.visibility = 'visible'; // and undo visibility = 'hidden'

        _dialogTitle.tabIndex = '0';
        loadDialogSettings();

		_tabBoundary = document.createElement('div');
		_tabBoundary.tabIndex = '0';
		_dialog.appendChild(_tabBoundary);

		_addEvent(_dialog, 'mousedown', _onMouseDown);
		// mousemove might run out of the dialog during resize, therefore we need to 
		// attach the event to the whole document, but we need to take care not to mess 
		// up normal events outside of the dialog.
		_addEvent(document, 'mousemove', _onMouseMove);
		// mouseup might happen out of the dialog during resize, therefore we need to 
		// attach the event to the whole document, but we need to take care not to mess 
		// up normal events outside of the dialog.
		_addEvent(document, 'mouseup', _onMouseUp);
		if (_buttons[0].textContent == '') // Use default symbol X if no other symbol is provided
			_buttons[0].innerHTML = '&#x2716;'; // use of innerHTML is required to show  Unicode characters
		for (var i = 0; i < _buttons.length; i++) {
			_addEvent(_buttons[i], 'click', _onClick);
			_addEvent(_buttons[i], 'focus', _onFocus);
			_addEvent(_buttons[i], 'blur', _onBlur);
		}
		_addEvent(_dialogTitle, 'focus', _adjustFocus);
		_addEvent(_tabBoundary, 'focus', _adjustFocus);

        _zIndex = _dialog.style.zIndex;        
    };

    function calcDialogPos(scroll_pos) {        
        if (_dialog != null) {
            var top = parseFloat(customDialog.style.top);
            if (isNaN(top))
                top = 50;
            _dialog.style.top = scroll_pos + top + 'px';
            saveDialogSettings();
        }
    };

    window.addEventListener('scroll', function (e) {
        var tmp = _last_known_scroll_position;
        _last_known_scroll_position = window.scrollY;
        calcDialogPos(_last_known_scroll_position - tmp);
    });

    function saveDialogSettings() {
        if (_dialog != null) {
            chrome.storage.local.set({ 'relativeTop': (parseFloat(_dialog.style.top) - window.scrollY) / window.innerHeight });
            chrome.storage.local.set({ 'relativeLeft': (parseFloat(_dialog.style.left) - window.scrollX) / window.innerWidth });            
            chrome.storage.local.set({ 'dialogState': _isMinimized });
            chrome.storage.local.set({ 'dialogHeight': _dialog.style.height });
            chrome.storage.local.set({ 'dialogWidth': _dialog.style.width });
        }
    };

    function loadDialogSettings(){
        if (_dialog != null) {
            chrome.storage.local.get('dialogState', function (result) {
                _isMinimized = result.dialogState;
                if (_isMinimized == false)
                    _maximizeDialogContent();
                else
                    _minimizeDialogContent();
                _isMinimized != _isMinimized;
            });

            chrome.storage.local.get('relativeTop', function (result) {
                var relativeTop = result.relativeTop;
                _dialog.style.top = window.innerHeight * relativeTop + window.scrollY + 'px';
            });

            chrome.storage.local.get('relativeLeft', function (result) {
                var relativeLeft = result.relativeLeft;
                _dialog.style.left = window.innerWidth * relativeLeft + window.scrollX + 'px';
            });

            chrome.storage.local.get('dialogHeight', function (result) {
                _dialog.style.height = result.dialogHeight;
            });

            chrome.storage.local.get('dialogWidth', function (result) {                
                _dialog.style.width = result.dialogWidth;
                resizeDialogTitle();
            });
        }
    };

    // Execute constructor
	_init(id, callback);

	// Public interface 
    this.showDialog = _showDialog;
	return this;
}