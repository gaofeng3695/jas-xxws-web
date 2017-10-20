/***************************************/
//片区管理初级搜索
var primarySearchObj = {
    $items: $('.top .item'), //搜索条件dom
    $primarySearchInput: $('#primarySearchInput'), //搜索关键词dom
    defaultObj: { //默认搜索条件
        "keyword": "", //高级搜索关键词
        "pageNum": 1, //第几页
        "pageSize": 10 //每页记录数
    },
    querryObj: { //请求的搜索条件
        "keyword": "", //片区名称 片区范围 创建人
        "pageNum": 1, //第几页
        "pageSize": 10 //每页记录数
    },
    init: function() {
        this.bindEvent(); //监听事件
    },
    bindEvent: function() {
        var that = this;
        /* 搜索关键词 */
        $('#cf_Btn').click(function() {
            var s = $(this).parent().find('input').val().trim();
            that.querryObj.keyword = s;
            that.refreshTable();
        });

        /* keyup事件 */
        that.$primarySearchInput.keypress(function(e) {
            if (e && e.keyCode === 13) { // enter 键;
                that.refreshTable();
            }
        });
        /* 清空搜索条件 */
        $('#cf_reset_Btn').click(function() {
            //请求数据还原到初始话
            $.extend(that.querryObj, that.defaultObj);
            that.$primarySearchInput.val("");
            that.refreshTable();
        });
    },
    refreshTable: function() {
        var that = this;
        that.querryObj.keyword = that.$primarySearchInput.val().trim();
        that.$primarySearchInput.val(that.querryObj.keyword);
        that.querryObj.pageNum = 1;
        $('#kilometerList').bootstrapTable('removeAll'); //清空数据
        $('#kilometerList').bootstrapTable('refreshOptions', {
            pageNumber: +that.querryObj.pageNum,
            pageSize: +that.querryObj.pageSize,
            queryParams: function(params) {
                that.querryObj.pageSize = params.pageSize;
                that.querryObj.pageNum = params.pageNumber;
                return that.querryObj;
            }
        });
    },
};

/***************************************/
//清空搜索条件
var clearSearch = {
    resetSearch: function() {
        //请求数据还原到初始话
        $.extend(searchObj.querryObj, searchObj.defaultObj);
        searchObj.$searchInput.val("");
        $("select[name=quartersList]").val('');
        searchObj.renderActive();
        searchObj.refreshTable();
    }
};
/***************************************/
//片区管理表格
var areaTable = {
    $NewlyBuiltAreaBtn: $("#NewlyBuiltArea"), //新建片区按钮
    $creatModal: $("#newCreatUserModal"), //新建片区模态框
    $editModal: $("#editAreaModal"), //编辑片区模态框
    $lookModal: $("#kilometerDetailsModal"), //操作里面  点击详情模态框
    $rangeModal: $("#viewDetailModal"), //操作里面  点击片区范围模态框
    $deleteBtn: $('.deleteSubmit'), //删除片区按钮
    _regionId: null,
    _regionName: null,
    _flag: true,
    _isModify: null,
    objectId: null,
    init: function() {
        var _this = this;
        _this.getTable();
        //点击 新增片区 模态框
        _this.$NewlyBuiltAreaBtn.click(function() {
            areaTable.creatFormReset();
            $("#newCreatUserModal").removeData('userData');
            $("#newCreatUserModal").modal();
            $("#newCreatUserModal input[name=createUserName]").val(JSON.parse(lsObj.getLocalStorage('userBo')).userName);
        });
        //新增片区里 创建 按钮
        $(".creatSubmit").click(function() {
            if (_this._flag == true) {
                var paramData = _this.formVerification($(".regionMainAdd"));
                if (paramData == false) {
                    return;
                } else {
                    var defaultOptions = {
                        tip: '您是否确定创建片区？',
                        name_title: '提示',
                        name_cancel: '取消',
                        name_confirm: '确定',
                        isCancelBtnShow: true,
                        callBack: function() {
                            _this.addArea(paramData);
                        }
                    };
                    xxwsWindowObj.xxwsAlert(defaultOptions);
                }
            }
        });
        //新增片区里 选择 按钮
        $("#areaRange").click(function() {
            choiceFrameObj.$choiceAreaFrame.modal();
            choiceFrameObj._areaChoiceData = $("#newCreatUserModal").data('userData');
            _this._isModify = false;
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
            if (_this._isModify == true) {
                $("#editAreaModal").data('userData', data);
                $("#editAreaModal").find("input[name=households]").val((total == 0) ? "" : total);
                $("#editAreaModal").find("textarea[name=sphere]").val(txt.join("，"));
            } else {
                $("#newCreatUserModal").data('userData', data);
                $("#newCreatUserModal").find("input[name=households]").val((total == 0) ? "" : total);
                $("#newCreatUserModal").find("textarea[name=sphere]").val(txt.join("，"));
            }
        });
        //操作 详情模态框里 删除片区 按钮
        $(".deleteSubmit").click(function() {
            var defaultOptions = {
                tip: '您是否确定删除该片区？',
                name_title: '提示',
                name_cancel: '取消',
                name_confirm: '确定',
                isCancelBtnShow: true,
                callBack: function() {
                    _this.deleteArea(_this._objectId);
                }
            };
            xxwsWindowObj.xxwsAlert(defaultOptions);
        });
        //操作 详情模态框里 查看明细 按钮
        $(".lookUserListBtn").click(function() {

            // _this.rangeFrameReset();
            if (_this._regionName == null || _this._regionName == '' || _this._regionName == undefined) {
                xxwsWindowObj.xxwsAlert('无详细信息');
            } else {
                choiceFrameObj._regionId = _this._regionId;
                $('.areaRangeName .areaName').text(_this._regionName);
                $("#viewDetailFrame").modal();
            }
        });
        //操作 编辑模态框里 保存 按钮
        $(".saveSubmit").click(function() {
            if (_this._flag == true) {
                var paramData = _this.formVerification($(".regionMainEdit"));
                if (paramData == false) {
                    return;
                } else {
                    paramData.objectId = _this._objectId;
                    var defaultOptions = {
                        tip: '您是否确定修改该片区？',
                        name_title: '提示',
                        name_cancel: '取消',
                        name_confirm: '确定',
                        isCancelBtnShow: true,
                        callBack: function() {
                            _this.regionEdit(paramData);
                        }
                    };
                    xxwsWindowObj.xxwsAlert(defaultOptions);
                }
            }
        });
        //编辑片区里 选择 按钮
        $("#editAreaRange").click(function() {
            choiceFrameObj.$choiceAreaFrame.modal();
            choiceFrameObj._areaChoiceData = $("#editAreaModal").data('userData');
            // console.log($("#editAreaModal").data('userData'))
            _this._isModify = true;
        });
        //片区详情模态框渲染
        _this.$lookModal.on('shown.bs.modal', function(e) { //判断是否有删除权限
            areaTable.getAreaDetails(_this._objectId);
        });
        //片区范围模态框渲染
        _this.$rangeModal.on('shown.bs.modal', function(e) {
            searchObj.querryObj.regionId = _this._objectId;
            searchObj.defaultObj.regionId = _this._objectId;
            // areaTable.getQuartersList(_this._objectId);
            $('.areaName').text(_this._regionName);
            searchObj.refreshTable();
        });
        //编辑片区模态框渲染
        _this.$editModal.on('shown.bs.modal', function(e) {
            areaTable.getEditDetails(_this._objectId);
        });
    },
    addArea: function(paramData) { //新增片区
        var _this = this;
        _this._flag = false;
        paramData.userFileIdVoSet = $("#newCreatUserModal").data('userData');
        $.ajax({
            type: "POST",
            url: "/cloudlink-inspection-event/region/save?token=" + lsObj.getLocalStorage('token'),
            contentType: "application/json",
            data: JSON.stringify(paramData),
            dataType: "json",
            success: function(data) {
                if (data.success == 1) {
                    var defaultOptions = {
                        tip: '新增片区成功',
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
                    if (data.code == 'XE03003') {
                        xxwsWindowObj.xxwsAlert("片区名称已存在");
                    } else {
                        xxwsWindowObj.xxwsAlert('新增片区失败');
                    }
                }
                _this.again();
            },
            error: function() {
                xxwsWindowObj.xxwsAlert('新增片区失败');
                _this.again();
            }
        });
    },
    getAreaDetails: function(areaId) { //操作里 片区详情
        var _this = this;
        var param = {
            "objectId": areaId
        };
        _this._regionName = null;
        $.ajax({
            type: "GET",
            url: "/cloudlink-inspection-event/commonData/region/get?token=" + lsObj.getLocalStorage('token'),
            contentType: "application/json",
            data: param,
            dataType: "json",
            success: function(data) {
                if (data.success == 1) {
                    _this._regionName = data.rows[0].regionName;
                    _this._regionId = data.rows[0].objectId;
                    localStorage.setItem("regionName", "name");
                    $("#kilometerDetailsModal .regionName").text(data.rows[0].regionName);
                    $("#kilometerDetailsModal .createUserName").text(data.rows[0].createUserName);
                    $("#kilometerDetailsModal .households").text((data.rows[0].households == 0) ? "" : (data.rows[0].households));
                    $("#kilometerDetailsModal .sphere").text(data.rows[0].sphere);
                    $("#kilometerDetailsModal .remark").text(data.rows[0].remark);
                    // if (JSON.parse(lsObj.getLocalStorage('userBo')).isSysadmin == 1) {
                    //     _this.$deleteBtn.show();
                    // } else {
                    if (data.rows[0].createUserId == JSON.parse(lsObj.getLocalStorage('userBo')).objectId) {
                        _this.$deleteBtn.show();
                    } else {
                        _this.$deleteBtn.hide();
                    }
                    // }
                } else {
                    xxwsWindowObj.xxwsAlert('获取片区详情失败');
                }
            },
            error: function() {
                xxwsWindowObj.xxwsAlert('获取片区详情失败');
            }
        });
    },
    deleteArea: function(areaId) { //操作里 删除片区
        var plan = {
            objectId: areaId
        };
        $.ajax({
            type: 'POST',
            url: "/cloudlink-inspection-event/region/delete?token=" + lsObj.getLocalStorage('token'),
            contentType: "application/json",
            data: JSON.stringify(plan),
            dataType: "json",
            success: function(data, status) {
                if (data.success == 1) {
                    var defaultOptions = {
                        tip: '片区删除成功！',
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
                        xxwsWindowObj.xxwsAlert("您没有删除权限！");
                    } else {
                        xxwsWindowObj.xxwsAlert("片区删除失败！");
                    }
                }
            }
        });
    },
    getEditDetails: function(id) { //操作里 获取编辑片区详情
        var _this = this;
        var param = {
            "objectId": id,
        };
        $.ajax({
            type: "GET",
            url: "/cloudlink-inspection-event/commonData/region/get?token=" + lsObj.getLocalStorage('token'),
            contentType: "application/json",
            data: param,
            dataType: "json",
            success: function(data) {
                if (data.success == 1) {
                    $("#editAreaModal").find("input[name=regionName]").val(data.rows[0].regionName);
                    $("#editAreaModal").find("input[name=createUserName]").val(data.rows[0].createUserName);
                    $("#editAreaModal").find("input[name=households]").val((data.rows[0].households == 0) ? "" : (data.rows[0].households));
                    $("#editAreaModal").find("textarea[name=sphere]").val(data.rows[0].sphere);
                    $("#editAreaModal").find("textarea[name=remark]").val(data.rows[0].remark);
                    $("#editAreaModal").data("userData", data.rows[0].userFileIdVoSet);
                } else {
                    xxwsWindowObj.xxwsAlert('获取编辑片区失败');
                }
            },
            error: function() {
                xxwsWindowObj.xxwsAlert('获取编辑片区失败');
            }
        });
    },
    regionEdit: function(paramData) { //操作里 编辑片区里点击保存
        var _this = this;
        _this._flag = false;
        paramData.userFileIdVoSet = $("#editAreaModal").data('userData');
        $.ajax({
            type: "POST",
            url: "/cloudlink-inspection-event/region/update?token=" + lsObj.getLocalStorage('token'),
            contentType: "application/json",
            data: JSON.stringify(paramData),
            dataType: "json",
            success: function(data) {
                if (data.success == 1) {
                    var defaultOptions = {
                        tip: '修改片区成功',
                        name_title: '提示',
                        name_confirm: '确定',
                        isCancelBtnShow: false,
                        callBack: function() {
                            window.location.reload();
                        }
                    };
                    xxwsWindowObj.xxwsAlert(defaultOptions);
                } else {
                    if (data.code == 'XE03003') {
                        xxwsWindowObj.xxwsAlert("片区名称已存在");
                    } else {
                        xxwsWindowObj.xxwsAlert('修改片区失败');
                    }

                }
                _this.again();
            },
            error: function() {
                xxwsWindowObj.xxwsAlert('修改片区失败');
                _this.again();
            }
        });
        $("#newCreatUserModal").modal('hide');
    },
    detailFormReset: function() { //片区详情重置表单
        var _this = this;
        $('#kilometerDetailsModal p').text('');
    },
    editFormReset: function() { //编辑片区重置表单
        var _this = this;
        _this.$editModal.find('input').val("");
        _this.$editModal.find('textarea').val("");
        $("#editAreaModal").data('userData', null);
    },
    creatFormReset: function() { //新建片区重置表单
        var _this = this;
        _this.$creatModal.find('input').val("");
        _this.$creatModal.find('textarea').val("");
    },
    getTable: function() { //table 数据
        var _this = this;
        $('#kilometerList').bootstrapTable({
            url: "/cloudlink-inspection-event/commonData/region/getPageList?token=" + lsObj.getLocalStorage('token'), //请求数据url
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
                primarySearchObj.defaultObj.pageSize = params.pageSize;
                primarySearchObj.defaultObj.pageNum = params.pageNumber;
                return primarySearchObj.defaultObj;
            },
            onDblClickRow: function(row) {
                _this._objectId = row.objectId;
                _this.getAreaDetails(row.objectId);
                areaTable.detailFormReset();
                _this.$lookModal.modal(); //打开详情模态框
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
                },
                {
                    field: 'regionName', //域值
                    title: '片区名称', //内容
                    align: 'center',
                    visible: true, //false表示不显示
                    sortable: false, //启用排序
                    width: '10%',
                    editable: true,
                }, {
                    field: 'sphere', //域值
                    title: '片区范围', //内容
                    align: 'center',
                    visible: true, //false表示不显示
                    sortable: false, //启用排序
                    width: '18%',
                    editable: true,
                }, {
                    field: 'households', //域值
                    title: '片区总户数', //内容
                    align: 'center',
                    visible: true, //false表示不显示
                    sortable: false, //启用排序
                    width: '4%',
                    editable: true,
                    formatter: function(value, row, index) {
                        if (value == 0) {
                            return "";
                        } else {
                            return value;
                        }
                    }
                }, {
                    field: 'createUserName', //域值
                    title: '创建人', //内容
                    align: 'center',
                    visible: true, //false表示不显示
                    sortable: false, //启用排序
                    width: '4%',
                }, {
                    field: 'operate',
                    title: '操作',
                    align: 'center',
                    events: _this.tableEvent(),
                    width: '10%',
                    formatter: _this.tableOperation,
                }
            ]
        });
    },
    tableOperation: function(value, row, index) { //操作按钮
        var modifyClass = null;
        var deleteClass = null;
        //var isSysadmin = JSON.parse(lsObj.getLocalStorage('userBo')).isSysadmin;
        var createUserId = JSON.parse(lsObj.getLocalStorage('userBo')).objectId;
        //判断有无删除编辑权限 现在是谁建谁删谁修改 不涉及管理员权限
        // if (isSysadmin == 1) {
        //     modifyClass = 'modify';
        //     deleteClass = 'delete';
        // } else {
        if (row.createUserId == createUserId) {
            modifyClass = 'modify';
            deleteClass = 'delete';
        } else {
            modifyClass = 'modify_end';
            deleteClass = 'delete_end';
        }
        // };
        return [
            '<a class="look" href="javascript:void(0)" title="查看">',
            '<i></i>',
            '</a>',
            '<a class="range" href="javascript:void(0)" title="范围明细">',
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
            //详情功能
            'click .look': function(e, value, row, index) {
                _this._objectId = row.objectId;
                _this.detailFormReset();
                _this.$deleteBtn.hide();
                _this.$lookModal.modal(); //打开详情模态框
                return false;
            },
            //片区范围功能
            'click .range': function(e, value, row, index) {
                choiceFrameObj._regionId = row.objectId;
                $('.areaRangeName .areaName').text(row.regionName);
                $("#viewDetailFrame").modal();
                return false;
            },
            //编辑功能
            'click .modify': function(e, value, row, index) {
                _this._objectId = row.objectId;
                _this.editFormReset();
                _this.$editModal.modal(); //打开编辑模态框
                return false;
            },
            //删除功能
            'click .delete': function(e, value, row, index) {
                var defaultOptions = {
                    tip: '您是否删除片区？',
                    name_title: '提示',
                    name_cancel: '取消',
                    name_confirm: '确定',
                    isCancelBtnShow: true,
                    callBack: function() {
                        _this.deleteArea(row.objectId);
                    }
                };
                xxwsWindowObj.xxwsAlert(defaultOptions);
                return false;
            }
        }
    },
    formVerification: function(e) { //表单的验证
        var _this = this;
        var regionName = e.find("input[name=regionName]").val().trim();
        var createUserName = e.find("input[name=createUserName]").val().trim();
        var households = e.find("input[name=households]").val().trim();
        var sphere = e.find("textarea[name=sphere]").val().trim();
        var remark = e.find("textarea[name=remark]").val().trim();

        if (regionName == '' || regionName == null) {
            xxwsWindowObj.xxwsAlert('请输入片区名称');
            return false;
        } else if (regionName.length > 25) {
            xxwsWindowObj.xxwsAlert('片区名称过长，填写上限为25个字');
            return false;
        } else if (sphere == '' || sphere == null) {
            xxwsWindowObj.xxwsAlert('片区范围不能为空');
            return false;
        } else {
            var param = {
                "regionName": regionName, //片区名称 必填项
                "sphere": sphere, //片区范围 必填项
                "households": households, // 片区总户数 必填项
                "remark": remark, // 备注
            }
            return param;
        }
    },
    getQuartersList: function(areaId) { //获取小区下拉列表
        var _this = this;
        var param = {
            "regionId": areaId,
            "pageNum": 1, //第几页
            "pageSize": 10000 //每页记录数 （前端给传10000）
        }
        $.ajax({
            type: "POST",
            url: "/cloudlink-inspection-event/commonData/residentialName/getPageList?token=" + lsObj.getLocalStorage('token'),
            contentType: "application/json",
            data: JSON.stringify(param),
            dataType: "json",
            success: function(data) {
                if (data.success == 1) {
                    var quartersList = data.rows;
                    var txt = '<option value="">全部（小区/院/村）</option>';
                    for (var i = 0; i < quartersList.length; i++) {
                        txt += '<option value="' + quartersList[i].residential + '">' + quartersList[i].residential + '</option>';
                    }
                    $("select[name=quartersList]").html(txt);
                }
            },
        });
    },
    again: function() {
        this._flag = true;
    }
};
/***************************************/
//导出文件
var exportFileObj = {
    $exportAll: $("#export_all"),
    $exportChoice: $("#export_choice"),
    expoerObj: {
        "keyword": "",
        "idList": []
    },
    init: function() {
        var _this = this;
        this.$exportAll.click(function() {
            _this.expoerObj.idList = [];
            _this.expoerCondition();
        });
        this.$exportChoice.click(function() {
            var selectionsData = $('#kilometerList').bootstrapTable('getSelections');
            _this.expoerObj.idList = [];
            if (selectionsData.length == 0) {
                xxwsWindowObj.xxwsAlert("请选择你需要导出的片区！");
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
        $.extend(this.expoerObj, primarySearchObj.querryObj);
        this.expoerData(this.expoerObj);
    },
    expoerData: function(date) {
        var options = {
            "url": '/cloudlink-inspection-event/commonData/region/export?token=' + lsObj.getLocalStorage('token'),
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
};
/***************************************/
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
};
/***************************************/
// 初始化
$(function() {
    $('input').val("");
    primarySearchObj.init();
    areaTable.init();
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