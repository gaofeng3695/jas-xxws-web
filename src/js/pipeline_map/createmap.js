// Created by GF on 2017/09/21

(function () {

    var utils = {
        extend: function (obj1, obj2) {
            for (var item in obj1) {
                if (obj1.hasOwnProperty(item)) {
                    if (obj2[item]) {
                        obj1[item] = obj2[item];
                    }
                }
            }
        }
    };

    function Map(obj) {
        if (!obj.sNodeId) {
            console.error('配置参数缺少： sNodeId')
            return;
        }
        var oDefault = {
            sNodeId: '',
            zoomLevel: 15,
            centerPoint: {
                lon: 116.404,
                lat: 39.915
            },
            isScroll: true,
            aLines: []

        };
        utils.extend(oDefault, obj);

        //地图加载控件
        this.initMap(oDefault);
        this.addControl_scale();
        this.addControl_navigation();
        this.addControl_mapType();
    }

    Map.prototype = {
        constructor: Map,
        initMap: function (obj) {
            this.map = new BMap.Map(obj.sNodeId,{
                //enableMapClick : false
            });
            var point = new BMap.Point(obj.centerPoint.lon, obj.centerPoint.lat); // 创建点坐标
            this.map.centerAndZoom(point, obj.zoomLevel); // 初始化地图，设置中心点坐标和地图级别
            this.map.enableScrollWheelZoom(obj.isScroll); //开启鼠标滚轮缩放
            this.startMarker = this.create_icon({
                sSrc: '/src/images/map/icon_start.png',
                nWidth: 30,
                nHeight: 42,
                nLeft: 0,
                nTop: 0,
            });
            this.endMarker = this.create_icon({
                sSrc: '/src/images/map/icon_end.png',
                nWidth: 30,
                nHeight: 42,
                nLeft: 0,
                nTop: 0,
            });
        },
        addControl_scale: function () { //声明-比例尺控件（左下角）
            var bottom_left_ScaleControl = new BMap.ScaleControl({
                anchor: BMAP_ANCHOR_BOTTOM_LEFT
            });
            this.map.addControl(bottom_left_ScaleControl);
        },
        addControl_navigation: function () { //声明-平移和缩放按钮控件（右下角）
            var bottom_right_navigation = new BMap.NavigationControl({
                anchor: BMAP_ANCHOR_BOTTOM_RIGHT,
                type: BMAP_NAVIGATION_CONTROL_SMALL
            });
            this.map.addControl(bottom_right_navigation);
        },
        addControl_mapType: function () { //添加地图类型控件
            this.map.addControl(new BMap.MapTypeControl());
        },
        create_icon: function (obj) {
            //     sSrc : '/src/images/map/icon_end.png',
            //     nWidth  : 30,
            //     nHeight : 42,
            //     nLeft : 42,
            //     nTop : 15,
            return new BMap.Icon(obj.sSrc || "/src/images/map/icon_end.png", new BMap.Size(obj.nWidth || 30, obj.nHeight || 42), { //小车图片
                anchor: new BMap.Size(obj.nLeft || 15, obj.nTop || 42), //图标的定位锚点
            })
        },
        draw_line: function (aPoints, oStyle, isBdPoint) {
            // aPoints : {
            //     bdLon : 123,
            //     bdLat : 123
            // }
            if (!isBdPoint) {
                aPoints = aPoints.map(function (item, index, arr) {
                    return new BMap.Point(item.bdLon, item.bdLat);
                });
            }
            var obj = {
                strokeColor: oStyle.strokeColor || "blue",
                strokeWeight: oStyle.strokeWeight || 2,
                strokeStyle: oStyle.strokeStyle || 'solid', //dashed
                strokeOpacity: oStyle.strokeOpacity || 0.5,
                enableEditing: oStyle.enableEditing || false
            };
            //console.log(obj)
            var polyline = new BMap.Polyline(aPoints, obj);
            this.map.addOverlay(polyline);
            return polyline;
        },
        draw_pointMarker: function (lon, lat, oIcon) {
            // oIcon = {
            //     sSrc : '/src/images/map/icon_end.png',
            //     nWidth  : 30,
            //     nHeight : 42,
            //     nLeft : 42,
            //     nTop : 15,
            // }
            // console.log(lon)
            // console.log(lat)
            var marker = new BMap.Marker(new BMap.Point(lon, lat), {
                icon: oIcon
            });
            //console.log(marker)
            this.map.addOverlay(marker);
            return marker;
        },
        clearOverlays: function () {
            this.map.clearOverlays();
        },
        getDistance: function (aPoints, isBdPoint) {
            var that = this;
            if (!aPoints || aPoints.length < 2) {
                return 0;
            }
            var lineLength = 0;
            aPoints.forEach(function (item, index, arr) {
                if(index === 0 ){
                    return;
                }
                var p1, p2;
                if (!isBdPoint) {
                    p1 = new BMap.Point(arr[index - 1].bdLon, arr[index - 1].bdLat);
                    p2 = new BMap.Point(item.bdLon, item.bdLat);
                } else {
                    p1 = arr[index - 1];
                    p2 = item;
                }
                lineLength += that.map.getDistance(p1, p2);
            });
            return lineLength;
        }
    };




    window.createMap = function (obj) {
        return new Map(obj);
    };

})();