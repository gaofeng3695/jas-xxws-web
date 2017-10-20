$(function () {
    mapObj.init(); //地图初始化
});
// 地图对象
var mapObj = {
    $bdMap: new BMap.Map("container"), //创建百度地图实例
    $myDis: null,
    $zoom: ["50", "100", "200", "500", "1000", "2000", "5000", "10000", "20000", "25000", "50000", "100000", "20000", "25000", "50000", "100000", "200000", "500000", "1000000", "2000000"],
    bdIconObj: { //地图上图标On表示处理中或者在线
        "constructionOn": new BMap.Icon("/src/images/event/con1.png", new BMap.Size(29, 42), {
            anchor: new BMap.Size(15, 42)
        }),
        "construction": new BMap.Icon("/src/images/event/con2.png", new BMap.Size(29, 42), {
            anchor: new BMap.Size(15, 42)
        }),
        "disasterOn": new BMap.Icon("/src/images/event/dis1.png", new BMap.Size(29, 42), {
            anchor: new BMap.Size(15, 42)
        }),
        "disaster": new BMap.Icon("/src/images/event/dis2.png", new BMap.Size(29, 42), {
            anchor: new BMap.Size(15, 42)
        }),
        "pipelineOn": new BMap.Icon("/src/images/event/pip1.png", new BMap.Size(29, 42), {
            anchor: new BMap.Size(15, 42)
        }),
        "pipeline": new BMap.Icon("/src/images/event/pip2.png", new BMap.Size(29, 42), {
            anchor: new BMap.Size(15, 42)
        }),
        "inspectOn": new BMap.Icon("/src/images/map/peopleOn.png", new BMap.Size(29, 29), {
            anchor: new BMap.Size(15, 29)
        }),
        "inspecLeave": new BMap.Icon("/src/images/map/peopleLeave.png", new BMap.Size(29, 29), {
            anchor: new BMap.Size(15, 29)
        }),
    },
    init: function () {
        //初始化地图
        var point = new BMap.Point(116.404, 39.915); // 创建点坐标
        this.$bdMap.centerAndZoom(point, 15); // 初始化地图，设置中心点坐标和地图级别
        this.$bdMap.enableScrollWheelZoom(true); //开启鼠标滚轮缩放
        //声明-比例尺控件（左下角）
        var bottom_left_ScaleControl = new BMap.ScaleControl({
            anchor: BMAP_ANCHOR_BOTTOM_LEFT
        });
        //声明-平移和缩放按钮控件（右下角）
        var bottom_right_navigation = new BMap.NavigationControl({
            anchor: BMAP_ANCHOR_BOTTOM_RIGHT,
            type: BMAP_NAVIGATION_CONTROL_SMALL
        });
        //地图加载控件
        this.$bdMap.addControl(bottom_left_ScaleControl);
        this.$bdMap.addControl(bottom_right_navigation);
        this.$bdMap.addControl(new BMap.MapTypeControl());

        this.$myDis = new BMapLib.DistanceTool(this.$bdMap);
        // this.$distance.click(function() {
        //     _this.$bdMap.addEventListener("mouseover", function() {
        //         mapObj.$myDis.open(); //开启鼠标测距
        //         //myDis.close();  //关闭鼠标测距大
        //     });
        // });
    },
    //地图打点并计算中心点及缩放等级
    setPointsMarkerWithCenterPointAndZoomLevel: function (data) {
        // this.$bdMap.clearOverlays(); //清除地图上已经标注的点
        //var maxPointAndMinPointObj = this.getMaxPointAndMinPoint(data); //计算当前数据中 最大的经纬度 及 最小的经纬度
        // alert(JSON.stringify(maxPointAndMinPointObj));
        //var centerPointAndZoomLevel = this.getCenterPointAndZoomLevel(maxPointAndMinPointObj.maxLon, maxPointAndMinPointObj.maxLat, maxPointAndMinPointObj.minLon, maxPointAndMinPointObj.minLat);
        //this.$bdMap.centerAndZoom(centerPointAndZoomLevel.centerPoint, centerPointAndZoomLevel.zoomlevel); //设置中心点
        var _length = data.length;
        var _arr = [];
        try {
            for (var i = 0; i < _length; i++) {
                if (data[i].bdLon != "" && data[i].bdLat != "") {
                    _arr.push(new BMap.Point(data[i].bdLon, data[i].bdLat));
                }
            }

            if (_arr.length > 0) {
                this.$bdMap.setViewport(_arr, {
                    zoomFactor: -1
                });
            } else {
                var point = new BMap.Point(116.404, 39.915); // 创建点坐标
                this.$bdMap.centerAndZoom(point, 5); // 初始化地图，设置中心点坐标和地图级别
            }

        } catch (e) {
            var point = new BMap.Point(116.404, 39.915); // 创建点坐标
            this.$bdMap.centerAndZoom(point, 5); // 初始化地图，设置中心点坐标和地图级别
        }
    },
    ///获取max坐标和min坐标
    getMaxPointAndMinPoint: function (_data) {
        var _maxLon = 0,
            _maxLat = 0,
            _minLon = 999,
            _minLat = 999;
        var _length = _data.length;
        for (var i = 0; i < _length; i++) {

            if (_maxLon < _data[i].bdLon) {
                _maxLon = _data[i].bdLon;
            }
            if (_minLon > _data[i].bdLon) {
                _minLon = _data[i].bdLon;
            }
            if (_maxLat < _data[i].bdLat) {
                _maxLat = _data[i].bdLat;
            }
            if (_minLat > _data[i].bdLat) {
                _minLat = _data[i].bdLat;
            }
        }
        var _obj = {
            maxLon: _maxLon,
            maxLat: _maxLat,
            minLon: _minLon,
            minLat: _minLat
        };
        return _obj;　　　　
    },
    //获取中心点及zoom级别
    getCenterPointAndZoomLevel: function (maxLon, maxLat, minLon, minLat) {
        var pointA = new BMap.Point(maxLon, maxLat); // 创建点坐标A
        var pointB = new BMap.Point(minLon, minLat); // 创建点坐标B
        var distance = this.$bdMap.getDistance(pointA, pointB).toFixed(1); //获取两点距离,保留小数点后两位
        //alert(distance);
        var _obj = {
            zoomlevel: 0,
            centerPoint: null
        }; //返回的对象
        for (var i = 0, zoomLen = this.$zoom.length; i < zoomLen; i++) {
            if (this.$zoom[i] - distance > 0) {
                _obj.zoomlevel = (18 - i + 3); //之所以会多3，是因为地图范围常常是比例尺距离的10倍以上。所以级别会增加3
                break;
            }
        };
        var _centerpoint = new BMap.Point((maxLon + minLon) / 2, (maxLat + minLat) / 2);
        _obj.centerPoint = _centerpoint;
        return _obj;
    },
}