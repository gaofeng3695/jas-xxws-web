/**企业部门的tree,调用requestPeopleTree(frameName,selectArr,boolean)打开
 * frameName---字符串(必填),可以为""，用于辨别来自哪个窗口
 * selectArr---人员数组（必填），默认选中的节点
 * boolean---ture or false（选填），删除自己
 */
/** 
 * 调用getSelectPeople()，返回所选节点对象obj = {key: "",selectedArr: value,addressObj };
 * obj.key 来自哪个窗口的名称
 * obj.value 地址相关的数据
 */

var addressMapObj = {
    $addressMap: new BMap.Map("address_map"),
    $frame: $("#addressMapFrame"),
    $searchText: $(".search_address"),
    $searchBtn: $(".search_botton"),
    $addressText: $("input[name=map_address]"),
    _geocoder: new BMap.Geocoder(),
    _frameName: null,
    addressObj: {
        name: null,
        lng: null,
        lat: null,
        gpsLon: null,
        gpsLat: null,
    },
    init: function() {
        var _this = this;
        _this.$addressMap.centerAndZoom(new BMap.Point(116.404, 39.915), 9); // 初始化地图,设置中心点坐标和地图级别
        _this.$addressMap.enableScrollWheelZoom(true); //开启鼠标滚轮缩放

        //添加选择点
        this.$addressMap.addEventListener("click", function(e) {
            var lng = e.point.lng;
            var lat = e.point.lat;
            _this.addressObj.lng = lng;
            _this.addressObj.lat = lat;
            _this.removePoint();
            _this.addPoint(lng, lat, true);
        });
        //地点搜索
        this.$searchBtn.click(function() {
            var local = new BMap.LocalSearch(_this.$addressMap, {
                renderOptions: {
                    map: _this.$addressMap
                }
            });
            local.search(_this.$searchText.val().trim());
        });

    },
    drawPoint: function(frameName, obj) {
        var _this = this;
        _this.$searchText.val("");
        _this._frameName = frameName;
        _this.removePoint();
        if (obj.name == null) {
            _this.$addressText.val("");
            _this.$addressMap.centerAndZoom(new BMap.Point(116.404, 39.915), 9);
            return;
        } else {
            _this.addressObj.lng = obj.lng;
            _this.addressObj.lat = obj.lat;
            _this.addressObj.gpsLon = obj.gpsLon;
            _this.addressObj.gpsLat = obj.gpsLat;
            _this.addPoint(obj.lng, obj.lat);
            _this.$addressText.val(obj.name);
        }
    },
    getPoint: function() {
        var _this = this;
        if (_this.$addressText.val().trim() == '') {
            xxwsWindowObj.xxwsAlert("请选择详细位置！");
            return false;
        } else if (_this.$addressText.val().trim().length > 50) {
            xxwsWindowObj.xxwsAlert("详细位置名称过长！");
            return false;
        } else {
            var coordinate = coordtransform.bd09togcj02(_this.addressObj.lng, _this.addressObj.lat);
            var coordinateGps = coordtransform.gcj02towgs84(coordinate[0], coordinate[1]);
            _this.addressObj.gpsLon = coordinateGps[0];
            _this.addressObj.gpsLat = coordinateGps[1];
            _this.addressObj.name = _this.$addressText.val().trim();
            var dataObj = {
                key: _this._frameName,
                value: _this.addressObj
            };
            _this.$frame.modal('hide');
            return dataObj;
        }
    },
    addPoint: function(lng, lat, e) {
        var _this = this;
        var point = new BMap.Point(lng, lat);
        var marker = new BMap.Marker(point); // 创建标注
        _this.$addressMap.addOverlay(marker); // 将标注添加到地图中

        // var geocoder = new BMap.Geocoder();

        if (e == true) {
            // 根据坐标得到地址描述   
            _this._geocoder.getLocation(point, function(result) {
                if (result) {
                    _this.$addressText.val(result.address);
                }
            });
            return;
        } else {
            _this.$addressMap.setCenter(point);
        }
    },
    removePoint: function() {
        this.$addressMap.clearOverlays(); //清除所以的点
    }
};
$(function() {
    addressMapObj.init();
});