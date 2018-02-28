$(function() {

    searchObj.init(); //搜索条件
    mapObj.init(); //地图初始化
    mapAddObj.init(); //初始化-事件上报地图
    addListenEventHandle(); //注册事件
    initTable(); //初始化表格数据
    exportFileObj.init(); //初始化导出表格方法

    drafting('event_map', 'drafting_down'); //启动拖拽

    // pipeLineObj.init(mapObj.$bdMap);
    pipelinebtnObj.isPrivaliage($("#event_map"), mapObj.$bdMap);
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
                        //that.servicedata = JSON.parse(JSON.stringify(data.rows));
                        that.foramtEventType(data.rows);
                        var obj = that.createSearchTemplateObj(that.aActiveData, that.hisData);
                        that.searchInst = createSearhTemplate(obj);

                        if (that.hisData.length > 0) {
                            that.bindEvent();
                            that.renderEventTypeTree(that.hisData);
                        }
                        eventObj.init(); //初始化-事件上报
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
                        indexNum: item.indexNum,
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
                        aActiveData[item.indexNum] = {
                            name: item.typeName,
                            value: key,
                            subValue: subValue,
                            children: children
                        };
                    }
                    if (+item.nodeType === 1 && +item.active === 1) { //父级是类型，且不是历史
                        aActiveData[item.indexNum] = ({
                            name: item.typeName,
                            value: key
                        });
                    }
                }
            }
            // alert(JSON.stringify(aActiveData));
            that.hisData = aHisData;
            that.aActiveData = aActiveData.filter(function(item) {
                return item;
            });
            //console.log(that.aActiveData);
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
                    '<span class="fl itemHisData">历史类型：</span>',
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
                    //console.log(data.type);
                    that.refreshTable();
                }
            };
        },
        refreshTable: function() {
            var that = this;
            that.queryObj.pageNum = '1';
            $('#table').bootstrapTable('refreshOptions', {
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
        // sortByKey: function(array, key) {
        //     return array.sort(function(a, b) {
        //         var x = a[key];
        //         var y = b[key];
        //         return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        //     });
        // },
    };
    window.searchObj = obj;
})(window, $, createSearhTemplate);

/*
 *新增事件对象
 *alex 2017-2-23 modify
 */
var eventObj = {
    $addBtn: $("#btn_add"),
    $submit: $(".submit"),
    $mapA: $(".map_address"),
    $lon: $("input[name=lon]"),
    $lat: $("input[name=lat]"),
    $eventM: $("#addEvent"),
    $mapM: $("#event_address"),
    $receiveUser: $("input[name=receiveUser]"),
    receiveUserIdsArr: [],
    _eventObjectId: null,
    $eventId: null,
    $flg: true,
    init: function() {
        var _this = this;
        this.$addBtn.click(function() { //打开事件模态框
            _this.eventOpen();
        });
        this.$mapA.click(function() { //打开地图模态框
            _this.mapOpen();
        });
        this.$submit.click(function() { //事件上报
            _this.submit();
        });
        this.$receiveUser.click(function() {
            $("#stakeholder").modal(); //打开人员模态框
            _this.requestPeopleTree();
        });
        $('#btn_selectPeople').click(function() { //确定选择人员
            _this.setSelectedPerson();
            //console.log(that.querryObj);
        });

        //地图模态框加载完加载
        this.$mapM.on('shown.bs.modal', function() {
            mapAddObj.reload();
        });
        //详情模态框加载完加载
        $('#details').on('shown.bs.modal', function(e) {
            detailsObj.loadEventDetails(_this._eventObjectId);
        });
        this.getType();
    },
    eventOpen: function() { //打开摸态窗口
        var time = (new Date()).Format("yyyy-MM-dd HH:mm");
        $("#datetime").val(time);
        this.$eventM.modal();
    },
    mapOpen: function() { //打开地图摸态窗口
        this.$mapM.modal();
        this.iconHide();
    },
    submit: function() { //提交表单
        var _this = this;
        this.$eventId = baseOperation.createuuid();
        var occurrenceTime = $("#datetime").val();
        var address = this.$mapA.val();
        var description = $("#event_description").val().trim();
        if (this.$flg == true) {
            this.$flg = false;
            if ($("#eventType").val() == "" || $("#eventType").val() == null || $("#eventType").val() == undefined) {
                xxwsWindowObj.xxwsAlert("请选择发生事件的类型！");
                this.again();
                return false;
            } else if (occurrenceTime == "") {
                xxwsWindowObj.xxwsAlert("请选择发生事件的时间！");
                this.again();
                return false;
            } else if (address == "") {
                xxwsWindowObj.xxwsAlert("请选择发生事件的地点！");
                this.again();
                return false;
            } else if (description == "") {
                xxwsWindowObj.xxwsAlert("请描述发生的事件！");
                this.again();
                return false;
            } else {
                var defaultOptions = {
                    tip: '您是否确定上报事件？',
                    name_title: '提示',
                    name_cancel: '取消',
                    name_confirm: '确定',
                    isCancelBtnShow: true,
                    callBack: function() {
                        _this.uploadFile();
                    }
                };
                xxwsWindowObj.xxwsAlert(defaultOptions);
                this.again();
            }
        }

    },
    uploadFile: function() {
        var nImgHasBeenSendSuccess = 0;
        var _this = this;
        var files = $(".feedback_img_file").find("input[name=file]");
        // var files = $(".feedback_img_list").find("input[name=file]");
        if (files.length > 0) {
            for (i = 0; i < files.length; i++) {
                var picId = files.eq(i).attr("id");
                $.ajaxFileUpload({
                    url: "/cloudlink-core-file/attachment/web/v1/save?businessId=" + _this.$eventId + "&bizType=pic&token=" + lsObj.getLocalStorage('token'),
                    /*这是处理文件上传的servlet*/
                    secureuri: false,
                    fileElementId: picId, //上传input的id
                    dataType: "json",
                    type: "POST",
                    async: false,
                    success: function(data, status) {
                        var statu = data.success;
                        if (statu == 1) {
                            nImgHasBeenSendSuccess++;
                            if (nImgHasBeenSendSuccess == files.length) {
                                //上传表单
                                _this.uploadData();
                            }
                        } else {
                            xxwsWindowObj.xxwsAlert("当前网络不稳定");
                            _this.again();
                        }
                    }
                });
            }
        } else {
            //上传表单
            _this.uploadData();
        }
    },
    uploadData: function() {
        var _this = this;
        var eventData = this.formData();
        // console.log(JSON.stringify(eventData));
        $.ajax({
            type: 'POST',
            url: "/cloudlink-inspection-event/eventInfo/saveBatch?token=" + lsObj.getLocalStorage('token'),
            contentType: "application/json",
            data: JSON.stringify(eventData),
            dataType: "json",
            success: function(data, status) {
                if (data.success == 1) {
                    $("input[type='text']").val("");
                    _this.$eventM.modal('hide');
                    window.location.reload();
                } else {
                    xxwsWindowObj.xxwsAlert("保存事件失败！");
                    _this.again();
                }
            }
        })
    },
    formData: function() {
        // debugger;
        var _this = this;
        var occurrenceTime = $("#datetime").val();
        var address = _this.$mapA.val();
        var description = $("#event_description").val().trim();

        var status = $("input[name=state]:checked").val();
        var eventCode = (new Date()).Format("yyyyMMddHHmmssS");
        var reportTime = (new Date()).Format("yyyy-MM-dd");
        var user = {
            "userId": mapObj.$user.objectId,
            "userName": mapObj.$user.userName
        }
        _this.receiveUserIdsArr.push(user);
        var dataArr = [];
        var dataMsg = {
            "objectId": this.$eventId,
            "type": $("#eventType").val(),
            "occurrenceTime": occurrenceTime,
            "address": _this.$mapA.val(),
            "description": description,
            "eventCode": eventCode,
            "reportTime": reportTime,
            "status": status,
            "bdLon": _this.$lon.val(),
            "bdLat": _this.$lat.val(),
            "lon": "0",
            "lat": "0",
            "taskUserMsg": _this.receiveUserIdsArr
        }
        dataArr.push(dataMsg);
        return dataArr;
    },
    getType: function() {
        var that = this;
        var data = searchObj.aActiveData;
        //console.log(data);

        var sHtml = data.map(function(item, index) {
            if (item.children) {
                return item.children.map(function(subItem) {
                    if (subItem.name === '全部') {
                        return '';
                    }
                    return '<option value=' + subItem.value + '>' + item.name + '&nbsp-&nbsp' + subItem.name + '</option>';
                }).join('');
            }
            return '<option value=' + item.value + '>' + item.name + '</option>';
        }).join('');

        $("#eventType").append(sHtml);
        return;

        // var parentData = [];
        // var txt = "";
        // data.forEach(function(item, index, arr) {
        //     if (item.parentId == '0' && item.active == "1") {
        //         parentData.push(item);
        //     }
        // });
        // parentData.forEach(function(item, index, arr) {
        //     var z = 0;
        //     data.map(function(val, index, arr) {
        //         if (val.parentId == item.objectId && val.active == "1") {
        //             txt += '<option value=' + val.objectId + '>' + item.typeName + '&nbsp-&nbsp' + val.typeName + '</option>';
        //             z++;
        //         }
        //     });
        //     if (z == 0 && item.nodeType == '1') {
        //         txt += '<option value=' + item.objectId + '>' + item.typeName + '</option>';
        //     }
        // });
        // $("#eventType").append(txt);
    },
    requestPeopleTree: function() { //请求人员信息
        var that = this;
        if (that.aAllPeople) {
            return;
        }
        $.ajax({
            type: "GET",
            url: "/cloudlink-core-framework/user/getOrgUserTree",
            contentType: "application/json",
            data: {
                token: lsObj.getLocalStorage('token'),
                status: 1
            },
            dataType: "json",
            success: function(data) {
                // console.log(JSON.stringify(data));
                var peopleAllArr = data.rows;
                if (data.success != 1) {
                    xxwsWindowObj.xxwsAlert('获取人员信息失败！');
                    return;
                }

                //数组中删除本人
                for (var i = 0; i < peopleAllArr.length; i++) {
                    if (peopleAllArr[i].id == mapObj.$user.objectId) {
                        peopleAllArr.splice(i, 1);
                    }
                }
                that.aAllPeople = peopleAllArr;
                that.renderPeopleTree(that.aAllPeople);
            },
            statusCode: {
                404: function() {
                    xxwsWindowObj.xxwsAlert('获取人员信息失败！');
                }
            }
        });
    },
    renderPeopleTree: function(data) { //遍历tree
        var that = this;
        //data = '';
        //// console.log(data)
        ////console.log(JSON.stringify(data))
        var setting = {
            view: {
                showLine: true
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
        that.zTree = $.fn.zTree.init($("#people_list"), setting, data);
        that.zTree.expandAll(true);
    },
    setSelectedPerson: function() { //获取选中的人员
        var that = this;
        // that.aPeopleId = [];
        that.aPeopleName = [];
        that.receiveUserIdsArr = []; //人员数组
        var userObj = null;
        var arr = that.zTree.getCheckedNodes(true);
        arr.forEach(function(item, index) {
            if (item.isParent) {
                return;
            }
            userObj = {
                "userId": item.id,
                "userName": item.treenodename
            }
            that.receiveUserIdsArr.push(userObj);
            // that.aPeopleId.push(item.id);
            that.aPeopleName.push(item.treenodename);
        });
        that.$receiveUser.val(that.aPeopleName.join('，'));
        $('#stakeholder').modal('hide');
        // console.log(JSON.stringify(this.formData()));
        // console.log(that.aPeopleName);
        // receiveUserIdsArr
    },
    initPeopleList: function() { //清空人员信息
        var that = this;
        that.aPeopleName = [];
        that.receiveUserIdsArr = [];
        that.$receiveUser.val('');
        if (that.zTree) {
            that.zTree.checkAllNodes(false);
        }
    },
    iconHide: function() { //隐藏百度图标与文字
        $(".BMap_cpyCtrl.BMap_noprint.anchorBL,.anchorBL").hide();
        $(".anchorBL a").hide();
    },
    again: function() {
        this.$flg = true;
    }
}

/*
 *新增事件 针对子地图的对象
 *alex 2017-2-23 modify
 */
var mapAddObj = { //上报事件地图
    $map: new BMap.Map("address_map"), // 创建Map实例
    $text: $("input[name=map_address]"),
    $dataPass: $(".dataPass"),
    $val: $(".search_val"),
    $botton: $(".search_botton"),
    $lon: null,
    $lat: null,
    $marker: null,
    $point: null,
    $address: new BMap.Geocoder(),
    init: function() {
        // debugger;

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
        // this.$map.addControl(bottom_left_ScaleControl);
        // this.$map.addControl(bottom_right_navigation);
        // this.$map.addControl(new BMap.MapTypeControl());


        var _this = this;

        this.$map.addEventListener("click", function(e) { //添加选择点
            _this.$lon = e.point.lng;
            _this.$lat = e.point.lat;
            _this.remove();
            _this.add();
        });
        this.$botton.click(function() { //地点搜索
            // xxwsWindowObj.xxwsAlert(_this.$val.val().trim())
            // debugger;
            var local = new BMap.LocalSearch(_this.$map, {
                renderOptions: {
                    map: _this.$map
                }
            });
            local.search(_this.$val.val().trim());
        });
        this.$dataPass.click(function() { //地址传到上报页面
            // console.log("dddd")
            if (_this.$text.val() == '') {
                xxwsWindowObj.xxwsAlert("请选择详细位置！");
                return false;
            } else {
                eventObj.$mapA.val(_this.$text.val()); //传地址过去
                eventObj.$lon.val(_this.$lon);
                eventObj.$lat.val(_this.$lat);
                eventObj.$mapM.modal('hide');
            }
        })
    },
    reload: function() { //重新加载地图
        this.$map.centerAndZoom(new BMap.Point(116.404, 39.915), 9); // 初始化地图,设置中心点坐标和地图级别
        this.$map.enableScrollWheelZoom(true); //开启鼠标滚轮缩放
    },
    add: function() {
        this.$point = new BMap.Point(this.$lon, this.$lat);
        this.$marker = new BMap.Marker(this.$point); // 创建标注
        this.$map.addOverlay(this.$marker); // 将标注添加到地图中

        var _this = this;
        // 根据坐标得到地址描述
        this.$address.getLocation(this.$point, function(result) {
            if (result) {
                _this.$text.val(result.address);
            }
        });
    },
    remove: function() {
        // this.$map.removeOverlay(this.$marker);
        this.$map.clearOverlays(); //清除所以的点
    }
}

/*
 *监听页面的相关事件
 *alex 2017-2-23 modify
 */
var addListenEventHandle = function() {

    //地图展示已选-点击事件
    $("#map_choice").click(function() {
        var selectedPointItems = $('#table').bootstrapTable('getSelections');
        // xxwsWindowObj.xxwsAlert(selectedPointItems.length);
        if (selectedPointItems.length > 0) {
            mapObj.setPointsMarkerWithCenterPointAndZoomLevel(selectedPointItems);
        } else {
            xxwsWindowObj.xxwsAlert("请选择您要展示的信息！");
        }
    });

    // 地图的展开和收缩 - 点击事件
    $(".bottom_btn span").click(function() {
        mapObj.mapSwitch();
    });


    //上传图片-点击事件
    $(".addImg").click(function() {
        var imgNum = $(".feedback_img_list").find(".feedback_images").length;
        if (imgNum <= 4) {
            $(".upload_file").trigger("click");
        } else {
            xxwsWindowObj.xxwsAlert("最多上传五张图片");
        }
    });

    //新建事件是否报送-点击change事件
    $(".pay_list_c1").each(function(e) {
        $(this).click(function() {
            $(".pay_list_c1").removeClass("on");
            $(this).addClass("on");
            $(this).find("input[type='radio']").prop("checked", true);
        })
    });

    //通过该方法来为每次弹出的模态框设置最新的zIndex值，从而使最新的modal显示在最前面
    $(document).on('show.bs.modal', '.modal', function(event) {
        var zIndex = 1040 + (10 * $('.modal:visible').length);
        $(this).css('z-index', zIndex);
        setTimeout(function() {
            $('.modal-backdrop').not('.modal-stack').css('z-index', zIndex - 1).addClass('modal-stack');
        }, 0);
    });
    $(document).on('hidden.bs.modal', '.modal', function(event) {
        if ($('.modal:visible').length > 0) {
            $("body").addClass("modal-open");
        }
    });
}


/*
 *事件地图的对象
 *alex 2017-2-23
 */
var mapObj = {
    $user: JSON.parse(lsObj.getLocalStorage("userBo")),
    $mapBtn: $(".bottom_btn span"),
    $mapO: $("#event_map"), //百度地图DIV容器
    $bdMap: new BMap.Map("event_map"), //创建百度地图实例
    $zoom: ["50", "100", "200", "500", "1000", "2000", "5000", "10000", "20000", "25000", "50000", "100000", "20000", "25000", "50000", "100000", "200000", "500000", "1000000", "2000000"],
    aCurrentPoints: [],
    init: function() { //地图初始化方法
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
        eventObj.iconHide();
    },
    //地图打点并计算中心点及缩放等级
    setPointsMarkerWithCenterPointAndZoomLevel: function(data) {
        this.$bdMap.clearOverlays(); //清除地图上已经标注的点

        this.aCurrentPoints = [];
        //var maxPointAndMinPointObj = this.getMaxPointAndMinPoint(data); //计算当前数据中 最大的经纬度 及 最小的经纬度
        // xxwsWindowObj.xxwsAlert(JSON.stringify(maxPointAndMinPointObj));
        //var centerPointAndZoomLevel = this.getCenterPointAndZoomLevel(maxPointAndMinPointObj.maxLon, maxPointAndMinPointObj.maxLat, maxPointAndMinPointObj.minLon, maxPointAndMinPointObj.minLat);
        //this.$bdMap.centerAndZoom(centerPointAndZoomLevel.centerPoint, centerPointAndZoomLevel.zoomlevel); //设置中心点坐标和地图级别

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
        for (var i = 0; i < data.length; i++) {
            var fullTypeName = "";
            if (data[i].fullTypeName) {
                fullTypeName = data[i].fullTypeName;
            }
            txts = '<div><p class="text">事件类型：' + fullTypeName + '</p>' +
                '<p>事件状态：' + data[i].statusValue + '</p>' +
                '<p>上报人：' + data[i].inspectorName + '</p></div>';
            point = new BMap.Point(data[i].bdLon, data[i].bdLat);
            //有图标之后，根据字段里面的内容进行图标位置的添加。
            if (data[i].status == 20) {
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
                'key': data[i].objectId,
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
            if (this.aCurrentPoints[i].key == selectedItem.objectId) {
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
            '<p>事件状态：' + selectedItem.statusValue + '</p>' +
            '<p>上报人：' + selectedItem.inspectorName + '</p></div>';
        if (selectedItem.status == 20) {
            if (selectedItem.eventIconName) {
                myIcons = new BMap.Icon("/src/images/common/process/" + selectedItem.eventIconName, new BMap.Size(29, 42));
            } else {
                myIcons = new BMap.Icon("/src/images/common/process/D01.png", new BMap.Size(29, 42));
            }
        } else {
            if (selectedItem.eventIconName) {
                myIcons = new BMap.Icon("/src/images/common/finish/" + selectedItem.eventIconName, new BMap.Size(29, 42));
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
            key: selectedItem.objectId,
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
    }
};

/*删除图片*/
function closeImg(e) {
    var num = $(e).attr("data-key");
    $(e).closest(".feedback_images").remove();
    $(".feedback_img_file input[name=file]").each(function() {
        console.log($(this).attr("data-value"))
        if ($(this).attr("data-value") == num) {
            $(this).remove();
        }
    })
}




/*
 *初始化表单的方法
 */
function initTable() {
    $('#table').bootstrapTable({
        url: "/cloudlink-inspection-event/eventInfo/web/v1/getPageList?token=" + lsObj.getLocalStorage('token'), //请求数据url
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
            // xxwsWindowObj.xxwsAlert(data.rows.length);
            if (data.success == 1) {
                if (data.rows.length > 0) {
                    mapObj.setPointsMarkerWithCenterPointAndZoomLevel(data.rows);
                } else {
                    mapObj.$bdMap.clearOverlays();
                }
            }

        },
        // onDblClickRow: function(row) {
        //     var objId = row.objectId;
        //     eventObj._eventObjectId = objId;
        //     $("#details").modal(); //打开详情模态框
        // },
        //表格的列
        columns: [{
                field: 'state', //域值
                checkbox: true, //复选框
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '3%',
            }, {
                field: 'occurrenceTime', //域值
                title: '事件发生时间',
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '15%',
                editable: true,
            }, {
                field: 'fullTypeName', //域值
                title: '事件类型', //内容
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '17%',
                editable: true,
                cellStyle: function(value, row, index) {
                    return {
                        css: {
                            "max-width": "300px",
                        }
                    };
                }
            }, {
                field: 'statusValue', //域值
                title: '事件状态', //内容
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '10%',
                editable: true,
            }, {
                field: 'address', //域值
                title: '事件地点', //内容
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '27%',
                // editable: true,
            }, {
                field: 'inspectorName', //域值
                title: '上报人', //内容
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '15%',
                editable: true,
            },
            {
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
            }
        ]
    });
}

//判断时间选择是否有值
// function dateChangeForSearch() {
//     var startDate = $("#datetimeStart").val();
//     var endDate = $("#datetimeEnd").val();
//     if (startDate != "" && endDate !== "") {
//         $("#diyDateBtn").addClass("active");
//     } else {
//         $("#diyDateBtn").removeClass("active");
//     }
// }
/*
 *表单的操作（html样式）
 */
function operateFormatter(value, row, index) {
    return [
        '<a class="location" href="javascript:void(0)" title="定位">',
        '<i></i>',
        '</a>',
        '<a class="check" data-toggle="modal" href="javascript:void(0)" title="查看">',
        '<i></i>',
        '</a>',
    ].join('');
}

// 表格操作的事件
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
        var objId = row.objectId;
        eventObj._eventObjectId = objId;
        $("#details").modal(); //打开详情模态框

        // setTimeout(function() {
        //     detailsObj.loadEventDetails(objId);
        // }, 1000);
        return false;
    }
};






//导出文件
var exportFileObj = {
    $exportAll: $("#export_all"),
    $exportChoice: $("#export_choice"),
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
        this.$exportAll.click(function() {
            _this.expoerObj.ids = '';
            _this.expoerCondition();
            if (tjSwitch == 1) {
                tjSdk.track('导出事件列表', {
                    'action': '导出全部'
                });
            }
        });
        this.$exportChoice.click(function() {
            var selectionsData = $('#table').bootstrapTable('getSelections');
            var objectIds = [];
            if (selectionsData.length == 0) {
                xxwsWindowObj.xxwsAlert("请选择你需要导出的任务！");
                return false;
            } else {
                for (var i = 0; i < selectionsData.length; i++) {
                    objectIds.push(selectionsData[i].objectId);
                }
                _this.expoerObj.ids = objectIds.join(',');

                _this.expoerCondition();

                if (tjSwitch == 1) {
                    tjSdk.track('导出事件列表', {
                        'action': '导出已选'
                    });
                }
            }
        });
    },
    expoerCondition: function() {
        var searchMsg = searchObj.queryObj;
        this.expoerObj.status = searchObj.queryObj.status;
        this.expoerObj.type = searchObj.queryObj.type;
        this.expoerObj.startDate = searchObj.queryObj.startDate;
        this.expoerObj.endDate = searchObj.queryObj.endDate;
        this.expoerObj.keyword = searchObj.queryObj.keyword;

        this.expoerData(this.expoerObj);
    },
    expoerData: function(date) {
        var options = {
            "url": '/cloudlink-inspection-event/eventInfo/exportExcel?token=' + lsObj.getLocalStorage('token'),
            "data": date,
            "method": 'post'
        }
        this.downLoadFile(options);
    },
    downLoadFile: function(options) {
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

//判断输入框文字的个数
function checkLen(obj) {
    var len = $(obj).val().length;
    if (len > 159) {
        $(obj).val($(obj).val().substring(0, 160));
    }
    var num = 160 - len;
    if (num < 0) {
        num = 0;
    }
    $(".text_num").text('(' + num + '字)');
}