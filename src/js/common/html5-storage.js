var lsObj = (function () {　　　　
    var _lsObj = window.localStorage;
    var isflag = 0;

    String.prototype.Pollute = function () {
        var _str = this;
        var _strLength = _str.length;
        var _strTarget = "";
        for (var i = 0; i < _strLength; i++) {
            _strTarget += String.fromCharCode(_str.charCodeAt(i) + (_strLength - i));
        }
        return escape(_strTarget);
    }
    String.prototype.Clean = function () {
        var _str = unescape(this);
        var _strLength = _str.length;
        var _strTarget = "";
        for (var i = 0; i < _strLength; i++) {
            _strTarget += String.fromCharCode(_str.charCodeAt(i) - (_strLength - i));
        }
        return _strTarget;
    }　　
    var setLocalStorage = function (key, value) {　　　　　　
        _lsObj.removeItem(key);
        _lsObj.setItem(key, value.toString().Pollute());　　　　
    };　　　　
    var getLocalStorage = function (key) {
        try {
            if (_lsObj.getItem('timeOut') == null) {
                _lsObj.clear();　
                parent.location.href = '/login.html';
                return;
            }
            var _timeOut = _lsObj.getItem('timeOut').Clean();
            if (isNaN(Number(_timeOut))) {
                _lsObj.clear();　
                parent.location.href = '/login.html';
                return;
            }

            if (_timeOut <= new Date().getTime()) {
                if (isflag == 0) {
                    isflag == 1;
                    _lsObj.clear();　
                    alert("当前用户会话超时，请重新登录！");
                    parent.location.href = '/login.html';
                }
                return;
            } else {
                isflag == 0;
            }
            var _value = (_lsObj.getItem(key) == null ? "" : _lsObj.getItem(key).Clean());
            return _value;　
        } catch (error) {
            _lsObj.clear();　
            parent.location.href = '/login.html';
        }　　　　　
    };　
    var clearAll = function () {
        _lsObj.clear();　
    };　　　　
    return {
        setLocalStorage: setLocalStorage,
        getLocalStorage: getLocalStorage,
        clearAll: clearAll　　　　
    };
})();