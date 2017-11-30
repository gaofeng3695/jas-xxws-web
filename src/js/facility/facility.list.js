/*
 *
 */
var facility = {
    $addFacility: $("#addFacility"),
    $locationBtn: $("#map_choice"),
    $importFacility: $("#importFacility"),
    init: function() {
        var _this = this;
        //打开添加计划模态框
        _this.$addFacility.click(function() {
            facilityFrame.$addFacilityFrame.modal();
        });
        //地图多点定位
        _this.$locationBtn.click(function() {
            var selectionsData = $('#tableFacility').bootstrapTable('getSelections');
            if (selectionsData.length == 0) {
                xxwsWindowObj.xxwsAlert("请选择你要展示的信息！");
                return false;
            } else {
                facilityMapObj.mapSetCenter(selectionsData);
            }
        });

        //批量导入设施台账
        _this.$importFacility.click(function() {
            importObj.$batchImportFrame.modal();
            $('.batchImportInput').val("");
        });
    }
};
//设施地图相关
var facilityMapObj = {
    $bdMap: new BMap.Map("facilityMap"), //创建百度地图实例
    $detailsAddressMap: new BMap.Map("detailsAddressMap"),
    $mapCon: $("#facilityMap"),
    $mapBtn: $(".bottom_btn span"),
    aCurrentPoints: [],
    init: function() {
        var _this = this;
        //地图的加载
        _this.mapLoad();
        //地图的显隐
        _this.$mapBtn.click(function() {
            _this.mapSwitch();
        });
    },
    mapLoad: function() {
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

        this.$detailsAddressMap.centerAndZoom(new BMap.Point(116.404, 39.915), 15); // 初始化地图,设置中心点坐标和地图级别
        this.$detailsAddressMap.enableScrollWheelZoom(true); //开启鼠标滚轮缩放
    },
    bdIconFn: function(n) {
        var myIcon;
        switch (n) {
            case 'FT_01':
                myIcon = new BMap.Icon("/src/images/facility/facility_type_01.png", new BMap.Size(35, 35), {
                    anchor: new BMap.Size(17, 17)
                });
                break;
            case 'FT_02':
                myIcon = new BMap.Icon("/src/images/facility/facility_type_02.png", new BMap.Size(35, 35), {
                    anchor: new BMap.Size(17, 17)
                });
                break;
            case 'FT_03':
                myIcon = new BMap.Icon("/src/images/facility/facility_type_03.png", new BMap.Size(35, 35), {
                    anchor: new BMap.Size(17, 17)
                });
                break;
            case 'FT_04':
                myIcon = new BMap.Icon("/src/images/facility/facility_type_04.png", new BMap.Size(35, 35), {
                    anchor: new BMap.Size(17, 17)
                });
                break;
            case 'FT_05':
                myIcon = new BMap.Icon("/src/images/facility/facility_type_05.png", new BMap.Size(35, 35), {
                    anchor: new BMap.Size(17, 17)
                });
                break;
            case 'FT_06':
                myIcon = new BMap.Icon("/src/images/facility/facility_type_06.png", new BMap.Size(35, 35), {
                    anchor: new BMap.Size(17, 17)
                });
                break;
            case 'FT_07':
                myIcon = new BMap.Icon("/src/images/facility/facility_type_07.png", new BMap.Size(35, 35), {
                    anchor: new BMap.Size(17, 17)
                });
                break;
            case 'FT_08':
                myIcon = new BMap.Icon("/src/images/facility/facility_type_08.png", new BMap.Size(35, 35), {
                    anchor: new BMap.Size(17, 17)
                });
                break;
            case 'FT_09':
                myIcon = new BMap.Icon("/src/images/facility/facility_type_09.png", new BMap.Size(35, 35), {
                    anchor: new BMap.Size(17, 17)
                });
                break;
            case 'FT_10':
                myIcon = new BMap.Icon("/src/images/facility/facility_type_10.png", new BMap.Size(35, 35), {
                    anchor: new BMap.Size(17, 17)
                });
                break;
            case 'FT_11':
                myIcon = new BMap.Icon("/src/images/facility/facility_type_11.png", new BMap.Size(35, 35), {
                    anchor: new BMap.Size(17, 17)
                });
                break;
            case 'FT_99':
                myIcon = new BMap.Icon("/src/images/facility/facility_type_99.png", new BMap.Size(35, 35), {
                    anchor: new BMap.Size(17, 17)
                });
                break;
            default:
                myIcon = new BMap.Icon("/src/images/facility/facility_type_99.png", new BMap.Size(35, 35), {
                    anchor: new BMap.Size(17, 17)
                });
        }
        return myIcon;
    },
    mapSwitch: function() { //地图展开、收缩的开关
        if (this.$mapCon.is(":hidden")) {
            this.show();
        } else {
            this.hide();
        }
    },
    hide: function() {
        this.$mapCon.slideUp();
        this.$mapBtn.attr("class", "map_down");
    },
    show: function() {
        this.$mapCon.slideDown();
        this.$mapBtn.attr("class", "map_up");
    },
    mapSetCenter: function(data) { //设置视野中心
        var _this = this;
        _this.$bdMap.clearOverlays(); //清除地图上已经标注的点
        _this.aCurrentPoints = [];
        var _length = data.length;
        var _arr = [];
        try {
            for (var i = 0; i < _length; i++) {
                if (data[i].bdLon && data[i].bdLat) {
                    _arr.push(new BMap.Point(data[i].bdLon, data[i].bdLat));
                }
            }
            if (_arr.length > 0) {
                _this.$bdMap.setViewport(_arr, {
                    zoomFactor: -1
                });
            } else {
                var point = new BMap.Point(116.404, 39.915); // 创建点坐标
                _this.$bdMap.centerAndZoom(point, 5); // 初始化地图，设置中心点坐标和地图级别
            }
        } catch (e) {
            var point = new BMap.Point(116.404, 39.915); // 创建点坐标
            _this.$bdMap.centerAndZoom(point, 5); // 初始化地图，设置中心点坐标和地图级别
        }
        _this.addPoints(data);
    },
    addPoints: function(data) { //添加地图点
        var _this = this;
        var txts = null;
        var myIcons = null;
        var markers = null;
        var point = null;
        if (data.length > 0) {
            for (var i = 0; i < data.length; i++) {
                if (data[i].bdLon && data[i].bdLat) {
                    txts = '<div><p>设施名称：' + data[i].facilityName + '</p>' +
                        '<p>设施编号：' + data[i].facilityCode + '</p>' +
                        '<p>设施类型：' + data[i].facilityTypeName + '</p></div>';
                    point = new BMap.Point(data[i].bdLon, data[i].bdLat);
                    myIcons = _this.bdIconFn(data[i].facilityTypeCode);
                    markers = new BMap.Marker(point, {
                        icon: myIcons
                    });
                    _this.$bdMap.addOverlay(markers);
                    //将当前地图上的坐标点 赋值全局变量
                    _this.aCurrentPoints.push({
                        'key': data[i].objectId,
                        'value': markers
                    });
                    _this.addClickHandler(txts, markers);
                }
            }
        }
    },
    addClickHandler: function(content, marker) { //地图上点的点击事件
        var _this = this;
        marker.addEventListener("click", function(e) {
            _this.openInfo(content, e)
        });
    },
    openInfo: function(content, e) { //地图上点的点击事件
        var _this = this;
        var opts = {
            width: 250, // 信息窗口宽度
            height: 80, // 信息窗口高度
            enableMessage: true //设置允许信息窗发送短息
        };
        var p = e.target;
        var point = new BMap.Point(p.getPosition().lng, p.getPosition().lat);
        var infoWindow = new BMap.InfoWindow(content, opts); // 创建信息窗口对象 
        _this.$bdMap.openInfoWindow(infoWindow, point); //开启信息窗口
    },
    locationClick: function(data) { //点的点位
        var _this = this;
        var isExist = 0;
        for (var i = 0; i < _this.aCurrentPoints.length; i++) {
            if (_this.aCurrentPoints[i].key == data.objectId) {
                isExist++;
                _this.aCurrentPoints[i].value.setAnimation(BMAP_ANIMATION_BOUNCE);
                _this.$bdMap.setCenter(_this.aCurrentPoints[i].value.point);
            } else {
                _this.aCurrentPoints[i].value.setAnimation();
            }
        }
        if (isExist > 0) return;
        var temporaryArr = [];
        temporaryArr.push(data);
        _this.addPoints(temporaryArr);
        var leng = _this.aCurrentPoints.length;
        _this.aCurrentPoints[leng - 1].value.setAnimation(BMAP_ANIMATION_BOUNCE);
        // _this.$bdMap.setCenter(new BMap.Point(_this.aCurrentPoints[leng - 1].value.point));
        _this.$bdMap.setCenter(new BMap.Point(data.bdLon, data.bdLat));
    },
};


//设施模态框
var facilityFrame = {
    $addFacilityFrame: $("#addFacilityFrame"), //新建模态框
    $modifyFacilityFrame: $("#modifyFacilityFrame"), //修改模态框
    $facilityDetailsFrame: $("#facilityDetailsFrame"), //设施详情模态框
    $addressMapFrame: $("#addressMapFrame"), //地址模态框
    $personFrame: $("#stakeholder"), //人员模态框 
    $historyFrame: $("#historyFrame"), //历史检查模态框
    $historyDetailsFrame: $("#historyDetailsFrame"), //检查详情模态框
    $measurementFrame: $("#measurementFrame"), //测量曲线模态框
    $addPerson: $(".facilityAdd input[name=personSelect]"),
    $modifyPerson: $(".facilityModify input[name=personSelect]"),
    $addAddress: $(".facilityAdd input[name=addressSelect]"),
    $modifyAddress: $(".facilityModify input[name=addressSelect]"),
    _selectPersonArr: [],
    $dataPass: $(".dataPass"),
    $personBtn: $("#btn_selectPeople"),
    $deleteFacilityBtn: $(".deleteFacility"),
    $getHistoryBtn: $(".getHistory"),
    $getMeasurementBtn: $(".getMeasurement"),
    temporaryObj: {
        name: null,
        lng: null,
        lat: null,
        gpsLon: null,
        gpsLat: null,
    },
    _facilityId: null,
    _recordId: null,
    _addressEdit: null,
    _personEdit: null,
    _flag: true,
    _imgLengthAdd: 0,
    _deleteImgs: [],
    _facilityTypeCode: null,
    init: function() {
        var _this = this;
        //新建设施模态框加载完
        _this.$addFacilityFrame.on('shown.bs.modal', function(e) {
            document.getElementById('addFacilityFrameT').scrollTop = 0;
            _this.temporaryObj.name = null;
            _this.temporaryObj.lng = null;
            _this.temporaryObj.lat = null;
            _this.temporaryObj.gpsLon = 0.00;
            _this.temporaryObj.gpsLat = 0.00;
            _this.$addFacilityFrame.find("input[name=inspectionCount]").val(0);
            _this.$addFacilityFrame.find("input[name=inspectionDays]").val(1);
            _this.$addFacilityFrame.find("input[name=createUserName]").val(JSON.parse(lsObj.getLocalStorage('userBo')).userName);
            _this.$addAddress.val("");
            _this.$addPerson.val("");
            _this._selectPersonArr = [];
        });
        //修改设施模态框加载完
        _this.$modifyFacilityFrame.on('shown.bs.modal', function(e) {
            document.getElementById('modifyFacilityFrameT').scrollTop = 0;
            _this._deleteImgs = [];
            _this.getModifyData(_this._facilityId);
        });
        //新建打开地图
        _this.$addAddress.click(function() {
            _this._addressEdit = false;
            _this.$addressMapFrame.modal();
        });
        //编辑打开地图
        _this.$modifyAddress.click(function() {
            _this._addressEdit = true;
            _this.$addressMapFrame.modal();
        });
        //地图模态框加载完
        _this.$addressMapFrame.on('shown.bs.modal', function(e) {
            if (_this._addressEdit == true) {
                addressMapObj.drawPoint(_this.$modifyFacilityFrame, _this.temporaryObj);
            } else {
                addressMapObj.drawPoint(_this.$addFacilityFrame, _this.temporaryObj);
            }
        });
        //地址传到
        _this.$dataPass.click(function() {
            var dataObj = addressMapObj.getPoint();
            if (dataObj.key == _this.$addFacilityFrame) {
                _this.$addAddress.val(dataObj.value.name);
            } else if (dataObj.key == _this.$modifyFacilityFrame) {
                _this.$modifyAddress.val(dataObj.value.name);
            }
            $.extend(_this.temporaryObj, dataObj.value);
        });

        //新建打开人员选择
        _this.$addPerson.click(function() {
            _this._personEdit = false;
            _this.$personFrame.modal();
        });
        //编辑打开人员选择
        _this.$modifyPerson.click(function() {
            _this._personEdit = true;
            _this.$personFrame.modal();
        });
        //人员选择模态框加载完
        _this.$personFrame.on('shown.bs.modal', function(e) {
            if (_this._personEdit == true) {
                peopleTreeObj.requestPeopleTree(_this.$modifyFacilityFrame, _this._selectPersonArr);
            } else {
                peopleTreeObj.requestPeopleTree(_this.$addFacilityFrame, _this._selectPersonArr);
            }
        });
        //人员传到
        this.$personBtn.click(function() {
            var dataObj = peopleTreeObj.getSelectPeople();
            _this._selectPersonArr = [];
            if (dataObj.key == _this.$addFacilityFrame) {
                _this.$addPerson.val(dataObj.selectedName);
            } else if (dataObj.key == _this.$modifyFacilityFrame) {
                _this.$modifyPerson.val(dataObj.selectedName);
            }
            for (var i = 0; i < dataObj.selectedArr.length; i++) {
                _this._selectPersonArr[i] = dataObj.selectedArr[i];
            }
        });

        //创建提交
        $(".addSubmit").click(function() {
            if (_this._flag == true) {
                var paramData = _this.formVerification($(".facilityAdd"));
                if (paramData == false) {
                    return;
                } else {
                    var defaultOptions = {
                        tip: '您是否确定新建设施？',
                        name_title: '提示',
                        name_cancel: '取消',
                        name_confirm: '确定',
                        isCancelBtnShow: true,
                        callBack: function() {
                            _this._imgLengthAdd = 0;
                            _this._facilityId = baseOperation.createuuid();
                            paramData.objectId = _this._facilityId;
                            _this.facilityAdd(paramData);
                        }
                    };
                    xxwsWindowObj.xxwsAlert(defaultOptions);
                }
            }
        });

        //修改提交
        $(".modifySubmit").click(function() {
            if (_this._flag == true) {
                var paramData = _this.formVerification($(".facilityModify"));
                if (paramData == false) {
                    return;
                } else {
                    paramData.objectId = _this._planId;
                    var defaultOptions = {
                        tip: '您是否确定修改该设施？',
                        name_title: '提示',
                        name_cancel: '取消',
                        name_confirm: '确定',
                        isCancelBtnShow: true,
                        callBack: function() {
                            _this._imgLengthAdd = 0;
                            paramData.objectId = _this._facilityId;
                            _this.facilityJudge(paramData);
                        }
                    };
                    xxwsWindowObj.xxwsAlert(defaultOptions);
                }
            }
        });

        //设施详情加载完成
        _this.$facilityDetailsFrame.on('shown.bs.modal', function(e) {
            document.getElementById('facilityDetailsFrameT').scrollTop = 0;
            _this.facilityDetails(_this._facilityId);
        });
        //详情里面打开历史检查
        _this.$getHistoryBtn.click(function() {
            repairObj.openHistoryFrame(_this._facilityId);
            // _this.$historyFrame.modal(); //打开历史检查模态框
        });
        //历史检查加载完成
        _this.$historyFrame.on('shown.bs.modal', function(e) {
            document.getElementById('historyFrameT').scrollTop = 0;
            facilityTable.getHistoryTable(_this._facilityId, _this._facilityTypeCode);
        });
        //历史检查详情模态框加载完
        historyDetailsObj.$historyDetailsFrame.on('shown.bs.modal', function(e) {
            document.getElementById('historyDetailsFrameT').scrollTop = 0;
            historyDetailsObj.geiHistoryDetails(_this._recordId);
        });

        //删除设施
        _this.$deleteFacilityBtn.click(function() {
            var defaultOptions = {
                tip: '您是否删除该设施，同时删除相关的检查记录？',
                name_title: '提示',
                name_cancel: '取消',
                name_confirm: '确定',
                isCancelBtnShow: true,
                callBack: function() {
                    _this.facilityDelete(_this._facilityId);
                }
            };
            xxwsWindowObj.xxwsAlert(defaultOptions);
            return false;
        });

        //打开测量曲线模态框
        _this.$getMeasurementBtn.click(function() {
            _this.$measurementFrame.modal();
            facilityChart.clearAll();
        });
        _this.$measurementFrame.on('shown.bs.modal', function(e) {
            document.getElementById('measurementFrameT').scrollTop = 0;
            facilityChart.getGasData(_this._facilityId);
            if (_this._facilityTypeCode == 'FT_01') {
                $(".pressureMain").show();
                facilityChart.getPressureData(_this._facilityId);
            }
        });
    },
    clearfacilityDetails: function() { //清空详情数据
        $(".facilityNameT").text("---");
        $(".facilityCodeT").text("---");
        $(".createTimeT").text("---");
        $(".facilityTypeNameT").text("---");
        $(".pipelineTypeNameT").text("---");
        $(".facilityStatusNameT").text("---");
        $(".addressT").text("---");
        $(".manufacturerT").text("---");
        $(".investmentTimeT").text("---");
        $(".installationTimeT").text("---");
        $(".specificationT").text("---");
        $(".relationshipPersonNamesT").text("---");
        $(".inspectionFrequencyT").text("---");
        // $(".inspectionDaysT").text("---");

        $(".facilityImg").html("<span>无</span>");
        $(".createUserNameT").text("---");
        this.$deleteFacilityBtn.hide();
        facilityMapObj.$detailsAddressMap.clearOverlays(); //清除所以的点
    },
    facilityDetails: function(id) { // 获取设施详情
        var _this = this;
        var param = {
            objectId: id
        }
        $.ajax({
            type: "GET",
            url: "/cloudlink-inspection-event/facility/get?token=" + lsObj.getLocalStorage('token'),
            contentType: "application/json",
            data: param,
            dataType: "json",
            success: function(data) {
                if (data.success == 1) {
                    _this._facilityId = data.rows[0].objectId;
                    _this._facilityTypeCode = data.rows[0].facilityTypeCode;
                    $(".facilityNameT").text(data.rows[0].facilityName);
                    $(".facilityCodeT").text(data.rows[0].facilityCode);
                    $(".createTimeT").text(data.rows[0].createTime);
                    $(".facilityTypeNameT").text(data.rows[0].facilityTypeName);
                    $(".pipelineTypeNameT").text(data.rows[0].pipelineTypeName == null ? '' : data.rows[0].pipelineTypeName);
                    $(".facilityStatusNameT").text(data.rows[0].facilityStatusName);
                    $(".addressT").text(data.rows[0].address);
                    $(".manufacturerT").text(data.rows[0].manufacturer);
                    $(".investmentTimeT").text(data.rows[0].investmentTime);
                    $(".installationTimeT").text(data.rows[0].installationTime);
                    $(".specificationT").text(data.rows[0].specification);
                    $(".relationshipPersonNamesT").text(data.rows[0].relationshipPersonNames);
                    $(".inspectionFrequencyT").text(data.rows[0].inspectionFrequency);

                    $(".facilityImg").html("<span>无</span>");
                    $(".createUserNameT").text(data.rows[0].createUserName);

                    if (data.rows[0].bdLon && data.rows[0].bdLat) {
                        var point = new BMap.Point(data.rows[0].bdLon, data.rows[0].bdLat);
                        var marker = new BMap.Marker(point); // 创建标注
                        facilityMapObj.$detailsAddressMap.addOverlay(marker); // 将标注添加到地图中
                        facilityMapObj.$detailsAddressMap.setCenter(point);
                    }

                    //判断底部的按钮
                    var userId = JSON.parse(lsObj.getLocalStorage('userBo')).objectId;
                    if (JSON.parse(lsObj.getLocalStorage('userBo')).isSysadmin == 1) {
                        _this.$deleteFacilityBtn.show();
                    } else {
                        if (data.rows[0].createUserId == userId) {
                            _this.$deleteFacilityBtn.show();
                        } else {
                            _this.$deleteFacilityBtn.hide();
                        }
                    }
                    var txtReImg = "";
                    if (data.rows[0].pic.length > 0) {
                        for (var i = 0; i < data.rows[0].pic.length; i++) {
                            txtReImg += '<li class="event_pic_list">' +
                                '<img  src="/cloudlink-core-file/file/getImageBySize?fileId=' + data.rows[0].pic[i] + '&viewModel=fill&width=104&hight=78" data-original="/cloudlink-core-file/file/downLoad?fileId=' + data.rows[0].pic[i] + '" onclick="previewPicture(this)" alt=""/>' +
                                '</li>';
                        }
                        $(".facilityImg").html(txtReImg);
                    }
                } else {
                    xxwsWindowObj.xxwsAlert('获取设施详情失败');
                }
            },
            error: function() {
                xxwsWindowObj.xxwsAlert('获取设施详情失败');
            }
        });
    },
    facilityDelete: function(id) { //删除设施
        var param = {
            objectId: id
        };
        $.ajax({
            type: 'POST',
            url: "/cloudlink-inspection-event/facility/delete?token=" + lsObj.getLocalStorage('token'),
            contentType: "application/json",
            data: JSON.stringify(param),
            dataType: "json",
            success: function(data, status) {
                if (data.success == 1) {
                    var defaultOptions = {
                        tip: '设施删除成功！',
                        name_title: '提示',
                        name_cancel: '取消',
                        name_confirm: '确定',
                        isCancelBtnShow: false,
                        callBack: function() {
                            window.location.reload();
                        }
                    };
                    xxwsWindowObj.xxwsAlert(defaultOptions);
                } else {
                    if (data.code == 410) {
                        xxwsWindowObj.xxwsAlert("您没有删除设施的权限！");
                    } else {
                        xxwsWindowObj.xxwsAlert("设施删除失败！");
                    }
                }
            }
        });
    },
    getModifyData: function(id) { //获取修改数据
        var _this = this;
        var param = {
            objectId: id
        }
        $.ajax({
            type: "GET",
            url: "/cloudlink-inspection-event/facility/get?token=" + lsObj.getLocalStorage('token'),
            contentType: "application/json",
            data: param,
            dataType: "json",
            success: function(data) {
                if (data.success == 1) {
                    _this._facilityId = data.rows[0].objectId;

                    $(".facilityModify").find("input[name=facilityName]").val(data.rows[0].facilityName);
                    $(".facilityModify").find("input[name=facilityCode]").val(data.rows[0].facilityCode);
                    $(".facilityModify").find("input[name=addressSelect]").val(data.rows[0].address);

                    $(".facilityModify").find("input[name=manufacturer]").val(data.rows[0].manufacturer);
                    $(".facilityModify").find("input[name=specification]").val(data.rows[0].specification);
                    $(".facilityModify").find("input[name=inspectionCount]").val(data.rows[0].inspectionCount);
                    $(".facilityModify").find("input[name=inspectionDays]").val(data.rows[0].inspectionDays);
                    $(".facilityModify").find("input[name=investmentTime]").val(data.rows[0].investmentTime);
                    $(".facilityModify").find("input[name=installationTime]").val(data.rows[0].installationTime);

                    $(".facilityModify").find("input[name=personSelect]").val(data.rows[0].relationshipPersonNames);
                    $(".facilityModify").find("input[name=createUserName]").val(data.rows[0].createUserName);
                    $(".facilityModify").find("select[name=facilityTypeCode]").val(data.rows[0].facilityTypeCode);
                    $(".facilityModify").find("select[name=pipelineTypeCode]").val(data.rows[0].pipelineTypeCode);
                    $(".facilityModify").find("select[name=facilityStatusCode]").val(data.rows[0].facilityStatusCode);
                    //地图相关的资料
                    _this.temporaryObj.name = data.rows[0].address;
                    _this.temporaryObj.lng = data.rows[0].bdLon;
                    _this.temporaryObj.lat = data.rows[0].bdLat;
                    _this.temporaryObj.gpsLon = data.rows[0].lon;
                    _this.temporaryObj.gpsLat = data.rows[0].lat;

                    //人员数组
                    _this._selectPersonArr = [];
                    for (var i = 0; i < data.rows[0].relationshipPersonList.length; i++) {
                        _this._selectPersonArr[i] = data.rows[0].relationshipPersonList[i];
                        // _this._selectPersonArr.push(data.rows[0].relationshipPersonList[i]);
                    }

                    var txtReImg = "";
                    if (data.rows[0].pic.length > 0) {
                        for (var i = 0; i < data.rows[0].pic.length; i++) {
                            txtReImg += '<div class="feedback_images">' +
                                '<img src="/cloudlink-core-file/file/getImageBySize?fileId=' + data.rows[0].pic[i] + '&viewModel=fill&width=104&hight=78" alt="">' +
                                '<span onclick="deleteImg(this);" data-key="' + data.rows[0].pic[i] + '"></span></div>';
                        }
                        $(".facilityModify .feedback_img_list").html(txtReImg);
                    }
                } else {
                    xxwsWindowObj.xxwsAlert('获取设施修改信息失败');
                }
            },
            error: function() {
                xxwsWindowObj.xxwsAlert('获取设施修改信息失败');
            }
        });
    },
    formVerification: function(e) { //表单的验证
        var _this = this;
        var facilityName = e.find("input[name=facilityName]").val().trim();
        var facilityCode = e.find("input[name=facilityCode]").val().trim();
        var addressSelect = e.find("input[name=addressSelect]").val().trim();

        var manufacturer = e.find("input[name=manufacturer]").val().trim();
        var specification = e.find("input[name=specification]").val().trim();
        var inspectionCount = e.find("input[name=inspectionCount]").val().trim();
        var inspectionDays = e.find("input[name=inspectionDays]").val().trim();
        var reg = /^[1-9]\d*|0$/;
        var investTime = (e.find("input[name=investmentTime]").val() == '') ? null : e.find("input[name=investmentTime]").val();
        var time = (e.find("input[name=installationTime]").val() == '') ? null : e.find("input[name=installationTime]").val();

        var relationshipPersons = [];
        for (var i = 0; i < _this._selectPersonArr.length; i++) {
            relationshipPersons[i] = _this._selectPersonArr[i];
        }

        if (facilityName == '' || facilityName == null) {
            xxwsWindowObj.xxwsAlert('请输入设施名称');
            return false;
        } else if (facilityName.length > 25) {
            xxwsWindowObj.xxwsAlert('设施名称过长，填写上限为25个字');
            return false;
        } else if (facilityCode == '' || facilityCode == null) {
            xxwsWindowObj.xxwsAlert('请输入设施编号');
            return false;
        } else if (facilityCode.length > 25) {
            xxwsWindowObj.xxwsAlert('设施编号过长，填写上限为25个字');
            return false;
        } else if (addressSelect == '' || addressSelect == null) {
            xxwsWindowObj.xxwsAlert('请输入详细位置');
            return false;
        } else if (manufacturer.length > 25) {
            xxwsWindowObj.xxwsAlert('生产厂家字数过长，填写上限为25个字');
            return false;
        } else if (specification.length > 100) {
            xxwsWindowObj.xxwsAlert('规格字数过长，填写上限为100个字');
            return false;
        } else if (!reg.test(inspectionCount)) {
            xxwsWindowObj.xxwsAlert('巡检频次次数格式不对');
            return false;
        } else if (inspectionCount.length > 3) {
            xxwsWindowObj.xxwsAlert('巡检频次次数过多');
            return false;
        } else if (!reg.test(inspectionDays)) {
            xxwsWindowObj.xxwsAlert('巡检频次天数格式不对');
            return false;
        } else if (inspectionDays.length > 3) {
            xxwsWindowObj.xxwsAlert('巡检频次天数过大');
            return false;
        } else {
            var param = {
                    facilityName: facilityName, //设施名称 必填项
                    facilityCode: facilityCode, //设施编号 必填项
                    address: addressSelect, //详细位置 必填项
                    facilityTypeCode: e.find("select[name=facilityTypeCode]").val(), //设施类型 必填
                    pipelineTypeCode: e.find("select[name=pipelineTypeCode]").val(), //管网类型 必填
                    facilityStatusCode: e.find("select[name=facilityStatusCode]").val(), //设施状态 必填

                    manufacturer: manufacturer, //生产厂家 选填
                    specification: specification, //规格 选填
                    investmentTime: investTime, //投产日期
                    installationTime: time, //安装日期  选填
                    inspectionCount: inspectionCount, //巡检次数 选填
                    inspectionDays: inspectionDays, //巡检天数  选填
                    bdLon: _this.temporaryObj.lng, //百度坐标lon 
                    bdLat: _this.temporaryObj.lat, //百度坐标lat 
                    lon: _this.temporaryObj.gpsLon,
                    lat: _this.temporaryObj.gpsLat,
                    relationshipPersonList: relationshipPersons
                }
                // console.log(param);
            return param;
        }
    },
    facilityAdd: function(paramData) { //创建设施
        var _this = this;
        _this._flag = false;
        var imgIndex = $(".facilityFileAdd .feedback_img_file").find('input[name=file]').length;
        if (_this._imgLengthAdd < imgIndex) {
            var picId = $(".facilityFileAdd .feedback_img_file").find('input[name=file]').eq(_this._imgLengthAdd).attr("id");
            _this.facilityFileAdd(picId, paramData);
        } else {
            _this.facilityDataAdd(paramData);
        }
    },
    facilityFileAdd: function(picId, paramData) { //创建提交文件
        var _this = this;
        $.ajaxFileUpload({
            url: "/cloudlink-core-file/attachment/web/v1/save?businessId=" + _this._facilityId + "&bizType=pic&token=" + lsObj.getLocalStorage("token"),
            /*这是处理文件上传的servlet*/
            secureuri: false,
            fileElementId: picId, //上传input的id
            dataType: "json",
            type: "POST",
            async: false,
            success: function(data, status) {
                var statu = data.success;
                if (statu == 1) {
                    _this._imgLengthAdd++;
                    _this.facilityAdd(paramData);
                } else {
                    xxwsWindowObj.xxwsAlert("照片上传失败，请重试", function() {
                        _this._imgLengthAdd = 0;
                        _this.again();
                    });
                }
            }
        });
    },
    facilityDataAdd: function(paramData) { //创建提交数据
        var _this = this;
        $.ajax({
            type: "POST",
            url: "/cloudlink-inspection-event/facility/save?token=" + lsObj.getLocalStorage('token'),
            contentType: "application/json",
            data: JSON.stringify(paramData),
            dataType: "json",
            success: function(data) {
                if (data.success == 1) {
                    _this.$addFacilityFrame.modal('hide');
                    var defaultOptions = {
                        tip: '添加设施成功',
                        name_title: '提示',
                        name_cancel: '取消',
                        name_confirm: '确定',
                        isCancelBtnShow: false,
                        callBack: function() {
                            window.location.reload();
                        }
                    };
                    xxwsWindowObj.xxwsAlert(defaultOptions);
                } else {
                    xxwsWindowObj.xxwsAlert('添加设施失败');
                }
                _this.again();
            },
            error: function() {
                xxwsWindowObj.xxwsAlert('添加设施失败');
                _this.again();
            }
        });
    },
    facilityJudge: function(paramData) { //设施修改前检查的判断
        var _this = this;
        _this._flag = false;
        var param = {
            objectId: _this._facilityId, //设施ID
            facilityTypeCode: paramData.facilityTypeCode, //设施类型
        }
        $.ajax({
            type: "POST",
            url: "/cloudlink-inspection-event/facility/judgeCodeForUpdate?token=" + lsObj.getLocalStorage('token'),
            contentType: "application/json",
            data: JSON.stringify(param),
            dataType: "json",
            success: function(data) {
                if (data.success == 1) {
                    _this.facilityFileDelete(paramData);
                } else {
                    if (data.code == 'XE04001') {
                        xxwsWindowObj.xxwsAlert('修改设施失败,设施下已经存在检查记录，设施类型不能被修改');
                        _this.again();
                    } else {
                        xxwsWindowObj.xxwsAlert('修改设施失败');
                        _this.again();
                    }
                }
            },
            error: function() {
                xxwsWindowObj.xxwsAlert('修改设施失败');
                _this.again();
            }
        });
    },
    facilityFileDelete: function(paramData) {
        var _this = this;
        // _this._flag = false;
        if (_this._deleteImgs.length > 0) {
            var param = {
                businessId: _this._facilityId,
                fileIds: _this._deleteImgs,
                bizType: "pic",
            }
            $.ajax({
                type: "POST",
                url: "/cloudlink-core-file/attachment/deleteByBizIdAndBizAttrAndFileIds?token=" + lsObj.getLocalStorage('token'),
                contentType: "application/json",
                data: JSON.stringify(param),
                dataType: "json",
                success: function(data) {
                    if (data.success == 1) {
                        _this.facilityModify(paramData);
                    } else {
                        xxwsWindowObj.xxwsAlert('修改设施失败');
                        _this.again();
                    }
                },
                error: function() {
                    xxwsWindowObj.xxwsAlert('修改设施失败');
                    _this.again();
                }
            });
        } else {
            _this.facilityModify(paramData);
        }
    },
    facilityModify: function(paramData) { //修改设施
        var _this = this;
        var imgIndex = $(".facilityModify .feedback_img_file").find('input[name=file]').length;
        if (_this._imgLengthAdd < imgIndex) {
            var picId = $(".facilityModify .feedback_img_file").find('input[name=file]').eq(_this._imgLengthAdd).attr("id");
            _this.facilityFileModify(picId, paramData);
        } else {
            _this.facilityDataModify(paramData);
        }
    },
    facilityFileModify: function(picId, paramData) { //创建提交文件
        var _this = this;
        $.ajaxFileUpload({
            url: "/cloudlink-core-file/attachment/web/v1/save?businessId=" + _this._facilityId + "&bizType=pic&token=" + lsObj.getLocalStorage("token"),
            /*这是处理文件上传的servlet*/
            secureuri: false,
            fileElementId: picId, //上传input的id
            dataType: "json",
            type: "POST",
            async: false,
            success: function(data, status) {
                var statu = data.success;
                if (statu == 1) {
                    _this._imgLengthAdd++;
                    _this.facilityModify(paramData);
                } else {
                    xxwsWindowObj.xxwsAlert("照片上传失败，请重试", function() {
                        _this._imgLengthAdd = 0;
                        _this.again();
                    });
                }
            }
        });
    },
    facilityDataModify: function(paramData) { //创建提交数据
        var _this = this;
        $.ajax({
            type: "POST",
            url: "/cloudlink-inspection-event/facility/update?token=" + lsObj.getLocalStorage('token'),
            contentType: "application/json",
            data: JSON.stringify(paramData),
            dataType: "json",
            success: function(data) {
                if (data.success == 1) {
                    _this.$modifyFacilityFrame.modal('hide');
                    var defaultOptions = {
                        tip: '修改设施成功',
                        name_title: '提示',
                        name_cancel: '取消',
                        name_confirm: '确定',
                        isCancelBtnShow: false,
                        callBack: function() {
                            window.location.reload();
                        }
                    };
                    xxwsWindowObj.xxwsAlert(defaultOptions);
                } else {
                    xxwsWindowObj.xxwsAlert('修改设施失败');
                }
                _this.again();
            },
            error: function() {
                xxwsWindowObj.xxwsAlert('修改设施失败');
                _this.again();
            }
        });
    },
    again: function() {
        this._flag = true;
    }
};

//曲线图
var facilityChart = {
    $timeBtn: $(".timeBtn"),
    $timePressure: $(".timePressure"),
    gasChart: null,
    pressureChart: null,
    _ObjId: null,
    gasParam: {
        "startDate": "2017-05-01", //开始时间 
        "endDate": "2017-05-20", //结束时间 
        "facilityId": "", //设施ID
    },
    pressureParam: {
        "startDate": "2017-05-01", //开始时间 
        "endDate": "2017-05-20", //结束时间 
        "facilityId": "", //设施ID
    },
    init: function() {
        var _this = this;
        _this.gasChart = echarts.init(document.getElementById('gasChart'));
        _this.pressureChart = echarts.init(document.getElementById('pressureChart'));
        _this.timeEvent();
        //可燃气时间选择
        _this.$timeBtn.click(function() {
            var key = $(this).closest(".chartCondition").attr("data-key");
            var value = $(this).attr("data-value");
            if (value === 'diy') {
                if (_this.diyTime(key) == false) {
                    return false;
                }
            } else {
                _this.setTime(key, value);
            }
            var obj = {};
            obj[key] = value;
            _this.renderActive(obj);
            if (key == "gas") {
                _this.getGasData();
            } else {
                _this.getPressureData();
            }
        });
    },
    getGasData: function(id) { //获取可燃气数据
        var _this = this;
        if (id) {
            _this._ObjId = id;
            _this.gasParam.facilityId = id;
        } else {
            _this.gasParam.facilityId = _this._ObjId;
        }
        $.ajax({
            type: "POST",
            url: "/cloudlink-inspection-event/facilityRecord/getCombustibleGasConcentrationByFacilityCheckTime?token=" + lsObj.getLocalStorage('token'),
            contentType: "application/json",
            data: JSON.stringify(_this.gasParam),
            dataType: "json",
            success: function(data) {
                if (data.success == 1) {
                    var times = [];
                    var datas = [];
                    if (data.rows.length > 0) {
                        for (var i = 0; i < data.rows.length; i++) {
                            times.push(data.rows[i].facilityCheckTime);
                            datas.push(data.rows[i].combustibleGasConcentration);
                        }
                    }
                    _this.gasChartParam(times, datas);
                } else {
                    xxwsWindowObj.xxwsAlert('获取可燃气浓度数据失败');
                }
            },
            error: function() {
                xxwsWindowObj.xxwsAlert('获取可燃气浓度数据失败');
            }
        });
    },
    gasChartParam: function(time, data) {
        var _this = this;
        option = {
            // title: {
            //     text: '可燃气浓度',
            //     left: 'center'
            // },
            tooltip: {
                trigger: 'item',
                formatter: '{b} <br/>{a} : {c}'
            },
            color: ["#59b6fc"],
            legend: {
                left: 'left',
                data: ['浓度']
            },
            xAxis: {
                type: 'category',
                name: '时间',
                splitLine: { show: false },
                nameGap: 5,
                data: time
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            yAxis: {
                type: 'value',
                name: '浓度（ppm）',
                // min: 10,
                // max: 10000,
                // splitNumber: 5
            },
            series: [{
                name: '浓度（ppm）',
                type: 'bar',
                data: data,
                barWidth: 20
            }]
        };
        _this.gasChart.setOption(option);
    },
    getPressureData: function(id) { //获取压力数据
        var _this = this;
        if (id) {
            _this._ObjId = id;
            _this.pressureParam.facilityId = id;
        } else {
            _this.pressureParam.facilityId = _this._ObjId;
        }
        $.ajax({
            type: "POST",
            url: "/cloudlink-inspection-event/facilityRecord/getInOutPressureByFacilityCheckTime?token=" + lsObj.getLocalStorage('token'),
            contentType: "application/json",
            data: JSON.stringify(_this.pressureParam),
            dataType: "json",
            success: function(data) {
                if (data.success == 1) {
                    var times = [];
                    var dataIns = [];
                    var dataOuts = [];
                    if (data.rows.length > 0) {
                        for (var i = 0; i < data.rows.length; i++) {
                            times.push(data.rows[i].facilityCheckTime);
                            dataIns.push(data.rows[i].pressureIn);
                            dataOuts.push(data.rows[i].pressureOut);
                        }
                    }
                    _this.gasPressureParam(times, dataIns, dataOuts);
                } else {
                    xxwsWindowObj.xxwsAlert('获取进出口压力数据失败');
                }
            },
            error: function() {
                xxwsWindowObj.xxwsAlert('获取进出口压力数据失败');
            }
        });
    },
    gasPressureParam: function(time, dataIn, dataOut) {
        var _this = this;
        option = {
            // title: {
            //     text: '进出口压力',
            //     left: 'center'
            // },
            tooltip: {
                trigger: 'item',
                formatter: '{b} <br/>{a} : {c}'
            },
            legend: {
                left: 'left',
                data: ['进口压力', '出口压力']
            },
            xAxis: {
                type: 'category',
                name: '时间',
                splitLine: { show: false },
                nameGap: 5,
                data: time
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            yAxis: {
                type: 'value',
                name: '压力（kPa）'
            },
            series: [{
                    name: '进口压力',
                    type: 'line',
                    data: dataIn
                },
                {
                    name: '出口压力',
                    type: 'line',
                    data: dataOut
                }
            ]
        };
        _this.pressureChart.setOption(option);
    },
    diyTime: function(key) {
        var _this = this;
        if (key == 'gas') {
            var s = $("#datetimeStartGas").val();
            var e = $("#datetimeEndGas").val();
            if (!s) {
                xxwsWindowObj.xxwsAlert('请选择起始时间');
                return false;
            }
            if (!e) {
                xxwsWindowObj.xxwsAlert('请选择结束时间');
                return false;
            }
            _this.gasParam.startDate = s;
            _this.gasParam.endDate = e;
        } else {
            var s = $("#datetimeStartPressure").val();
            var e = $("#datetimeEndPressure").val();
            if (!s) {
                xxwsWindowObj.xxwsAlert('请选择起始时间');
                return false;
            }
            if (!e) {
                xxwsWindowObj.xxwsAlert('请选择结束时间');
                return false;
            }
            _this.pressureParam.startDate = s;
            _this.pressureParam.endDate = e;
        }
        return true;
    },
    setTime: function(key, value) {
        var _this = this;
        var date = new Date();
        switch (value) {
            case 'week':
                if (key == 'gas') {
                    _this.gasParam.startDate = date.getWeekStartDate().Format('yyyy-MM-dd');
                    _this.gasParam.endDate = date.getWeekEndDate().Format('yyyy-MM-dd');
                } else {
                    _this.pressureParam.startDate = date.getWeekStartDate().Format('yyyy-MM-dd');
                    _this.pressureParam.endDate = date.getWeekEndDate().Format('yyyy-MM-dd');
                }
                break;
            case 'month':
                if (key == 'gas') {
                    _this.gasParam.startDate = date.getMonthStartDate().Format('yyyy-MM-dd');
                    _this.gasParam.endDate = date.getMonthEndDate().Format('yyyy-MM-dd');
                } else {
                    _this.pressureParam.startDate = date.getMonthStartDate().Format('yyyy-MM-dd');
                    _this.pressureParam.endDate = date.getMonthEndDate().Format('yyyy-MM-dd');
                }
                break;
            default:
                if (key == 'gas') {
                    _this.gasParam.startDate = '';
                    _this.gasParam.endDate = '';
                } else {
                    _this.pressureParam.startDate = '';
                    _this.pressureParam.endDate = '';
                }
        }
    },
    renderActive: function(obj) { //被选中的样式
        var _this = this;
        if (!obj) {
            obj = _this.activeObj;
        }
        for (var key in obj) {
            var $parent = _this.$timeBtn.parent('[data-key=' + key + ']');
            $parent.find('span').removeClass('active')
            $parent.find('.timeBtn[data-value="' + obj[key] + '"]').addClass('active');
            if (obj[key] === 'diy') {
                $parent.find('.diy').addClass('active');
            }
        }
    },
    timeEvent: function() { //时间控件
        $("#datetimeStartGas").datetimepicker({
            format: 'yyyy-mm-dd',
            minView: 'month',
            language: 'zh-CN',
            autoclose: true,
            // startDate: new Date()
        }).on("click", function() {
            $("#datetimeStartGas").datetimepicker("setEndDate", $("#datetimeEndGas").val());
        });
        $("#datetimeEndGas").datetimepicker({
            format: 'yyyy-mm-dd',
            minView: 'month',
            language: 'zh-CN',
            autoclose: true,
            // startDate: new Date()
        }).on("click", function() {
            $("#datetimeEndGas").datetimepicker("setStartDate", $("#datetimeStartGas").val())
        });


        $("#datetimeStartPressure").datetimepicker({
            format: 'yyyy-mm-dd',
            minView: 'month',
            language: 'zh-CN',
            autoclose: true,
            // startDate: new Date()
        }).on("click", function() {
            $("#datetimeStartPressure").datetimepicker("setEndDate", $("#datetimeEndPressure").val());
        });
        $("#datetimeEndPressure").datetimepicker({
            format: 'yyyy-mm-dd',
            minView: 'month',
            language: 'zh-CN',
            autoclose: true,
            // startDate: new Date()
        }).on("click", function() {
            $("#datetimeEndPressure").datetimepicker("setStartDate", $("#datetimeStartPressure").val())
        });
    },
    clearAll: function() { //初始化参数
        var _this = this;
        $("#datetimeStartGas").val("");
        $("#datetimeEndGas").val("");
        $("#datetimeStartPressure").val("");
        $("#datetimeEndPressure").val("");
        var date = new Date();
        _this.setTime("gas", "week");
        _this.setTime("pressure", "week");
        _this.renderActive({ gas: "week" });
        _this.renderActive({ pressure: "week" });
        $(".pressureMain").hide();
    }
};
//判断时间选择是否有值
function dateChangeForSearchGas() {
    var startDate = $("#datetimeStartGas").val();
    var endDate = $("#datetimeEndGas").val();
    if (startDate != "" && endDate !== "") {
        $("#diyDateBtnGas").addClass("active");
    } else {
        $("#diyDateBtnGas").removeClass("active");
    }
}
//判断时间选择是否有值
function dateChangeForSearchPressure() {
    var startDate = $("#datetimeStartPressure").val();
    var endDate = $("#datetimeEndPressure").val();
    if (startDate != "" && endDate !== "") {
        $("#diyDateBtnPressure").addClass("active");
    } else {
        $("#diyDateBtnPressure").removeClass("active");
    }
}

//设施table
var facilityTable = {
    init: function() {
        var _this = this;
        _this.getTable();
        _this.historyTable();
    },
    getTable: function() { //table 数据
        var _this = this;
        $('#tableFacility').bootstrapTable({
            url: "/cloudlink-inspection-event/facility/getPageList?token=" + lsObj.getLocalStorage('token'), //请求数据url
            method: 'post',
            toolbar: "#toolbar",
            toolbarAlign: "left",
            cache: false, //是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
            showHeader: true,
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
                searchObj.defaultObj.pageSize = params.pageSize;
                searchObj.defaultObj.pageNum = params.pageNumber;
                return searchObj.defaultObj;
            },
            onLoadSuccess: function(data) {
                if (data.success == 1) {
                    facilityMapObj.mapSetCenter(data.rows);
                }
            },
            onDblClickRow: function(row) {
                facilityFrame._facilityId = row.objectId;
                facilityFrame.$facilityDetailsFrame.modal(); //打开详情模态框
                facilityFrame.clearfacilityDetails();
                return false;
            },
            //表格的列
            columns: [{
                field: 'state', //域值
                checkbox: true, //复选框
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '4%',
            }, {
                field: 'facilityName', //域值
                title: '设施名称',
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '15%',
                editable: true,
            }, {
                field: 'facilityCode', //域值
                title: '设施编号', //内容
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '15%',
                editable: true,
            }, {
                field: 'facilityTypeName', //域值
                title: '设施类型', //内容
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '10%',
                editable: true,
            }, {
                field: 'pipelineTypeName', //域值
                title: '管网类型', //内容
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '10%',
                editable: true,
            }, {
                field: 'facilityStatusName', //域值
                title: '设施状态', //内容
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '10%',
                formatter: function(value, row, index) {
                    return "<span class='atatus_" + row.facilityStatusCode + "'>" + value + "</span>";
                }
            }, {
                field: 'address', //域值
                title: '详细位置', //内容
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '21%',
                editable: true,
            }, {
                field: 'operate',
                title: '操作',
                align: 'center',
                events: _this.tableEvent(),
                width: '15%',
                formatter: _this.tableOperation,
            }]
        });
    },
    tableOperation: function(value, row, index) { //操作按钮
        var modifyClass = null;
        var deleteClass = null;
        if (JSON.parse(lsObj.getLocalStorage('userBo')).isSysadmin == 1) {
            modifyClass = 'modify';
            deleteClass = 'delete';
        } else {
            if (row.createUserId == JSON.parse(lsObj.getLocalStorage('userBo')).objectId) {
                modifyClass = 'modify';
                deleteClass = 'delete';
            } else {
                modifyClass = 'modify_end';
                deleteClass = 'delete_end';
            }
        };

        return [
            '<a class="location" href="javascript:void(0)" title="定位">',
            '<i></i>',
            '</a>',
            '<a class="look" href="javascript:void(0)" title="查看">',
            '<i></i>',
            '</a>',
            '<a class="history" href="javascript:void(0)" title="历史检查">',
            '<i></i>',
            '</a>',
            '<a class="' + modifyClass + '" href="javascript:void(0)" title="编辑">',
            '<i></i>',
            '</a>',
            '<a class="' + deleteClass + '" href="javascript:void(0)" title="删除">',
            '<i></i>',
            '</a>',
        ].join('');
    },
    tableEvent: function() { //按钮相关的事件
        var _this = this;
        return {
            //定位功能
            'click .location': function(e, value, row, index) {
                if (row.bdLat && row.bdLon) {
                    if ($(this).find('i').attr("class") == 'active') {} else {
                        $(".location").find('i').attr("class", "");
                        $(this).find('i').attr("class", "active");
                        facilityMapObj.locationClick(row);
                    }
                    $('body,html').animate({
                        scrollTop: 0
                    }, 500);
                } else {
                    xxwsWindowObj.xxwsAlert("当前设施未标注位置，点击【编辑】操作，维护【详细位置】信息！");
                }
                return false;
            },
            //查看功能
            'click .look': function(e, value, row, index) {
                facilityFrame._facilityId = row.objectId;
                facilityFrame.$facilityDetailsFrame.modal(); //打开详情模态框
                facilityFrame.clearfacilityDetails();
                return false;
            },
            //修改计划
            'click .modify': function(e, value, row, index) {
                facilityFrame._facilityId = row.objectId;
                facilityFrame.$modifyFacilityFrame.modal(); //打开修改模态框
                return false;
            },
            //历史检查
            'click .history': function(e, value, row, index) {
                facilityFrame._facilityId = row.objectId;
                facilityFrame._facilityTypeCode = row.facilityTypeCode;
                facilityFrame.$historyFrame.modal(); //打开历史检查模态框
                return false;
            },
            //删除计划
            'click .delete': function(e, value, row, index) {
                var defaultOptions = {
                    tip: '您是否删除该设施，同时删除相关的检查记录？',
                    name_title: '提示',
                    name_cancel: '取消',
                    name_confirm: '确定',
                    isCancelBtnShow: true,
                    callBack: function() {
                        facilityFrame.facilityDelete(row.objectId);
                    }
                };
                xxwsWindowObj.xxwsAlert(defaultOptions);
                return false;
            }
        }
    },
    historyTable: function() { //table 数据
        var _this = this;
        var param = {
            "startDate": "", //开始日期 2017-04-05
            "endDate": "", //结束日期  2017-04-06
            "facilityCheckResult": "", //检查结果(0:正常  1:异常)
            "isLeakage": "", //是否漏气（0：否   1：是   ）
            "facilityTypeCode": "", //设施类型种12种.字符串，空代表全部
            "keyword": "", // 设施名称、创建人
            "facilityId": "0", // 设施ID。查询某一个设施的历史检查记录时，传入设施ID。 
            "pageNum": 1, //第几页
            "pageSize": 10 //每页记录数 默认10条
        };
        $('#tableHistory').bootstrapTable({
            url: "/cloudlink-inspection-event/facilityRecord/getPageList?token=" + lsObj.getLocalStorage('token'), //请求数据url
            method: 'post',
            cache: false, //是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
            showHeader: true,
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
                param.pageSize = params.pageNumber;
                param.pageNum = params.pageSize;
                return param;
            },
            onLoadSuccess: function(data) {
                if (data.success == 1) {}
            },
            onDblClickRow: function(row) {
                facilityFrame._recordId = row.objectId;
                historyDetailsObj.$historyDetailsFrame.modal(); //打开详情模态框
                historyDetailsObj.clearHistoryDetails();
                return false;
            },
            //表格的列
            columns: [
                [{
                    field: 'facilityCheckTime', //域值
                    title: '检查时间',
                    align: 'center',
                    visible: true, //false表示不显示
                    sortable: false, //启用排序
                    width: '24%',
                    editable: true,
                    valign: "middle",
                    colspan: 1,
                    rowspan: 2
                }, {
                    field: 'isLeakageName', //域值
                    title: '漏气状态', //内容
                    align: 'center',
                    visible: true, //false表示不显示
                    sortable: false, //启用排序
                    width: '10%',
                    editable: true,
                    valign: "middle",
                    colspan: 1,
                    rowspan: 2
                }, {
                    field: 'pressureSituationName', //域值
                    title: '压力情况', //内容
                    align: 'center',
                    visible: true, //false表示不显示
                    sortable: false, //启用排序
                    width: '8%',
                    editable: true,
                    valign: "middle",
                    colspan: 1,
                    rowspan: 2
                }, {
                    field: 'pressure', //域值
                    title: '压力', //内容
                    align: 'center',
                    // visible: true, //false表示不显示
                    // sortable: false, //启用排序
                    width: '16%',
                    // editable: true,
                    colspan: 2,
                    rowspan: 1
                }, {
                    field: 'isSeeperName', //域值
                    title: '井内有无积水', //内容
                    align: 'center',
                    visible: true, //false表示不显示
                    sortable: false, //启用排序
                    width: '8%',
                    editable: true,
                    valign: "middle",
                    colspan: 1,
                    rowspan: 2
                }, {
                    field: 'isWellCoverDamageName', //域值
                    title: '井盖是否损坏', //内容
                    align: 'center',
                    visible: true, //false表示不显示
                    sortable: false, //启用排序
                    width: '8%',
                    editable: true,
                    valign: "middle",
                    colspan: 1,
                    rowspan: 2
                }, {
                    field: 'isOccupyName', //域值
                    title: '有无占压', //内容
                    align: 'center',
                    visible: true, //false表示不显示
                    sortable: false, //启用排序
                    width: '8%',
                    valign: "middle",
                    colspan: 1,
                    rowspan: 2
                }, {
                    field: 'flowmeterData', //域值
                    title: '流量计读数（m<sup>3</sup>）', //内容
                    align: 'center',
                    visible: true, //false表示不显示
                    sortable: false, //启用排序
                    width: '14%',
                    editable: true,
                    valign: "middle",
                    colspan: 1,
                    rowspan: 2
                }, {
                    field: 'isFacilityWorkName', //域值
                    title: '设施运行情况', //内容
                    align: 'center',
                    visible: true, //false表示不显示
                    sortable: false, //启用排序
                    width: '14%',
                    editable: true,
                    valign: "middle",
                    colspan: 1,
                    rowspan: 2
                }, {
                    field: 'facilityCheckResultName', //域值
                    title: '检查结果', //内容
                    align: 'center',
                    visible: true, //false表示不显示
                    sortable: false, //启用排序
                    width: '10%',
                    editable: true,
                    valign: "middle",
                    colspan: 1,
                    rowspan: 2
                }, {
                    field: 'createUserName', //域值
                    title: '检查人', //内容
                    align: 'center',
                    visible: true, //false表示不显示
                    sortable: false, //启用排序
                    width: '10%',
                    editable: true,
                    valign: "middle",
                    colspan: 1,
                    rowspan: 2
                }, {
                    field: 'operate',
                    title: '操作',
                    align: 'center',
                    events: _this.historyTableEvent(),
                    width: '8%',
                    formatter: _this.historyTableOperation,
                    valign: "middle",
                    colspan: 1,
                    rowspan: 2
                }],
                [{
                    field: 'pressureIn', //域值
                    title: '进口(kPa)', //内容
                    align: 'center',
                    visible: true, //false表示不显示
                    sortable: false, //启用排序
                    width: '8%',
                    editable: true,
                    colspan: 1,
                    rowspan: 1
                }, {
                    field: 'pressureOut', //域值
                    title: '出口(kPa)', //内容
                    align: 'center',
                    visible: true, //false表示不显示
                    sortable: false, //启用排序
                    width: '8%',
                    colspan: 1,
                    rowspan: 1
                }, ]
            ],
        });
    },
    getHistoryTable: function(id, e) {
        var _this = this;
        var param = {
            "startDate": "", //开始日期 2017-04-05
            "endDate": "", //结束日期  2017-04-06
            "facilityCheckResult": "", //检查结果(0:正常  1:异常)
            "isLeakage": "", //是否漏气（0：否   1：是   ）
            "facilityTypeCode ": "", //设施类型种12种.字符串，空代表全部
            "keyword": "", // 设施名称、创建人
            "facilityId": id, // 设施ID。查询某一个设施的历史检查记录时，传入设施ID。 
            "pageNum": 1, //第几页
            "pageSize": 10 //每页记录数 默认10条
        };
        $('#tableHistory').bootstrapTable('refreshOptions', {
            queryParams: function(params) {
                param.pageNum = params.pageNumber;
                param.pageSize = params.pageSize;
                return param;
            }
        });
        switch (e) {
            case "FT_01": //调压设备
                $('#tableHistory').bootstrapTable('showColumn', 'pressureSituationName'); //压力情况
                $('#tableHistory').bootstrapTable('showColumn', 'pressureIn'); //进口压力
                $('#tableHistory').bootstrapTable('showColumn', 'pressureOut'); //出口压力
                $('#tableHistory').bootstrapTable('hideColumn', 'isSeeperName'); //有无积水
                $('#tableHistory').bootstrapTable('hideColumn', 'isWellCoverDamageName'); //井盖破损
                $('#tableHistory').bootstrapTable('hideColumn', 'isOccupyName'); //有无占压
                $('#tableHistory').bootstrapTable('hideColumn', 'flowmeterData'); //流量计读数
                break;
            case "FT_04": //井
                $('#tableHistory').bootstrapTable('hideColumn', 'pressureSituationName'); //压力情况
                $('#tableHistory').bootstrapTable('hideColumn', 'pressureIn'); //进口压力
                $('#tableHistory').bootstrapTable('hideColumn', 'pressureOut'); //出口压力
                $('#tableHistory').bootstrapTable('showColumn', 'isSeeperName'); //有无积水
                $('#tableHistory').bootstrapTable('showColumn', 'isWellCoverDamageName'); //井盖破损
                $('#tableHistory').bootstrapTable('showColumn', 'isOccupyName'); //有无占压
                $('#tableHistory').bootstrapTable('hideColumn', 'flowmeterData'); //流量计读数
                $("th[data-field='pressure']").hide();
                break;
            case "FT_10": //流量计
                $('#tableHistory').bootstrapTable('showColumn', 'pressureSituationName'); //压力情况
                $('#tableHistory').bootstrapTable('hideColumn', 'pressureIn'); //进口压力
                $('#tableHistory').bootstrapTable('hideColumn', 'pressureOut'); //出口压力
                $('#tableHistory').bootstrapTable('hideColumn', 'isSeeperName'); //有无积水
                $('#tableHistory').bootstrapTable('hideColumn', 'isWellCoverDamageName'); //井盖破损
                $('#tableHistory').bootstrapTable('hideColumn', 'isOccupyName'); //有无占压
                $('#tableHistory').bootstrapTable('showColumn', 'flowmeterData'); //流量计读数
                $("th[data-field='pressure']").hide();
                break;
            default: //其他所有
                $('#tableHistory').bootstrapTable('hideColumn', 'pressureSituationName'); //压力情况
                $('#tableHistory').bootstrapTable('hideColumn', 'pressureIn'); //进口压力
                $('#tableHistory').bootstrapTable('hideColumn', 'pressureOut'); //出口压力
                $('#tableHistory').bootstrapTable('hideColumn', 'isSeeperName'); //有无积水
                $('#tableHistory').bootstrapTable('hideColumn', 'isWellCoverDamageName'); //井盖破损
                $('#tableHistory').bootstrapTable('hideColumn', 'isOccupyName'); //有无占压
                $('#tableHistory').bootstrapTable('hideColumn', 'flowmeterData'); //流量计读数
                $("th[data-field='pressure']").hide();
        }
    },
    historyTableOperation: function(value, row, index) { //历史检查操作按钮
        return [
            '<a class="look" href="javascript:void(0)" title="查看">',
            '<i></i>',
            '</a>',
        ].join('');
    },
    historyTableEvent: function() { //历史检查按钮相关的事件
        var _this = this;
        return {
            //查看功能
            'click .look': function(e, value, row, index) {
                facilityFrame._recordId = row.objectId;
                historyDetailsObj.$historyDetailsFrame.modal(); //打开详情模态框
                historyDetailsObj.clearHistoryDetails();
                return false;
            }
        }
    },
};

//高级搜索相关的对象与方法
var searchObj = {
    $items: $('.top .item'), //搜索条件dom
    $searchInput: $('#searchInput'), //搜索关键词dom
    $startDate: $("#datetimeStart"),
    $endDate: $("#datetimeEnd"),
    // tracksIdsArr: [], //存放已被选中的轨迹ID
    defaultObj: { //默认搜索条件
        "facilityStatusCode": "",
        "pipelineTypeCode": "",
        "facilityTypeCodeList": [],
        "startDate": "", //开始日期
        "endDate": "", //结束日期
        "keyword": "", //高级搜索关键词
        "pageNum": 1, //第几页
        "pageSize": 10 //每页记录数
    },
    querryObj: { //请求的搜索条件
        "facilityStatusCode": "",
        "pipelineTypeCode": "",
        "facilityTypeCodeList": [],
        "startDate": "", //开始日期
        "endDate": "", //结束日期
        "keyword": "", //巡线人，巡线编号
        "pageNum": 1, //第几页
        "pageSize": 10 //每页记录数
    },
    activeObj: { //高亮默认搜索条件，用于渲染页面
        "facilityStatusCode": "",
        "pipelineTypeCode": "",
        "facilityTypeCodeList": "",
        "date": "all",
    },
    init: function() {
        this.renderActive(); //初始化显示被选中
        this.bindEvent(); //监听事件
        this.bindDateDiyEvent(); //时间控件初始化
    },
    renderActive: function(obj) { //被选中的样式
        var that = this;
        if (!obj) {
            obj = that.activeObj;
        }
        for (var key in obj) {
            var $parent = that.$items.parent('[data-class=' + key + ']');
            $parent.find('.item').removeClass('active')
            $parent.find('.item[data-value="' + obj[key] + '"]').addClass('active');
            if (key === 'date') {
                if (obj[key] === 'diy') {
                    $('#item_diy').addClass('active');
                } else {
                    $('#item_diy').removeClass('active');
                }
            }
        }
    },
    bindEvent: function() {
        var that = this;
        /* 选择条件 */
        that.$items.click(function() {
            var key = $(this).parent().attr("data-class");
            var value = $(this).attr("data-value");

            if (key === 'date') {
                that.setDate(value);
            } else if (key == "facilityTypeCodeList") {
                if (value == '') {
                    that.querryObj[key] = [];
                } else {
                    that.querryObj[key] = [value];
                }
            } else {
                that.querryObj[key] = value;
            }

            var obj = {};
            obj[key] = value;
            that.renderActive(obj);
            that.refreshTable();
            console.log(that.querryObj);
        });

        /* 搜索关键词 */
        $('#gf_Btn').click(function() {
            var s = $(this).parent().find('input').val().trim();
            that.querryObj.keyword = s;
            that.refreshTable();
        });

        /* keyup事件 */
        that.$searchInput.keypress(function(e) {
            if (e && e.keyCode === 13) { // enter 键
                //that.querryObj.keyword = that.$searchInput.val();
                that.refreshTable();
            }
        });
        /* 显示高级搜索 */
        $('#search_more').click(function() {
            if ($(this).hasClass('active')) {
                $(this).removeClass('active');
                $('.more_item_wrapper').slideUp();
            } else {
                $(this).addClass('active');
                $('.more_item_wrapper').slideDown();
            }
        });
        /* 清空搜索条件 */
        $('#gf_reset_Btn').click(function() {
            //请求数据还原到初始话
            $.extend(that.querryObj, that.defaultObj);
            // Object.assign(that.querryObj, that.defaultObj);

            that.$startDate.val("");
            that.$endDate.val("");
            that.$searchInput.val("");
            $("#diyDateBtn").removeClass("active");
            that.renderActive();
            that.refreshTable();
        });
        //自定义时间
        $('#diyDateBtn').on('click', function() {
            var s = that.$startDate.val();
            var e = that.$endDate.val();
            if (!s) {
                xxwsWindowObj.xxwsAlert('请选择起始时间');
                return;
            }
            if (!e) {
                xxwsWindowObj.xxwsAlert('请选择结束时间');
                return;
            }
            that.querryObj.startDate = s;
            that.querryObj.endDate = e;
            that.renderActive({
                'date': 'diy'
            })
            that.refreshTable();
        });
    },
    setDate: function(value) {
        var that = this;
        switch (value) {
            case 'day':
                var date = new Date().Format('yyyy-MM-dd');
                that.querryObj.startDate = date;
                that.querryObj.endDate = date;
                break;
            case 'week':
                var date = new Date();
                that.querryObj.startDate = date.getWeekStartDate().Format('yyyy-MM-dd');
                that.querryObj.endDate = date.getWeekEndDate().Format('yyyy-MM-dd');
                break;
            case 'month':
                var date = new Date();
                that.querryObj.startDate = date.getMonthStartDate().Format('yyyy-MM-dd');
                that.querryObj.endDate = date.getMonthEndDate().Format('yyyy-MM-dd');
                break;
            default:
                that.querryObj.startDate = '';
                that.querryObj.endDate = '';
        }
    },
    refreshTable: function() {
        var that = this;
        that.querryObj.keyword = that.$searchInput.val().trim();
        that.$searchInput.val(that.querryObj.keyword);
        that.querryObj.pageNum = '1';
        $('#tableFacility').bootstrapTable('removeAll'); //清空数据
        $('#tableFacility').bootstrapTable('refreshOptions', {
            pageNumber: +that.querryObj.pageNum,
            pageSize: +that.querryObj.pageSize,
            queryParams: function(params) {
                that.querryObj.pageSize = params.pageSize;
                that.querryObj.pageNum = params.pageNumber;
                return that.querryObj;
            }
        });
    },
    bindDateDiyEvent: function() { //时间控件
        $("#datetimeStart").datetimepicker({
            format: 'yyyy-mm-dd',
            minView: 'month',
            language: 'zh-CN',
            autoclose: true,
            // startDate: new Date()
        }).on("click", function() {
            $("#datetimeStart").datetimepicker("setEndDate", $("#datetimeEnd").val());
        });
        $("#datetimeEnd").datetimepicker({
            format: 'yyyy-mm-dd',
            minView: 'month',
            language: 'zh-CN',
            autoclose: true,
            // startDate: new Date()
        }).on("click", function() {
            $("#datetimeEnd").datetimepicker("setStartDate", $("#datetimeStart").val())
        });


        $('#dateTimeAdd').datetimepicker({
            format: 'yyyy-mm-dd',
            minView: 'month',
            language: 'zh-CN',
            autoclose: true,
            endDate: new Date()
        });
        $('#dateTimeModify').datetimepicker({
            format: 'yyyy-mm-dd',
            minView: 'month',
            language: 'zh-CN',
            autoclose: true,
            endDate: new Date()
        });
        $('#investmentTimeAdd').datetimepicker({
            format: 'yyyy-mm-dd',
            minView: 'month',
            language: 'zh-CN',
            autoclose: true,
            endDate: new Date()
        });
        $('#investmentTimeModify').datetimepicker({
            format: 'yyyy-mm-dd',
            minView: 'month',
            language: 'zh-CN',
            autoclose: true,
            endDate: new Date()
        });
    }
};

//导出文件
var exportFileObj = {
    $exportAll: $("#export_all"),
    $exportChoice: $("#export_choice"),
    $downFacility: $("#downFacility"),
    expoerObj: {
        "facilityStatusCode": "",
        "pipelineTypeCode": "",
        "facilityTypeCode": "",
        "startDate": "", //开始日期
        "endDate": "", //结束日期
        "keyword": "", //高级搜索关键词
        "pageNum": 1, //第几页
        "pageSize": 10, //每页记录数
        "idList": []
    },
    init: function() {
        var _this = this;
        //下载设施台账模板
        _this.$downFacility.click(function() {
            _this.exportTemlates();
        });
        this.$exportAll.click(function() {
            _this.expoerObj.idList = [];
            _this.expoerCondition();
        });
        this.$exportChoice.click(function() {
            var selectionsData = $('#tableFacility').bootstrapTable('getSelections');
            _this.expoerObj.idList = [];
            if (selectionsData.length == 0) {
                xxwsWindowObj.xxwsAlert("请选择你需要导出的设施！");
                return false;
            } else {
                for (var i = 0; i < selectionsData.length; i++) {
                    _this.expoerObj.idList.push(selectionsData[i].objectId);
                }
                _this.expoerCondition();
            }
        });
    },
    expoerCondition: function() {
        $.extend(this.expoerObj, searchObj.querryObj);
        this.expoerData(this.expoerObj);
    },
    expoerData: function(date) {
        var options = {
            "url": '/cloudlink-inspection-event/facility/exportExcel?token=' + lsObj.getLocalStorage('token'),
            "data": date,
            "method": 'post'
        }
        this.downLoadFile(options);
    },
    exportTemlates: function() {
        var options = {
            "url": '/cloudlink-inspection-event/facility/downLoadTemplate?token=' + lsObj.getLocalStorage('token'),
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

//文件相关的
var fileObj = {
    fileElem: document.getElementById("fileElem"),
    path: null,
    fileList: document.getElementById("fileList"),
    _mun: 0,
    _isModify: null,
    init: function() {
        var _this = this;
        //上传图片-点击事件
        $(".facilityFileAdd .addImg").click(function() {
            _this._isModify = false;
            var imgNum = $(".facilityFileAdd").find(".feedback_images").length;
            if (imgNum <= 5) {
                $(".facilityFileAdd .upload_file").trigger("click");
            } else {
                xxwsWindowObj.xxwsAlert("最多上传六张图片");
            }
        });

        $(".facilityFileModity .addImg").click(function() {
            _this._isModify = true;
            var imgNum = $(".facilityFileModity").find(".feedback_images").length;
            if (imgNum <= 5) {
                $(".facilityFileModity .upload_file").trigger("click");
            } else {
                xxwsWindowObj.xxwsAlert("最多上传六张图片");
            }
        });
        window.URL = window.URL || window.webkitURL;
    },
    handleFilesImg: function(obj) {
        var _this = this;
        var filextension = obj.value.substring(obj.value.lastIndexOf("."), obj.value.length);
        filextension = filextension.toLowerCase();
        if ((filextension != '.jpg') && (filextension != '.gif') && (filextension != '.jpeg') && (filextension != '.png') && (filextension != '.bmp')) {
            alert("对不起，系统仅支持标准格式的照片，请您调整格式后重新上传，谢谢 !");
            obj.focus();
        } else {
            var files = obj.files,
                img = new Image();
            if (window.URL) {
                _this.path = window.URL.createObjectURL(files[0]); //创建一个object URL，并不是你的本地路径
                img.onload = function(e) {
                    window.URL.revokeObjectURL(this.src); //图片加载后，释放object URL
                };
            } else if (window.FileReader) {
                //opera不支持createObjectURL/revokeObjectURL方法。我们用FileReader对象来处理
                var reader = new FileReader();
                reader.readAsDataURL(files[0]);
                reader.onload = function(e) {
                    _this.path = this.result;
                }

            } else {
                //ie      
                obj.select();
                obj.blur();
                var nfile = document.selection.createRange().text;
                document.selection.empty();
                _this.path = nfile;
                img.onload = function() {};
                //fileList.style.filter="progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod='image',src='"+nfile+"')";
            }
            _this._mun++;
            var imagesL = '<div class="feedback_images">' +
                '<img src="' + _this.path + '" alt=""/>' +
                '<span onclick="closeImg(this);" data-key="' + _this._mun + '"></span>' +
                '</div>';

            var file = {
                "data-value": _this._mun,
                "id": 'fileid' + _this._mun,
                "name": "file"
            }
            var fileId = '<input type="file" onchange="handleFilesImg(this);"  class="upload_file"/>';

            if (_this._isModify == true) {
                $(".facilityFileModity .feedback_img_list").append(imagesL);
                $(".facilityFileModity .feedback_img_file").find("input").attr("class", ""); //清空所有的class，进行事件的
                $(".facilityFileModity .feedback_img_file").find("input").last().attr(file);
                $(".facilityFileModity .feedback_img_file").append(fileId);
            } else {
                $(".facilityFileAdd .feedback_img_list").append(imagesL);
                $(".facilityFileAdd .feedback_img_file").find("input").attr("class", ""); //清空所有的class，进行事件的
                $(".facilityFileAdd .feedback_img_file").find("input").last().attr(file);
                $(".facilityFileAdd .feedback_img_file").append(fileId);
            }
        }
    },
};

function handleFilesImg(obj) {
    fileObj.handleFilesImg(obj);
};
/*删除图片*/
function closeImg(e) {
    var num = $(e).attr("data-key");
    $(e).closest(".feedback_images").remove();
    $(".feedback_img_file input[name=file]").each(function() {
        if ($(this).attr("data-value") == num) {
            $(this).remove();
        }
    })
};
//删除编辑图片
function deleteImg(e) {
    var imgid = $(e).attr("data-key");
    $(e).closest(".feedback_images").remove();
    facilityFrame._deleteImgs.push(imgid);
};
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

//导入
var importObj = {
    $submitBtn: $(".submitFileBtn"),
    $batchImportFrame: $("#batchImportModal"), //上传文件的模态框
    $hintsFrame: $("#validationHintsFrame"), //提示内容展示模态框
    $confirmationFrame: $("#confirmationFrame"), //确定导入模态框
    $transitionFrame: $("#transitionFrame"), //请求中模态框
    $refrsetFrame: $("#refrsetFrame"), //成功的模态框
    $confirmationBtn: $(".confirmationBtn"),
    _addressObj: null,
    _flag: true,
    init: function() {
        var _this = this;
        //点击浏览 选择上传文件
        $(".batchImport").click(function() {
            $(".upload_picture").trigger("click");
        });


        //文件上传模态框打开完成
        _this.$batchImportFrame.on('shown.bs.modal', function(e) {
            $(".feedback_excel_file").find("input[type=file]").val("");
        });

        //上传文件按钮
        _this.$submitBtn.click(function() {
            _this.importVerification();
        });
        //批量上传
        _this.$confirmationBtn.click(function() {
            _this.cockedFile();
        });
        //成功之后刷新页面
        _this.$refrsetFrame.on('hide.bs.modal', function(e) {
            window.location.reload();
        });
    },
    importVerification: function() { //提交的时候表单验证
        var _this = this;
        var val = $('.batchImportInput').val().trim();
        if (val == "" || val == null) {
            xxwsWindowObj.xxwsAlert("请选择上传的文件");
            return false;
        } else {
            var uploadId = $('.feedback_excel_file').find('input').attr('id');
            _this.uploadFlie(uploadId);
        }
    },
    uploadFlie: function(uploadId) { //上传文件到阿里
        var _this = this;
        var objectId = baseOperation.createuuid();
        if (_this._flag == true) {
            _this._flag = false;
            _this.$transitionFrame.modal();
            _this.$transitionFrame.find(".transitionMain dd span").text("数据格式规范验证");
            $.ajaxFileUpload({
                url: "/cloudlink-core-file/attachment/web/v1/save?businessId=" + objectId + "&bizType=excel&token=" + lsObj.getLocalStorage("token"),
                secureuri: false,
                fileElementId: uploadId, //上传input的id
                dataType: "json",
                type: "POST",
                async: false,
                success: function(data, status) {
                    var statu = data.success;
                    if (statu == 1) {
                        var fileId = data.rows[0].fileId;
                        _this.fileCheck(fileId);
                    } else {
                        _this.$transitionFrame.modal('hide');
                        _this.again();
                        xxwsWindowObj.xxwsAlert("校验失败，请稍后重试");
                    }
                },
                error: function(data) {
                    _this.$transitionFrame.modal('hide');
                    _this.again();
                }
            });
        }
    },
    fileCheck: function(fileId) { //文件的校验
        var _this = this;
        var param = {
            fileId: fileId,
        };
        $.ajax({
            type: 'POST',
            url: "/cloudlink-inspection-event/facility/importValidation?token=" + lsObj.getLocalStorage('token'),
            contentType: "application/json",
            data: JSON.stringify(param),
            dataType: "json",
            success: function(data, status) {
                if (data.success == 1) {
                    var state = data.rows[0].status;
                    var total = data.rows[0].total;
                    $(".hintsTotal").text(total);
                    $(".confirmationText span").text(total);
                    $(".confirmationAdopt span").text(total);
                    if (state == 1) {
                        _this.$confirmationFrame.modal();
                        _this.$transitionFrame.modal('hide');
                        _this.again();
                    } else {
                        var wrongData = data.rows[0].errors;
                        $(".hintsNum").text(wrongData.length);

                        _this.$transitionFrame.modal('hide');
                        _this.$hintsFrame.modal();
                        $(".hintsMainList ul").html("");
                        _this.$hintsFrame.find(".modal-header h3 span").text("数据格式规范验证");
                        _this.$hintsFrame.find(".hintsMainTitle i").text("必填项未填写、填写项不符合规范、设备名称相同");
                        _this.again();
                        for (var i = 0; i < wrongData.length; i++) {
                            var colTxt = '';
                            if (wrongData[i].msgType == "facilityNameDuplicate") {
                                if (wrongData[i].msg) {
                                    colTxt = wrongData[i].msg + '行【设施名称】重复、';
                                }
                                if (wrongData[i].colErrors) {
                                    for (var j = 0; j < wrongData[i].colErrors.length; j++) {
                                        var wrongTxt;
                                        if (wrongData[i].colErrors[j].msgType == 'notBlank' || wrongData[i].colErrors[j].msgType == 'typemismatch' || wrongData[i].colErrors[j].msgType == 'integrality') {
                                            wrongTxt = wrongData[i].colErrors[j].msg;
                                        }
                                        colTxt += '第' + wrongData[i].colErrors[j].colNum + '列 ' + wrongTxt + '、';
                                    }
                                }
                            } else if (wrongData[i].msgType == "facilityNameExists") {
                                if (wrongData[i].msg) {
                                    colTxt = wrongData[i].msg + '行【设施名称】已存在、';
                                }
                            } else {
                                if (wrongData[i].colErrors) {
                                    for (var j = 0; j < wrongData[i].colErrors.length; j++) {
                                        var wrongTxt;
                                        if (wrongData[i].colErrors[j].msgType == 'notBlank' || wrongData[i].colErrors[j].msgType == 'typemismatch' || wrongData[i].colErrors[j].msgType == 'integrality') {
                                            wrongTxt = wrongData[i].colErrors[j].msg;
                                        }
                                        colTxt += '第' + wrongData[i].colErrors[j].colNum + '列 ' + wrongTxt + '、';
                                    }
                                }
                            }
                            // if (wrongData[i].msg) {
                            //     colTxt = wrongData[i].msg + '行设备名称重复、';
                            // }
                            // if (wrongData[i].colErrors) {
                            //     for (var j = 0; j < wrongData[i].colErrors.length; j++) {
                            //         var wrongTxt;
                            //         if (wrongData[i].colErrors[j].msgType == 'notBlank') {
                            //             wrongTxt = '列未填写';
                            //         } else if (wrongData[i].colErrors[j].msgType == 'typemismatch' || wrongData[i].colErrors[j].msgType == 'integrality') {
                            //             wrongTxt = '列填写不规范';
                            //         } else if (wrongData[i].colErrors[j].msgType == 'facilityNameExists') {
                            //             wrongTxt = '列设备名称已存在';
                            //         }
                            //         colTxt += '第' + wrongData[i].colErrors[j].colNum + wrongTxt + '、';
                            //     }
                            // }
                            var txt = '<li><span class="listLeft">' + wrongData[i].rowNum + '</span><span class="listRight">' + colTxt + '</span></li>';
                            $(".hintsMainList ul").append(txt);
                        }
                    }
                } else {
                    xxwsWindowObj.xxwsAlert("校验失败，请稍后重试");
                    _this.$transitionFrame.modal('hide');
                    _this.again();
                }
            },
            error: function(data) {
                _this.$transitionFrame.modal('hide');
                _this.again();
                xxwsWindowObj.xxwsAlert("校验失败，请稍后重试");
            }
        });
    },
    fileCheckTwo: function() { //与数据库校验
        var _this = this;
        $.ajax({
            type: 'POST',
            url: "/cloudlink-inspection-event/userArchive/importValidateAddress?token=" + lsObj.getLocalStorage('token'),
            contentType: "application/json",
            // data: JSON.stringify(param),
            dataType: "json",
            success: function(data, status) {
                if (data.success == 1) {
                    var state = data.rows[0].status;
                    if (state == 1) {
                        _this.$confirmationFrame.modal();
                        _this.$transitionFrame.modal('hide');
                        _this.again();
                    } else {
                        var wrongData = data.rows[0].errors;
                        $(".hintsNum").text(wrongData.length);
                        _this.$transitionFrame.modal('hide');
                        _this.$hintsFrame.modal();
                        $(".hintsMainList ul").html("");
                        _this.$hintsFrame.find(".modal-header h3 span").text("地址验证");
                        _this.$hintsFrame.find(".hintsMainTitle i").text("地址已存在");
                        _this.again();
                        for (var i = 0; i < wrongData.length; i++) {
                            var colTxt = '';
                            if (wrongData[i].msg) {
                                colTxt = wrongData[i].rowNum + '行的地址系统中已存在';
                            }
                            var txt = '<li><span class="listLeft">' + wrongData[i].rowNum + '</span><span class="listRight">' + colTxt + '</span></li>';
                            $(".hintsMainList ul").append(txt);
                        }
                    }
                } else {
                    xxwsWindowObj.xxwsAlert("校验失败，请稍后重试");
                    _this.$transitionFrame.modal('hide');
                    _this.again();
                }
            },
            error: function(data) {
                _this.$transitionFrame.modal('hide');
                _this.again();
                xxwsWindowObj.xxwsAlert("校验失败，请稍后重试");
            }
        });
    },
    cockedFile: function() { //批量上传数据库
        var _this = this;
        if (_this._flag == true) {
            _this._flag = false;
            _this.$transitionFrame.modal();
            _this.$transitionFrame.find(".transitionMain dd span").text("批量导入");
            $.ajax({
                type: 'POST',
                url: "/cloudlink-inspection-event/facility/importBatch?token=" + lsObj.getLocalStorage('token'),
                contentType: "application/json",
                // data: JSON.stringify(param),
                dataType: "json",
                success: function(data, status) {
                    if (data.success == 1) {
                        _this.$transitionFrame.modal('hide');
                        _this.again();
                        _this.$refrsetFrame.modal();
                    } else if (data.success == -1 && data.msg == 'NONE') {
                        xxwsWindowObj.xxwsAlert("导入失败，Excel中没有数据!");
                        _this.$transitionFrame.modal('hide');
                        _this.again();
                    } else {
                        xxwsWindowObj.xxwsAlert("导入失败，请稍后重试");
                        _this.$transitionFrame.modal('hide');
                        _this.again();
                    }
                },
                error: function(data) {
                    _this.$transitionFrame.modal('hide');
                    _this.again();
                    xxwsWindowObj.xxwsAlert("导入失败，请稍后重试");
                }
            });
        }
    },
    again: function() {
        this._flag = true;
    }
};



$(function() {
    $("input[type=text]").val("");
    searchObj.init();
    facility.init();
    facilityTable.init();
    facilityFrame.init();
    exportFileObj.init();
    fileObj.init();
    facilityChart.init();
    facilityMapObj.init();
    importObj.init();
    drafting('facilityMap', 'drafting_down'); //启动拖拽

    pipeLineObj.init(facilityMapObj.$bdMap);
    pipelinebtnObj.init($("#facilityMap"));
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
});