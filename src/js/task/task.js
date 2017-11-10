$(function() {
    mapObj.init();
    searchObj.init(); //搜索条件
    // taskObj.init(); //填写处置信息
    initTable();


    taskDetailsObj.init(); //任务详情

    tableOperationObj.init(); //表格上面的操作按钮
    drafting('task_map', 'drafting_down'); //启动拖拽
    pipeLineObj.init(mapObj.$bdMap);
    pipelinebtnObj.init($("#task_map"));
});
/*searchObj*/
(function(window, $, createSearhTemplate) {
    var obj = {
        queryObj: { //对象，必填，传输给后台的对象，也会用来初始化html视图展示，高亮显示
            keyword: '',
            status: '20,21,30', //类别vlaue值 ：类别内项目value值
            type: '',
            date: 'all', //all,day,week,month //时间类别
            startDate: '',
            endDate: '',
            pageNum: 1,
            pageSize: 10,
            iscustorm: "1", //0表示自定义的 1表示item的
        },

        init: function() {
            this.requestEventType();
            //this.bindEvent();
        },
        requestEventType: function() {
            var that = this;
            var params = {};
            $.ajax({
                type: "POST",
                url: "/cloudlink-inspection-event/commonData/eventType/getList?token=" + lsObj.getLocalStorage("token"),
                data: JSON.stringify(params),
                contentType: "application/json",
                dataType: "json",
                success: function(data) {
                    if (data.success == 1) {
                        that.servicedata = data.rows;
                        that.foramtEventType(data.rows);
                        var obj = that.createSearchTemplateObj(that.aActiveData, that.hisData);
                        that.searchInst = createSearhTemplate(obj);

                        if (that.hisData.length > 0) {
                            that.bindEvent();
                            that.renderEventTypeTree(that.hisData);
                        }
                    } else {
                        xxwsWindowObj.xxwsAlert("网络异常请稍候尝试！");
                    }
                }
            });
        },
        foramtEventType: function(data) {
            var oAllTypes = {}; //活跃的：组、类型对应Map
            data.forEach(function(item) {
                if (+item.parentId === 0) { //父级节点作为map的key
                    oAllTypes[item.objectId] = {
                        typeName: item.typeName,
                        nodeType: item.nodeType,
                        active: item.active,
                        aHisData: [],
                        aActiveData: []
                    }
                }
            });
            data.forEach(function(item) {
                if (+item.parentId !== 0) { //子集节点作为value放入响应的key中
                    if (+item.active === 0) { //类型类型
                        oAllTypes[item.parentId].aHisData.push({
                            isParent: false,
                            treenodename: item.typeName,
                            pid: item.parentId,
                            id: item.objectId
                        });
                    } else { //活动类型
                        oAllTypes[item.parentId].aActiveData.push({
                            name: item.typeName,
                            value: item.objectId
                        });
                    }
                }
            });
            //console.log(oAllTypes);
            this._formatTypeDataForActiveAndHis(oAllTypes);
        },
        _formatTypeDataForActiveAndHis: function(obj) {
            //渲染历史数据
            var that = this;

            var aHisData = [];
            var aActiveData = [];

            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    var item = obj[key];
                    /*历史的类型*/
                    if (item.aHisData.length > 0 && +item.nodeType !== 1) { //含有子级历史类型
                        [].push.apply(aHisData, item.aHisData);
                        aHisData.push({
                            isParent: true,
                            treenodename: item.typeName,
                            pid: '',
                            id: key
                        });
                    }
                    if (+item.nodeType === 1 && +item.active === 0) { //父级是历史类型
                        aHisData.push({
                            isParent: false,
                            treenodename: item.typeName,
                            pid: '',
                            id: key
                        })
                    }
                    /*活动的类型*/
                    if (item.aActiveData.length > 0) {
                        var subValue = item.aActiveData.map(function(val) {
                            return val.value;
                        }).join(',');
                        var children = item.aActiveData.length > 1 ? [{
                            name: '全部',
                            value: subValue
                        }].concat(item.aActiveData) : item.aActiveData;
                        aActiveData.push({
                            name: item.typeName,
                            value: key,
                            subValue: subValue,
                            children: children
                        })
                    }
                    if (+item.nodeType === 1 && +item.active === 1) { //父级是类型，且不是历史
                        aActiveData.push({
                            name: item.typeName,
                            value: key
                        });
                    }
                }
            }
            // alert(JSON.stringify(aActiveData));
            //console.log(aActiveData);
            that.hisData = aHisData;
            that.aActiveData = aActiveData;
        },
        _initSearcEventType: function(aActiveData, hisData) { //返回组装后的事件类型
            var that = this;
            var aItems = [{
                name: '全部',
                value: '',
            }].concat(aActiveData);
            //console.log(hisData)
            aItems.push(
                hisData.length > 0 && ['<span class="fl history">',
                    '<span class="fl itemHisData" style="float:left">历史类型：</span>',
                    '<span class="peo_wrapper" data-class="userIds">',
                    '<span class="peo_border">',
                    '<input id="hisTypeInput" class="peo_selected" readonly>',
                    '<span class="mybtn"></span>',
                    '</span>',
                    //'<span id="type_confirm" class="itemBtn">确定</span>',
                    '<span id="clear_type" class="clear">清空</span>',
                    '</span>',
                    '</span>'

                ].join('')
            );
            return aItems;
        },
        createSearchTemplateObj: function(aActiveData, hisData) {
            var that = this;
            var item = that._initSearcEventType(aActiveData, hisData);
            return {
                wrapper: '#search_wrapper', //必填 jquery选择器
                topItem: { //必填 要显示在左上部的数据
                    widthRate: [6, 6], //必填 宽度比 数值1-12,总和为12，可参考bootstrap的栅格系统
                    data: [ //必填 数组，数组项：对象，'date', html字符串模板
                        /**
                         * 对象
                         *
                         **/
                        { // 搜索的一个类别
                            title: { //类别分类名称
                                name: '完成状态',
                                value: 'status', //类别的value值，可作为数据传回后台
                            },
                            items: [{
                                name: '全部', //类别单项
                                value: '20,21,30', //类别单项value值
                            }, {
                                name: '处理中',
                                value: '20',
                            }, {
                                name: '已完成',
                                value: '21,30',
                            }]
                        },
                        'date', //'date'，自动生成日期类别
                        // html字符串模板
                    ]
                },
                itemArr: [ //数组，必填 高级搜索内的类别集合
                    { //搜索的一个类别
                        title: { //类别分类名称
                            name: '事件类型',
                            value: 'type', //类别的value值，可作为数据传回后台
                        },
                        items: item,
                    },
                    'date',
                ],
                cbRender: function() { ////选填，选项变更时会触发回调
                    $('.itemHisData').removeClass('active');
                    // that._clearHisActive();
                },
                queryObj: this.queryObj,
                callback: function(data) { //初始化和更新queryObj后的回调，默认传入queryObj
                    that.refreshTable();
                }
            };
        },
        refreshTable: function() {
            var that = this;
            that.queryObj.pageNum = '1';
            $('#task_table').bootstrapTable('refreshOptions', {
                pageNumber: +that.queryObj.pageNum,
                pageSize: +that.queryObj.pageSize,
                queryParams: function(params) {
                    that.queryObj.pageSize = params.pageSize;
                    that.queryObj.pageNum = params.pageNumber;
                    return that.queryObj;
                }
            });
        },
        bindEvent: function() {
            var that = this;
            $('body').on('click', '.peo_border', function() { //展现历史选择列表
                $('#hisData').modal();
            });
            $('body').on('click', '#btn_hisData', function() {
                that._setSelectedItems();
                $('.item2_id').hide();
                $('#hisTypeInput').val(that.aTypeName.join('，'));
                $('#hisData').modal('hide');
                if (!that.aTypeId || that.aTypeId.length === 0) {
                    $('#clear_type').trigger('click'); //点击清空历史事件类型
                    return;
                }
                $('.itemHisData').addClass('active');
                $('div[data-class="type"]').find('.item').removeClass('active');
                that.queryObj.type = that.aTypeId.join(',');
                that.searchInst.callback();
            });
            $('body').on('click', '#clear_type', function() { //点击清空历史事件类型
                that._clearHisActive();
                that.queryObj.type = '';
                that.searchInst.renderActive({
                    type: ''
                });
                that.searchInst.callback();
            });

            $('body').on('click', '.search_reset', function() { //添加重置事件
                that._clearHisActive();
            });
        },
        renderEventTypeTree: function(data) {
            var that = this;
            var setting = {
                view: {
                    showLine: true,
                    showIcon: false,
                },
                data: {
                    key: {
                        name: 'treenodename'
                    },
                    simpleData: {
                        enable: true,
                        pIdKey: 'pid'
                    }
                },
                check: {
                    enable: true,
                    chkStyle: "checkbox",
                }

            };
            that.zTree = $.fn.zTree.init($("#eventType_list"), setting, data);
            that.zTree.expandAll(true);
        },
        _setSelectedItems: function() { //设定选中的历史事件类型
            var that = this;
            that.aTypeId = [];
            that.aTypeName = [];
            var arr = that.zTree.getCheckedNodes(true);
            arr.forEach(function(item, index) {
                if (item.isParent) {
                    return;
                }
                that.aTypeId.push(item.id);
                that.aTypeName.push(item.treenodename);
            });
        },
        _clearHisActive: function() {
            var that = this;
            that.aTypeId = null;
            that.aTypeName = null;
            $('#hisTypeInput').val('');
            $('.itemHisData').removeClass('active');
            that.zTree.checkAllNodes(false);
        },

    };
    window.searchObj = obj;
})(window, $, createSearhTemplate);

// 地图的显示隐藏

var mapObj = {
    $user: JSON.parse(lsObj.getLocalStorage("userBo")),
    $mapBtn: $(".bottom_btn span"),
    $mapO: $("#task_map"), //百度地图DIV容器
    $bdMap: new BMap.Map("task_map"), //创建百度地图实例
    $zoom: ["50", "100", "200", "500", "1000", "2000", "5000", "10000", "20000", "25000", "50000", "100000", "20000", "25000", "50000", "100000", "200000", "500000", "1000000", "2000000"],
    aCurrentPoints: [],
    init: function() { //地图初始化方法
        var _this = this;
        this.$bdMap.centerAndZoom(new BMap.Point(116.404, 39.915), 5); // 初始化地图,设置中心点坐标和地图级别
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

        //地图的展开和收缩-点击事件
        $(".bottom_btn span").click(function() {
            _this.mapSwitch();
        });
    },
    mapSwitch: function() { //地图展开、收缩的开关
        if (this.$mapO.is(":hidden")) {
            this.show();
        } else {
            this.hide();
        }
    },
    hide: function() {
        this.$mapO.slideUp();
        this.$mapBtn.attr("class", "map_down");
    },
    show: function() {
        this.$mapO.slideDown();
        this.$mapBtn.attr("class", "map_up");
        this.iconHide();
    },
    //地图打点并计算中心点及缩放等级
    setPointsMarkerWithCenterPointAndZoomLevel: function(data) {
        this.$bdMap.clearOverlays(); //清除地图上已经标注的点
        //var maxPointAndMinPointObj = this.getMaxPointAndMinPoint(data); //计算当前数据中 最大的经纬度 及 最小的经纬度
        // xxwsWindowObj.xxwsAlert(JSON.stringify(maxPointAndMinPointObj));
        //var centerPointAndZoomLevel = this.getCenterPointAndZoomLevel(maxPointAndMinPointObj.maxLon, maxPointAndMinPointObj.maxLat, maxPointAndMinPointObj.minLon, maxPointAndMinPointObj.minLat);
        //this.$bdMap.centerAndZoom(centerPointAndZoomLevel.centerPoint, centerPointAndZoomLevel.zoomlevel); //设置中心点

        //计算中心点及缩放的新方法
        var arr = data.map(function(item, index, arr) {
            return new BMap.Point(item.bdLon, item.bdLat);
        });
        this.$bdMap.setViewport(arr, {
            zoomFactor: -1
        });

        this.setPointsMarker(data);
    },
    //地图打点(多个点)
    setPointsMarker: function(data) {
        //this.$bdMap.clearOverlays(); //清除地图上已经标注的点
        var txts = null;
        var myIcons = null;
        var markers = null;
        var point = null;
        this.aCurrentPoints = [];
        for (var i = 0; i < data.length; i++) {

            var fullTypeName = "";
            if (data[i].fullTypeName) {
                fullTypeName = data[i].fullTypeName;
            }
            txts = '<div><p class="text">事件类型：' + fullTypeName + '</p>' +
                '<p>事件状态：' + data[i].taskStatusDesc + '</p>' +
                '<p>上报人：' + data[i].taskCreateUserName + '</p></div>';

            point = new BMap.Point(data[i].bdLon, data[i].bdLat);
            if (data[i].taskStatus == 20) {
                if (data[i].eventIconName) {
                    myIcons = new BMap.Icon("/src/images/common/process/" + data[i].eventIconName, new BMap.Size(29, 42));
                } else {
                    myIcons = new BMap.Icon("/src/images/common/process/D01.png", new BMap.Size(29, 42));
                }
            } else {
                if (data[i].eventIconName) {
                    myIcons = new BMap.Icon("/src/images/common/finish/" + data[i].eventIconName, new BMap.Size(29, 42));
                } else {
                    myIcons = new BMap.Icon("/src/images/common/finish/D01.png", new BMap.Size(29, 42));
                }
            }
            markers = new BMap.Marker(point, {
                icon: myIcons
            });
            this.$bdMap.addOverlay(markers);
            //将当前地图上的坐标点 赋值全局变量
            this.aCurrentPoints.push({
                'key': data[i].taskId,
                'value': markers
            });
            this.addClickHandler(txts, markers);
        }
    },
    ///获取max坐标和min坐标
    getMaxPointAndMinPoint: function(_data) {
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
    getCenterPointAndZoomLevel: function(maxLon, maxLat, minLon, minLat) {
        var pointA = new BMap.Point(maxLon, maxLat); // 创建点坐标A  
        var pointB = new BMap.Point(minLon, minLat); // 创建点坐标B  
        var distance = this.$bdMap.getDistance(pointA, pointB).toFixed(1); //获取两点距离,保留小数点后两位
        //xxwsWindowObj.xxwsAlert(distance);
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
    singlePointLocation: function(selectedItem) {
        var isExist = 0;
        this.$bdMap.centerAndZoom(new BMap.Point(selectedItem.bdLon, selectedItem.bdLat), 18); //中心点跳转

        for (var i = 0; i < this.aCurrentPoints.length; i++) {
            if (this.aCurrentPoints[i].key == selectedItem.taskId) {
                isExist++;
                this.aCurrentPoints[i].value.setAnimation(BMAP_ANIMATION_BOUNCE);

            } else {
                this.aCurrentPoints[i].value.setAnimation();
            }
        }
        if (isExist > 0) return;
        var _point = new BMap.Point(selectedItem.bdLon, selectedItem.bdLat);
        var _marker = new BMap.Marker(_point); // 创建标注

        var txts = null;
        var myIcons = null;
        var fullTypeName = "";
        if (selectedItem.fullTypeName) {
            fullTypeName = selectedItem.fullTypeName;
        }
        txts = '<div><p class="text">事件类型：' + fullTypeName + '</p>' +
            '<p>事件状态：' + selectedItem.taskStatusDesc + '</p>' +
            '<p>上报人：' + selectedItem.taskCreateUserName + '</p></div>';

        if (selectedItem.eventIconName) {
            if (selectedItem.taskStatus == 20) {
                myIcons = new BMap.Icon("/src/images/common/process/" + selectedItem.eventIconName, new BMap.Size(29, 42));
            } else {
                myIcons = new BMap.Icon("/src/images/common/finish/" + selectedItem.eventIconName, new BMap.Size(29, 42));
            }
        } else {
            if (selectedItem.taskStatus == 20) {
                myIcons = new BMap.Icon("/src/images/common/process/D01.png", new BMap.Size(29, 42));
            } else {
                myIcons = new BMap.Icon("/src/images/common/finish/D01.png", new BMap.Size(29, 42));
            }
        }
        _marker = new BMap.Marker(_point, {
            icon: myIcons
        });

        this.$bdMap.addOverlay(_marker); // 将标注添加到地图中 
        _marker.setAnimation(BMAP_ANIMATION_BOUNCE);
        this.aCurrentPoints.push({
            key: selectedItem.taskId,
            value: _marker
        });
        this.addClickHandler(txts, _marker);
    },
    addClickHandler: function(content, marker) {
        var _this = this;
        marker.addEventListener("click", function(e) {
            // xxwsWindowObj.xxwsAlert(content);
            _this.openInfo(content, e)
        });
    },
    openInfo: function(content, e) {
        var opts = {
            width: 250, // 信息窗口宽度
            height: 80, // 信息窗口高度
            enableMessage: true //设置允许信息窗发送短息
        };
        var p = e.target;
        var point = new BMap.Point(p.getPosition().lng, p.getPosition().lat);
        var infoWindow = new BMap.InfoWindow(content, opts); // 创建信息窗口对象 
        mapObj.$bdMap.openInfoWindow(infoWindow, point); //开启信息窗口
    },
    iconHide: function() { //隐藏百度图标与文字
        $(".BMap_cpyCtrl.BMap_noprint.anchorBL,.anchorBL").hide();
        $(".anchorBL a").hide();
    }
};




function initTable() {
    $('#task_table').bootstrapTable({
        url: "/cloudlink-inspection-task/task/getPageList?token=" + lsObj.getLocalStorage('token'), //请求数据url
        method: 'post',
        // data: "dataAll",
        toolbar: "#toolbar",
        toolbarAlign: "left",
        cache: false, //是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
        // detailView: true, //显示详细信息
        showHeader: true,
        // showColumns: true,  //显示内容下拉框
        showRefresh: true,
        pagination: true, //分页
        striped: true,
        sidePagination: 'server', //分页方式：client客户端分页，server服务端分页（*）
        pageNumber: 1,
        pageSize: 10,
        pageList: [10, 20, 50], //分页步进值
        search: false, //显示搜索框
        searchOnEnterKey: false,
        queryParamsType: '', //默认值为 'limit' ,在默认情况下 传给服务端的参数为：offset,limit,sort
        // 设置为 ''  在这种情况下传给服务器的参数为：pageSize,pageNumber
        queryParams: function(params) {
            searchObj.queryObj.pageSize = params.pageSize;
            searchObj.queryObj.pageNum = params.pageNumber;
            return searchObj.queryObj;
        },
        responseHandler: function(res) {
            return res;
        },
        onLoadSuccess: function(data) {
            // console.log(data);
            if (data.rows.length > 0) {
                mapObj.setPointsMarkerWithCenterPointAndZoomLevel(data.rows);
            } else {
                mapObj.$bdMap.clearOverlays();
            }
        },
        //表格的列
        columns: [{
            field: 'state', //域值
            checkbox: true, //复选框
            align: 'center',
            visible: true, //false表示不显示
            sortable: false, //启用排序
            width: '3%',
        }, {
            field: 'stakeholder', //域值
            title: '待办', //标题
            align: 'center',
            visible: true, //false表示不显示
            sortable: false, //启用排序
            width: '6%',
            formatter: function(value, row, index) {
                if (value == 1) {
                    return "<span class='dealtTask'>待办</span>";
                } else {
                    return "";
                }
            }
        }, {
            field: 'taskCode', //域值
            title: '任务编号', //标题
            align: 'center',
            visible: true, //false表示不显示
            sortable: false, //启用排序
            width: '14%',
        }, {
            field: 'taskStatusDesc', //域值
            title: '任务状态', //内容
            align: 'center',
            visible: true, //false表示不显示
            sortable: false, //启用排序
            width: '7%',
            editable: true,
            cellStyle: function(value, row, index) {
                return {
                    css: {
                        "max-width": "300px",
                    }
                };
            }
        }, {
            field: 'fullTypeName', //域值
            title: '事件类型', //内容
            align: 'center',
            visible: true, //false表示不显示
            sortable: false, //启用排序
            width: '15%',
            editable: true,
            formatter: function(value, row, index) {
                if (value == null) {
                    return "";
                } else {
                    return value;
                }
            }
        }, {
            field: 'disposeTypeName', //域值
            title: '最新处置类型', //内容
            align: 'center',
            visible: true, //false表示不显示
            sortable: false, //启用排序
            width: '11%',
            // editable: true,
        }, {
            field: 'disposeCreateTime', //域值
            title: '最新处置时间', //内容
            align: 'center',
            visible: true, //false表示不显示
            sortable: false, //启用排序
            width: '13%',
            editable: true, //可编辑
        }, {
            field: 'taskCreateUserName', //域值
            title: '任务发起人', //内容
            align: 'center',
            visible: true, //false表示不显示
            sortable: false, //启用排序
            width: '8%',
            editable: false, //可编辑
        }, {
            field: 'eventIconName', //域值
            title: 'eventIconName', //内容
            align: 'center',
            visible: false, //false表示不显示
            sortable: false, //启用排序
            width: '15%',
            editable: true,
        }, {
            field: 'operate',
            title: '操作',
            align: 'center',
            events: operateEvents,
            width: '13%',
            formatter: operateFormatter
        }]
    });
}

//判断时间选择是否有值
function dateChangeForSearch() {
    var startDate = $("#datetimeStart").val();
    var endDate = $("#datetimeEnd").val();
    if (startDate != "" && endDate !== "") {
        $("#diyDateBtn").addClass("active");
    } else {
        $("#diyDateBtn").removeClass("active");
    }
}

//操作按钮的展现
function operateFormatter(value, row, index) {
    var managementClass = null;
    var closedClass = null
    if (row.stakeholder == 1) {
        if (row.taskStatus == 20) {
            managementClass = 'management';
            closedClass = 'closed';
        } else {
            managementClass = 'management_end';
            closedClass = 'closed_end';
        }
    } else {
        managementClass = 'management_end';
        closedClass = 'closed_end';
    }
    return [
        '<a class="location" href="javascript:void(0)" title="定位">',
        '<i></i>',
        '</a>',
        '<a class="' + managementClass + '" href="javascript:void(0)" title="处置">',
        '<i></i>',
        '</a>',
        '<a class="check" data-toggle="modal" href="javascript:void(0)" title="查看">',
        '<i></i>',
        '</a>',
        '<a class="' + closedClass + '" href="javascript:void(0)" title="关闭">',
        '<i></i>',
        '</a>',
    ].join('');


}
// 表格里面的操作
window.operateEvents = {
    //定位功能
    'click .location': function(e, value, row, index) {
        if ($(this).find('i').attr("class") == 'active') {} else {
            $(".location").find('i').attr("class", "");
            $(this).find('i').attr("class", "active");
            mapObj.singlePointLocation(row);
        }
        $('body,html').animate({
            scrollTop: 0
        }, 500);
        return false;
    },
    //查看详情
    'click .check': function(e, value, row, index) {
        $("#details").modal(); //打开详情模态框

        if (row.stakeholder == 0) {
            $(".disposeTask").hide();
            $(".closeTask").hide();
        } else {
            $(".disposeTask").show();
            $(".closeTask").show();
        }
        taskDetailsObj._taskDetailsData = row;
        // setTimeout(function() {
        //     taskDetailsObj.loadDetails(row);
        // }, 1000);

        return false;
    },
    //填写处置信息
    'click .management': function(e, value, row, index) {
        taskObj.taskOpen(row.taskId);
        return false;
    },
    //关闭任务
    'click .closed': function(e, value, row, index) {
        var defaultOptions = {
            tip: '您是否关闭该任务？',
            name_title: '提示',
            name_cancel: '取消',
            name_confirm: '确定',
            isCancelBtnShow: true,
            callBack: function() {
                taskDetailsObj.closedWhether(row.taskId);
            }
        };
        xxwsWindowObj.xxwsAlert(defaultOptions);
        return false;
    }
};


var taskDetailsObj = {
    $detailsMap: new BMap.Map("details_address_map"),
    $disposeTask: $(".disposeTask"),
    $closeTask: $(".closeTask"),
    _taskDetailsData: null,
    _taskId: null,
    init: function() {
        var _this = this;

        this.$detailsMap.centerAndZoom(new BMap.Point(116.404, 39.915), 5); // 初始化地图,设置中心点坐标和地图级别
        this.$detailsMap.enableScrollWheelZoom(true); //开启鼠标滚轮缩放
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
        this.$detailsMap.addControl(bottom_left_ScaleControl);
        this.$detailsMap.addControl(bottom_right_navigation);
        this.$detailsMap.addControl(new BMap.MapTypeControl());

        //关闭任务按钮
        this.$closeTask.click(function() {
            var defaultOptions = {
                tip: '您是否关闭该任务？',
                name_title: '提示',
                name_cancel: '取消',
                name_confirm: '确定',
                isCancelBtnShow: true,
                callBack: function() {
                    _this.closedWhether(_this._taskId);
                }
            };
            xxwsWindowObj.xxwsAlert(defaultOptions);

        });
        //填写处置信息按钮
        this.$disposeTask.click(function() {
            $("#details").modal('hide'); //关闭详情模态框
            taskObj.taskOpen(_this._taskId);
        });
        //详情模态框加载完运行方法
        $('#details').on('shown.bs.modal', function() {
            // console.log(_this._taskDetailsData)
            taskDetailsObj.loadDetails(_this._taskDetailsData);
        });

    },
    loadDetails: function(row) {
        $(".taskCode").text(row.taskCode);
        var eventId = row.eventId;
        this._taskId = row.taskId;
        // console.log(row);
        var lon = row.bdLon;
        var lat = row.bdLat;
        this.loadEventDetails(eventId);
        this.loadTaskDetails(this._taskId);
    },
    setCenterZoom: function(msg) {
        // debugger;
        var _this = this;
        var lon = msg[0].bdLon;
        var lat = msg[0].bdLat;
        this.$detailsMap.clearOverlays();
        var point = new BMap.Point(lon, lat);
        var myIcon = null;
        if (msg[0].eventIconName) {
            if (msg[0].status == 20) {
                myIcon = new BMap.Icon("/src/images/common/process/" + msg[0].eventIconName, new BMap.Size(29, 42));
            } else {
                myIcon = new BMap.Icon("/src/images/common/finish/" + msg[0].eventIconName, new BMap.Size(29, 42));
            }
        } else {
            if (msg[0].status == 20) {
                myIcon = new BMap.Icon("/src/images/common/process/D01.png", new BMap.Size(29, 42));
            } else {
                myIcon = new BMap.Icon("/src/images/common/finish/D01.png", new BMap.Size(29, 42));
            }
        }
        // var myIcon = new BMap.Icon("/src/images/event/personal.png", new BMap.Size(130, 130));
        var marker = new BMap.Marker(point, {
            icon: myIcon
        });

        this.$detailsMap.addOverlay(marker);
        this.$detailsMap.centerAndZoom(point, 15);
        mapObj.iconHide(); //隐藏百度图标
    },
    loadEventDetails: function(eventId) {
        var _this = this;
        $.ajax({
            type: 'GET',
            url: "/cloudlink-inspection-event/eventInfo/get?token=" + lsObj.getLocalStorage('token') + "&eventId=" + eventId,
            contentType: "application/json",
            dataType: "json",
            success: function(data, status) {
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
                            '<img  src="/cloudlink-core-file/file/getImageBySize?fileId=' + images[i] + '&viewModel=fill&width=104&hight=78" data-original="/cloudlink-core-file/file/downLoad?fileId=' + images[i] + '" id="imagesPic' + i + '" onclick="previewPicture(this)" alt=""/>' +
                            '</li>';
                    }
                } else {
                    pic_scr = "<span>无</span>";
                }
                $(".event_pic ul").append(pic_scr);

                //打开地图中心点
                _this.setCenterZoom(msg);
                $('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
                    if (e.target.innerHTML == "事件详情") {
                        _this.setCenterZoom(msg);
                    }
                });

            }
        });
    },
    loadTaskDetails: function(taskId) {
        //获取处置信息
        $.ajax({
            type: 'GET',
            url: "/cloudlink-inspection-task/dispose/getPageListByTaskId?token=" + lsObj.getLocalStorage('token') + "&taskId=" + taskId,
            contentType: "application/json",
            dataType: "json",
            success: function(data, status) {
                var msgAll = data.rows;
                $(".dispose_content").html("");
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
                            if (msgAll[x].type == 00 || msgAll[x].type == 40) {
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
            }
        })
    },
    closedWhether: function(taskId) {
        var _this = this;
        $.ajax({
            type: 'GET',
            url: "/cloudlink-inspection-task/task/getTaskStatus?token=" + lsObj.getLocalStorage('token') + "&taskId=" + taskId,
            contentType: "application/json",
            dataType: "json",
            success: function(data, status) {
                console.log(data);
                if (data.success == 1) {
                    var taskState = data.rows;
                    if (taskState[0].status == 21) {
                        xxwsWindowObj.xxwsAlert("您好，该任务已经关闭！");
                        window.location.reload();
                        return false;
                    } else {
                        _this.closedTask(taskId);
                        return true;
                    }
                }
            }
        })
    },
    closedTask: function(taskId) {
        var taskIds = [];
        taskIds.push(taskId);
        $.ajax({
            type: 'POST',
            url: "/cloudlink-inspection-task/task/close?token=" + lsObj.getLocalStorage('token'),
            contentType: "application/json",
            data: JSON.stringify(taskIds),
            dataType: "json",
            success: function(data, status) {
                if (data.success == 1) {
                    xxwsWindowObj.xxwsAlert("任务关闭成功！");
                    window.location.reload();
                } else {
                    xxwsWindowObj.xxwsAlert("任务关闭失败！");
                }
            }
        })
    }
};
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
//表格上面的操作按钮
var tableOperationObj = {
    $exportAll: $("#export_all"),
    $exportChoice: $("#export_choice"),
    $mapChoice: $("#map_choice"),
    expoerObj: {
        "status": "", //处理状态，括号内为注释
        "type": "", //事件类型,
        "startDate": "", //开始日期
        "endDate": "", //结束日期
        "keyword": "",
        "ids": ""
    },
    init: function() {
        var _this = this;
        //导出全部
        this.$exportAll.click(function() {
            _this.expoerObj.ids = '';
            _this.expoerCondition();
            if (zhugeSwitch == 1) {
                zhuge.track('导出任务列表', {
                    'action': '导出全部'
                });
            }
        });
        //导出所选
        this.$exportChoice.click(function() {
            var selectionsData = $('#task_table').bootstrapTable('getSelections');
            var taskIds = [];
            if (selectionsData.length == 0) {
                xxwsWindowObj.xxwsAlert("请选择你需要导出的任务！");
                return false;
            } else {
                for (var i = 0; i < selectionsData.length; i++) {
                    taskIds.push(selectionsData[i].taskId);
                }
                _this.expoerObj.ids = taskIds.join(',');
                _this.expoerCondition();
                if (zhugeSwitch == 1) {
                    zhuge.track('导出任务列表', {
                        'action': '导出已选'
                    });
                }
            }
        });
        //在地图上显示所选点
        this.$mapChoice.click(function() {
            // 获取已选的信息
            var selectedPointItems = $('#task_table').bootstrapTable('getSelections');
            if (selectedPointItems.length > 0) {
                mapObj.setPointsMarkerWithCenterPointAndZoomLevel(selectedPointItems);
            } else {
                xxwsWindowObj.xxwsAlert("请选择您要展示的信息！");
            }
        });
    },
    expoerCondition: function() { //导出文件条件设置
        var searchMsg = searchObj.queryObj;
        this.expoerObj.status = searchObj.queryObj.status;
        this.expoerObj.type = searchObj.queryObj.type;
        this.expoerObj.startDate = searchObj.queryObj.startDate;
        this.expoerObj.endDate = searchObj.queryObj.endDate;
        this.expoerObj.keyword = searchObj.queryObj.keyword;

        this.expoerData(this.expoerObj);
    },
    expoerData: function(date) { //导出url等
        var options = {
            "url": '/cloudlink-inspection-task/task/exportExcel?token=' + lsObj.getLocalStorage('token'),
            "data": date,
            "method": 'post'
        }
        this.downLoadFile(options);
    },
    downLoadFile: function(options) { //导出文件的方法
        var config = $.extend(true, {
            method: 'post'
        }, options);
        var $iframe = $('<iframe id="down-file-iframe" />');
        var $form = $('<form target="down-file-iframe" method="' + config.method + '" />');
        $form.attr('action', config.url);
        for (var key in config.data) {
            $form.append('<input type="hidden" name="' + key + '" value="' + config.data[key] + '" />');
        }
        $iframe.append($form);
        $(document.body).append($iframe);
        $form[0].submit();
        $iframe.remove();
    }
}