$(function() {
    //playerObj.play('c2f52b27-a888-40b7-824d-3abc7c056281');
})

/*var data = {
    "success": 1,
    "code": "200",
    "msg": "ok",
    "totalElements": 28,
    "totalPages": 1,
    "size": 28,
    "number": 1,
    "first": true,
    "last": true,
    "rows": [{
        "createTime": 1488340180000,
        "lon": 116.349276,
        "bdLon": 116.362069,
        "lat": 39.986543,
        "bdLat": 39.993663
    }, {
        "createTime": 1488340331000,
        "lon": 116.349395,
        "bdLon": 116.362188,
        "lat": 39.986451,
        "bdLat": 39.993573
    }, {
        "createTime": 1488340345000,
        "lon": 116.34955,
        "bdLon": 116.362342,
        "lat": 39.986436,
        "bdLat": 39.99356
    }, {
        "createTime": 1488340364000,
        "lon": 116.34964,
        "bdLon": 116.362432,
        "lat": 39.986365,
        "bdLat": 39.99349
    }, {
        "createTime": 1488340384000,
        "lon": 116.349696,
        "bdLon": 116.362488,
        "lat": 39.986149,
        "bdLat": 39.993275
    }, {
        "createTime": 1488340395000,
        "lon": 116.349706,
        "bdLon": 116.362498,
        "lat": 39.985999,
        "bdLat": 39.993125
    }, {
        "createTime": 1488340404000,
        "lon": 116.349754,
        "bdLon": 116.362546,
        "lat": 39.985904,
        "bdLat": 39.993031
    }, {
        "createTime": 1488340413000,
        "lon": 116.349893,
        "bdLon": 116.362684,
        "lat": 39.985931,
        "bdLat": 39.99306
    }, {
        "createTime": 1488340423000,
        "lon": 116.350072,
        "bdLon": 116.362863,
        "lat": 39.985952,
        "bdLat": 39.993084
    }, {
        "createTime": 1488340432000,
        "lon": 116.350215,
        "bdLon": 116.363005,
        "lat": 39.985988,
        "bdLat": 39.993122
    }, {
        "createTime": 1488340442000,
        "lon": 116.350339,
        "bdLon": 116.363129,
        "lat": 39.98598,
        "bdLat": 39.993116
    }, {
        "createTime": 1488340452000,
        "lon": 116.350509,
        "bdLon": 116.363299,
        "lat": 39.985974,
        "bdLat": 39.993113
    }, {
        "createTime": 1488340461000,
        "lon": 116.350671,
        "bdLon": 116.36346,
        "lat": 39.98597,
        "bdLat": 39.993111
    }, {
        "createTime": 1488340469000,
        "lon": 116.350842,
        "bdLon": 116.363631,
        "lat": 39.985985,
        "bdLat": 39.993129
    }, {
        "createTime": 1488340478000,
        "lon": 116.351011,
        "bdLon": 116.363799,
        "lat": 39.985978,
        "bdLat": 39.993125
    }, {
        "createTime": 1488340487000,
        "lon": 116.35117,
        "bdLon": 116.363958,
        "lat": 39.985969,
        "bdLat": 39.993118
    }, {
        "createTime": 1488340497000,
        "lon": 116.351358,
        "bdLon": 116.364145,
        "lat": 39.985973,
        "bdLat": 39.993125
    }, {
        "createTime": 1488340508000,
        "lon": 116.351562,
        "bdLon": 116.364348,
        "lat": 39.985989,
        "bdLat": 39.993144
    }, {
        "createTime": 1488340516000,
        "lon": 116.35173,
        "bdLon": 116.364516,
        "lat": 39.985999,
        "bdLat": 39.993157
    }, {
        "createTime": 1488340534000,
        "lon": 116.351788,
        "bdLon": 116.364574,
        "lat": 39.986173,
        "bdLat": 39.993332
    }, {
        "createTime": 1488340543000,
        "lon": 116.35178,
        "bdLon": 116.364566,
        "lat": 39.986318,
        "bdLat": 39.993477
    }, {
        "createTime": 1488340554000,
        "lon": 116.351756,
        "bdLon": 116.364542,
        "lat": 39.986415,
        "bdLat": 39.993574
    }, {
        "createTime": 1488340570000,
        "lon": 116.351639,
        "bdLon": 116.364425,
        "lat": 39.986574,
        "bdLat": 39.993731
    }, {
        "createTime": 1488340579000,
        "lon": 116.351638,
        "bdLon": 116.364424,
        "lat": 39.986729,
        "bdLat": 39.993886
    }, {
        "createTime": 1488340594000,
        "lon": 116.351707,
        "bdLon": 116.364493,
        "lat": 39.986896,
        "bdLat": 39.994054
    }, {
        "createTime": 1488340603000,
        "lon": 116.351747,
        "bdLon": 116.364533,
        "lat": 39.987027,
        "bdLat": 39.994186
    }, {
        "createTime": 1488340614000,
        "lon": 116.351792,
        "bdLon": 116.364578,
        "lat": 39.987179,
        "bdLat": 39.994338
    }, {
        "createTime": 1488340622000,
        "lon": 116.351838,
        "bdLon": 116.364624,
        "lat": 39.987303,
        "bdLat": 39.994463
    }]
}*/

var playerObj = {
    $close: $('.player_wrapper .btn_close'),
    $date: $('.player_wrapper .title .date'),
    $rangeNow: $('.player_wrapper .title .now '),
    $rangeEnd: $('.player_wrapper .title .end '),
    $speed: $('.player_wrapper .title .speed .item'),
    $btn_play: $('.player_wrapper .time_line .btn_play'),
    $time_mark: $('.player_wrapper .time_line .time_mark'),
    $stick_bar: $('.player_wrapper .time_line .stick_bar'),
    $move_bar: $('.player_wrapper .time_line .move_bar'),
    $active_bar: $('.player_wrapper .time_line .line_bar_active'), //蓝色进度条
    $time_now: $('.player_wrapper .time_line .time_now'),
    $line_bar: $('.player_wrapper .time_line .line_bar'),
    $mask_bar: $('.player_wrapper .time_line .mask_bar'),
    $event_line: $('.player_wrapper .time_line .event_line'),

    lineLength: $('.player_wrapper .time_line .line_bar').width(),
    timer: null, //定时器
    nowTime: 0, //播放的时间进度
    beginTime: null,
    endTime: null,
    allTime: null, //巡线总时长
    aData: null, //轨迹点
    lastPt: null, //上一个轨迹点
    nextPt: null, //下一个轨迹点
    rate: 30, //播放速度比率

    init: function() {
        var that = this;
        this.timer = null; //定时器
        this.nowTime = 0; //播放的时间进度
        this.beginTime = null;
        this.endTime = null;
        this.allTime = null; //巡线总时长
        this.aData = null; //轨迹点
        this.lastPt = null; //上一个轨迹点
        this.nextPt = null; //下一个轨迹点
        this.rate = 30; //播放速度比率

        this.$date.html('-');
        this.$rangeNow.html('-');
        this.$rangeEnd.html('-');
        this.$time_mark.html('-');
        this.$time_now.html('-');

        that.$move_bar.css('left', 0);
        that.$active_bar.css('width', 0);
        that.$time_now.css('left', 0);

        if (!that.isBindEvent) {
            that.bindEvent();
            that.isBindEvent = true;
        }
        $('.player_wrapper').css('display', 'block');
        that.$btn_play.addClass('active');
        that.$speed.removeClass('active').eq(1).addClass('active');
        mapObj.$bdMap.clearOverlays();

    },
    bindEvent: function() {
        var that = this;
        /* 点击播放按钮 */
        that.$btn_play[0].onclick = function() {
            if ($(this).hasClass('active')) {
                if (that.nowTime >= that.allTime) {
                    that.nowTime = 0;
                }
                that.setTimer(true);
                return;
            }
            that.setTimer();
        };
        /* 关闭播放器 */
        that.$close.click(function() {
            that.close_player(function() {
                eventObj.getInitialPoints();
            });
            inspectObj.openInspect();
        });
        /* 选择播放速度 */
        that.$speed.click(function() {
            var index = $(this).index();
            var aRate = [1, 30, 60, 120, 240];
            that.$speed.removeClass('active');
            $(this).addClass('active');
            that.rate = aRate[index - 1];
        });
        /* 点击时间轴事件 */
        that.$mask_bar.on('click', function(e) {
            //console.log(e.offsetX/that.lineLength*that.allTime);
            var e = e || event;
            that.nowTime = e.offsetX / that.lineLength * that.allTime;
            that.setCurrentPointByTime(that.nowTime + that.beginTime);
            that.renderTimeLine();
            return false;
        });
        /* 移动进度按钮事件 */
        that.$move_bar[0].onmousedown = function() {
                var bool = that.$btn_play.hasClass('active');
                this.ispause = bool;
                that.setTimer();
                this.onmousemove = null;
                this.onmousemove = function(e) {
                    var e = e || event;
                    that.nowTime = Math.ceil(+that.$move_bar.css('left').slice(0, -2) + e.offsetX) / that.lineLength * that.allTime;
                    that.setCurrentPointByTime(that.nowTime + that.beginTime);
                    that.renderTimeLine();
                    return false;
                }
            }
            /* 取消移动按钮事件 */
        that.$move_bar[0].onmouseup = that.$move_bar[0].onmouseout = function(e) {
            var e = e || event;
            this.onmousemove = null;
            return false;
        }
    },
    render: function() {
        var that = this;
        //console.log(that.beginTime)
        var begin = new Date(that.beginTime).Format('yyyy.MM.dd');
        var end = new Date(that.endTime).Format('yyyy.MM.dd');
        var sDate = begin;
        if (end.slice(-2) !== begin.slice(-2)) {
            var sDate = begin + ' - ' + end;
        }
        that.$date.html(sDate);
        that.$rangeEnd.html(new Date(that.allTime - 8 * 3600 * 1000).Format('HH:mm:ss'));

        that.renderStick();
    },
    renderStick: function() {
        var that = this;
        var begin_time = new Date(that.beginTime).Format('HH:mm:ss');
        var end_time = new Date(that.endTime).Format('HH:mm:ss');
        var s = '';
        var sTime = '<div class="time">' + begin_time + '</div>';
        for (var i = 1; i < 6; i++) {
            s += '<div class="stick" style="left:' + i / 6 * that.lineLength + 'px"></div>';
            sTime += '<div class="time" style="left:' + i / 6 * that.lineLength + 'px">' + new Date(that.beginTime + that.allTime * i / 6).Format('HH:mm:ss') + '</div>';
        }
        sTime += '<div class="time" style="left:' + i / 6 * that.lineLength + 'px">' + end_time + '</div>';
        that.$stick_bar.html(s);
        that.$time_mark.html(sTime);
    },
    renderTimeLine: function() {
        var that = this;
        var rate = that.nowTime / that.allTime;
        rate = rate > 1 ? 1 : rate;
        that.$move_bar.css('left', rate * 600);
        that.$active_bar.css('width', rate * 600);
        that.$time_now.css('left', rate * 600);
        var timeNow = that.beginTime + that.nowTime;
        timeNow = timeNow > that.endTime ? that.endTime : timeNow;
        that.$time_now.html(new Date(timeNow).Format('HH:mm:ss'));
        var _timeNow = that.nowTime > that.allTime ? that.allTime : that.nowTime;
        _timeNow = _timeNow - 8 * 3600 * 1000;
        that.$rangeNow.html(new Date(_timeNow).Format('HH:mm:ss'));
    },
    play: function(s, flag) {
        var that = this;
        that.requestRoutePoint(s, flag);
    },
    requestRoutePoint: function(s, flag) {
        var that = this;
        //var s = s ? s : 'c2f52b27-a888-40b7-824d-3abc7c056281';
        that.close_player();

        $.ajax({
            type: "POST",
            url: "/cloudlink-inspection-trajectory/trajectory/getByRecordId",
            contentType: "application/json",
            data: JSON.stringify({
                inspRecordId: s
            }),
            dataType: "json",
            success: function(data) {
                //console.log(data);
                if (data.success != 1) {
                    xxwsWindowObj.xxwsAlert('网络连接出错！code:-1')
                    return;
                }
                if (data.rows.length === 0) {
                    xxwsWindowObj.xxwsAlert('当前巡检记录无轨迹点！')
                    return;
                }
                that.requestEventInfo(s);
                that.init();
                that.aData = data.rows;
                that.beginTime = that.aData[0].createTime;
                that.endTime = that.aData[that.aData.length - 1].createTime;
                that.allTime = that.endTime - that.beginTime;
                that.render();
                that.drawRoute(that.aData, flag);
                that.movePerson(that.aData);
            },
            statusCode: {
                404: function() {
                    xxwsWindowObj.xxwsAlert('网络连接出错！code:404');
                }
            }
        });
    },
    requestEventInfo: function(s) {
        var that = this;
        $.ajax({
            type: "POST",
            url: "/cloudlink-inspection-event/eventInfo/web/v1/getPageList?token=" + lsObj.getLocalStorage('token'),
            contentType: "application/json",
            data: JSON.stringify({
                "status": "20,21,30", //处理状态 固定为”20,21,30”查询所有
                "type": '', //固定为空”1,2,3”查询所有
                "startDate": "", //固定为空字符串
                "endDate": "", //固定为空字符串
                "keyword": "", // 固定为空字符串
                "inspRecordId": s, //巡检记录ID
                "pageNum": 1, //第几页 固定为1
                "pageSize": 100 //每页记录数 固定为100
            }),
            dataType: "json",
            success: function(data) {
                //console.log(data);
                if (data.success != 1) {
                    xxwsWindowObj.xxwsAlert('网络连接出错！code:-1');
                    return;
                }
                var aData = data.rows;
                if (aData.length === 0) {
                    return;
                }
                eventObj.setEventPointsMarker(aData, true);
                //that.drawEventOnLine(aData);
            },
            statusCode: {
                404: function() {
                    xxwsWindowObj.xxwsAlert('网络连接出错！code:404');
                }
            }
        });
    },
    drawRoute: function(data, flag) {
        // var obj = mapObj.getMaxPointAndMinPoint(data);
        // var level = mapObj.getCenterPointAndZoomLevel(obj.maxLon, obj.maxLat, obj.minLon, obj.minLat);
        // mapObj.$bdMap.centerAndZoom(level.centerPoint, level.zoomlevel);
        var arr = data.map(function(item, index, arr) {
            return new BMap.Point(item.bdLon, item.bdLat);
        });
        var level = mapObj.$bdMap.setViewport(arr, {
            zoomFactor: -1
        });

        var polyline = new BMap.Polyline(arr, {
            strokeColor: "#59b6fc",
            strokeWeight: 4,
            strokeOpacity: 1,
        });
        var startMarker = new BMap.Marker(new BMap.Point(data[0].bdLon, data[0].bdLat), {
            icon: new BMap.Icon("/src/images/map/icon_start.png", new BMap.Size(30, 42), { //小车图片
                anchor: new BMap.Size(15, 42), //图标的定位锚点
            })
        });
        var endMarker = new BMap.Marker(new BMap.Point(data[data.length - 1].bdLon, data[data.length - 1].bdLat), {
            icon: new BMap.Icon("/src/images/map/icon_end.png", new BMap.Size(30, 42), { //小车图片
                anchor: new BMap.Size(15, 42), //图标的定位锚点
            })
        });
        mapObj.$bdMap.addOverlay(startMarker);
        if (+flag === 1) {
            mapObj.$bdMap.addOverlay(endMarker);
        }
        mapObj.$bdMap.addOverlay(polyline);
    },
    drawEventOnLine: function(data) {
        var that = this;
        var s = '';
        console.log(data)
        data.forEach(function(item, index) {
            var l = that.getDateFromDateString(item.createTime).getTime();
            var rate = (l - that.beginTime) / that.allTime;
            rate = rate > 1 ? 1 : rate;
            rate = rate < 0 ? 0 : rate;
            s += '<div class="item dis1" style="left:' + that.lineLength * rate + 'px"></div>';
        });
        that.$event_line.html(s);
    },
    movePerson: function(data) {
        var that = this;
        that.personMarker = new BMap.Marker(new BMap.Point(data[0].bdLon, data[0].bdLat), {
            icon: new BMap.Icon("/src/images/map/icon_person.png", new BMap.Size(30, 42))
        });
        mapObj.$bdMap.addOverlay(that.personMarker);
        that.renderTimeLine()
            //console.log(data[0])
            //that.$btn_play.removeClass('active');
            //that.setTimer();
    },
    setTimer: function(bool) {
        /*
         ** 传入true，开启定时器
         ** 不传或false，关闭定时器
         */
        var that = this;
        var data = that.aData;
        if (that.timer) {
            that.$btn_play.addClass('active');
            clearInterval(that.timer);
        }
        if (that.nowTime > that.allTime || !bool) {
            return;
        }
        that.$btn_play.removeClass('active');
        that.timer = setInterval(function() {
            that.nowTime += 40 * that.rate;
            if (that.nowTime > that.allTime) {
                that.$btn_play.addClass('active');
                clearInterval(that.timer);
            }
            that.setCurrentPointByTime(data[0].createTime + that.nowTime);
            that.renderTimeLine();
        }, 40);
    },
    setCurrentScopeByTime: function(time) { //入参：毫秒时间点
        var that = this;
        var a = that.aData;
        var l = a.length;
        for (var i = 0; i < l; i++) {
            if (time < a[i].createTime) {
                that.lastPt = a[i - 1];
                that.nextPt = a[i];
                return;
            }
        }
        that.lastPt = a[l - 1];
        that.nextPt = null;
    },
    setCurrentPointByTime: function(time) { //入参：毫秒时间点
        var that = this;
        that.setCurrentScopeByTime(time);
        if (!that.nextPt) {
            return;
        }
        var time_now = time - that.lastPt.createTime;
        var time_all = that.nextPt.createTime - that.lastPt.createTime;
        var rate = time_now / time_all;
        var lat = that.lastPt.bdLat + (that.nextPt.bdLat - that.lastPt.bdLat) * rate;
        var lon = that.lastPt.bdLon + (that.nextPt.bdLon - that.lastPt.bdLon) * rate;
        that.personMarker.setPosition(new BMap.Point(lon, lat));
    },
    close_player: function(fn) {
        var that = this;
        that.setTimer();
        mapObj.$bdMap.clearOverlays();
        inspectObj.$inspectBtn.removeClass("active");
        // eventObj.$eventBtn.removeClass("active");
        eventObj.closeEvent();
        $('.player_wrapper').css('display', 'none');
        if (Object.prototype.toString.call(fn) === '[object Function]') {
            fn();
        }
    },
    getDateFromDateString: function(s) {
        // s = '2015-01-01 12:14'
        var date = new Date();
        date.setFullYear(s.slice(0, 4));
        date.setMonth(+s.slice(5, 7) - 1);
        date.setDate(s.slice(8, 10));
        date.setHours(+s.slice(11, 13));
        date.setMinutes(+s.slice(14, 16));
        date.setSeconds(0);
        return date;
    }
};

var searchObj = {
    $ul: $('.location ul'),
    $input: $('#location_search'),
    init: function() {
        this.bindEvent();
    },
    bindEvent: function() {
        var that = this;
        var ac = new BMap.Autocomplete({
            "input": "location_search",
            "location": mapObj.$bdMap,
            "onSearchComplete": function(re) {
                //console.log(re)
                // ac.hide();
            }
        });
        ac.addEventListener("onhighlight", function(e) { //鼠标放在下拉列表上的事件
            var str = "";
            var _value = e.fromitem.value;
            var value = "";
            if (e.fromitem.index > -1) {
                value = _value.province + _value.city + _value.district + _value.street + _value.business;
            }
            str = "FromItem<br />index = " + e.fromitem.index + "<br />value = " + value;

            value = "";
            if (e.toitem.index > -1) {
                _value = e.toitem.value;
                value = _value.province + _value.city + _value.district + _value.street + _value.business;
            }
            str += "<br />ToItem<br />index = " + e.toitem.index + "<br />value = " + value;
            //G("searchResultPanel").innerHTML = str;
        });
        var myValue;
        ac.addEventListener("onconfirm", function(e) { //鼠标点击下拉列表后的事件
            var _value = e.item.value;
            myValue = _value.province + _value.city + _value.district + _value.street + _value.business;
            setPlace();
        });

        function setPlace() {
            if (that.lastPoint) {
                mapObj.$bdMap.removeOverlay(that.lastPoint);
            }
            var local = new BMap.LocalSearch(mapObj.$bdMap, { //智能搜索
                onSearchComplete: function() {
                    if (!local.getResults().getPoi(0)) {
                        xxwsWindowObj.xxwsAlert('未找到该点，请重新搜索')
                        return;
                    }
                    var pp = local.getResults().getPoi(0).point; //获取第一个智能搜索的结果
                    //mapObj.$bdMap.setCenter(pp);
                    mapObj.$bdMap.centerAndZoom(pp, 18);
                    that.lastPoint = new BMap.Marker(pp);
                    mapObj.$bdMap.addOverlay(that.lastPoint); //添加标注
                }
            });
            local.search(myValue);
        }

    },
    renderResult: function() {

    }
};
$(function() {
    searchObj.init();
});