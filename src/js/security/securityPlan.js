//计划管理
var planObj = {
    $addplan: $("#addPlan"),
    $deletePlan: $("button.deletePlan"),
    $closePlan: $("button.closePlan"),
    $addPlanFrame: $("#addPlanFrame"),
    $modifyPlanFrame: $("#modifyPlanFrame"),
    $planDetailsFrame: $("#planDetailsFrame"),
    $securityPeople: $(".planMainAdd input[name=securityPeople]"),
    $securityPeopleModify: $(".planMainModify input[name=securityPeople]"),
    $addChoiceUserBtn: $(".addChoiceUserBtn span.areaBtn"), //小区选择
    $addChoiceRegionBtn: $(".addChoiceUserBtn span.regionBtn"), //片区选择
    $modifyChoiceUserBtn: $(".modifyChoiceUserBtn span"),
    $lookUserListBtn: $(".lookUserList span"),
    $copyPlanBtn: $(".copyPlan"),
    selectPersonArr: [], //选择的人员数组
    _planId: null,
    _planNmae: null,
    _planShowStatus: null,
    _createUserId: null,
    _isEdit: null,
    _flag: true,
    init: function() {
        var _this = this;
        _this.getTable();
        _this.bindPlanDate();
        //打开添加计划模态框
        _this.$addplan.click(function() {
            _this.$addPlanFrame.modal();
            _this.$securityPeople.val("");
            _this.selectPersonArr = [];
            $(".planMainAdd").find('input').val("");
            $(".planMainAdd").find('textarea').val("");
            $("#addPlanFrame").removeData('userData');
            $("#addPlanFrame").removeData('regionData');
        });
        //新建模态框加载完成
        _this.$addPlanFrame.on('shown.bs.modal', function(e) {
            $("input[name=createUserNameAdd]").val(JSON.parse(lsObj.getLocalStorage('userBo')).userName);
        });
        //新建打开用户选择
        _this.$addChoiceUserBtn.click(function() {
            _this._isEdit = false;
            choiceFrameObj.$choiceAreaFrame.modal();
            choiceFrameObj._areaChoiceData = $("#addPlanFrame").data('userData');
        });
        //新建打开片区选择
        _this.$addChoiceRegionBtn.click(function() {
            // _this._isEdit = false;
            choiceFrameObj.$choiceRegionFrame.modal();
            choiceFrameObj._regionChoiceData = $("#addPlanFrame").data('regionData');
        });
        //修改打开用户选择
        _this.$modifyChoiceUserBtn.click(function() {
            _this._isEdit = true;
            choiceFrameObj.$choiceAreaFrame.modal();
            choiceFrameObj._areaChoiceData = $("#modifyPlanFrame").data('userData');
        });

        //确定片区选择
        $(".regionChoiceTrueBtn").click(function() {
            var obj = choiceFrameObj.getRegionChoiceData();
            var data = obj.value;
            choiceFrameObj.$choiceRegionFrame.modal('hide');
            var txt = [],
                total = 0;
            for (var i = 0; i < data.length; i++) {
                total += data[i].choiceNumber;
                txt.push(data[i].residential + '(' + data[i].choiceNumber + '户)');
                data[i].regionId = '';
            }
            // if (_this._isEdit == true) {
            //     $("#modifyPlanFrame").data('userData', data);
            //     $("#modifyPlanFrame").find("input[name=planWorkload]").val((total == 0) ? "" : total);
            //     $("#modifyPlanFrame").find("textarea[name=securityCheckScope]").val(txt.join("，"));
            // } else {

            $("#addPlanFrame").data('regionData', obj.key);
            $("#addPlanFrame").data('userData', data);
            $("#addPlanFrame").find("input[name=planWorkload]").val((total == 0) ? "" : total);
            $("#addPlanFrame").find("textarea[name=securityCheckScope]").val(txt.join("，"));
        });
        //确定小区选择
        $(".areaChoiceTrueBtn").click(function() {
            var data = choiceFrameObj.getAreaChoiceData();
            choiceFrameObj.$choiceAreaFrame.modal('hide');
            var txt = [],
                total = 0;
            for (var i = 0; i < data.length; i++) {
                total += data[i].choiceNumber;
                txt.push(data[i].residential + '(' + data[i].choiceNumber + '户)');
            }
            if (_this._isEdit == true) {
                $("#modifyPlanFrame").data('userData', data);
                $("#modifyPlanFrame").find("input[name=planWorkload]").val((total == 0) ? "" : total);
                $("#modifyPlanFrame").find("textarea[name=securityCheckScope]").val(txt.join("，"));
            } else {
                $("#addPlanFrame").removeData('regionData');
                $("#addPlanFrame").data('userData', data);
                $("#addPlanFrame").find("input[name=planWorkload]").val((total == 0) ? "" : total);
                $("#addPlanFrame").find("textarea[name=securityCheckScope]").val(txt.join("，"));
            }
        });

        //打开用户的明细
        _this.$lookUserListBtn.click(function() {
            if (_this._planId) {
                $("#viewDetailFrame").modal();
                choiceFrameObj._planId = _this._planId;
                $('.areaRangeName .areaName').text(_this._planNmae);
            } else {
                xxwsWindowObj.xxwsAlert('无详细信息');
            }
        });

        //打开人员模态框
        _this.$securityPeople.click(function() {
            // _this.selectPersonArr = [];
            _this._isEdit = false;
            $("#stakeholder").modal();
            _this.requestPeopleTree();
        });
        _this.$securityPeopleModify.click(function() {
            _this._isEdit = true;
            $("#stakeholder").modal();
            _this.requestPeopleTree();
        });
        //确定选择人员
        $('#btn_selectPeople').click(function() {
            _this.getSelectPeople();
        });

        //创建计划提交
        $(".addSubmit").click(function() {
            if (_this._flag == true) {
                var paramData = _this.formVerification($(".planMainAdd"));
                if (paramData == false) {
                    return;
                } else {
                    var defaultOptions = {
                        tip: '您是否确定创建计划？',
                        name_title: '提示',
                        name_cancel: '取消',
                        name_confirm: '确定',
                        isCancelBtnShow: true,
                        callBack: function() {
                            _this.addPlan(paramData);
                        }
                    };
                    xxwsWindowObj.xxwsAlert(defaultOptions);
                }
            }
        });

        //修改计划提交
        $(".modifySubmit").click(function() {
            if (_this._flag == true) {
                var paramData = _this.formVerification($(".planMainModify"));
                if (paramData == false) {
                    return;
                } else {
                    paramData.objectId = _this._planId;
                    var defaultOptions = {
                        tip: '您是否确定修改该计划？',
                        name_title: '提示',
                        name_cancel: '取消',
                        name_confirm: '确定',
                        isCancelBtnShow: true,
                        callBack: function() {
                            _this.modifyPlan(paramData);
                        }
                    };
                    xxwsWindowObj.xxwsAlert(defaultOptions);
                }
            }
        });
        //修改模态框加载完成
        _this.$modifyPlanFrame.on('shown.bs.modal', function(e) {
            _this.getModifyDetails(_this._planId);
        });

        //打开详情页面
        _this.$planDetailsFrame.on('shown.bs.modal', function(e) {
            if (_this._planShowStatus == 2) {
                _this.$deletePlan.hide();
                _this.$closePlan.hide();
            } else {
                if (JSON.parse(lsObj.getLocalStorage('userBo')).isSysadmin == 1) {
                    _this.$deletePlan.show();
                    _this.$closePlan.show();
                } else {
                    if (_this._createUserId == JSON.parse(lsObj.getLocalStorage('userBo')).objectId) {
                        _this.$deletePlan.show();
                        _this.$closePlan.show();
                    } else {
                        _this.$deletePlan.hide();
                        _this.$closePlan.hide();
                    }
                }
            };
            _this.getPlanDetails(_this._planId);
        });
        //关闭计划
        _this.$closePlan.click(function() {
            var defaultOptions = {
                tip: '您是否关闭该计划？',
                name_title: '提示',
                name_cancel: '取消',
                name_confirm: '确定',
                isCancelBtnShow: true,
                callBack: function() {
                    _this.closedPlan(_this._planId);
                }
            };
            xxwsWindowObj.xxwsAlert(defaultOptions);
            return false;
        });
        //删除计划
        _this.$deletePlan.click(function() {
            var defaultOptions = {
                tip: '您是否删除该计划？',
                name_title: '提示',
                name_cancel: '取消',
                name_confirm: '确定',
                isCancelBtnShow: true,
                callBack: function() {
                    _this.judgePlanHas(_this._planId);
                }
            };
            xxwsWindowObj.xxwsAlert(defaultOptions);
            return false;
        });

        //复制计划
        _this.$copyPlanBtn.click(function() {
            if (_this._planId) {
                var defaultOptions = {
                    tip: '您是否复制该计划？',
                    name_title: '提示',
                    name_cancel: '取消',
                    name_confirm: '确定',
                    isCancelBtnShow: true,
                    callBack: function() {
                        _this.copyPlan(_this._planId);
                    }
                };
                xxwsWindowObj.xxwsAlert(defaultOptions);
                return false;
            } else {
                xxwsWindowObj.xxwsAlert("未获取到计划信息，不能复制");
            }
        });
    },
    getTable: function() { //table 数据
        var _this = this;
        $('#tablePlan').bootstrapTable({
            url: "/cloudlink-inspection-event/commonData/securityCheckPlan/getPageList?token=" + lsObj.getLocalStorage('token'), //请求数据url
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
                if (data.success == 1) {}
            },
            onDblClickRow: function(row) {
                _this._planId = row.objectId;
                _this._planShowStatus = row.planShowStatus;
                _this._createUserId = row.createUserId;
                _this.$planDetailsFrame.modal(); //打开详情模态框
                _this.clearDetails();
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
                title: '计划名称',
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '15%',
                editable: true,
            }, {
                field: 'planStartTime', //域值
                title: '起始时间', //内容
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '10%',
                editable: true,
                cellStyle: function(value, row, index) {
                    return {
                        css: {
                            // "max-width": "300px",
                        }
                    };
                }
            }, {
                field: 'planEndTime', //域值
                title: '结束时间', //内容
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '10%',
                editable: true,
            }, {
                field: 'planShowStatusName', //域值
                title: '计划状态', //内容
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '7%',
                formatter: function(value, row, index) {
                    return "<span class='atatus_" + (parseInt(row.planShowStatus) + 1) + "'>" + value + "</span>";
                }
            }, {
                field: 'planWorkload', //域值
                title: '用户总数', //内容
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '8%',
                editable: true,
            }, {
                field: 'coverageWorkload', //域值
                title: '覆盖数', //内容
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '7%',
                // editable: true,
            }, {
                field: 'coverageRatio', //域值
                title: '覆盖率', //内容
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '7%',
                editable: true,
                formatter: function(value, row, index) {
                    return value + '%';
                }
            }, {
                field: 'factWorkload', //域值
                title: '入户数', //内容
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '7%',
                // editable: true,
            }, {
                field: 'workloadRatio', //域值
                title: '入户率', //内容
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '7%',
                editable: true,
                formatter: function(value, row, index) {
                    return value + '%';
                }
            }, {
                field: 'operate',
                title: '操作',
                align: 'center',
                events: _this.tableEvent(),
                width: '18%',
                formatter: _this.tableOperation,
            }]
        });
    },
    tableOperation: function(value, row, index) { //操作按钮
        var modifyClass = null;
        var closedClass = null;
        var deleteClass = null;
        //已结束不能操作
        if (row.planShowStatus == 2) {
            modifyClass = 'modify_end';
            closedClass = 'closed_end';
            deleteClass = 'delete_end';
        } else {
            if (JSON.parse(lsObj.getLocalStorage('userBo')).isSysadmin == 1) {
                modifyClass = 'modify';
                closedClass = 'closed';
                deleteClass = 'delete';
            } else {
                if (row.createUserId == JSON.parse(lsObj.getLocalStorage('userBo')).objectId) {
                    modifyClass = 'modify';
                    closedClass = 'closed';
                    deleteClass = 'delete';
                } else {
                    modifyClass = 'modify_end';
                    closedClass = 'closed_end';
                    deleteClass = 'delete_end';
                }
            }
        };


        return [
            '<a class="look" data-toggle="modal" href="javascript:void(0)" title="查看">',
            '<i></i>',
            '</a>',
            '<a class="range" href="javascript:void(0)" title="范围明细">',
            '<i></i>',
            '</a>',
            '<a class="' + modifyClass + '" href="javascript:void(0)" title="修改">',
            '<i></i>',
            '</a>',
            '<a class="' + closedClass + '" href="javascript:void(0)" title="关闭">',
            '<i></i>',
            '</a>',
            '<a class="clone" href="javascript:void(0)" title="复制计划">',
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
            //查看功能
            'click .look': function(e, value, row, index) {
                _this._planId = row.objectId;
                _this._planShowStatus = row.planShowStatus;
                _this._createUserId = row.createUserId;
                _this.$planDetailsFrame.modal(); //打开详情模态框
                _this.clearDetails();
                return false;
            },
            //查看范围明细
            'click .range': function(e, value, row, index) {
                $("#viewDetailFrame").modal();
                choiceFrameObj._planId = row.objectId;
                $('.areaRangeName .areaName').text(row.planName);
                return false;
            },
            //修改计划
            'click .modify': function(e, value, row, index) {
                if (row.planShowStatus == 0) {
                    _this._planId = row.objectId;
                    _this.clearModify();
                    _this.$modifyPlanFrame.modal(); //打开修改模态框
                } else {
                    var defaultOptions = {
                        tip: '该计划处于【' + row.planShowStatusName + '】，如要修改安检范围，则会引起覆盖及入户相关数据的改变，是否继续修改？',
                        name_title: '提示',
                        name_cancel: '取消',
                        name_confirm: '确定',
                        isCancelBtnShow: true,
                        callBack: function() {
                            _this._planId = row.objectId;
                            _this.clearModify();
                            _this.$modifyPlanFrame.modal(); //打开修改模态框
                        }
                    };
                    xxwsWindowObj.xxwsAlert(defaultOptions);
                }
                return false;
            },
            //关闭计划
            'click .closed': function(e, value, row, index) {
                var defaultOptions = {
                    tip: '您是否关闭该计划？',
                    name_title: '提示',
                    name_cancel: '取消',
                    name_confirm: '确定',
                    isCancelBtnShow: true,
                    callBack: function() {
                        _this.closedPlan(row.objectId);
                    }
                };
                xxwsWindowObj.xxwsAlert(defaultOptions);
                return false;
            },
            //复制计划
            'click .clone': function(e, value, row, index) {
                var defaultOptions = {
                    tip: '您是否复制该计划？',
                    name_title: '提示',
                    name_cancel: '取消',
                    name_confirm: '确定',
                    isCancelBtnShow: true,
                    callBack: function() {
                        _this.copyPlan(row.objectId);
                    }
                };
                xxwsWindowObj.xxwsAlert(defaultOptions);
                return false;
            },
            //删除计划
            'click .delete': function(e, value, row, index) {
                var defaultOptions = {
                    tip: '您是否删除该计划？',
                    name_title: '提示',
                    name_cancel: '取消',
                    name_confirm: '确定',
                    isCancelBtnShow: true,
                    callBack: function() {
                        _this.judgePlanHas(row.objectId);
                    }
                };
                xxwsWindowObj.xxwsAlert(defaultOptions);
                return false;
            }
        }
    },
    requestPeopleTree: function() { //请求人员信息
        var _this = this;
        if (_this.aAllPeople) {
            _this.renderPeopleTree(_this.aAllPeople);
            return;
        }
        $.ajax({
            type: "GET",
            url: "/cloudlink-core-framework/user/getOrgUserTree?token=" + lsObj.getLocalStorage('token'),
            contentType: "application/json",
            data: {
                token: lsObj.getLocalStorage('token'),
                status: 1
            },
            dataType: "json",
            success: function(data) {
                var peopleAllArr = data.rows;
                if (data.success != 1) {
                    xxwsWindowObj.xxwsAlert('获取人员信息失败！');
                    return;
                }
                _this.aAllPeople = peopleAllArr;
                _this.renderPeopleTree(_this.aAllPeople);
            },
            statusCode: {
                404: function() {
                    xxwsWindowObj.xxwsAlert('获取人员信息失败！');
                }
            }
        });
    },
    renderPeopleTree: function(data) { //遍历tree
        var _this = this;
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
        _this.zTree = $.fn.zTree.init($("#people_list"), setting, data);
        _this.zTree.expandAll(true);
        _this.setSelectPeople();
    },
    setSelectPeople: function() { //设置被选中的人员
        var _this = this;
        if (_this.selectPersonArr.length > 0) {
            for (var i = 0; i < _this.selectPersonArr.length; i++) {
                var nodes = _this.zTree.getNodesByParam("id", _this.selectPersonArr[i].relationshipPersonId, null); //根据id查询节点对象数组
                _this.zTree.checkNode(nodes[0], true, true);
            }
        }
    },
    getSelectPeople: function() { //获取选中的人员
        var _this = this;
        _this.aPeopleName = [];
        _this.selectPersonArr = []; //人员数组
        var userObj = null;
        var arr = _this.zTree.getCheckedNodes(true);
        arr.forEach(function(item, index) {
            if (item.isParent) {
                return;
            }
            userObj = {
                relationshipPersonId: item.id,
                relationshipPersonName: item.treenodename
            }
            _this.selectPersonArr.push(userObj);
            _this.aPeopleName.push(item.treenodename);
        });
        if (_this._isEdit == true) {
            _this.$securityPeopleModify.val(_this.aPeopleName.join('，'));
        } else {
            _this.$securityPeople.val(_this.aPeopleName.join('，'));
        }

        $('#stakeholder').modal('hide');
        // console.log(_this.selectPersonArr)
    },
    initPeopleList: function() { //清空人员信息
        var _this = this;
        _this.aPeopleName = [];
        _this.selectPersonArr = [];
        _this.$receiveUser.val('');
        if (_this.zTree) {
            _this.zTree.checkAllNodes(false);
        }
    },
    formVerification: function(e) { //表单的验证
        var _this = this;
        var planName = e.find("input[name=planName]").val().trim();
        var planWorkload = e.find("input[name=planWorkload]").val().trim();
        var planStartTime = e.find("input[name=planStartTime]").val().trim();
        var planEndTime = e.find("input[name=planEndTime]").val().trim();
        var securityPeople = e.find("input[name=securityPeople]").val().trim();
        var securityCheckScope = e.find("textarea[name=securityCheckScope]").val().trim();
        var remark = e.find("textarea[name=remark]").val().trim();
        // var reg = /^\+?[1-9][0-9]*$/;

        var userMsg = {
            "relationshipPersonId": JSON.parse(lsObj.getLocalStorage('userBo')).objectId,
            "relationshipPersonName": JSON.parse(lsObj.getLocalStorage('userBo')).userName
        };
        var relationshipPersons = [];
        for (var i = 0; i < _this.selectPersonArr.length; i++) {
            relationshipPersons[i] = _this.selectPersonArr[i];
        }
        // relationshipPersons.push(userMsg);

        if (planName == '' || planName == null) {
            xxwsWindowObj.xxwsAlert('请输入计划名称');
            return false;
        } else if (planName.length > 15) {
            xxwsWindowObj.xxwsAlert('计划名称过长，填写上限为15个字');
            return false;
        } else if (planStartTime == '' || planStartTime == null) {
            xxwsWindowObj.xxwsAlert('起始时间不能为空');
            return false;
        } else if (planEndTime == '' || planEndTime == null) {
            xxwsWindowObj.xxwsAlert('结束时间不能为空');
            return false;
        } else if (securityCheckScope == '' || securityCheckScope == null) {
            xxwsWindowObj.xxwsAlert('请选择安检范围');
            return false;
        } else {
            var param = {
                "planName": planName, //计划名称 必填项
                "planStartTime": planStartTime, //计划开始时间 必填项
                "planEndTime": planEndTime, //计划结束时间 必填项
                "planWorkload": planWorkload, // 用户总数 必填项
                "securityCheckScope": securityCheckScope, // 安检范围 必填项
                "remark": remark, // 备注
                "relationshipPersons": relationshipPersons
            }
            return param;
        }
    },
    addPlan: function(paramData) { //添加计划
        var _this = this;
        _this._flag = false;
        var ids = $("#addPlanFrame").data('regionData');
        var regionArr = [];
        if (ids) {
            for (var i = 0; i < ids.length; i++) {
                var obj = {
                    "regionId": ids[i], //片区信息不为空时按片区选择
                    "residential": "",
                    "userFileIdSet": []
                }
                regionArr.push(obj);
            }
            paramData.userFileIdVoSet = regionArr;
        } else {
            paramData.userFileIdVoSet = $("#addPlanFrame").data('userData');
        }
        $.ajax({
            type: "POST",
            url: "/cloudlink-inspection-event/securityCheckPlan/save?token=" + lsObj.getLocalStorage('token'),
            contentType: "application/json",
            data: JSON.stringify(paramData),
            dataType: "json",
            success: function(data) {
                if (data.success == 1) {
                    _this.$addPlanFrame.modal('hide');
                    var defaultOptions = {
                        tip: '添加计划成功',
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
                    xxwsWindowObj.xxwsAlert('添加计划失败');
                }
                _this.again();
            },
            error: function() {
                xxwsWindowObj.xxwsAlert('添加计划失败');
                _this.again();
            }
        });
    },
    modifyPlan: function(paramData) { //修改计划提交
        var _this = this;
        _this._flag = false;
        paramData.userFileIdVoSet = $("#modifyPlanFrame").data('userData');
        $.ajax({
            type: "POST",
            url: "/cloudlink-inspection-event/securityCheckPlan/update?token=" + lsObj.getLocalStorage('token'),
            contentType: "application/json",
            data: JSON.stringify(paramData),
            dataType: "json",
            success: function(data) {
                if (data.success == 1) {
                    _this.$modifyPlanFrame.modal('hide');
                    var defaultOptions = {
                        tip: '修改计划成功',
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
                    xxwsWindowObj.xxwsAlert('修改计划失败');
                }
                _this.again();
            },
            error: function() {
                xxwsWindowObj.xxwsAlert('修改计划失败');
                _this.again();
            }
        });
    },
    clearModify: function() { //情况修改模态框
        var _this = this;
        $(".planMainModify").find("input").val("");
        $(".planMainModify").find("textarea").val("");
        $("#modifyPlanFrame").data('userData', null);
        _this.selectPersonArr = [];
    },
    getModifyDetails: function(planId) { //获取计划详情修改
        var _this = this;
        var param = {
            objectId: planId
        }
        $.ajax({
            type: "GET",
            url: "/cloudlink-inspection-event/commonData/securityCheckPlan/get?token=" + lsObj.getLocalStorage('token'),
            contentType: "application/json",
            data: param,
            dataType: "json",
            success: function(data) {
                if (data.success == 1) {
                    $(".planMainModify").find("input[name=planName]").val(data.rows[0].planName);
                    $(".planMainModify").find("input[name=createUserNameModify]").val(data.rows[0].createUserName);
                    $(".planMainModify").find("input[name=planWorkload]").val(data.rows[0].planWorkload);
                    $(".planMainModify").find("input[name=planStartTime]").val(data.rows[0].planStartTime);
                    $(".planMainModify").find("input[name=planEndTime]").val(data.rows[0].planEndTime);

                    _this.$securityPeopleModify.val(data.rows[0].relationshipPersonNames);
                    $(".planMainModify").find("textarea[name=securityCheckScope]").val(data.rows[0].securityCheckScope);
                    $(".planMainModify").find("textarea[name=remark]").val(data.rows[0].remark);

                    $("#modifyPlanFrame").data("userData", data.rows[0].userFileIdVoSet);
                    //人员数组
                    _this.selectPersonArr = [];
                    for (var i = 0; i < data.rows[0].relationshipPersons.length; i++) {
                        _this.selectPersonArr.push(data.rows[0].relationshipPersons[i]);
                    }
                } else {
                    xxwsWindowObj.xxwsAlert('获取计划失败');
                }
            },
            error: function() {
                xxwsWindowObj.xxwsAlert('获取计划失败');
            }
        });
    },
    clearDetails: function() { //清空详情模态框
        $(".planNameT").text("---");
        $(".createUserNameT").text("---");
        $(".planWorkloadT").text("---");
        $(".planStartTimeT").text("---");
        $(".planEndTimeT").text("---");
        $(".coverageRatioT").text("---");
        $(".coverageWorkloadT").text("---");
        $(".factWorkloadT").text("---");
        $(".workloadRatioT").text("---");
        $(".relationshipPersonNamesT").text("---")
        $(".securityCheckScopeT").text("---");
        $(".remarkT").text("---");
        this.$deletePlan.hide();
        this.$closePlan.hide();
    },
    getPlanDetails: function(planId) { //获取计划详情
        var _this = this;
        var param = {
            objectId: planId
        }
        _this._planId = null;
        $.ajax({
            type: "GET",
            url: "/cloudlink-inspection-event/commonData/securityCheckPlan/get?token=" + lsObj.getLocalStorage('token'),
            contentType: "application/json",
            data: param,
            dataType: "json",
            success: function(data) {
                if (data.success == 1) {
                    _this._planId = data.rows[0].objectId;
                    _this._planNmae = data.rows[0].planName;
                    $(".planNameT").text(data.rows[0].planName);
                    $(".createUserNameT").text(data.rows[0].createUserName);
                    $(".planWorkloadT").text(data.rows[0].planWorkload);
                    $(".planStartTimeT").text(data.rows[0].planStartTime);
                    $(".planEndTimeT").text(data.rows[0].planEndTime);
                    $(".coverageWorkloadT").text(data.rows[0].coverageWorkload);
                    $(".coverageRatioT").text(parseInt((data.rows[0].coverageRatio == '') ? 0 : data.rows[0].coverageRatio) + "%");
                    $(".factWorkloadT").text(data.rows[0].factWorkload);
                    $(".workloadRatioT").text(parseInt(data.rows[0].workloadRatio) + "%");
                    $(".relationshipPersonNamesT").text(data.rows[0].relationshipPersonNames)
                    $(".securityCheckScopeT").text(data.rows[0].securityCheckScope);
                    $(".remarkT").text(data.rows[0].remark);
                } else {
                    xxwsWindowObj.xxwsAlert('获取计划详情失败');
                }
            },
            error: function() {
                xxwsWindowObj.xxwsAlert('获取计划详情失败');
            }
        });
    },
    closedPlan: function(planId) { //关闭计划
        var plan = {
            objectId: planId
        };
        $.ajax({
            type: 'POST',
            url: "/cloudlink-inspection-event/securityCheckPlan/finish?token=" + lsObj.getLocalStorage('token'),
            contentType: "application/json",
            data: JSON.stringify(plan),
            dataType: "json",
            success: function(data, status) {
                if (data.success == 1) {
                    var defaultOptions = {
                        tip: '安检计划关闭成功！',
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
                        xxwsWindowObj.xxwsAlert("您没有关闭计划的权限！");
                    } else {
                        xxwsWindowObj.xxwsAlert("安检计划关闭失败！");
                    }
                }
            }
        });
    },
    judgePlanHas: function(planId) { //判断有没有记录
        var _this = this;
        var plan = {
            objectId: planId
        };
        $.ajax({
            type: 'GET',
            url: "/cloudlink-inspection-event/securityCheckPlan/hasCheckRecord?token=" + lsObj.getLocalStorage('token'),
            contentType: "application/json",
            data: plan,
            dataType: "json",
            success: function(data, status) {
                if (data.success == 1) {
                    if (data.rows[0].hasCheckRecord == 0) {
                        _this.deletePlan(planId);
                    } else {
                        xxwsWindowObj.xxwsAlert("当前计划包含安检记录数据，无法删除！");
                    };
                } else {
                    if (data.code == 410) {
                        xxwsWindowObj.xxwsAlert("您没有删除计划的权限！");
                    } else {
                        xxwsWindowObj.xxwsAlert("安检计划删除失败！");
                    }
                }
            }
        });
    },
    deletePlan: function(planId) { //删除计划
        var plan = {
            objectId: planId
        };
        $.ajax({
            type: 'POST',
            url: "/cloudlink-inspection-event/securityCheckPlan/delete?token=" + lsObj.getLocalStorage('token'),
            contentType: "application/json",
            data: JSON.stringify(plan),
            dataType: "json",
            success: function(data, status) {
                if (data.success == 1) {
                    var defaultOptions = {
                        tip: '安检计划删除成功！',
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
                        xxwsWindowObj.xxwsAlert("您没有删除计划的权限！");
                    } else {
                        xxwsWindowObj.xxwsAlert("安检计划删除失败！");
                    }
                }
            }
        });
    },
    copyPlan: function(planId) { //复制计划
        var plan = {
            objectId: planId
        };
        $.ajax({
            type: 'POST',
            url: "/cloudlink-inspection-event/securityCheckPlan/clone?token=" + lsObj.getLocalStorage('token'),
            contentType: "application/json",
            data: JSON.stringify(plan),
            dataType: "json",
            success: function(data, status) {
                if (data.success == 1) {
                    var defaultOptions = {
                        tip: '安检计划复制成功！',
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
                    xxwsWindowObj.xxwsAlert("安检计划复制失败！");
                }
            }
        });
    },
    bindPlanDate: function() { //计划相关时间控件
        $("#planTimeStartSet").datetimepicker({
            format: 'yyyy-mm-dd',
            minView: 'month',
            language: 'zh-CN',
            autoclose: true,
            // startDate: new Date()
        }).on("click", function() {
            $("#planTimeStartSet").datetimepicker("setEndDate", $("#planTimeEndSet").val());
        });
        $("#planTimeEndSet").datetimepicker({
            format: 'yyyy-mm-dd',
            minView: 'month',
            language: 'zh-CN',
            autoclose: true,
            // startDate: new Date()
        }).on("click", function() {
            $("#planTimeEndSet").datetimepicker("setStartDate", $("#planTimeStartSet").val())
        });

        $("#planTimeStartModify").datetimepicker({
            format: 'yyyy-mm-dd',
            minView: 'month',
            language: 'zh-CN',
            autoclose: true,
            // startDate: new Date()
        }).on("click", function() {
            $("#planTimeStartModify").datetimepicker("setEndDate", $("#planTimeEndModify").val());
        });
        $("#planTimeEndModify").datetimepicker({
            format: 'yyyy-mm-dd',
            minView: 'month',
            language: 'zh-CN',
            autoclose: true,
            // startDate: new Date()
        }).on("click", function() {
            $("#planTimeEndModify").datetimepicker("setStartDate", $("#planTimeStartModify").val())
        });
    },
    again: function() {
        this._flag = true;
    }
};
//高级搜索相关的对象与方法
var searchObj = {
    $items: $('.top .item'), //搜索条件dom
    $searchInput: $('#searchInput'), //搜索关键词dom
    $startDate: $("#datetimeStart"),
    $endDate: $("#datetimeEnd"),
    // tracksIdsArr: [], //存放已被选中的轨迹ID
    defaultObj: { //默认搜索条件
        "planShowStatus": "", //0：未开始 1：进行中 2：已结束 为空代表查询全部
        "startDate": "", //开始日期
        "endDate": "", //结束日期
        "keywordWeb": "", //高级搜索关键词
        "pageNum": 1, //第几页
        "pageSize": 10 //每页记录数
    },
    querryObj: { //请求的搜索条件
        "planShowStatus": "",
        "startDate": "", //开始日期
        "endDate": "", //结束日期
        "keywordWeb": "", //巡线人，巡线编号
        "pageNum": 1, //第几页
        "pageSize": 10 //每页记录数
    },
    activeObj: { //高亮默认搜索条件，用于渲染页面
        "planShowStatus": "",
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
        that.querryObj.keywordWeb = that.$searchInput.val().trim();
        that.$searchInput.val(that.querryObj.keywordWeb);
        that.querryObj.pageNum = '1';
        $('#tablePlan').bootstrapTable('removeAll'); //清空数据
        $('#tablePlan').bootstrapTable('refreshOptions', {
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
    }
}

//导出文件
var exportFileObj = {
    $exportAll: $("#export_all"),
    $exportChoice: $("#export_choice"),
    expoerObj: {
        "planShowStatus": "", //处理状态，括号内为注释
        "startDate": "", //开始日期
        "endDate": "", //结束日期
        "keywordWeb": "",
        "ids": []
    },
    init: function() {
        var _this = this;
        this.$exportAll.click(function() {
            _this.expoerObj.ids = [];
            _this.expoerCondition();
        });
        this.$exportChoice.click(function() {
            var selectionsData = $('#tablePlan').bootstrapTable('getSelections');
            _this.expoerObj.ids = [];
            if (selectionsData.length == 0) {
                xxwsWindowObj.xxwsAlert("请选择你需要导出的计划！");
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
        this.expoerObj.planShowStatus = searchMsg.planShowStatus;
        this.expoerObj.startDate = searchMsg.startDate;
        this.expoerObj.endDate = searchMsg.endDate;
        this.expoerObj.keywordWeb = searchMsg.keywordWeb;
        this.expoerData(this.expoerObj);
    },
    expoerData: function(date) {
        var options = {
            "url": '/cloudlink-inspection-event/commonData/securityCheckPlan/export?token=' + lsObj.getLocalStorage('token'),
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

$(function() {
    $("input[type=text]").val("");
    planObj.init();
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

//判断输入框文字的个数
function checkLen(obj) {
    var len = $(obj).val().length;
    if (len > 199) {
        $(obj).val($(obj).val().substring(0, 200));
    }
    var num = 200 - len;
    if (num < 0) {
        num = 0;
    }
    $(obj).next(".text_num").text('(' + num + '字)');
}