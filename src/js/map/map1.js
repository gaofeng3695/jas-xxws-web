$(function() {
    eventObj.init(); //事件信息初始化
    inspectObj.init(); //巡检信息初始化
    tabObj.init(); //左上角tab操作对象
    isExistNet.init(); //用于判断管网是否存在
})



//事件相关
var eventObj = {
    $eventBtn: $(".eventBtn"),
    $searchEvent: $("#search_event"),
    $searchEventText: $(".search_event"),
    $eventInformation: $(".event_list"),
    $eventClosed: $(".close_event"),
    $tabEventClosed: $("#event_closed"),
    _eventData: null, //初始化数据
    eventStartPoints: [], //初始化事件点的数组
    eventPoints: [], //页面展示事件点的数组
    initialPoints: [], //零时存储事件点
    markerClusterer: null,
    eventConditionObj: {
        "status": "20", //处理状态，固定为20 处理中事件
        "type": "", //事件类型, 固定为1,2,3
        "startDate": "2016-10-01", //开始日期 固定为2016-10-01
        "endDate": "", //结束日期 当前系统时间
        "keyword": "", //固定为空，
        "userIds": "", // 逗号分隔的userId 输入查询用户ID
        "pageNum": 1, //第几页
        "pageSize": 100 //每页记录数
    },
    init: function() {
        var _this = this;
        //初始化获取事件信息
        this.getEventData();

        //事件点的开关
        this.$eventBtn.click(function() {
            if ($(this).hasClass("active")) {
                _this.closeEvent();
            } else {
                _this.openEvent();
            }
        });
        //关闭事件详情窗口
        this.$eventClosed.click(function() {
            $(".event_list").hide();
            for (var i = 0; i < _this.eventPoints.length; i++) {
                _this.eventPoints[i].value.setAnimation();
            }
        });
        //点击搜索
        this.$searchEvent.click(function() {
            var querry = _this.$searchEventText.val().trim();
            _this.searchData(querry);
        });

        //事件列表点击查看详情
        $("#_event .event").on("click", "li", function() {
            var eventId = $(this).find("input[type=hidden]").val();
            _this.eventTabListClick(eventId);
            // console.log($(this).find("input[type=hidden]").val());
        });
        //左上角事件tab关闭
        this.$tabEventClosed.click(function() {
            inspectObj.resetInspect();
            _this.resetevent();
        });
    },
    closeEvent: function() {
        this.$eventBtn.removeClass("active");
        this.removePoints();
        this.$eventInformation.hide();
    },
    openEvent: function() {
        this.$eventBtn.addClass("active");
        this.addPoints();
    },
    assignmentPoints: function() { //初始化事件点信息
        for (var i = 0; i < this.eventPoints.length; i++) {
            this.eventStartPoints[i] = this.eventPoints[i];
        }
    },
    setInitialPoints: function() { //储存事件点
        for (var i = 0; i < this.eventPoints.length; i++) {
            this.initialPoints[i] = this.eventPoints[i];
        }
    },
    getInitialPoints: function() { //获取事件点
        if (this.initialPoints.length > 0) {
            for (var i = 0; i < this.initialPoints.length; i++) {
                this.eventPoints[i] = this.initialPoints[i];
            }
            this.initialPoints = []; //清空
        }
    },
    setEventPointsMarker: function(data, boolean) { //设置地图事件点
        // mapObj.$bdMap.clearOverlays(); //清除地图上已经标注的点
        //清空事件点
        this.removePoints();
        var _this = this;
        if (boolean == '' || boolean == null || boolean == undefined) {
            //
        } else {
            _this.setInitialPoints();
        }

        var myIcons = null;
        var markers = null;
        var point = null;
        this.eventPoints = [];
        for (var i = 0; i < data.length; i++) {
            point = new BMap.Point(data[i].bdLon, data[i].bdLat);
            if (data[i].eventIconName) {
                if (data[i].status == 20) {
                    myIcons = new BMap.Icon("/src/images/common/process/" + data[i].eventIconName, new BMap.Size(29, 42), {
                        anchor: new BMap.Size(15, 42)
                    });
                } else {
                    myIcons = new BMap.Icon("/src/images/common/finish/" + data[i].eventIconName, new BMap.Size(29, 42), {
                        anchor: new BMap.Size(15, 42)
                    });
                }
            } else {
                myIcons = new BMap.Icon("/src/images/common/process/D01.png", new BMap.Size(29, 42), {
                    anchor: new BMap.Size(15, 42)
                });;
            }
            // if (data[i].parentTypeId == 1) {
            //     if (data[i].status == 20) {
            //         myIcons = mapObj.bdIconObj.constructionOn;
            //     } else {
            //         myIcons = mapObj.bdIconObj.construction;
            //     }
            // } else if (data[i].parentTypeId == 2) {
            //     if (data[i].status == 20) {
            //         myIcons = mapObj.bdIconObj.disasterOn;
            //     } else {
            //         myIcons = mapObj.bdIconObj.disaster;
            //     }
            // } else if (data[i].parentTypeId == 3) {
            //     if (data[i].status == 20) {
            //         myIcons = mapObj.bdIconObj.pipelineOn;
            //     } else {
            //         myIcons = mapObj.bdIconObj.pipeline;
            //     }
            // }
            markers = new BMap.Marker(point, {
                icon: myIcons
            });
            //将当前地图上的坐标点 赋值全局变量
            this.eventPoints.push({
                'key': data[i].objectId,
                'value': markers
            });
            //添加点击事件
            markers.addEventListener("click", function(e) {
                _this.eventPointClick(e, boolean);
            });
        }
        this.addPoints();
    },
    eventPointClick: function(e, boolean) { //事件标注点的点击事件
        var _this = this;
        // debugger;
        for (var i = 0; i < this.eventPoints.length; i++) {
            this.eventPoints[i].value.setAnimation();
        }
        for (var i = 0; i < inspectObj.inspectPoints.length; i++) {
            inspectObj.inspectPoints[i].value.setAnimation();
        }
        var p = e.target;
        p.setAnimation(BMAP_ANIMATION_BOUNCE); //添加跳动
        for (var i = 0; i < this.eventPoints.length; i++) {
            if (this.eventPoints[i].value == p) {
                if (boolean == '' || boolean == null || boolean == undefined) {
                    _this.getEventDetails(this.eventPoints[i].key);
                } else {
                    taskDetailsObj.loadDetails(this.eventPoints[i].key);
                }
                // console.log(this.eventPoints[i].key);
            }
        }
    },
    eventTabListClick: function(eventId) { //事件列表点击事件
        var _this = this;
        if (this.$eventBtn.hasClass("active")) {} else {
            this.addPoints();
        }
        for (var i = 0; i < inspectObj.inspectPoints.length; i++) {
            inspectObj.inspectPoints[i].value.setAnimation();
        }
        for (var i = 0; i < _this.eventPoints.length; i++) {
            if (_this.eventPoints[i].key == eventId) {
                //设置中心点并跳动
                var cenLng = _this.eventPoints[i].value.getPosition().lng;
                var cenLat = _this.eventPoints[i].value.getPosition().lat;
                mapObj.$bdMap.centerAndZoom(new BMap.Point(cenLng, cenLat), 19);
                _this.eventPoints[i].value.setAnimation(BMAP_ANIMATION_BOUNCE);
            } else {
                _this.eventPoints[i].value.setAnimation();
            }
        }
        this.getEventDetails(eventId);
        this.$eventBtn.addClass("active");

    },
    setEventTab: function(data) { //事件列表
        this.$eventBtn.addClass("active");
        $("#_event .event ul").html("");
        var txt = null;
        try {
            if (data.length > 0) {
                for (var i = 0; i < data.length; i++) {
                    txt = '<li>' +
                        '<input type="hidden" value="' + data[i].objectId + '">' +
                        '<div class="line01">' +
                        '<span class="type">' + data[i].fullTypeName + '</span>' +
                        '<span class="name">' + data[i].inspectorName + '</span>' +
                        '<span class="date">' + data[i].occurrenceTime + '</span>' +
                        '</div>' +
                        '<div class="loca_desc">' + data[i].address + '</div>' +
                        '</li>';
                    $("#_event .event ul").append(txt);
                }
            } else {
                txt = '<p style="text-align:center;">没有查询到您要数据！</p>';
                $("#_event .event ul").append(txt);
            }
        } catch (e) {
            txt = '<p style="text-align:center;">没有查询到您要数据！</p>';
            $("#_event .event ul").append(txt);
        }

    },
    eventInit: function() { //事件初始化获取需要数据
        var leng = this._eventData.rows.length;
        $(".eventAll").text(leng);
        this.assignmentPoints();
        this.setEventTab(this._eventData.rows);
    },
    searchData: function(querry) { //模糊查询的结果
        var querryArr = jsonFuzzyQuery(this._eventData.rows, querry, "fullTypeName,inspectorName,occurrenceTime,address");
        // console.log(querryArr);
        this.setEventPointsMarker(querryArr);
        this.setEventTab(querryArr);
        this.$eventInformation.hide();
        mapObj.setPointsMarkerWithCenterPointAndZoomLevel(querryArr);
        this.$eventBtn.addClass("active");
    },
    resetevent: function() { //重置事件信息
        this.$eventInformation.hide();
        this.$searchEventText.val("");
        this.setEventPointsMarker(this._eventData.rows);
        this.setEventTab(this._eventData.rows);
        mapObj.setPointsMarkerWithCenterPointAndZoomLevel(this._eventData.rows);
        this.$eventBtn.addClass("active");
    },
    getEventData: function() { //获取所有未处理的事件
        var _this = this;
        $.ajax({
            type: 'POST',
            url: "/cloudlink-inspection-event/eventInfo/web/v1/getPageList?token=" + lsObj.getLocalStorage('token'),
            contentType: "application/json",
            data: JSON.stringify(_this.eventConditionObj),
            dataType: 'json',
            success: function(data, status) {
                _this._eventData = data;
                _this.eventInit();
                eventObj.setEventPointsMarker(_this._eventData.rows);
                eventsAndInspectersLoadFinish(_this._eventData.rows); //create by alex 判断事件与人员都已经初始化加载完成
            }
        })
    },
    getEventDetails: function(eventId) { //根据事件id获取事件详情
        var _this = this;
        inspectObj.$inspectInformation.hide();
        _this.$eventInformation.show();
        $.ajax({
            type: 'GET',
            url: "/cloudlink-inspection-event/eventInfo/get?token=" + lsObj.getLocalStorage('token') + "&eventId=" + eventId,
            contentType: "application/json",
            dataType: "json",
            success: function(data, status) {
                var msg = data.rows;
                // console.log(msg[0]);
                var images = msg[0].pic;
                $(".eventpic_list ul").html(''); //初始化的时候，将图片进行清空
                $(".event_code").text(msg[0].eventCode);
                $(".event_type").text(msg[0].fullTypeName); //事件类型
                $(".report_man").text(msg[0].inspectorName); //上报人
                $(".event_address").text(msg[0].address); //详细位置
                $(".event_description").text(msg[0].description); //事件描述
                $(".event_date").text(msg[0].occurrenceTime); //事件时间
                $(".detail_btn").attr("name", msg[0].objectId);
                var pic_scr = "";
                $(".pic_des").html("");
                if (images.length > 0) {
                    for (var i = 0; i < images.length; i++) {
                        pic_scr += '<li><img data-original="/cloudlink-core-file/file/downLoad?fileId=' + images[i] + '" src="/cloudlink-core-file/file/getImageBySize?fileId=' + images[i] + '&viewModel=fill&width=64&hight=64" id="imagesPic' + i + '" onclick="previewPicture(this)" alt=""/></li>';
                    }
                } else {
                    $(".pic_des").html("无");
                }
                $(".eventpic_list ul").append(pic_scr);
                $(".event_audio_list").html("");
                if (msg[0].audio.length == 0) {
                    $(".event_audio_list").html("无");
                } else {
                    var audioMain = '<button  class="audioPlay" onclick="playAmrAudio(\'' + msg[0].audio[0] + '\',this)"></button>';
                    $(".event_audio_list").html(audioMain);
                }
            }
        });
    },
    addPoints: function() { //添加事件点
        var markersArr = [];
        for (var i = 0; i < this.eventPoints.length; i++) {
            // mapObj.$bdMap.addOverlay(this.eventPoints[i].value);
            markersArr.push(this.eventPoints[i].value);
        }
        this.markerClusterer = new BMapLib.MarkerClusterer(mapObj.$bdMap, { markers: markersArr });
    },
    removePoints: function() { //删除事件点
        if (this.eventPoints.length > 0) {
            for (var i = 0; i < this.eventPoints.length; i++) {
                // mapObj.$bdMap.removeOverlay(this.eventPoints[i].value);
                this.markerClusterer.removeMarker(this.eventPoints[i].value);
            }
        } else {}
    }
}

//巡检人员相关
var inspectObj = {
        $inspectBtn: $(".inspectBtn"),
        $networkBtn: $(".networkBtn"),
        $search: $("#search_people"),
        $searchText: $(".search_people"),
        $inspectInformation: $("#accordion"),
        $inspectClosed: $(".close_inspect"),
        $tabInspectClosed: $("#people_closed"),
        $eventDate: $(".eventDate"),
        $lineDate: $(".inspectDate"),
        _inspectData: null, //初始化数据
        inspectStartPoints: [], //初始化巡检点的数组
        inspectPoints: [], //页面展示巡检点的数组
        eventParameterObj: { //打开人员列表事件请求的参数
            "status": "20,21,30", //处理状态，20 处理中事件
            "type": "", //事件类型
            "startDate": new Date().Format('yyyy-MM-dd'), //开始日期 固定为2016-10-01
            "endDate": new Date().Format('yyyy-MM-dd'), //结束日期 当前系统时间
            "keyword": "", //固定为空，
            "inspectorId": "", // 逗号分隔的userId 输入查询用户ID
            "pageNum": 1, //第几页
            "pageSize": 100 //每页记录数
        },
        eventSearchObj: {}, //搜索事件请求的参数
        inspectParameterObj: { //打开人员列表巡检请求的参数
            "status": "1,0", //固定为1,0查询全部
            // "startDate": "2017-3-10",
            "startDate": new Date().Format('yyyy-MM-dd'), //开始日期 固定开始时间为项目启动时间
            "endDate": new Date().Format('yyyy-MM-dd'), //结束日期 为当前系统时间
            "keyword": "", //巡线人，巡线编号 固定为空
            "userIds": '', //逗号分隔的userId 输入查询用户ID
            "pageNum": 1, //第几页
            "pageSize": 100 //每页记录数
        },
        inspectSearchObj: {}, //搜索巡检请求的参数
        init: function() {
            var _this = this;
            this.getInspectData();
            this.getNewestData();
            this.eventInspectLinkage();
            this.bindDateDiyEvent();
            this.getCurrentTime();
            //点击搜索
            this.$search.click(function() {
                var querry = _this.$searchText.val().trim();
                _this.searchData(querry);
            });
            //巡检点的开关
            this.$inspectBtn.click(function() {
                if ($(this).hasClass("active")) {
                    _this.closeInspect();
                } else {
                    _this.openInspect();
                }
            });
            //管网的开关
            this.$networkBtn.click(function() {
                if ($(this).hasClass("active")) {
                    $(this).removeClass("active");
                    pipeLineObj.removeLines(); //清除地图的管线图层
                } else {
                    $(this).addClass("active");
                    pipeLineObj.drawLines() //重新添加地图的管线图层
                }
            });
            //事件列表点击查看详情
            $("#people .people").on("click", "li", function() {
                var inspectId = $(this).find("input[name=inspect_id]").val();
                var isOnline = $(this).find("input[name=is_online]").val();
                var isBd = $(this).find("input[name=is_bdLon]").val();
                _this.inspectTabListClick(inspectId, isOnline, isBd);
                // console.log($(this).find("input[type=hidden]").val());
            });

            //关闭人员详情窗口
            this.$inspectClosed.click(function() {
                _this.$inspectInformation.hide();
                for (var i = 0; i < _this.inspectPoints.length; i++) {
                    _this.inspectPoints[i].value.setAnimation();
                }
            });

            //左上角人员tab关闭
            this.$tabInspectClosed.click(function() {
                playerObj.close_player(function() {
                    eventObj.getInitialPoints();
                });
                _this.resetInspect();
                eventObj.resetevent();
            });
        },
        closeInspect: function() {
            this.$inspectBtn.removeClass("active");
            this.removePoints();
            this.$inspectInformation.hide();
        },
        openInspect: function() {
            this.$inspectBtn.addClass("active");
            this.addPoints();
        },
        assignmentPoints: function() { //初始化在线巡检员信息
            for (var i = 0; i < this.inspectPoints.length; i++) {
                this.inspectStartPoints[i] = this.inspectPoints[i];
            }
        },
        setInspectPointsMarker: function(data) { //巡检人员添加设置标注点
            this.removePoints();
            var _this = this;
            var myIcons = null;
            var markers = null;
            var point = null;
            this.inspectPoints = [];
            for (var i = 0; i < data.length; i++) {
                if (data[i].isOnline == 1) {
                    myIcons = mapObj.bdIconObj.inspectOn;
                } else {
                    myIcons = mapObj.bdIconObj.inspecLeave;
                }

                point = new BMap.Point(data[i].bdLon, data[i].bdLat);
                markers = new BMap.Marker(point, {
                    icon: myIcons
                });
                // mapObj.$bdMap.addOverlay(markers);
                //将当前地图上的坐标点 赋值全局变量
                this.inspectPoints.push({
                    'key': data[i].objectId,
                    'name': data[i].userName,
                    'value': markers,
                    "isOnline": data[i].isOnline,
                    "isBd": data[i].bdLon
                });
                //添加点击事件
                markers.addEventListener("click", function(e) {
                    _this.inspectPointClick(e);
                });
            }
            this.addPoints();
        },
        inspectPointClick: function(e) { //巡检人员标注点的点击事件
            var _this = this;
            for (var i = 0; i < eventObj.eventPoints.length; i++) {
                eventObj.eventPoints[i].value.setAnimation();
            }
            for (var i = 0; i < this.inspectPoints.length; i++) {
                this.inspectPoints[i].value.setAnimation();
            }
            var p = e.target;
            p.setAnimation(BMAP_ANIMATION_BOUNCE); //添加跳动
            for (var i = 0; i < this.inspectPoints.length; i++) {

                if (this.inspectPoints[i].value == p) {
                    _this.getAllDetails(this.inspectPoints[i].key, this.inspectPoints[i].isOnline, this.inspectPoints[i].isBd);
                    // console.log(this.inspectPoints[i].key);
                }
            }
        },
        inspectTabListClick: function(inspectId, isOnline, isBd) { //人员列表点击事件
            var _this = this;
            // mapObj.$bdMap.clearO
            playerObj.close_player(function() {
                eventObj.getInitialPoints();
            });
            // 修复 点击人员列表后，标注点消失 原因
            this.addPoints();
            // if (this.$inspectBtn.hasClass("active")) {} else {
            //     console.log('else---');
            //     this.addPoints();
            // }
            this.$inspectBtn.addClass("active");
            //巡检员信息
            var peopleLeave = Enumerable.From(this._inspectData.rows).Where(function(x) {
                return x.objectId == inspectId
            }).Select(function(x) {
                return x
            }).ToArray();
            var isExist = 0;
            for (var i = 0; i < eventObj.eventPoints.length; i++) {
                eventObj.eventPoints[i].value.setAnimation();
            }
            var _this = this;
            for (var i = 0; i < _this.inspectPoints.length; i++) {
                if (_this.inspectPoints[i].key == inspectId) {
                    isExist++;
                    _this.inspectPoints[i].value.setAnimation(BMAP_ANIMATION_BOUNCE);
                    //设置中心点
                    var cenLng = _this.inspectPoints[i].value.getPosition().lng;
                    var cenLat = _this.inspectPoints[i].value.getPosition().lat;
                    mapObj.$bdMap.setCenter(new BMap.Point(cenLng, cenLat));
                } else {
                    _this.inspectPoints[i].value.setAnimation();
                }
            }
            this.getAllDetails(inspectId, isOnline, isBd);
            if (isExist > 0) return;
            //添加离线人员图标
            if (peopleLeave[0].isOnline == 0) {
                var _point = new BMap.Point(peopleLeave[0].bdLon, peopleLeave[0].bdLat);
                var _marker = new BMap.Marker(_point); // 创建标注
                var _myIcons = mapObj.bdIconObj.inspecLeave;
                _marker = new BMap.Marker(_point, {
                    icon: _myIcons
                });

                mapObj.$bdMap.addOverlay(_marker); // 将标注添加到地图中
                mapObj.$bdMap.setCenter(_point);
                _marker.setAnimation(BMAP_ANIMATION_BOUNCE);
                this.inspectPoints.push({
                    key: inspectId,
                    name: peopleLeave[0].userName,
                    value: _marker,
                    "isOnline": peopleLeave[0].isOnline,
                    "isBd": peopleLeave[0].bdLon
                });
                //添加点击事件
                _marker.addEventListener("click", function(e) {
                    _this.inspectPointClick(e);
                });
            }
        },
        inspectOnline: function(data) { //巡检在线人员标地图点
            //所有的人员
            var peopelAllArr = Enumerable.From(data).Where(function(x) {
                return x.isOnline !== -1
            }).Select(function(x) {
                return x
            }).ToArray();
            //在线人员
            var onlineArr = Enumerable.From(data).Where(function(x) {
                return (x.isOnline > -1 && x.bdLon > 0)
            }).Select(function(x) {
                return x
            }).ToArray();
            $(".inspectOnline").text(onlineArr.length);

            //mapObj.setPointsMarkerWithCenterPointAndZoomLevel(onlineArr);
            this.setInspectPointsMarker(peopelAllArr);
        },
        inspectInit: function() { //巡检初始化获取需要数据
            //巡线人员数组
            // var patrolArr = Enumerable.From(this._inspectData.rows).Where(function(x) {
            //     return x.roleNames == '巡检工作人员'
            // }).Select(function(x) {
            //     return x
            // }).ToArray();
            $(".patrolNum").text(this._inspectData.rows.length);
            this.inspectOnline(this._inspectData.rows);
            this.setInspectTab(this._inspectData.rows);
            // console.log(patrolArr.length);
        },
        searchData: function(querry) { //模糊查询的结果
            var querryArr = jsonFuzzyQuery(this._inspectData.rows, querry, "userName,orgName,roleNames");
            // console.log(querryArr);
            this.inspectOnline(querryArr);
            this.setInspectTab(querryArr);
            this.$inspectInformation.hide();
            mapObj.setPointsMarkerWithCenterPointAndZoomLevel(querryArr);
            this.$inspectBtn.addClass("active");
        },
        resetInspect: function() { //重置人员信息
            this.$inspectInformation.hide();
            this.$searchText.val("");
            this.inspectOnline(this._inspectData.rows);
            this.setInspectTab(this._inspectData.rows);
            // mapObj.setPointsMarkerWithCenterPointAndZoomLevel(this._inspectData.rows);
            this.$inspectBtn.addClass("active");
        },
        setInspectTab: function(data) { //人员信息列表
            $("#people .people ul").html("");
            var txt = null;
            try {
                if (data.length > 0) {
                    for (var i = 0; i < data.length; i++) {
                        var roleName = data[i].roleNames;
                        var orgname = data[i].orgName;
                        if (roleName == null || roleName == '') {
                            roleName = "----";
                        }
                        if (orgname == null || orgname == '') {
                            orgname = "----";
                        }
                        // console.log(data[i])
                        var state = data[i].isOnline > -1 && +data[i].bdLon > 0 ? '今日已巡' : '今日未巡';
                        var activeState = data[i].isOnline > -1 && +data[i].bdLon > 0 ? 'active' : '';
                        txt = '<li>' +
                            '<input type="hidden" name="inspect_id" value="' + data[i].objectId + '">' +
                            '<input type="hidden" name="is_online" value="' + data[i].isOnline + '">' +
                            '<input type="hidden" name="is_bdLon" value="' + data[i].bdLon + '">' +
                            '<span class="peoicon ' + activeState + '">' + state + '</span>' +
                            '<span class="name">' + data[i].userName + '</span>' +
                            '<span class="dept">' + orgname + '</span>' +
                            '<span class="task">' + roleName + '</span>' +
                            '</li>';

                        $("#people .people ul").append(txt);
                    }
                } else {
                    txt = '<p style="text-align:center;">没有查询到您要数据！</p>';
                    $("#people .people ul").append(txt);
                }
            } catch (e) {
                txt = '<p style="text-align:center;">没有查询到您要数据！</p>';
                $("#people .people ul").append(txt);
            }

        },
        getInspectData: function() { //获取巡检数据
            var _this = this;
            $.ajax({
                type: 'GET',
                url: "/cloudlink-inspection-event/inspectionMonitor/getListAuthority?token=" + lsObj.getLocalStorage('token'),
                contentType: "application/json",
                dataType: 'json',
                success: function(data, status) {
                    _this._inspectData = data;
                    // console.log(_this._inspectData);
                    _this.inspectInit();
                    eventsAndInspectersLoadFinish(data.rows); //create by alex 判断事件与人员都已经初始化加载完成
                }
            })
        },
        getNewestData: function() { //获取当前最新数据
            var _this = this;
            $.ajax({
                type: 'GET',
                url: "/cloudlink-inspection-analysis/patrolStatistical/getPatrolStatisticsData?token=" + lsObj.getLocalStorage('token'),
                contentType: "application/json",
                dataType: 'json',
                success: function(data, status) {
                    $(".eventNew").text(data.rows[0].eventCountToday);
                    // console.log(data);
                }
            })
        },
        getInspectDetails: function(inspectId, isOnline, isBd) { //根据巡检id获取巡检员详情
            var _this = this;
            eventObj.$eventInformation.hide();
            _this.$inspectInformation.show();
            $.ajax({
                type: 'GET',
                url: "/cloudlink-inspection-analysis/mapStatistical/getUserStatistics?token=" + lsObj.getLocalStorage('token') + "&inspectorId=" + inspectId,
                contentType: "application/json",
                dataType: "json",
                success: function(data, status) {
                    // 头像
                    if (data.rows[0].profilePhoto != null && data.rows[0].profilePhoto != "") {
                        $(".inspectImg").attr('src', "/cloudlink-core-file/file/getImageBySize?fileId=" + data.rows[0].profilePhoto + "&viewModel=fill&width=500&hight=500");
                    } else {
                        $(".inspectImg").attr('src', "/src/images/main/photo.png");
                    }
                    // 是否在线
                    if (isOnline == 1 && +isBd > 0) {
                        $('.isOnline').attr({
                            'src': '/src/images/map/line.png',
                            "title": "在线"
                        });
                        $(".status").css("background", "#51b7ff");
                        $(".isPolling").text("今日已巡");
                    } else if (isOnline == 0 && +isBd > 0) {
                        $('.isOnline').attr({
                            'src': '/src/images/map/Leave_line.png',
                            "title": "离线"
                        });
                        $(".status").css("background", "#51b7ff");
                        $(".isPolling").text("今日已巡");
                    } else {
                        $(".status").css("background", "#b9b9b9");
                        $(".isPolling").text("今日未巡");
                        $('.isOnline').attr({
                            'src': '/src/images/map/Leave_line.png',
                            "title": "离线"
                        });
                    }


                    //手机号码的显示
                    $(".dynamicTitle").attr('title', data.rows[0].mobileNum);
                    // 姓名
                    $('.inspectUseName').text(data.rows[0].userName);

                    var roleName = data.rows[0].roleNames;
                    var orgname = data.rows[0].orgName;
                    if (roleName == null || roleName == '') {
                        roleName = "----";
                    }
                    if (orgname == null || orgname == '') {
                        orgname = "----";
                    }
                    // 部门
                    $('.inspectDepartment').text(orgname);
                    // 角色
                    $('.inspectRoleName').text(roleName);
                    // 手机号
                    // 本日巡检次数
                    $('.inspectCount').text(data.rows[0].inspectTodayCount + ' 次');
                    // 本日巡检里程
                    $('.inspectKm').text((data.rows[0].inspectTodayDistance / 1000).toFixed(2) + ' km');
                    // 本日事件上报
                    $('.inspectQi').text(data.rows[0].eventTodayCount + ' 起');
                    // console.log(data);
                }
            });
        },
        addPoints: function() { //添加巡检点
            for (var i = 0; i < this.inspectPoints.length; i++) {
                var label = new BMap.Label(this.inspectPoints[i].name, { offset: new BMap.Size(30, 3) });
                if (this.inspectPoints[i].isOnline == 1) {
                    label.setStyle({ color: "#75c3fe", fontSize: "12px", border: '1px solid #75c3fe', padding: '3px' });
                } else {
                    label.setStyle({ color: "#999", fontSize: "12px", border: '1px solid #999', padding: '3px' });
                }
                this.inspectPoints[i].value.setLabel(label);
                mapObj.$bdMap.addOverlay(this.inspectPoints[i].value);
            }
        },
        removePoints: function() { //删除巡检点
            for (var i = 0; i < this.inspectPoints.length; i++) {
                mapObj.$bdMap.removeOverlay(this.inspectPoints[i].value);
            }
        },
        getEventPageList: function() { //加载人员下的事件记录分页信息
            var _this = this;
            $.ajax({
                type: 'POST',
                url: "/cloudlink-inspection-event/eventInfo/web/v1/getPageList?token=" + lsObj.getLocalStorage('token'),
                contentType: "application/json",
                data: JSON.stringify(_this.eventSearchObj),
                dataType: 'json',
                success: function(data, status) {
                    // console.log(data);
                    if (data.success == 1) {
                        $(".eventListPage").html("");
                        var eventHtml = "";
                        if (data.rows.length > 0) {
                            for (var i = 0; i < data.rows.length; i++) {
                                eventHtml = '<div class="record_details "><p class="pb10 pt10"><span class="fr5 width fl5">事件时间</span>' +
                                    '<span class="borderLeft fl block ">' + data.rows[i].createTime + '</span>' +
                                    '</p><p class = "pb10 pt10" ><span class = "fr5 width" > 事件类型 </span>' +
                                    '<span class="borderLeft fl block">' + data.rows[i].fullTypeName + '</span ></p>' +
                                    '<p class = "pb10 pt10"> <span class = "fr5 width">上报人</span>' +
                                    '<span class="borderLeft fl block">' + data.rows[i].inspectorName + '</span></p>' +
                                    '<p class = "pb10 pt10" > <span class = "fr5 width"> 事件状态</span>' +
                                    '<span class="borderLeft fl block">' + data.rows[i].statusValue + '</span> </p>' +
                                    '<button class = "viewDetails" name="' + data.rows[i].objectId + '" onclick="view_detail(this)"> 查看详情 </button></div>';
                                $(".eventListPage").append(eventHtml);
                            }
                        } else {
                            eventHtml = '<p style="text-align:center;min-height:152px;line-height:152px;">暂无相关数据</p>';
                            $(".eventListPage").append(eventHtml);
                        }
                    }
                    $(".eventListPage").find("div").last().css("margin-bottom", "0px"); //直接添加样式
                }
            })

        },
        getInspectionPageList: function() { //加载人员下的巡检记录事件分页信息
            var _this = this;
            $.ajax({
                type: 'POST',
                url: "/cloudlink-inspection-event/inspectionRecord/web/v1/getPageList?token=" + lsObj.getLocalStorage('token'),
                contentType: "application/json",
                data: JSON.stringify(_this.inspectSearchObj),
                dataType: 'json',
                success: function(data, status) {
                    if (data.success == 1) {
                        var peopleHtml = "";
                        var inspectStatus = null;
                        var inspectTxt = null;
                        var timeS = new Date().getTime();
                        var timeE = null;
                        $(".peopleList").html("");
                        if (data.rows.length > 0) {
                            for (var i = 0; i < data.rows.length; i++) {
                                inspectStatus = data.rows[i].flag;
                                timeE = new Date(data.rows[i].endTime).getTime();
                                if (inspectStatus == 1) {
                                    inspectTxt = '已完成';
                                } else {
                                    if (timeS - timeE > 300000) {
                                        inspectTxt = '其他';
                                    } else {
                                        inspectTxt = '巡检中';
                                    }
                                }
                                peopleHtml = '<div class="record_details">' +
                                    '<input type="hidden" name="inspect_id_m" value="' + data.rows[i].objectId + '">' +
                                    '<input type="hidden" name="flag_m" value="' + data.rows[i].flag + '">' +
                                    '<p class="pb10 pt10"><span class="fr5 width fl5">开始时间</span>' +
                                    '<span class="borderLeft fl block ">' + data.rows[i].beginTime + '</span>' +
                                    '</p><p class = "pb10 pt10" ><span class = "fr5 width" > 结束时间 </span>' +
                                    '<span class="borderLeft fl block">' + data.rows[i].endTime + '</span ></p>' +
                                    '<p class = "pb10 pt10"> <span class = "fr5 width">时长</span>' +
                                    '<span class="borderLeft fl block">' + data.rows[i].wholeTime + '</span></p>' +
                                    '<p class = "pb10 pt10" > <span class = "fr5 width"> 巡线状态</span>' +
                                    '<span class="borderLeft fl block">' + inspectTxt + '</span> </p>' +
                                    '<p class="pb10 pt10"><span class="fr5 width">总里程</span>' +
                                    '<span class="borderLeft fl block peopleDistance">' + (data.rows[i].distance / 1000).toFixed(2) + ' KM' + '</span> </p>' +
                                    '<p class="pb10 pt10" style="height:23px;line-height:23px"><span class="fr5 width">轨迹回放</span>' +
                                    '<span class="borderLeft fl block"><img onclick="palyInspect(this)" src="/src/images/map/bofang.png" alt=""></span></p>';

                                $(".peopleList").append(peopleHtml);
                            }
                        } else {
                            peopleHtml = '<p style="text-align:center;line-height:152px;min-height:152px;">暂无相关数据</p>';
                            $(".peopleList").append(peopleHtml);
                        }
                        $(".peopleList").find("div").last().css("margin-bottom", "0px"); //直接添加样式
                    }
                }
            });
        },
        getAllDetails: function(inspectId, isOnline, isBd) { //获取人员图标的所有信息
            $.extend(this.inspectSearchObj, this.inspectParameterObj);
            this.inspectSearchObj.userIds = inspectId;
            $.extend(this.eventSearchObj, this.eventParameterObj);
            this.eventSearchObj.inspectorId = inspectId;
            this.getInspectDetails(inspectId, isOnline, isBd);
            this.getEventPageList();
            this.searchEventByDate(); //确定根据时间进行事件的搜索
            this.searchlineByDate(); //确定根据时间进行巡线记录的搜索
            this.getInspectionPageList();
        },
        eventSearchList: function() { //搜索查询事件列表
            this.getEventPageList();
        },
        InspectSearchList: function() { //搜索查询巡检列表
            this.getInspectionPageList();
        },
        eventInspectLinkage: function() { //事件与巡检相关的联动
            $(".panel-heading").click(function() {
                var thisDiv = $(this).closest(".panel-default");
                var otherDiv = $(this).closest(".panel-default").siblings(".panel-default");
                if (thisDiv.find("div.collapse").is(":hidden")) {
                    thisDiv.find("div.collapse").slideDown();
                    thisDiv.find(".panel-heading span").removeClass('glyphicon-menu-down').addClass("glyphicon-menu-up");
                } else {
                    thisDiv.find("div.collapse").slideUp();
                    thisDiv.find(".panel-heading span").removeClass('glyphicon-menu-up').addClass("glyphicon-menu-down");
                }
                otherDiv.find("div.collapse").slideUp();
                otherDiv.find(".panel-heading span").removeClass('glyphicon-menu-up').addClass("glyphicon-menu-down");
            })
        },
        bindDateDiyEvent: function() { //时间控件
            $("#datetimeStartEvent").datetimepicker({
                format: 'yyyy-mm-dd',
                minView: 'month',
                language: 'zh-CN',
                autoclose: true,
            }).on("click", function() {
                $("#datetimeStartEvent").datetimepicker("setEndDate", $("#datetimeEndEvent").val());
            });
            $("#datetimeEndEvent").datetimepicker({
                format: 'yyyy-mm-dd',
                minView: 'month',
                language: 'zh-CN',
                autoclose: true,
            }).on("click", function() {
                $("#datetimeEndEvent").datetimepicker("setStartDate", $("#datetimeStartEvent").val());
                $("#datetimeEndEvent").datetimepicker("setEndDate", new Date());
            });

            $("#datetimeStartInspect").datetimepicker({
                format: 'yyyy-mm-dd',
                minView: 'month',
                language: 'zh-CN',
                autoclose: true,
            }).on("click", function() {
                $("#datetimeStartInspect").datetimepicker("setEndDate", $("#datetimeEndInspect").val());
            });
            $("#datetimeEndInspect").datetimepicker({
                format: 'yyyy-mm-dd',
                minView: 'month',
                language: 'zh-CN',
                autoclose: true,
            }).on("click", function() {
                $("#datetimeEndInspect").datetimepicker("setStartDate", $("#datetimeStartInspect").val());
                $("#datetimeEndInspect").datetimepicker("setEndDate", new Date());
            });
        },
        getCurrentTime: function() {
            var date = new Date().Format("yyyy-MM-dd");
            $("#datetimeStartInspect").val(date);
            $("#datetimeEndInspect").val(date);
            $("#datetimeStartEvent").val(date);
            $("#datetimeEndEvent").val(date);
        },
        searchEventByDate: function() { //事件的时间控件搜索
            var _this = this;
            this.$eventDate.click(function() {
                var datetimeStartEvent = $("#datetimeStartEvent").val();
                var datetimeEndEvent = $("#datetimeEndEvent").val();
                _this.eventSearchObj.startDate = datetimeStartEvent;
                _this.eventSearchObj.endDate = datetimeEndEvent;
                _this.getEventPageList();
            });
        },
        searchlineByDate: function() { //巡线的时间控件搜索
            var _this = this;
            this.$lineDate.click(function() {
                var datetimeStartInspect = $("#datetimeStartInspect").val();
                var datetimeEndInspect = $("#datetimeEndInspect").val();
                _this.inspectSearchObj.startDate = datetimeStartInspect;
                _this.inspectSearchObj.endDate = datetimeEndInspect;
                _this.getInspectionPageList();
            });
        },
    }
    //判断是否存在管网权限
var isExistNet = {
        $shijian: $(".shijian"),
        $network: $(".network"),
        init: function() {
            this.requestServer();
            // var isExist = true;
            // if (!isExist) {
            //     return; //不存在
            // }
            // this.renderNet();
        },
        requestServer: function() {
            var that = this;
            $.ajax({
                type: 'GET',
                url: "/cloudlink-core-framework/menu/checkAccess?token=" + lsObj.getLocalStorage('token'),
                contentType: "application/json",
                data: { "appId": "0c753fdd-5f54-4b24-bf50-491ea5eb1a84", "menuCode": "pipeline" },
                dataType: "json",
                success: function(data, state) {
                    if (data.success == 1) {
                        if (data.rows[0].access) {
                            that.renderNet();
                        }

                    }
                }
            });
        },
        renderNet: function() {
            this.$shijian.removeClass("fr").addClass("fl");
            this.$network.removeClass("hidden");
            pipeLineObj.init(mapObj.$bdMap);
        }
    }
    //巡检记录播放
function palyInspect(e) {
    var inspectId = $(e).closest("div.record_details").find("input[name=inspect_id_m]").val();
    var flag = $(e).closest("div.record_details").find("input[name=flag_m]").val();
    playerObj.play(inspectId, flag);
    // console.log(inspectId + ",ddd," + flag);
}

var tabObj = {
    tabsTitle: $('.item_wrapper .item'),
    people: $('#people'),
    event: $('#_event'),
    location: $('#location'),
    tool: $('#tool'),
    closeBtn: $('.result_wrapper .close_btn'),
    refresh: $('#gf_refresh'),
    currentTab: null,
    init: function() {
        var that = this;
        that.bindEvent();
    },
    bindEvent: function() {
        var that = this;
        // 切换Tab事件
        that.tabsTitle.click(function() {
            var s = $(this).attr("data-tab");

            if (s == "people") {
                if (inspectObj.$inspectBtn.hasClass("active")) {
                    eventObj.closeEvent();
                } else {
                    eventObj.closeEvent();
                    inspectObj.openInspect();
                }
            } else if (s == "event") {
                playerObj.close_player(function() {
                    eventObj.getInitialPoints();
                });
                if (eventObj.$eventBtn.hasClass("active")) {
                    inspectObj.closeInspect();
                } else {
                    inspectObj.closeInspect();
                    eventObj.openEvent();
                }
            }
            if (s !== that.currentTab) {
                that.closeTip();
                that.showTip(s);
                return;
            }
            that.closeTip();
            $(this).removeClass('active');
        });
        //关闭tab事件
        that.closeBtn.click(function() {
            that.closeTip();
        });
        //
        that.refresh.click(function() {
            location.reload();
        });
    },
    requestPeople: function() {
        var that = this;
    },
    showTip: function(currentTab) {
        var that = this;
        if (!currentTab) {
            return;
        }
        $('#' + currentTab + '_title').addClass('active');
        that[currentTab].removeClass('hide');
        that.currentTab = currentTab;
    },
    closeTip: function() {
        // eventObj.resetevent();
        // inspectObj.resetInspect();
        var that = this;
        if (!that.currentTab) {
            return;
        }
        $('#' + that.currentTab + '_title').removeClass('active');
        that[that.currentTab].addClass('hide');
        that.currentTab = null;
    }
};

function view_detail(e) {
    var eventId = $(e).attr("name");
    // console.log(eventId);
    taskDetailsObj.loadDetails(eventId);
}

var taskDetailsObj = {
    _taskId: null,
    init: function() {
        var _this = this;
    },
    loadDetails: function(eventId) {
        $("#details").modal();
        this.loadEventDetails(eventId);
        this.loadTaskDetails(eventId);
    },
    loadEventDetails: function(eventId) {
        var _this = this;
        $.ajax({
            type: 'GET',
            url: "/cloudlink-inspection-event/eventInfo/get?token=" + lsObj.getLocalStorage('token') + "&eventId=" + eventId,
            contentType: "application/json",
            dataType: "json",
            success: function(data, status) {
                // debugger;
                var msg = data.rows;
                var images = msg[0].pic;
                $(".event_pic ul").html("");
                $(".eventCode").text(msg[0].eventCode);
                $(".occurrenceTime").text(msg[0].occurrenceTime);
                $(".fullTypeName").text(msg[0].fullTypeName);
                $(".inspectorName").text(msg[0].inspectorName);
                $(".address").text(msg[0].address);
                $(".description").text(msg[0].description);

                if (msg[0].audio.length == 0) {
                    $(".event_audio").html("无");
                } else {
                    var audioMain = '<button class="audioPlay" onclick="playAmrAudio(\'' + msg[0].audio[0] + '\',this)"></button>';
                    $(".event_audio").html(audioMain);
                }

                var pic_scr = "";
                if (images.length > 0) {
                    for (var i = 0; i < images.length; i++) {
                        pic_scr += '<li class="event_pic_list">' +
                            '<img data-original="/cloudlink-core-file/file/downLoad?fileId=' + images[i] + '" src="/cloudlink-core-file/file/getImageBySize?fileId=' + images[i] + '&viewModel=fill&width=104&hight=78" id="imagesPic' + i + '" onclick="previewPicture(this)" alt=""/>' +
                            '</li>';
                    }
                } else {
                    pic_scr = "<span>无</span>";
                }
                $(".event_pic ul").append(pic_scr);
            }
        });
    },
    loadTaskDetails: function(taskId) {
        //获取处置信息
        $.ajax({
            type: 'GET',
            url: "/cloudlink-inspection-task/dispose/getPageListByEventId?token=" + lsObj.getLocalStorage('token') + "&bizId=" + taskId,
            contentType: "application/json",
            dataType: "json",
            success: function(data, status) {

                if (data.rows[0].taskCode == "") {
                    $(".taskCode").text("无");
                } else {

                    $(".taskCode").text(data.rows[0].taskCode);
                }

                $(".dispose_content").html("");
                var msgAll = data.rows[0].disposeList;
                if (msgAll.length > 0) {
                    var txt = '';
                    var tempArry = [];
                    var temp = "";

                    for (var i = 0; i < msgAll.length; i++) {
                        if (temp != msgAll[i].modifyday) {
                            tempArry.push(msgAll[i].modifyday);
                            temp = msgAll[i].modifyday;
                        }
                    }
                    for (var j = 0; j < tempArry.length; j++) {
                        txt = '<div class="dispose_date" id="day_' + j + '">' +
                            '<div class="dispose_day">' +
                            '<div class="day_dian"></div>' +
                            '<div class="day_time">' + tempArry[j] + '</div>' +
                            '</div></div>';
                        $(".dispose_content").append(txt);

                        for (var x = 0; x < msgAll.length; x++) {
                            var txtChild = '';
                            if (msgAll[x].modifyday == tempArry[j]) {
                                var recevieUser = msgAll[x].recevieUserName;
                                //判断接收人
                                if (recevieUser == null || recevieUser == '') {
                                    recevieUser = '无';
                                }
                                if (msgAll[x].typeCode == 00 || msgAll[x].typeCode == 40) {
                                    txtChild = '<div class="dispose_main">' +
                                        '<div class="dispose_main_l">' +
                                        '<span class="dispose_time">' + msgAll[x].modifytime + '</span>' +
                                        '</div>' +
                                        '<div class="dispose_main_r">' +
                                        '<div class="dispose_info">' +
                                        '<span class="modifyUserName">' + msgAll[x].modifyUserName + '</span>&nbsp&nbsp' +
                                        '<span class="disposeValue">' + msgAll[x].disposeValue + '</span>' +
                                        '</div>' +
                                        '<div class="dispose_info">' +
                                        '<span class="info_l text-right">信息描述：</span>' +
                                        '<div class="info_r">' + msgAll[x].content + '</div>' +
                                        '</div>' +
                                        '<div class="dispose_info">' +
                                        '<span class="info_l text-right">接收人：</span>' +
                                        '<div class="info_r">' + recevieUser + '</div>' +
                                        '</div>' +
                                        '</div></div>';
                                } else {
                                    txtChild = '<div class="dispose_main">' +
                                        '<div class="dispose_main_l">' +
                                        '<span class="dispose_time">' + msgAll[x].modifytime + '</span>' +
                                        '</div>' +
                                        '<div class="dispose_main_r">' +
                                        '<div class="dispose_info">' +
                                        '<span class="modifyUserName">' + msgAll[x].modifyUserName + '</span>&nbsp&nbsp' +
                                        '<span class="disposeValue">' + msgAll[x].disposeValue + '</span>' +
                                        '</div>' +
                                        '<div class="dispose_info">' +
                                        '<span class="info_l text-right">信息描述：</span>' +
                                        '<div class="info_r">' + msgAll[x].content + '</div>' +
                                        '</div>' +
                                        '<div class="dispose_info">' +
                                        '<span class="info_l text-right">语音描述：</span>' +
                                        '<div class="info_r task_audio_' + x + '"></div>' +
                                        '</div>' +
                                        '<div class="dispose_info">' +
                                        '<span class="info_l text-right">接收人：</span>' +
                                        '<div class="info_r">' + recevieUser + '</div>' +
                                        '</div>' +
                                        '<div class="dispose_info">' +
                                        '<span class="info_l text-right">照片：</span>' +
                                        '<div class="info_r"><ul class="taskImg_' + x + '"></ul></div>' +
                                        '</div></div></div>';
                                }
                                $("#day_" + j).append(txtChild);
                                //添加录音文件
                                if (msgAll[x].audio.length == 0) {
                                    $(".task_audio_" + x).html("无");
                                } else {
                                    var audioMain = '<button  class="audioPlay" onclick="playAmrAudio(\'' + msgAll[x].audio[0] + '\',this)"></button>';
                                    $(".task_audio_" + x).html(audioMain);
                                }
                                var picAll = msgAll[x].pic;
                                var pic_scr = "";
                                if (picAll.length > 0) {
                                    for (var n = 0; n < picAll.length; n++) {
                                        pic_scr += '<li class="task_pic_list">' +
                                            '<img data-original="/cloudlink-core-file/file/downLoad?fileId=' + picAll[n] + '" src="/cloudlink-core-file/file/getImageBySize?fileId=' + picAll[n] + '&viewModel=fill&width=104&hight=78" id="taskImagesPic' + n + '" onclick="previewPicture(this)" alt=""/>' +
                                            '</li>';
                                    }
                                } else {
                                    pic_scr = "<span>无</span>";
                                }
                                $(".taskImg_" + x).append(pic_scr);
                            }
                        }
                    }
                } else {
                    var textaa = "<p style='text-align:center;background:#fff;margin:0;'>本事件无处置信息！</p>";
                    $(".dispose_content").html(textaa);
                }
            }
        })
    }
}

//查看大图
function previewPicture(e) {
    viewPicObj.viewPic(e);
};
//录音文件的播放
function playAmrAudio(_fileId, e) {
    if (!!window.ActiveXObject || "ActiveXObject" in window) {
        xxwsWindowObj.xxwsAlert("IE浏览器暂不支持录音文件的播放，建议使用Chrome、Firefox等浏览器！");
        return true;
    } else {
        $.ajax({
            type: 'GET',
            url: "/cloudlink-core-file/file/getUrlByFileId?fileId=" + _fileId,
            contentType: "application/json",
            dataType: "json",
            success: function(data, status) {
                var relativePath = data.rows[0].fileUrl.replace(/^.*?\:\/\/[^\/]+/, "");
                fetchBlob('/audio' + relativePath, function(blob) {
                    playAmrBlob(blob);
                });

                $(e).attr("class", "audioPlayIn");
                setTimeout(function() {
                    $(e).attr("class", "audioPlay");
                }, 10000);
            }
        });
    }
}


var aEventsAndInspecters = [];
var loadCount = 0;

function eventsAndInspectersLoadFinish(_data) {
    loadCount++;
    if (_data != null && _data.length > 0) {
        aEventsAndInspecters = aEventsAndInspecters.concat(_data);
    }
    if (loadCount == 2 && aEventsAndInspecters.length > 0) {
        mapObj.setPointsMarkerWithCenterPointAndZoomLevel(aEventsAndInspecters);
        loadCount = 0;
        aEventsAndInspecters = [];
    } else if (loadCount == 2 && aEventsAndInspecters.length == 0) {
        var point = new BMap.Point(116.404, 39.915); // 创建点坐标
        mapObj.$bdMap.centerAndZoom(point, 5); // 初始化地图，设置中心点坐标和地图级别
    }
}

function eventsOrInspectersLoadFinish(_data) {
    if (_data != null && _data.length > 0) {
        aEventsAndInspecters = aEventsAndInspecters.concat(_data);
    }
    if (aEventsAndInspecters.length > 0) {
        mapObj.setPointsMarkerWithCenterPointAndZoomLevel(aEventsAndInspecters);
        loadCount = 0;
        aEventsAndInspecters = [];
    }
}

function toolsBarForDistance() {
    tabObj.closeTip();
    mapObj.$myDis.open();
}