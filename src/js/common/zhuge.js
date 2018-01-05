 var zhugeSwitch = 1; //1:开启诸葛 0：关闭诸葛
 var zhuge = (function (k) {　　　
     var _ss = window.sessionStorage;
     var _sw = "";
     var _methods = "_load _init _identify _track".split(" ");
     var _u = "http://192.168.100.212:8050/cloudlink-analysis-tianjiio/application";

     String.prototype.Pollute = function () {
         var _str = this;
         var _strLength = _str.length;
         var _strTarget = "";
         for (var i = 0; i < _strLength; i++) {
             _strTarget += String.fromCharCode(_str.charCodeAt(i) + (_strLength - i));
         }
         return escape(_strTarget);
     };

     String.prototype.Clean = function () {
         var _str = unescape(this);
         var _strLength = _str.length;
         var _strTarget = "";
         for (var i = 0; i < _strLength; i++) {
             _strTarget += String.fromCharCode(_str.charCodeAt(i) - (_strLength - i));
         }
         return _strTarget;
     };

     var _ro = function () {
         return window.XMLHttpRequest ? new XMLHttpRequest : new ActiveXObject("Microsoft.XMLHTTP");
     };

     var _res = function (u, t, c, f) {
         var i = _ro();
         i.open(t, _u + u);
         i.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
         i.onreadystatechange = function () {
             if (i.readyState == 4 && i.status == 200) {
                 if (typeof (f) === "function") {
                     var _arg = i.responseText;
                     f(_arg);
                 }
             }
         };
         i.send(encodeURIComponent(c));
     }

     var _sss = function (key, value) {　　　　　　
         _ss.removeItem(key);
         _ss.setItem(key, value.toString().Pollute());　　　　
     };　　　　
     var _gss = function (key) {
         var _value = (_ss.getItem(key) == null ? "" : _ss.getItem(key).Clean());
         return _value;　
     };　
     var clearAll = function () {
         _ss.clear();　
     };

     var _init = function (k, f) {
         if (!_gss(_methods[1])) {
             _res("/init?appKey=" + k, "POST", k, function (e) {
                 var _o = JSON.parse(e);
                 if (_o.success = 1) {
                     _sss(_methods[1], _o.tjToken);
                     if (typeof (f) === "function") {
                         f(_o.tjToken);
                     }
                 }
             });
         } else {
             if (typeof (f) === "function") {
                 f(_gss(_methods[1]));
             }
         }
     };

     var _identify = function (o, c) {
         _init(k, function (t) {
             _res("/identify", "POST", JSON.stringify({
                 tjToken: t,
                 tid: o,
                 info: c
             }), t);
         });
     };

     var _track = function (o, c) {
         _init(k, function (t) {
             _res("/event", "POST", JSON.stringify({
                 tjToken: t,
                 eventName: o,
                 info: c
             }), t);
         });
     };

     _init(k);　　
     return {
         identify: _identify,
         track: _track,
     };
 })("36074960630e47a5b9ce66eb6c523c1d");