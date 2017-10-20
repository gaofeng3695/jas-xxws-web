/*
 *Json对象的数组的模糊查询
 *Json对象的格式：[{},{},{},{}]
 *_jsonArray 数据源
 *_keyword 搜索的关键字
 *__querykeysStr 过滤字段
 *
 *create by alex 2017-03-08
 */
var jsonFuzzyQuery = function (_jsonArray, _keyword, _querykeysStr) {
    var _temp = [];
    if (_querykeysStr == undefined) {
        _querykeysStr = "";
    }
    if (_querykeysStr.length == 0) {
        for (var i = 0; i < _jsonArray.length; i++) {
            for (var _key in _jsonArray[i]) {
                var _value = (_jsonArray[i][_key]==null?"":_jsonArray[i][_key].toString());
                if (_value.indexOf(_keyword) > -1) {
                    _temp.push(_jsonArray[i]);
                    break;
                }
            }
        }
    } else {
        for (var i = 0; i < _jsonArray.length; i++) {
            for (var _key in _jsonArray[i]) {
                var _value = (_jsonArray[i][_key]==null?"":_jsonArray[i][_key].toString());
                if (_querykeysStr.indexOf(_key) > -1 && _value.indexOf(_keyword) > -1) {
                    _temp.push(_jsonArray[i]);
                    break;
                }
            }
        }
    }
    return _temp;
}