function DialogBox(id, needSignin)
{
    var MD5 = function (string)
    {
        function RotateLeft(lValue, iShiftBits)
        {
            return (lValue<<iShiftBits) | (lValue>>>(32-iShiftBits));
        }
    
        function AddUnsigned(lX,lY) 
        {
            var lX4,lY4,lX8,lY8,lResult;
            lX8 = (lX & 0x80000000);
            lY8 = (lY & 0x80000000);
            lX4 = (lX & 0x40000000);
            lY4 = (lY & 0x40000000);
            lResult = (lX & 0x3FFFFFFF)+(lY & 0x3FFFFFFF);
            if (lX4 & lY4) 
            {
                return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
            }
            if (lX4 | lY4)
            {
                if (lResult & 0x40000000)
                {
                    return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
                } else 
                {
                    return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
                }
            } else
            {
                return (lResult ^ lX8 ^ lY8);
            }
        }
    
        function F(x,y,z) { return (x & y) | ((~x) & z); }
        function G(x,y,z) { return (x & z) | (y & (~z)); }
        function H(x,y,z) { return (x ^ y ^ z); }
        function I(x,y,z) { return (y ^ (x | (~z))); }
    
        function FF(a,b,c,d,x,s,ac) {
            a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
            return AddUnsigned(RotateLeft(a, s), b);
        };
    
        function GG(a,b,c,d,x,s,ac) {
            a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
            return AddUnsigned(RotateLeft(a, s), b);
        };
    
        function HH(a,b,c,d,x,s,ac) {
            a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
            return AddUnsigned(RotateLeft(a, s), b);
        };
    
        function II(a,b,c,d,x,s,ac) {
            a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
            return AddUnsigned(RotateLeft(a, s), b);
        };
    
        function ConvertToWordArray(string) {
            var lWordCount;
            var lMessageLength = string.length;
            var lNumberOfWords_temp1=lMessageLength + 8;
            var lNumberOfWords_temp2=(lNumberOfWords_temp1-(lNumberOfWords_temp1 % 64))/64;
            var lNumberOfWords = (lNumberOfWords_temp2+1)*16;
            var lWordArray=Array(lNumberOfWords-1);
            var lBytePosition = 0;
            var lByteCount = 0;
            while ( lByteCount < lMessageLength ) {
                lWordCount = (lByteCount-(lByteCount % 4))/4;
                lBytePosition = (lByteCount % 4)*8;
                lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount)<<lBytePosition));
                lByteCount++;
            }
            lWordCount = (lByteCount-(lByteCount % 4))/4;
            lBytePosition = (lByteCount % 4)*8;
            lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80<<lBytePosition);
            lWordArray[lNumberOfWords-2] = lMessageLength<<3;
            lWordArray[lNumberOfWords-1] = lMessageLength>>>29;
            return lWordArray;
        };
    
        function WordToHex(lValue) {
            var WordToHexValue="",WordToHexValue_temp="",lByte,lCount;
            for (lCount = 0;lCount<=3;lCount++) {
                lByte = (lValue>>>(lCount*8)) & 255;
                WordToHexValue_temp = "0" + lByte.toString(16);
                WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length-2,2);
            }
            return WordToHexValue;
        };
    
        function Utf8Encode(string) {
            string = string.replace(/\r\n/g,"\n");
            var utftext = "";
    
            for (var n = 0; n < string.length; n++) {
    
                var c = string.charCodeAt(n);
    
                if (c < 128) {
                    utftext += String.fromCharCode(c);
                }
                else if((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
                else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
    
            }
    
            return utftext;
        };
    
        var x=Array();
        var k,AA,BB,CC,DD,a,b,c,d;
        var S11=7, S12=12, S13=17, S14=22;
        var S21=5, S22=9 , S23=14, S24=20;
        var S31=4, S32=11, S33=16, S34=23;
        var S41=6, S42=10, S43=15, S44=21;
    
        string = Utf8Encode(string);
    
        x = ConvertToWordArray(string);
    
        a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;
    
        for (k=0;k<x.length;k+=16) {
            AA=a; BB=b; CC=c; DD=d;
            a=FF(a,b,c,d,x[k+0], S11,0xD76AA478);
            d=FF(d,a,b,c,x[k+1], S12,0xE8C7B756);
            c=FF(c,d,a,b,x[k+2], S13,0x242070DB);
            b=FF(b,c,d,a,x[k+3], S14,0xC1BDCEEE);
            a=FF(a,b,c,d,x[k+4], S11,0xF57C0FAF);
            d=FF(d,a,b,c,x[k+5], S12,0x4787C62A);
            c=FF(c,d,a,b,x[k+6], S13,0xA8304613);
            b=FF(b,c,d,a,x[k+7], S14,0xFD469501);
            a=FF(a,b,c,d,x[k+8], S11,0x698098D8);
            d=FF(d,a,b,c,x[k+9], S12,0x8B44F7AF);
            c=FF(c,d,a,b,x[k+10],S13,0xFFFF5BB1);
            b=FF(b,c,d,a,x[k+11],S14,0x895CD7BE);
            a=FF(a,b,c,d,x[k+12],S11,0x6B901122);
            d=FF(d,a,b,c,x[k+13],S12,0xFD987193);
            c=FF(c,d,a,b,x[k+14],S13,0xA679438E);
            b=FF(b,c,d,a,x[k+15],S14,0x49B40821);
            a=GG(a,b,c,d,x[k+1], S21,0xF61E2562);
            d=GG(d,a,b,c,x[k+6], S22,0xC040B340);
            c=GG(c,d,a,b,x[k+11],S23,0x265E5A51);
            b=GG(b,c,d,a,x[k+0], S24,0xE9B6C7AA);
            a=GG(a,b,c,d,x[k+5], S21,0xD62F105D);
            d=GG(d,a,b,c,x[k+10],S22,0x2441453);
            c=GG(c,d,a,b,x[k+15],S23,0xD8A1E681);
            b=GG(b,c,d,a,x[k+4], S24,0xE7D3FBC8);
            a=GG(a,b,c,d,x[k+9], S21,0x21E1CDE6);
            d=GG(d,a,b,c,x[k+14],S22,0xC33707D6);
            c=GG(c,d,a,b,x[k+3], S23,0xF4D50D87);
            b=GG(b,c,d,a,x[k+8], S24,0x455A14ED);
            a=GG(a,b,c,d,x[k+13],S21,0xA9E3E905);
            d=GG(d,a,b,c,x[k+2], S22,0xFCEFA3F8);
            c=GG(c,d,a,b,x[k+7], S23,0x676F02D9);
            b=GG(b,c,d,a,x[k+12],S24,0x8D2A4C8A);
            a=HH(a,b,c,d,x[k+5], S31,0xFFFA3942);
            d=HH(d,a,b,c,x[k+8], S32,0x8771F681);
            c=HH(c,d,a,b,x[k+11],S33,0x6D9D6122);
            b=HH(b,c,d,a,x[k+14],S34,0xFDE5380C);
            a=HH(a,b,c,d,x[k+1], S31,0xA4BEEA44);
            d=HH(d,a,b,c,x[k+4], S32,0x4BDECFA9);
            c=HH(c,d,a,b,x[k+7], S33,0xF6BB4B60);
            b=HH(b,c,d,a,x[k+10],S34,0xBEBFBC70);
            a=HH(a,b,c,d,x[k+13],S31,0x289B7EC6);
            d=HH(d,a,b,c,x[k+0], S32,0xEAA127FA);
            c=HH(c,d,a,b,x[k+3], S33,0xD4EF3085);
            b=HH(b,c,d,a,x[k+6], S34,0x4881D05);
            a=HH(a,b,c,d,x[k+9], S31,0xD9D4D039);
            d=HH(d,a,b,c,x[k+12],S32,0xE6DB99E5);
            c=HH(c,d,a,b,x[k+15],S33,0x1FA27CF8);
            b=HH(b,c,d,a,x[k+2], S34,0xC4AC5665);
            a=II(a,b,c,d,x[k+0], S41,0xF4292244);
            d=II(d,a,b,c,x[k+7], S42,0x432AFF97);
            c=II(c,d,a,b,x[k+14],S43,0xAB9423A7);
            b=II(b,c,d,a,x[k+5], S44,0xFC93A039);
            a=II(a,b,c,d,x[k+12],S41,0x655B59C3);
            d=II(d,a,b,c,x[k+3], S42,0x8F0CCC92);
            c=II(c,d,a,b,x[k+10],S43,0xFFEFF47D);
            b=II(b,c,d,a,x[k+1], S44,0x85845DD1);
            a=II(a,b,c,d,x[k+8], S41,0x6FA87E4F);
            d=II(d,a,b,c,x[k+15],S42,0xFE2CE6E0);
            c=II(c,d,a,b,x[k+6], S43,0xA3014314);
            b=II(b,c,d,a,x[k+13],S44,0x4E0811A1);
            a=II(a,b,c,d,x[k+4], S41,0xF7537E82);
            d=II(d,a,b,c,x[k+11],S42,0xBD3AF235);
            c=II(c,d,a,b,x[k+2], S43,0x2AD7D2BB);
            b=II(b,c,d,a,x[k+9], S44,0xEB86D391);
            a=AddUnsigned(a,AA);
            b=AddUnsigned(b,BB);
            c=AddUnsigned(c,CC);
            d=AddUnsigned(d,DD);
        }
    
        var temp = WordToHex(a)+WordToHex(b)+WordToHex(c)+WordToHex(d);
    
        return temp.toLowerCase();
    }

    const CollectStateEnum = Object.freeze({ "none": 1, "collect": 2, "stopCollection": 3, "invitation": 4 });
    const SecurityLevelEnum = Object.freeze({ "safe": "Safe", "medium": "Medium", "low": "Low" });
    const CurrentViewEnum = Object.freeze({ "invitationView": 1, "messageView": 2, "csvView": 3 });
    const DocumentScrollDelta = 3;
    const invitationsList = "invitationsList";
    const messageList = "msgList";
    const csvList = "csvList";
    const minMilsecWaiting = 8000;
    const maxMilsecWaiting = 15000;
    const Version = "1.0.0.0";
    let _hasEventListeners = !!window.addEventListener,
        _last_known_scroll_position = 0,
        _dialog,
        _dialogTitle,
        _needSignin = false,
        _dialogContent,
        _signinContent,
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
        _delimiter = ',',
        _token = '';
	
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
        //saveDialogSettings();
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
        _dialog.style.minWidth = 230 + 'px';
        _dialog.style.width = 230 + 'px';
        
        _dialogContent.style.visibility = 'hidden';
        _dialogContent.style.display = 'none';

        _signinContent.style.visibility = 'hidden';
        _dialogTitle.style.width = '170px';
    },

    maximizeDialogContent = function ()
    {   
        _dialog.style.height = '195px';
        _dialog.style.width = '304px';
        _dialog.style.top = (window.innerHeight - (window.innerHeight - _dialog.style.height) + window.scrollY) - 51 + 'px';
        if(_needSignin)
        {
            _signinContent.style.visibility = 'visible';
        }
        else
        { 
            _dialogContent.style.visibility = 'visible';
            _dialogContent.style.display = 'block';
        }
        setDialogContent();
    }

    function sleep(ms)
    {
        return new Promise(resolve => setTimeout(resolve, ms));
    };

    async function smoothScrollCurrentDocument()
    {
        var delta = document.body.scrollHeight / DocumentScrollDelta;
        var offset = 0.0;
        for (var i = 0; i < DocumentScrollDelta; i++)
        {
            if (_state == CollectStateEnum.stopCollection)
                return;
            offset += delta;
            window.scrollTo(0, offset);
            await sleep(3000);
        }
    }

    parseFirstConnectionsPage = async function(currentList, maxNum, saveFunc)
    {
        await smoothScrollCurrentDocument();
        window.scrollTo(0, 0);
            
        var divs = document.getElementsByClassName("search-result__wrapper");
        if (divs == undefined || divs.length == 0)
        {
            alert("There is no people");
            setState(CollectStateEnum.stopCollection);
            return;
        }
        var count = await loadTempCount();
        for (var i = 0; i < divs.length; i++)
        {
            if (_state == CollectStateEnum.stopCollection || count >= maxNum)
            {
                if(count >= maxNum)
                    alert('Parsed ' + maxNum + ' accounts.');
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
                isSalesNavigator: false,
                isError: false,
                url: url.href,
            };
            currentList.people.push(person);
            count++;
        }
        saveFunc();
        if (currentList.people.length < maxNum)
        {
            await saveTempCount(count);
            parseNextPageUrl();
        }
        else
        {
            alert('Parsed ' + maxNum + ' accounts.');
            setState(CollectStateEnum.stopCollection);
        }
    };

    function loadTempCount()
    {
        return new Promise(resolve => 
        {
            chrome.storage.local.get('tempCount', function (result)
            {
                var count = result['tempCount'];
                if (count == undefined)
                    count = 0;
                resolve(count);
            })
        });
    };

    function saveTempCount(count)
    {
        return new Promise(resolve =>
        {
            chrome.storage.local.set({ 'tempCount': count });
            resolve();
        });
    };

    parseSalesNavigatorPage = async function()
    {
        await smoothScrollCurrentDocument();
        window.scrollTo(0, 0);

        var divs = document.getElementsByClassName("pv5 ph2 search-results__result-item");
        if (divs == undefined || divs.length == 0)
        {
            alert("There is no people");
            setState(CollectStateEnum.stopCollection);
            return;
        }
        var count = await loadTempCount();
        for (var i = 0; i < divs.length; i++)
        {
            if (_state == CollectStateEnum.stopCollection || count >= _maxInvitationNum)
            {
                if(count >= _maxInvitationNum)
                    alert('Parsed ' + _maxInvitationNum + ' accounts. Now you can start sending invitations.');
                setState(CollectStateEnum.stopCollection);
                return;
            }
            var div = divs[i];
            var alreadyInvitedMark = div.getElementsByClassName("result-lockup__badge-icon m-type--saved mr1")[0];
            if(alreadyInvitedMark != undefined)
                continue;
            var url = div.getElementsByClassName("result-lockup__icon-link ember-view")[0];
            if (url == undefined || url.href === "")
                continue;
            var img = div.getElementsByClassName("lazy-image max-width max-height circle-entity-4 loaded")[0];
            var dtName = div.getElementsByClassName("result-lockup__name")[0];
            if(dtName == undefined)
                continue;
            var name = TrimParsedString(dtName.getElementsByTagName('a')[0]);
            var parsedName = ParseName(name);
            var position = TrimParsedString(div.getElementsByClassName("t-14 t-bold")[0]);
            var location = TrimParsedString(div.getElementsByClassName("result-lockup__misc-item")[0]);
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
                isSalesNavigator: true,
                isError: false,
                url: url.href,
            };
            _currentInvitationList.people.push(person);
            count++;
        }
        saveCurrentInvitationList();
        if (count < _maxInvitationNum)
        {
            await saveTempCount(count);
            parseNextSalesNavigatorPage();
        }
        else
        {
            alert('Parsed ' + _maxInvitationNum + ' accounts. Now you can start sending invitations.');
            setState(CollectStateEnum.stopCollection);
        }
    };

    parseGeneralSearchPage = async function ()
    {
        await smoothScrollCurrentDocument();
        window.scrollTo(0, 0);
        
        var divs = document.getElementsByClassName("search-result__wrapper");
        if (divs == undefined || divs.length == 0)
        {
            alert("There is no people");
            setState(CollectStateEnum.stopCollection);
            return;
        }
        var count = await loadTempCount();
        for (var i = 0; i < divs.length; i++)
        {
            if (_state == CollectStateEnum.stopCollection || count >= _maxInvitationNum)
            {
                if(count >= _maxInvitationNum)
                    alert('Parsed ' + _maxInvitationNum + ' accounts. Now you can start sending invitations.');
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
                isSalesNavigator: false,
                isError: false,
                url: url.href,
            };
            _currentInvitationList.people.push(person);
            count++;
        }
        saveCurrentInvitationList();
        if (count < _maxInvitationNum)
        {
            await saveTempCount(count);
            parseNextPageUrl();
        }
        else
        {
            alert('Parsed ' + _maxInvitationNum + ' accounts. Now you can start sending invitations.');
            setState(CollectStateEnum.stopCollection);
        }
    };

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

    function parseNextSalesNavigatorPage()
    {
        var nextButton = document.getElementsByClassName("search-results__pagination-next-button")[0];
        if (nextButton == undefined || nextButton.disabled)
        {
            alert("No more people");
            setState(CollectStateEnum.stopCollection);
            return;
        }
        nextButton.click();
    }

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

    function saveCredentialsToken(login, pwd)
    {
        return new Promise(resolve =>
        {
            if(login == '' || pwd == '')
            {
                chrome.storage.local.set({ 'credentials': null });
                resolve();
                return;
            }
            let credentials = 
            {
                login: login,
                password: pwd
            };
            chrome.storage.local.set({ 'credentials': credentials });
            resolve();
        });
    };

    function loadCredentials()
    {
        return new Promise(resolve => 
        {
            chrome.storage.local.get('credentials', function (result)
            {
                var credentials = result['credentials'];
                if (credentials == undefined)
                    resolve(null);
                resolve(credentials);
            })
        });
    };

    refreshCredentials = async function()
    {
        var cred = await loadCredentials();
        await tryToSignIn(cred.login, cred.password);
    }

    this.signout = function(showLabel)
    {
        _needSignin = true;
        saveCredentialsToken('', '');
        _token = '';
        _signinContent.style.visibility = 'visible';
        _dialogContent.style.visibility = 'hidden';
        if(showLabel)
            document.getElementById('wrongPwdLabel').style.visibility = 'visible';
    }.bind(this);

    tryToSignIn = function (login, password)
    {
        return new Promise(resolve => 
        {
            chrome.runtime.sendMessage({ greeting: "signin", login: login, password: password }, response => 
            {
                if(response == '')
                {
                    this.signout(true);
                    resolve();
                }
                else
                {
                    var obj = JSON.parse(response);
                    if(obj.token != undefined && obj.token != '')
                    {
                        _needSignin = false;
                        _token = obj.token;
                        _signinContent.style.visibility = 'hidden';
                        minimizeOrMaximizeWnd();
                        document.getElementById('wrongPwdLabel').style.visibility = 'hidden';
                        getAccountInfo(login, password);
                    }
                    else
                        this.signout(true);
                    resolve();
                }
            });
        });
    };

    getAccountInfo = function (login, password)
    {
        return new Promise(resolve => 
        {
            chrome.runtime.sendMessage({ greeting: "subscriptioninfo", token: _token, login: login, password: password }, response =>
            {
                var info = JSON.parse(response);
                if(info.version != undefined && info.version != Version)
                    document.getElementById('linkedExtenderUpdate').style.visibility = 'visible';
                else
                    document.getElementById('linkedExtenderUpdate').style.visibility = 'hidden';
                saveAccountInfo(info);
                resolve();
            });
        });
    };
    	
	whichClick = async function(btn)
    {
        if(btn.name == "signin")
        {
            let login = document.getElementById('loginInput').value;
            let password = MD5(document.getElementById('passwordInput').value);
            if(login == '' || password == '')
                return;
            await new Promise(resolve =>
            {
                chrome.runtime.sendMessage({ greeting: "signin", login: login, password: password }, response => 
                {
                    if(response == '')
                    {
                        document.getElementById('passwordInput').value = '';
                        document.getElementById('wrongPwdLabel').style.visibility = 'visible';
                        resolve();
                    }
                    else
                    {
                        var obj = JSON.parse(response);
                        if(obj.token != undefined && obj.token != '')
                        {
                            _needSignin = false;
                            _token = obj.token;
                            saveCredentialsToken(login, password);
                            _signinContent.style.visibility = 'hidden';
                            _dialogContent.style.visibility = 'visible';
                            _dialogContent.style.display = 'block';
                            getAccountInfo(login, password);
                            document.getElementById('wrongPwdLabel').style.visibility = 'hidden';
                            document.getElementById('loginInput').value = '';
                            document.getElementById('passwordInput').value = '';
                        }
                        else
                        {
                            document.getElementById('passwordInput').value = '';
                            document.getElementById('wrongPwdLabel').style.visibility = 'visible';
                        }
                        resolve();
                    }
                });
            });
        }

        else if (btn.name === "cancel")
        {
            setState(CollectStateEnum.stopCollection);
            return;
        }
        
        else if (btn.name === 'collect')
        {
            await saveTempCount(0);
            if(_currentView == CurrentViewEnum.invitationView)
            {
                let currentUrl = window.location.toString();
                if (currentUrl.indexOf("facetNetwork=%5B%22S%22%5D") == -1 &&
                    currentUrl.indexOf("sales/search/people") == -1)
                    _invitaionDlg.showInvitationDialog();
                else
                {
                    if (currentUrl.indexOf("facetNetwork=%5B%22S%22%5D") != -1)
                        parseGeneralSearchPage();
                    else if(currentUrl.indexOf("sales/search/people") != -1)
                        parseSalesNavigatorPage();
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

        else if (btn.name === "open")
        {
            if(_currentView == CurrentViewEnum.invitationView)
                _invitedList.showInvitedList(_state, _currentInvitationList, _securityLevel, _currentView);
            else if(_currentView == CurrentViewEnum.messageView)
                _invitedList.showInvitedList(_state, _currentMessageList, _securityLevel, _currentView);
            else if(_currentView == CurrentViewEnum.csvView)
                _invitedList.showInvitedList(_state, _currentCsvList, _securityLevel, _currentView);
        }
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
        if(_state == CollectStateEnum.stopCollection)
            saveTempCount(0);

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
        var	_dialogContentStyle = getComputedStyle(_dialogContent);
        var h = _dialog.clientHeight - parseInt(_dialogContentStyle.top);
		_dialogContent.style.width = '302px';
		_dialogContent.style.height = h + 'px';
		_dialogTitle.style.width = '294px';
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
                {
                    let currentUrl = window.location.toString();
                    if (currentUrl.indexOf("facetNetwork") != -1)
                        parseGeneralSearchPage();
                    else if(currentUrl.indexOf("sales/search/people") != -1)
                        parseSalesNavigatorPage();
                }
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

    this.init = function (id, needSignin)
    {
		_dialog = document.getElementById(id);
		_dialog.style.visibility = 'hidden'; // We dont want to see anything..
		_dialog.style.display = 'block'; // but we need to render it to get the size of the dialog box
		_dialogTitle = _dialog.querySelector('.titlebar');
        _dialogContent = _dialog.querySelector('.customRootPanel');
        _signinContent = _dialog.querySelector('.signinRootPanel');
        _buttons = _dialog.querySelectorAll('button');  // Ensure to get minimal width
        _invitaionDlg = new invitationDialog();
        _invitedList = new invitedList(setState);
        _createListDialog = new createInvitationListDialog(this.createNewList);
        _setupDialog = new createSetupDialog(this.signout);
        _needSignin = needSignin;
        if(!_needSignin)
            refreshCredentials();
        
        document.getElementById('linkedExtenderShowSetup').onclick = function()
        {
            _setupDialog.showSetupDialog(_securityLevel, _delimiter, setSecurityLevel, setDelimiter);
        }.bind(this);

        document.getElementById('customDialogMinimizeBtn').onclick = function()
        {
            _isMinimized = !_isMinimized;
            minimizeOrMaximizeWnd();
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
                
		setDialogContent();		
	
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
        _dialog.style.display = 'none'; // Let's hide it again..
		_dialog.style.visibility = 'visible'; // and undo visibility = 'hidden'
    };

    function minimizeOrMaximizeWnd()
    {
        if (_isMinimized == false)
            minimizeDialogContent();
        else
            maximizeDialogContent();
    }

    function calcDialogPos(scroll_pos)
    {        
        if (_dialog != null)
        {
            var top = parseFloat(customDialog.style.top);
            if (isNaN(top))
                top = 50;
            _dialog.style.top = scroll_pos + top + 'px';
            //saveDialogSettings();
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

    function saveAccountInfo(info)
    {
        return new Promise(resolve =>
        {
            chrome.storage.local.set({ 'accountInfo': info });
            resolve();
        });
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
            //chrome.storage.local.set({ 'relativeTop': (parseFloat(_dialog.style.top) - window.scrollY) / window.innerHeight });
            //chrome.storage.local.set({ 'relativeLeft': (parseFloat(_dialog.style.left) - window.scrollX) / window.innerWidth });            
            chrome.storage.local.set({ 'dialogState': _isMinimized });
        }
    };

    function loadDialogSettings()
    {
        if (_dialog != null)
        {
            chrome.storage.local.get('dialogState', function (result)
            {
                if(result['dialogState'] == undefined)
                    _isMinimized  = true;
                else
                    _isMinimized = result['dialogState'];
                minimizeOrMaximizeWnd();
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
	this.init(id, needSignin);

	// Public interface 
    this.showDialog = showDialog;
	return this;
}