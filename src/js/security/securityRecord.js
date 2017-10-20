//计划管理
var recordObj = {
    $securityRecordFrame: $("#securityRecordFrame"),
    $historyRecordFrame: $("#historyRecordFrame"),
    $openHistory: $(".openHistory"),
    $deleteRecord: $(".deleteRecord"),
    $openHistory: $(".openHistory"),
    _recordId: null,
    _groupId: null,
    _planId: null,
    init: function() {
        var _this = this;
        //获取计划列表
        _this.getPlanList();
        //获取记录列表
        this.getTable();

        //查看记录详情
        _this.$securityRecordFrame.on('shown.bs.modal', function(e) {
            _this.getSecurityRecord(_this._recordId);
        });
        //打开历史记录
        _this.$openHistory.click(function() {
            _this.$historyRecordFrame.modal();
            _this.clearHistoryRecord();
        });
        _this.$historyRecordFrame.on('shown.bs.modal', function(e) {
            _this.getHistoryRecord(_this._groupId, _this._planId);
        });
        //删除安检记录
        _this.$deleteRecord.click(function() {
            var defaultOptions = {
                tip: '您是否删除此次安检？',
                name_title: '提示',
                name_cancel: '取消',
                name_confirm: '确定',
                isCancelBtnShow: true,
                callBack: function() {
                    _this.deteleRecord(_this._recordId);
                }
            };
            xxwsWindowObj.xxwsAlert(defaultOptions);
        });
    },
    getTable: function() {
        var _this = this;
        $('#tablRrecord').bootstrapTable({
            url: "/cloudlink-inspection-event/commonData/securityCheckRecord/getPageList?token=" + lsObj.getLocalStorage('token'), //请求数据url
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
                searchObj.querryObj.pageSize = params.pageSize;
                searchObj.querryObj.pageNum = params.pageNumber;
                return searchObj.querryObj;
            },
            onLoadSuccess: function(data) {
                if (data.success == 1) {}
            },
            onDblClickRow: function(row) {
                _this._recordId = row.objectId
                _this.$securityRecordFrame.modal();
                _this.clearSecurityRecord();
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
                field: 'planName', //域值
                title: '所属计划',
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '15%',
                editable: true,
            }, {
                field: 'securityCheckTime', //域值
                title: '安检时间', //内容
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '10%',
                editable: true,
            }, {
                field: 'userFileName', //域值
                title: '用户名称', //内容
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '8%',
                editable: true,
            }, {
                field: 'enterhomeUserTypeName', //域值
                title: '用户类型', //内容
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '6%',
                editable: true,
            }, {
                field: 'address', //域值
                title: '详细地址', //内容
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '30%',
                editable: true,
            }, {
                field: 'createUserName', //域值
                title: '安检人员', //内容
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '8%',
                editable: true,
            }, {
                field: 'enterhomeSituationTypeName', //域值
                title: '入户情况', //内容
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '8%',
                formatter: function(value, row, index) {
                    return "<span class='home_" + row.enterhomeSituationTypeCode + "'>" + value + "</span>";
                }
            }, {
                field: 'isdanger', //域值
                title: '安全隐患', //内容
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '6%',
                formatter: function(value, row, index) {
                    if (value == 0) {
                        return '不存在';
                    } else if (value == 1) {
                        return '存在';
                    } else {
                        return '';
                    }
                }
            }, {
                field: 'operate',
                title: '操作',
                align: 'center',
                events: _this.tableEvent(),
                width: '5%',
                formatter: _this.tableOperation,
            }]
        });
    },
    tableOperation: function(value, row, index) {
        var deleteClass = null;
        var userId = JSON.parse(lsObj.getLocalStorage('userBo')).objectId;

        if (row.isPlanClosed == 1) {
            deleteClass = 'delete_end';
        } else {
            if (JSON.parse(lsObj.getLocalStorage('userBo')).isSysadmin == 1) {
                deleteClass = 'delete';
            } else {
                if (row.planCreateUserId == userId || row.createUserId == userId) {
                    deleteClass = 'delete';
                } else {
                    deleteClass = 'delete_end';
                }
            }
        }

        return [
            '<a class="look" data-toggle="modal" href="javascript:void(0)" title="查看">',
            '<i></i>',
            '</a>',
            // '<a class="' + deleteClass + '" href="javascript:void(0)" title="删除">',
            // '<i></i>',
            // '</a>',
        ].join('');
    },
    tableEvent: function() {
        var _this = this;
        return {
            //查看详情
            'click .look': function(e, value, row, index) {
                _this._recordId = row.objectId
                _this.$securityRecordFrame.modal();
                _this.clearSecurityRecord();
                return false;
            },
            //删除计划
            'click .delete': function(e, value, row, index) {
                var defaultOptions = {
                    tip: '您是否删除此次安检？',
                    name_title: '提示',
                    name_cancel: '取消',
                    name_confirm: '确定',
                    isCancelBtnShow: true,
                    callBack: function() {
                        _this.deteleRecord(row.objectId);
                    }
                };
                xxwsWindowObj.xxwsAlert(defaultOptions);
                return false;
            }
        }
    },
    getPlanList: function() { //获取计划列表
        var _this = this;
        var plan = {
            "startDate": "", //默认空
            "endDate": "", //默认空 
            "planShowStatus": "",
            "keywordWeb": "", // 默认空
            "pageNum": 1, //固定为1
            "pageSize": 50000 //固定50条
        }
        $.ajax({
            type: 'POST',
            url: "/cloudlink-inspection-event/securityCheckPlan/getPageList?token=" + lsObj.getLocalStorage('token'),
            contentType: "application/json",
            data: JSON.stringify(plan),
            dataType: "json",
            success: function(data, status) {
                if (data.success == 1) {
                    $("#planIdList").html("");
                    var txt = "<option value=''>全部</option>";

                    for (var i = 0; i < data.rows.length; i++) {
                        txt += "<option value='" + data.rows[i].objectId + "'>" + data.rows[i].planName + "</option>";
                    }
                    $("#planIdList").append(txt);
                } else {
                    xxwsWindowObj.xxwsAlert("获取计划列表失败");
                }
            }
        });
    },
    clearSecurityRecord: function() { //清空安检记录详情
        $("#securityRecordFrame").find("p").each(function() {
            if ($(this).attr("data-name")) {
                $(this).text("----");
            }
        });
        // $(".planNameT").text("---");
        // $(".securityCheckTimeT").text("---");
        // $(".enterhomeUserCodeT").text("---");
        // $(".enterhomeUserNameT").text("---");
        // $(".enterhomeUserTypeCodeT").text("---");
        // $(".enterhomeUserTelT").text("---");
        // $(".enterhomeSituationTypeCodeT").text("---");
        // $(".createUserNameT").text("---");
        // $(".enterhomeAddressT").text("---");
        // $(".remarkT").text("---");
        $(".isdangerT").text("正常");
        $(".hiddendangersT").html('<span>无</span>');
        $(".gasMeterList").html("");
        $(".recordImg").html("<span>无</span>");
        $(".userImg").html("<span>无</span>");
        this.$openHistory.hide();
        this.$deleteRecord.hide();
        $(".isHasDanger").hide();
        $(".isSuccess").hide();
        this.satisfaction('5');
    },
    satisfaction: function(value) { //满意度星星的遍历
        var _this = this;
        switch (value) {
            case '1':
                var liTxt = '<li><img src="/src/images/security/star.png" width="20" alt="">';
                $(".satisfaction ul").html(liTxt);
                $(".satisfaction span").text("非常不满");
                break;
            case '2':
                var liTxt = '<li><img src="/src/images/security/star.png" width="20" alt=""></li>' +
                    '<li><img src="/src/images/security/star.png" width="20" alt=""></li>';
                $(".satisfaction ul").html(liTxt);
                $(".satisfaction span").text("不满意");
                break;
            case '3':
                var liTxt = '<li><img src="/src/images/security/star.png" width="20" alt=""></li>' +
                    '<li><img src="/src/images/security/star.png" width="20" alt=""></li>' +
                    '<li><img src="/src/images/security/star.png" width="20" alt=""></li>';
                $(".satisfaction ul").html(liTxt);
                $(".satisfaction span").text("一般");
                break;
            case '4':
                var liTxt = '<li><img src="/src/images/security/star.png" width="20" alt=""></li>' +
                    '<li><img src="/src/images/security/star.png" width="20" alt=""></li>' +
                    '<li><img src="/src/images/security/star.png" width="20" alt=""></li>' +
                    '<li><img src="/src/images/security/star.png" width="20" alt=""></li>';
                $(".satisfaction ul").html(liTxt);
                $(".satisfaction span").text("满意");
                break;
            default:
                var liTxt = '<li><img src="/src/images/security/star.png" width="20" alt=""></li>' +
                    '<li><img src="/src/images/security/star.png" width="20" alt=""></li>' +
                    '<li><img src="/src/images/security/star.png" width="20" alt=""></li>' +
                    '<li><img src="/src/images/security/star.png" width="20" alt=""></li>' +
                    '<li><img src="/src/images/security/star.png" width="20" alt=""></li>';
                $(".satisfaction ul").html(liTxt);
                $(".satisfaction span").text("非常满意");
                break;
        }
    },
    satisfactionTxt: function(value) { //满意度星星的遍历
        var _this = this;
        switch (value) {
            case '1':
                var starTxt = '<ul>' +
                    '<li><img src="/src/images/security/star.png" width="20" alt=""></li>' +
                    '</ul>' +
                    '<span>非常不满</span>';
                return starTxt;
                break;
            case '2':
                var starTxt = '<ul>' +
                    '<li><img src="/src/images/security/star.png" width="20" alt=""></li>' +
                    '<li><img src="/src/images/security/star.png" width="20" alt=""></li>' +
                    '</ul>' +
                    '<span>不满意</span>';
                return starTxt;
                break;
            case '3':
                var starTxt = '<ul>' +
                    '<li><img src="/src/images/security/star.png" width="20" alt=""></li>' +
                    '<li><img src="/src/images/security/star.png" width="20" alt=""></li>' +
                    '<li><img src="/src/images/security/star.png" width="20" alt=""></li>' +
                    '</ul>' +
                    '<span>一般</span>';
                return starTxt;
                break;
            case '4':
                var starTxt = '<ul>' +
                    '<li><img src="/src/images/security/star.png" width="20" alt=""></li>' +
                    '<li><img src="/src/images/security/star.png" width="20" alt=""></li>' +
                    '<li><img src="/src/images/security/star.png" width="20" alt=""></li>' +
                    '<li><img src="/src/images/security/star.png" width="20" alt=""></li>' +
                    '</ul>' +
                    '<span>满意</span>';
                return starTxt;
                break;
            default:
                var starTxt = '<ul>' +
                    '<li><img src="/src/images/security/star.png" width="20" alt=""></li>' +
                    '<li><img src="/src/images/security/star.png" width="20" alt=""></li>' +
                    '<li><img src="/src/images/security/star.png" width="20" alt=""></li>' +
                    '<li><img src="/src/images/security/star.png" width="20" alt=""></li>' +
                    '<li><img src="/src/images/security/star.png" width="20" alt=""></li>' +
                    '</ul>' +
                    '<span>非常满意</span>';
                return starTxt;
                break;
        }
    },
    getSecurityRecord: function(recordId) { //获取安检记录详情
        var _this = this;
        var record = {
            objectId: recordId
        }
        $.ajax({
            type: 'GET',
            url: "/cloudlink-inspection-event/commonData/securityCheckRecord/get?token=" + lsObj.getLocalStorage('token'),
            contentType: "application/json",
            data: record,
            dataType: "json",
            success: function(data, status) {
                if (data.success == 1) {
                    var obj = data.rows[0];
                    fromObj.setDetails('securityRecordFrame', obj);
                    // $(".planNameT").text(data.rows[0].planName);
                    // $(".securityCheckTimeT").text(data.rows[0].securityCheckTime);
                    // $(".enterhomeUserCodeT").text(data.rows[0].enterhomeUserCode);
                    // $(".enterhomeUserNameT").text(data.rows[0].enterhomeUserName);
                    // $(".enterhomeUserTypeCodeT").text(data.rows[0].enterhomeUserTypeName);
                    // $(".enterhomeUserTelT").text(data.rows[0].enterhomeUserTel);
                    // $(".enterhomeSituationTypeCodeT").text(data.rows[0].enterhomeSituationTypeName);
                    // 安全隐患
                    if (data.rows[0].isdanger == 0) {
                        $(".isdangerT").text("不存在");
                    } else if (data.rows[0].isdanger == 1) {
                        $(".isdangerT").text("存在");
                        $(".isHasDanger").show();
                    } else {
                        $(".isdangerT").text("");
                    }
                    // $(".createUserNameT").text(data.rows[0].createUserName);
                    // $(".enterhomeAddressT").text(data.rows[0].enterhomeAddress);
                    // $(".remarkT").text(data.rows[0].remark);

                    //判断是否成功入户
                    if (data.rows[0].enterhomeSituationTypeCode == 'EHS_001') {
                        $(".isSuccess").show();
                    }

                    //隐患情况组
                    $(".hiddendangersT").html("");
                    var txtDanger = null;
                    if (data.rows[0].hiddendangers.length > 0) {
                        for (var i = 0; i < data.rows[0].hiddendangers.length; i++) {
                            txtDanger = '<span class="dangerC">' + data.rows[0].hiddendangers[i].hiddendangerName + '</span>';
                            $(".hiddendangersT").append(txtDanger);
                        }
                    } else {
                        $(".hiddendangersT").html('<span>无</span>');
                    };
                    //燃气表组
                    $(".gasMeterList").html("");
                    var txtGes = null;
                    if (data.rows[0].gasmeters.length > 0) {
                        for (var i = 0; i < data.rows[0].gasmeters.length; i++) {
                            txtGes = '<div class="planList">' +
                                '<p class="gasTitle">' + data.rows[0].gasmeters[i].gasmeterName + '</p>' +
                                '</div>' +
                                '<div class="planList">' +
                                '<div class="planListHalf">' +
                                '<div class="planListLeft">编号</div>' +
                                '<div class="planListRight">' +
                                '<p>' + data.rows[0].gasmeters[i].gasmeterCode + '</p>' +
                                '</div>' +
                                '</div>' +
                                '<div class="planListHalf">' +
                                '<div class="planListLeft">类型</div>' +
                                '<div class="planListRight">' +
                                '<p>' + data.rows[0].gasmeters[i].gasmeterTypeName + '</p>' +
                                '</div>' +
                                '</div>' +
                                '</div>' +
                                '<div class="planList">' +
                                '<div class="planListHalf">' +
                                '<div class="planListLeft">型号</div>' +
                                '<div class="planListRight">' +
                                '<p>' + data.rows[0].gasmeters[i].gasmeterMode + '</p>' +
                                '</div>' +
                                '</div>' +
                                '<div class="planListHalf">' +
                                '<div class="planListLeft">生产厂家</div>' +
                                '<div class="planListRight">' +
                                '<p>' + data.rows[0].gasmeters[i].manufacturer + '</p>' +
                                '</div>' +
                                '</div>' +
                                '</div>' +
                                '<div class="planList">' +
                                '<div class="planListHalf">' +
                                '<div class="planListLeft">进气方向</div>' +
                                '<div class="planListRight">' +
                                '<p>' + data.rows[0].gasmeters[i].gasmeterEntermode + '</p>' +
                                '</div>' +
                                '</div>' +
                                '<div class="planListHalf">' +
                                '<div class="planListLeft">生产日期</div>' +
                                '<div class="planListRight">' +
                                '<p>' + data.rows[0].gasmeters[i].manufactureDate + '</p>' +
                                '</div>' +
                                '</div>' +
                                '</div>' +
                                '<div class="planList">' +
                                '<div class="planListHalf">' +
                                '<div class="planListLeft">使用状态</div>' +
                                '<div class="planListRight">' +
                                '<p>' + data.rows[0].gasmeters[i].gasmeterStatusName + '</p>' +
                                '</div>' +
                                '</div>' +
                                '<div class="planListHalf">' +
                                '<div class="planListLeft">使用年限</div>' +
                                '<div class="planListRight">' +
                                '<p>' + data.rows[0].gasmeters[i].serviceLife + '</p>' +
                                '</div>' +
                                '</div>' +
                                '</div>' +
                                '<div class="planList">' +
                                '<div class="planListLeft">规格</div>' +
                                '<div class="planListRight">' +
                                '<p>' + data.rows[0].gasmeters[i].specifications + '</p>' +
                                '</div>' +
                                '</div>' +
                                '<div class="planList">' +
                                '<div class="planListLeft">燃气表读数</div>' +
                                '<div class="planListRight">' +
                                '<p>' + (data.rows[0].gasmeters[i].gasmeterData == null ? "" : data.rows[0].gasmeters[i].gasmeterData) + '</p>' +
                                '</div>' +
                                '</div>';
                            $(".gasMeterList").append(txtGes);
                        }
                    }
                    //图片加载
                    $(".recordImg").html("");
                    var txtReImg = "";
                    if (data.rows[0].pic.length > 0) {
                        for (var i = 0; i < data.rows[0].pic.length; i++) {
                            txtReImg += '<li class="event_pic_list">' +
                                '<img  src="/cloudlink-core-file/file/getImageBySize?fileId=' + data.rows[0].pic[i] + '&viewModel=fill&width=104&hight=78" data-original="/cloudlink-core-file/file/downLoad?fileId=' + data.rows[0].pic[i] + '" onclick="previewPicture(this)" alt=""/>' +
                                '</li>';
                        }
                    } else {
                        txtReImg = "<span>无</span>";
                    }
                    $(".recordImg").append(txtReImg);
                    $(".userImg").html("");
                    var txtUsImg = "";
                    if (data.rows[0].signature.length > 0) {
                        for (var l = 0; l < data.rows[0].signature.length; l++) {
                            txtUsImg += '<li class="event_pic_list">' +
                                '<img  src="/cloudlink-core-file/file/getImageBySize?fileId=' + data.rows[0].signature[l] + '&viewModel=fill&width=156&hight=78" data-original="/cloudlink-core-file/file/downLoad?fileId=' + data.rows[0].signature[l] + '" onclick="previewPicture(this)" alt=""/>' +
                                '</li>';
                        }
                    } else {
                        txtUsImg = "<span>无</span>";
                    }
                    $(".userImg").append(txtUsImg);

                    //满意度值
                    _this.satisfaction(data.rows[0].satisfaction);
                    //判断底部的按钮
                    _this._groupId = data.rows[0].groupId;
                    _this._planId = data.rows[0].planId;
                    if (data.rows[0].hasHistory == 1) {
                        _this.$openHistory.show();
                    };
                    var userId = JSON.parse(lsObj.getLocalStorage('userBo')).objectId;
                    if (data.rows[0].isPlanClosed == 1) {
                        _this.$deleteRecord.hide();
                    } else {
                        if (JSON.parse(lsObj.getLocalStorage('userBo')).isSysadmin == 1) {
                            _this.$deleteRecord.show();
                        } else {
                            if (data.rows[0].planCreateUserId == userId || data.rows[0].createUserId == userId) {
                                _this.$deleteRecord.show();
                            } else {
                                _this.$deleteRecord.hide();
                            }
                        }
                    }
                } else {
                    xxwsWindowObj.xxwsAlert("获取安检记录失败");
                }
            }
        });
    },
    clearHistoryRecord: function() { //清空历史记录详情
        $(".historyList").html("");
    },
    getHistoryRecord: function(groupId, planId) { //获取历史记录详情
        var _this = this;
        var param = {
            groupId: groupId,
            planId: planId
        }
        $.ajax({
            type: 'POST',
            url: "/cloudlink-inspection-event/commonData/securityCheckRecordHistory/getList?token=" + lsObj.getLocalStorage('token'),
            contentType: "application/json",
            data: JSON.stringify(param),
            dataType: "json",
            success: function(data, status) {
                /*
                $(".historyList").html("");
                if (data.success == 1) {
                    var txtHistory = null;
                    for (var i = 0; i < data.rows.length; i++) {
                        txtHistory = '<div class="planDetailsMain">' +
                            '<div class="planList">' +
                            '<div class="planListHalf">' +
                            '<div class="planListLeft">安检时间</div>' +
                            '<div class="planListRight">' +
                            '<p>' + data.rows[i].securityCheckTime + '</p>' +
                            '</div>' +
                            '</div>' +
                            '<div class="planListHalf">' +
                            '<div class="planListLeft">入户情况</div>' +
                            '<div class="planListRight">' +
                            '<p>' + data.rows[i].enterhomeSituationTypeName + '</p>' +
                            '</div>' +
                            '</div>' +
                            '</div>' +
                            '<div class="planList">' +
                            '<div class="planListLeft">安检人员</div>' +
                            '<div class="planListRight">' +
                            '<p class="">' + data.rows[i].createUserName + '</p>' +
                            '</div>' +
                            '</div>' +
                            '<div class="planList">' +
                            '<div class="planListLeft">备注</div>' +
                            '<div class="planListRight">' +
                            '<p>' + data.rows[i].remark + '</p>' +
                            '</div>' +
                            '</div>' +
                            '<div class="planList">' +
                            '<div class="planListLeft">照片</div>' +
                            '<div class="planListRight">' +
                            '<ul class="recordPic_' + i + '"></ul>' +
                            '</div>' +
                            '</div>' +
                            '</div>';
                        $(".historyList").append(txtHistory);
                        var txtPic = '';
                        if (data.rows[i].pic.length > 0) {
                            for (var x = 0; x < data.rows[i].pic.length; x++) {
                                txtPic += '<li class="event_pic_list">' +
                                    '<img  src="/cloudlink-core-file/file/getImageBySize?fileId=' + data.rows[i].pic[x] + '&viewModel=fill&width=104&hight=78" data-original="/cloudlink-core-file/file/downLoad?fileId=' + data.rows[i].pic[x] + '" onclick="previewPicture(this)" alt=""/>' +
                                    '</li>';
                            }
                        } else {
                            txtPic = "<span>无</span>";
                        }
                        $(".recordPic_" + i).append(txtPic);
                    }
                } else {
                    xxwsWindowObj.xxwsAlert("获取历史记录失败");
                }
                */
                if (data.success == 1) {
                    var dataAll = data.rows;
                    var txt = '';
                    if (dataAll.length > 0) {
                        for (var j = 0; j < dataAll.length; j++) {
                            //满意度
                            var starTxt = _this.satisfactionTxt(dataAll[j].satisfaction);
                            //隐患情况组
                            var txtDanger = "";
                            if (dataAll[j].hiddendangers.length > 0) {
                                for (var i = 0; i < dataAll[j].hiddendangers.length; i++) {
                                    txtDanger += '<span class="dangerC">' + dataAll[j].hiddendangers[i].hiddendangerName + '</span>';
                                }
                            } else {
                                txtDanger = '<span>无</span>';
                            };
                            //照片图片
                            var txtReImg = "";
                            if (dataAll[j].pic.length > 0) {
                                for (var i = 0; i < dataAll[j].pic.length; i++) {
                                    txtReImg += '<li class="event_pic_list">' +
                                        '<img  src="/cloudlink-core-file/file/getImageBySize?fileId=' + dataAll[j].pic[i] + '&viewModel=fill&width=104&hight=78" data-original="/cloudlink-core-file/file/downLoad?fileId=' + dataAll[j].pic[i] + '" onclick="previewPicture(this)" alt=""/>' +
                                        '</li>';
                                }
                            } else {
                                txtReImg = "<span>无</span>";
                            };
                            //用户签字
                            var txtUsImg = "";
                            if (dataAll[j].signature.length > 0) {
                                for (var l = 0; l < dataAll[j].signature.length; l++) {
                                    txtUsImg += '<li class="event_pic_list">' +
                                        '<img  src="/cloudlink-core-file/file/getImageBySize?fileId=' + dataAll[j].signature[l] + '&viewModel=fill&width=156&hight=78" data-original="/cloudlink-core-file/file/downLoad?fileId=' + dataAll[j].signature[l] + '" onclick="previewPicture(this)" alt=""/>' +
                                        '</li>';
                                }
                            } else {
                                txtUsImg = "<span>无</span>";
                            };

                            // 安全隐患
                            var securityTxt = null;
                            var securityClass = null;
                            if (dataAll[j].isdanger == 0) {
                                securityTxt = "不存在";
                                securityClass = 'hideClass';
                            } else if (dataAll[j].isdanger == 1) {
                                securityTxt = "存在";
                                securityClass = 'showClass';
                            } else {
                                securityTxt = "";
                                securityClass = 'hideClass';
                            }

                            //判断是否成功入户
                            var successClass = null;
                            if (dataAll[j].enterhomeSituationTypeCode == 'EHS_001') {
                                successClass = 'showClass';
                            } else {
                                successClass = 'hideClass';
                            }

                            txt += '<div class="planDetailsMain">' +
                                '<div class="planList">' +
                                '<div class="planListHalf">' +
                                '<div class="planListLeft">安检时间</div>' +
                                '<div class="planListRight">' +
                                '<p>' + dataAll[j].securityCheckTime + '</p>' +
                                '</div>' +
                                '</div>' +
                                '<div class="planListHalf">' +
                                '<div class="planListLeft">安检人</div>' +
                                '<div class="planListRight">' +
                                '<p>' + dataAll[j].createUserName + '</p>' +
                                '</div>' +
                                '</div>' +
                                '</div>' +
                                '<div class="planList">' +
                                '<div class="planListHalf">' +
                                '<div class="planListLeft">安检计划</div>' +
                                '<div class="planListRight">' +
                                '<p>' + dataAll[j].planName + '</p>' +
                                '</div>' +
                                '</div>' +
                                '<div class="planListHalf">' +
                                '<div class="planListLeft">入户情况</div>' +
                                '<div class="planListRight">' +
                                '<p>' + dataAll[j].enterhomeSituationTypeName + '</p>' +
                                '</div>' +
                                '</div>' +
                                '</div>' +
                                '<div class="planList">' +
                                '<div class="planListHalf">' +
                                '<div class="planListLeft">安全隐患</div>' +
                                '<div class="planListRight">' +
                                '<p>' + securityTxt + '</p>' +
                                '</div>' +
                                '</div>' +
                                '<div class="planListHalf">' +
                                '<div class="planListLeft">整改时间</div>' +
                                '<div class="planListRight">' +
                                '<p>' + dataAll[j].remediationTime + '</p>' +
                                '</div>' +
                                '</div>' +
                                '</div>' +
                                '<div class="planList ' + securityClass + '">' +
                                '<div class="planListLeft">隐患情况</div>' +
                                '<div class="planListRight">' +
                                '<p class="hiddendangersT">' + txtDanger + '</p>' +
                                '</div>' +
                                '</div>' +
                                '<div class="planList ' + securityClass + '">' +
                                '<div class="planListLeft">隐患措施告知</div>' +
                                '<div class="planListRight">' +
                                '<p>隐患整改措施已告知用户并解释清楚</p>' +
                                '</div>' +
                                '</div>' +

                                '<div class="planList">' +
                                '<div class="planListLeft">备注</div>' +
                                '<div class="planListRight">' +
                                '<p>' + dataAll[j].remark + '</p>' +
                                '</div>' +
                                '</div>' +
                                '<div class="planList">' +
                                '<div class="planListLeft">照片</div>' +
                                '<div class="planListRight">' +
                                '<ul>' + txtReImg + '</ul>' +
                                '</div>' +
                                '</div>' +

                                '<div class="planList ' + successClass + '">' +
                                '<div class="planListLeft">用户签字</div>' +
                                '<div class="planListRight">' +
                                '<ul>' + txtUsImg + '</ul>' +
                                '</div>' +
                                '</div>' +
                                '<div class="planList ' + successClass + '">' +
                                '<div class="planListLeft">用户满意度</div>' +
                                '<div class="planListRight satisfaction">' + starTxt + '</div>' +
                                '</div>' +

                                '</div>';
                        }
                    } else {
                        txt = "<span class='notEmptyData'>暂无检查记录</span>";
                    }
                    $(".historyList").append(txt);
                } else {
                    xxwsWindowObj.xxwsAlert("获取历史记录失败");
                }
            }
        });
    },
    deteleRecord: function(recordId) { //删除记录
        var record = {
            objectId: recordId
        };
        $.ajax({
            type: 'POST',
            url: "/cloudlink-inspection-event/securityCheckRecord/delete?token=" + lsObj.getLocalStorage('token'),
            contentType: "application/json",
            data: JSON.stringify(record),
            dataType: "json",
            success: function(data, status) {
                if (data.success == 1) {
                    var defaultOptions = {
                        tip: '安检记录删除成功！',
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
                        xxwsWindowObj.xxwsAlert("您没有删除安检记录的权限！");
                    } else {
                        xxwsWindowObj.xxwsAlert("安检记录删除失败！");
                    }
                }
            }
        });
    }
};
//高级搜索相关的对象与方法
var searchObj = {
    $items: $('.top .item'), //搜索条件dom
    $searchInput: $('#searchInput'), //搜索关键词dom
    $startDate: $("#datetimeStart"),
    $endDate: $("#datetimeEnd"),
    $selectId: $("#planIdList"),
    // tracksIdsArr: [], //存放已被选中的轨迹ID
    defaultObj: { //默认搜索条件
        "enterhomeSituationTypeCode": "", //20:处理中，21：已完成，:全部
        "enterhomeUserTypeCode": '', // 用户类型
        "planId": "", // 巡检计划
        "hasHiddenDanger": '', //隐患情况
        "specialFilter": "0", //特殊筛选
        "startDate": "", //开始日期
        "endDate": "", //结束日期
        "keywordWeb": "", //高级搜索关键词
        "pageNum": 1, //第几页
        "pageSize": 10 //每页记录数
    },
    querryObj: { //请求的搜索条件
        "enterhomeSituationTypeCode": "",
        "enterhomeUserTypeCode": '', // 用户类型
        "planId": "", // 巡检计划
        "hasHiddenDanger": '', //隐患情况
        "specialFilter": "0", //特殊筛选
        "startDate": "", //开始日期
        "endDate": "", //结束日期
        "keywordWeb": "", //巡线人，巡线编号
        "pageNum": 1, //第几页
        "pageSize": 10 //每页记录数
    },
    activeObj: { //高亮默认搜索条件，用于渲染页面
        "enterhomeSituationTypeCode": "",
        "enterhomeUserTypeCode": '',
        "hasHiddenDanger": '',
        "date": "all",
        "specialFilter": 0,
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
            } else {
                that.querryObj[key] = value;
            }

            var obj = {};
            obj[key] = value;
            that.renderActive(obj);
            that.refreshTable();
        });

        /* 搜索关键词 */
        $('#gf_Btn').click(function() {
            var s = $(this).parent().find('input').val().trim();
            that.querryObj.keywordWeb = s;
            that.refreshTable();
        });

        /* keyup事件 */
        that.$searchInput.keypress(function(e) {
            if (e && e.keyCode === 13) { // enter 键
                //that.querryObj.keywordWeb = that.$searchInput.val();
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
            that.$selectId.val("");
            that.$startDate.val("");
            that.$endDate.val("");
            that.$searchInput.val("");
            $("#diyDateBtn").removeClass("active");
            that.renderActive();
            that.refreshTable();
        });

        //计划下拉框选择
        that.$selectId.change(function() {
            that.querryObj.planId = $(this).val();
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
        that.querryObj.keywordWeb = that.$searchInput.val().trim();
        that.$searchInput.val(that.querryObj.keywordWeb);
        that.querryObj.pageNum = '1';
        $('#tablRrecord').bootstrapTable('removeAll'); //清空数据
        $('#tablRrecord').bootstrapTable('refreshOptions', {
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
        $('#datetime').datetimepicker({
            format: 'yyyy-mm-dd hh:ii',
            weekStart: 1,
            todayBtn: 1,
            autoclose: 1,
            todayHighlight: 1,
            startView: 2,
            forceParse: 0,
            showMeridian: 1,
            endDate: new Date()
        });
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
    }
}

$(function() {
    recordObj.init();
    searchObj.init();
    exportFileObj.init();
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
//查看大图
function previewPicture(e) {
    viewPicObj.viewPic(e);
};
//导出文件
var exportFileObj = {
    $exportAll: $("#export_all"),
    $exportChoice: $("#export_choice"),
    expoerObj: {
        "enterhomeSituationTypeCode": "", //20:处理中，21：已完成，:全部
        "enterhomeUserTypeCode": '', // 用户类型
        "planId": "", // 巡检计划
        "hasHiddenDanger": '', //隐患情况
        "specialFilter": "0", //特殊筛选
        "startDate": "", //开始日期
        "endDate": "", //结束日期
        "keywordWeb": "", //高级搜索关键词
        "ids": []
    },
    init: function() {
        var _this = this;
        this.$exportAll.click(function() {
            _this.expoerObj.ids = [];
            _this.expoerCondition();
        });
        this.$exportChoice.click(function() {
            var selectionsData = $('#tablRrecord').bootstrapTable('getSelections');
            _this.expoerObj.ids = [];
            if (selectionsData.length == 0) {
                xxwsWindowObj.xxwsAlert("请选择你需要导出的安检记录！");
                return false;
            } else {
                for (var i = 0; i < selectionsData.length; i++) {
                    // objectIds.push(selectionsData[i].objectId);
                    _this.expoerObj.ids.push(selectionsData[i].objectId);
                }
                // _this.expoerObj.ids = objectIds.join(',');
                _this.expoerCondition();
            }
        });
    },
    expoerCondition: function() {
        var searchMsg = searchObj.querryObj;
        this.expoerObj.enterhomeSituationTypeCode = searchMsg.enterhomeSituationTypeCode;
        this.expoerObj.enterhomeUserTypeCode = searchMsg.enterhomeUserTypeCode;
        this.expoerObj.planId = searchMsg.planId;
        this.expoerObj.hasHiddenDanger = searchMsg.hasHiddenDanger;
        this.expoerObj.specialFilter = searchMsg.specialFilter;
        this.expoerObj.startDate = searchMsg.startDate;
        this.expoerObj.endDate = searchMsg.endDate;
        this.expoerObj.keywordWeb = searchMsg.keywordWeb;

        this.expoerData(this.expoerObj);
    },
    expoerData: function(date) {
        var options = {
            "url": '/cloudlink-inspection-event/commonData/securityCheckRecord/export?token=' + lsObj.getLocalStorage('token'),
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