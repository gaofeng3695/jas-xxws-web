$(function () {
    //playerObj.play('c2f52b27-a888-40b7-824d-3abc7c056281');
})


(function (global, $, document, mapObj, xxwsWindowObj) {

    var playerClass = function () {
        this.initializeElements();
        this.eventsMap = {
            'click .player_wrapper .time_line .btn_play': 'playOrPause',
            'click ..player_wrapper .btn_close': 'clickCloseBtn',
        };
    };

    //工具库
    var utils = {
        getDateFromDateString: function (s) {
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

    playerClass.Eles = {
        $close: '.player_wrapper .btn_close', //关闭按钮
        $date: '.player_wrapper .title .date', //第一行日期
        $rangeNow: '.player_wrapper .title .now ', //时间范围
        $rangeEnd: '.player_wrapper .title .end ',
        $speed: '.player_wrapper .title .speed .item',
        $btn_play: '.player_wrapper .time_line .btn_play',
        $time_mark: '.player_wrapper .time_line .time_mark',
        $stick_bar: '.player_wrapper .time_line .stick_bar',
        $move_bar: '.player_wrapper .time_line .move_bar',
        $active_bar: '.player_wrapper .time_line .line_bar_active', //蓝色进度条
        $time_now: '.player_wrapper .time_line .time_now',
        $line_bar: '.player_wrapper .time_line .line_bar',
        $mask_bar: '.player_wrapper .time_line .mask_bar',
        $event_line: '.player_wrapper .time_line .event_line',
    };
    playerClass.prototype = {
        constructor: playerClass,
        initElements: function () {
            var eles = playerClass.Eles;
            for (var name in eles) {
                if (eles.hasOwnProperty(name)) {
                    this[name] = $(eles[name]);
                }
            }
        },
        initParam: function () {
            this.timer = null; //定时器
            this.nowTime = 0; //播放的时间进度
            this.beginTime = null;
            this.endTime = null;
            this.allTime = null; //巡线总时长
            this.aData = null; //轨迹点
            this.lastPt = null; //上一个轨迹点
            this.nextPt = null; //下一个轨迹点
            this.rate = 30; //播放速度比率
            this.lineLength = this.$line_bar.width();
        },
        initView: function () {
            this.$date.html('-');
            this.$rangeNow.html('-');
            this.$rangeEnd.html('-');
            this.$time_mark.html('-');
            this.$time_now.html('-');

            that.$move_bar.css('left', 0);
            that.$active_bar.css('width', 0);
            that.$time_now.css('left', 0);

            $('.player_wrapper').css('display', 'block');
            that.$btn_play.addClass('active');
            that.$speed.removeClass('active').eq(1).addClass('active');
            mapObj.$bdMap.clearOverlays();
        },
        _scanEventsMap: function(maps, isOn) {
            var delegateEventSplitter = /^(\S+)\s*(.*)$/;
            var bind = isOn ? this._delegate : this._undelegate;
            for (var keys in maps) {
                if (maps.hasOwnProperty(keys)) {
                    var matchs = keys.match(delegateEventSplitter);
                    bind(matchs[1], matchs[2], maps[keys].bind(this));
                }
            }
        },
        initializeOrdinaryEvents: function(maps) {
            this._scanEventsMap(maps, true);
        },
        uninitializeOrdinaryEvents: function(maps) {
            this._scanEventsMap(maps);
        },
        _delegate: function(name, selector, func) {
            $(document).on(name, selector, func);
        },
        _undelegate: function(name, selector, func) {
            $(document).off(name, selector, func);
        },
        initEvent: function () {
            if (!this.isBindEvent) {
                this.bindEvent();
                this.isBindEvent = true;
            }
        },
        playOrPause : function(){
            if (this.$btn_play.hasClass('active')) {
                if (this.nowTime >= this.allTime) {
                    this.nowTime = 0;
                }
                this.setTimer(true);
                return;
            }
            this.setTimer();
        },
        clickCloseBtn : function(){
            this.close_player();
            inspectObj.openInspect();
        },
        bindEvent: function () {
            var that = this;

            /* 选择播放速度 */
            that.$speed.click(function () {
                var index = $(this).index();
                var aRate = [1, 30, 60, 120, 240];
                that.$speed.removeClass('active');
                $(this).addClass('active');
                that.rate = aRate[index - 1];
            });
            /* 点击时间轴事件 */
            that.$mask_bar.on('click', function (e) {
                //console.log(e.offsetX/that.lineLength*that.allTime);
                var e = e || event;
                that.nowTime = e.offsetX / that.lineLength * that.allTime;
                that.setCurrentPointByTime(that.nowTime + that.beginTime);
                that.renderTimeLine();
                return false;
            });
            /* 移动进度按钮事件 */
            that.$move_bar[0].onmousedown = function () {
                    var bool = that.$btn_play.hasClass('active');
                    this.ispause = bool;
                    that.setTimer();
                    this.onmousemove = null;
                    this.onmousemove = function (e) {
                        var e = e || event;
                        that.nowTime = Math.ceil(+that.$move_bar.css('left').slice(0, -2) + e.offsetX) / that.lineLength * that.allTime;
                        that.setCurrentPointByTime(that.nowTime + that.beginTime);
                        that.renderTimeLine();
                        return false;
                    }
                }
                /* 取消移动按钮事件 */
            that.$move_bar[0].onmouseup = that.$move_bar[0].onmouseout = function (e) {
                var e = e || event;
                this.onmousemove = null;
                return false;
            }
        },
        render: function () {
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
        renderStick: function () {
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
        renderTimeLine: function () {
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
        play: function (s, flag) {
            var that = this;
            that.requestRoutePoint(s, flag);
        },
        requestRoutePoint: function (s, flag) {
            var that = this;
            that.close_player();
            $.ajax({
                type: "POST",
                url: "/cloudlink-inspection-trajectory/trajectory/getByRecordId",
                contentType: "application/json",
                data: JSON.stringify(),
                dataType: "json",
                success: function (data) {
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
                    that.initParam();
                    that.initView();
                    that.initEvent();
                    that.aData = data.rows;
                    that.beginTime = that.aData[0].createTime;
                    that.endTime = that.aData[that.aData.length - 1].createTime;
                    that.allTime = that.endTime - that.beginTime;
                    that.render();
                    that.drawRoute(that.aData, flag);
                    that.movePerson(that.aData);
                },
                statusCode: {
                    404: function () {
                        xxwsWindowObj.xxwsAlert('网络连接出错！code:404');
                    }
                }
            });
        },
        requestEventInfo: function (s) {
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
                success: function (data) {
                    //console.log(data);
                    if (data.success != 1) {
                        xxwsWindowObj.xxwsAlert('网络连接出错！code:-1');
                        return;
                    }
                    var aData = data.rows;
                    if (aData.length === 0) {
                        return;
                    }
                    eventObj.setEventPointsMarker(aData);
                    //that.drawEventOnLine(aData);
                },
                statusCode: {
                    404: function () {
                        xxwsWindowObj.xxwsAlert('网络连接出错！code:404');
                    }
                }
            });
        },
        drawRoute: function (data, flag) {
            // var obj = mapObj.getMaxPointAndMinPoint(data);
            // var level = mapObj.getCenterPointAndZoomLevel(obj.maxLon, obj.maxLat, obj.minLon, obj.minLat);
            // mapObj.$bdMap.centerAndZoom(level.centerPoint, level.zoomlevel);
            var arr = data.map(function (item, index, arr) {
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
        drawEventOnLine: function (data) {
            var that = this;
            var s = '';
            console.log(data)
            data.forEach(function (item, index) {
                var l = utils.getDateFromDateString(item.createTime).getTime();
                var rate = (l - that.beginTime) / that.allTime;
                rate = rate > 1 ? 1 : rate;
                rate = rate < 0 ? 0 : rate;
                s += '<div class="item dis1" style="left:' + that.lineLength * rate + 'px"></div>';
            });
            that.$event_line.html(s);
        },
        movePerson: function (data) {
            var that = this;
            that.personMarker = new BMap.Marker(new BMap.Point(data[0].bdLon, data[0].bdLat), {
                icon: new BMap.Icon("/src/images/map/icon_person.png", new BMap.Size(30, 42))
            });
            mapObj.$bdMap.addOverlay(that.personMarker);
            that.renderTimeLine()
        },
        setTimer: function (bool) {
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
            that.timer = setInterval(function () {
                that.nowTime += 40 * that.rate;
                if (that.nowTime > that.allTime) {
                    that.$btn_play.addClass('active');
                    clearInterval(that.timer);
                }
                that.setCurrentPointByTime(data[0].createTime + that.nowTime);
                that.renderTimeLine();
            }, 40);
        },
        setCurrentScopeByTime: function (time) { //入参：毫秒时间点
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
        setCurrentPointByTime: function (time) { //入参：毫秒时间点
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
        close_player: function (fn) {
            var that = this;
            that.setTimer();
            mapObj.$bdMap.clearOverlays();
            $('.player_wrapper').css('display', 'none');
            if (Object.prototype.toString.call(fn) === '[object Function]') {
                fn();
            }
        },

    }


    $(function () {
        global.playerObj = new playerClass();
    })

})(this, this.$, document, mapObj, xxwsWindowObj);