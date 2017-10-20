var mapObj = (function () {
    //声明地图对象
    var map = new BMap.Map("container");
    //定义地图比例尺
    var _zoom = ["50", "100", "200", "500", "1000", "2000", "5000", "10000", "20000", "25000", "50000", "100000", "20000", "25000", "50000", "100000", "200000", "500000", "1000000", "2000000"];
    //获取中心点及zoom级别　　　　
    var getCenterPointAndZoomLevel = function (maxLon, maxLat, minLon, minLat) {
        var pointA = new BMap.Point(maxLon, maxLat); // 创建点坐标A
        var pointB = new BMap.Point(minLon, minLat); // 创建点坐标B
        var distance = map.getDistance(pointA, pointB).toFixed(1); //获取两点距离,保留小数点后两位
        console.log(distance)
        var _obj = {zoomlevel:0,centerPoint:null};//返回的对象
        for (var i = 0, zoomLen = _zoom.length; i < zoomLen; i++) {
            if (_zoom[i] - distance > 0) {
                console.log(i)
                _obj.zoomlevel = (18 - i + 3); //之所以会多3，是因为地图范围常常是比例尺距离的10倍以上。所以级别会增加3
                break;
            }
        };
        var _centerpoint = new BMap.Point((maxLon+minLon)/2, (maxLat+minLat)/2);
        _obj.centerPoint = _centerpoint;
        return _obj;
    };
    //获取max坐标和min坐标　　　　
    var getMaxPointAndMinPoint = function (_data) {
        var _maxLon=0,_maxLat=0,_minLon=999, _minLat=999;
        var _length = _data.length;
        for (var i = 0; i <_length; i++) {
            if(_maxLon<_data[i].bdLon){
                _maxLon = _data[i].bdLon;
            }
            if(_minLon>_data[i].bdLon){
                _minLon = _data[i].bdLon;
            }
            if(_maxLat<_data[i].bdLat){
                _maxLat = _data[i].bdLat;
            }
            if(_minLat>_data[i].bdLat){
                _minLat = _data[i].bdLat;
            }
        }
        var _obj = {maxLon:_maxLon,maxLat:_maxLat,minLon:_minLon, minLat:_minLat};
        return _obj;　　　　
    };
    return {
        getCenterPointAndZoomLevel: getCenterPointAndZoomLevel,
        getMaxPointAndMinPoint: getMaxPointAndMinPoint
    };
})();