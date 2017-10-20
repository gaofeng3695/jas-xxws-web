/**
 * 
 */

//高级搜索相关的对象与方法
var searchObj = {
    $items: $('.top .item'), //搜索条件dom
    $searchInput: $('#searchInput'), //搜索关键词dom
    defaultObj: { //默认搜索条件
        "regionId": "", //片区
        "residential": "", //小区
        "enterhomeUserTypeCode": '',
        "userStatusCode": "",
        "keyword": "",
        "pageNum": 1, //第几页
        "pageSize": 10, //每页记录数
    },
    querryObj: { //请求的搜索条件
        "regionId": "", //片区
        "residential": "", //小区
        "enterhomeUserTypeCode": '',
        "userStatusCode": "",
        "keyword": "",
        "pageNum": 1, //第几页
        "pageSize": 10, //每页记录数
    },
    activeObj: { //高亮默认搜索条件，用于渲染页面
        "enterhomeUserTypeCode": "",
        "userStatusCode": "",
    },
    init: function() {
        this.renderActive(); //初始化显示被选中
        this.bindEvent(); //监听事件
        this.bindDateDiyEvent(); //时间控件初始化
        farmeObj.getQuartersList('');
        farmeObj.getAreaList(true); //初始化获取片区列表
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
        }
    },
    bindEvent: function() {
        var that = this;
        /* 选择条件 */
        that.$items.click(function() {
            var key = $(this).parent().attr("data-class");
            var value = $(this).attr("data-value");
            that.querryObj[key] = value;
            var obj = {};
            obj[key] = value;
            that.renderActive(obj);
            that.refreshTable();
        });

        //片区选择
        $("select[name=areaList]").change(function() {
            $("select[name=quartersList]").html('<option value="">全部（小区/院/村）</option>');
            // if ($(this).val() == '') {
            //     $("select[name=quartersList]").prop('disabled', true);
            // } else {
            //     $("select[name=quartersList]").prop('disabled', false);
            // }
            that.querryObj.regionId = $(this).val();
            that.querryObj.residential = '';
            that.refreshTable();
            farmeObj.getQuartersList($(this).val());
        });

        //小区选择
        $("select[name=quartersList]").change(function() {
            that.querryObj.residential = $(this).val();
            that.refreshTable();
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
            $("select[name=areaList]").val("");
            farmeObj.getQuartersList('');
            // $("select[name=quartersList]").html('<option value="">全部（小区/院/村）</option>');
            // $("select[name=quartersList]").prop('disabled', true);
            that.$searchInput.val("");
            that.renderActive();
            that.refreshTable();
        });
    },
    refreshTable: function() {
        var that = this;
        that.querryObj.keyword = that.$searchInput.val().trim();
        that.$searchInput.val(that.querryObj.keyword);
        that.querryObj.pageNum = '1';
        $('#userList').bootstrapTable('removeAll'); //清空数据
        $('#userList').bootstrapTable('refreshOptions', {
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
        $("#historydateStart").datetimepicker({
            format: 'yyyy-mm-dd',
            minView: 'month',
            language: 'zh-CN',
            autoclose: true,
            // startDate: new Date()
        }).on("click", function() {
            $("#historydateStart").datetimepicker("setEndDate", $("#historydateEnd").val());
        });
        $("#historydateEnd").datetimepicker({
            format: 'yyyy-mm-dd',
            minView: 'month',
            language: 'zh-CN',
            autoclose: true,
            // startDate: new Date()
        }).on("click", function() {
            $("#historydateEnd").datetimepicker("setStartDate", $("#historydateStart").val());
        });

        $(document).on('click', '.dateTimeAdd', function() {
            $(this).datetimepicker({
                format: 'yyyy-mm-dd',
                minView: 'month',
                language: 'zh-CN',
                autoclose: true,
                endDate: new Date()
            });
            $(this).datetimepicker('show').on('changeDate', function() {
                $(this).datetimepicker('hide');
            });
        });
    }
};
//用户相关表格
var userTable = {
    $addBtn: $("#addUserBtn"),
    $importBtn: $("#importBtn"),
    $deleteBtn: $("#deleteBtn"),
    init: function() {
        var _this = this;
        _this.getTable();

        //打开新增用户
        _this.$addBtn.click(function() {
            farmeObj.$addUserFrame.find(".modal-header span").text("新建用户");
            farmeObj.$addUserFrame.find(".modal-footer .addSubmit").show();
            farmeObj.$addUserFrame.find(".modal-footer .modifySubmit").hide();
            farmeObj.formReset();
            farmeObj.gasText(1);
            farmeObj._isModify = false;
            farmeObj.$addUserFrame.find("input[name=createUserName]").val(JSON.parse(lsObj.getLocalStorage('userBo')).userName);
            farmeObj.$addUserFrame.modal();
        });
        //删除多个用户
        _this.$deleteBtn.click(function() {
            var objIds = $('#userList').bootstrapTable('getSelections');
            var ids = [];
            if (objIds.length == 0) {
                xxwsWindowObj.xxwsAlert("请选择你需要删除的用户！");
                return false;
            } else {
                for (var i = 0; i < objIds.length; i++) {
                    ids.push(objIds[i].objectId);
                }
                var defaultOptions = {
                    tip: '慎重！此删除操作会导致所选用户的相关数据彻底移除，您是否确认删除该用户？',
                    name_title: '提示',
                    name_cancel: '取消',
                    name_confirm: '确定',
                    isCancelBtnShow: true,
                    callBack: function() {
                        farmeObj.deleteMoreUser(ids);
                    }
                };
                xxwsWindowObj.xxwsAlert(defaultOptions);
            }
        });
        //打开上传文件模态框
        _this.$importBtn.click(function() {
            importObj.$batchImportFrame.modal();
            $('.batchImportInput').val("");
        });

    },
    getTable: function() { //table 数据
        var _this = this;
        $('#userList').bootstrapTable({
            url: "/cloudlink-inspection-event/commonData/userArchive/getPageList?token=" + lsObj.getLocalStorage('token'), //请求数据url
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
                farmeObj._userId = row.objectId;
                farmeObj.detailsReset();
                farmeObj.$usreDetailsFrame.modal(); //打开详情模态框
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
                field: 'userFileName', //域值
                title: '用户名称', //内容
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '10%',
                editable: true,
            }, {
                field: 'userFileCode', //域值
                title: '用户编号', //内容
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '10%',
                editable: true,
            }, {
                field: 'enterhomeUserTypeName', //域值
                title: '用户类型', //内容
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '8%',
                editable: true,
            }, {
                field: 'userStatusName', //域值
                title: '用户状态', //内容
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '8%',
            }, {
                field: 'regionName', //域值
                title: '所属片区', //内容
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '15%',
                editable: true,
            }, {
                field: 'residential', //域值
                title: '小区/院/村', //内容
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '10%',
            }, {
                field: 'address', //域值
                title: '详细地址', //内容
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '25%',
                editable: true,
            }, {
                field: 'operate',
                title: '操作',
                align: 'center',
                events: _this.tableEvent(),
                width: '10%',
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
            '<a class="look" href="javascript:void(0)" title="查看">',
            '<i></i>',
            '</a>',
            '<a class="' + modifyClass + '" href="javascript:void(0)" title="修改">',
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
                farmeObj._userId = row.objectId;
                farmeObj.detailsReset();
                farmeObj.$usreDetailsFrame.modal(); //打开详情模态框
                return false;
            },
            //修改计划
            'click .modify': function(e, value, row, index) {
                farmeObj._userId = row.objectId;
                farmeObj.$addUserFrame.modal(); //打开修改模态框
                farmeObj.$addUserFrame.find(".modal-header span").text("编辑用户");
                farmeObj.$addUserFrame.find(".modal-footer .addSubmit").hide();
                farmeObj.$addUserFrame.find(".modal-footer .modifySubmit").show();
                farmeObj.formReset();
                farmeObj._isModify = true;
                return false;
            },
            //删除计划
            'click .delete': function(e, value, row, index) {
                var defaultOptions = {
                    tip: '慎重！此删除操作会导致该用户的相关数据移除，您是否确认删除该用户？',
                    name_title: '提示',
                    name_cancel: '取消',
                    name_confirm: '确定',
                    isCancelBtnShow: true,
                    callBack: function() {
                        farmeObj.deleteUser(row.objectId);
                    }
                };
                xxwsWindowObj.xxwsAlert(defaultOptions);
                return false;
            }
        }
    },
};

//模态框
var farmeObj = {
    $addUserFrame: $("#addUserFrame"),
    $usreDetailsFrame: $("#usreDetailsFrame"),
    $historyInspectFrame: $("#historyInspectFrame"), //历史检查记录
    $addSubmit: $(".addSubmit"),
    $modifySubmit: $(".modifySubmit"),
    $addGasBtn: $(".addGasBtn span"),
    $deleteUserBtn: $(".deleteUserBtn"),
    $historyBtn: $('.getHistory'),
    _gasObj: [],
    querryObj: {
        startDate: '',
        endDate: '',
        groupId: '',
    },
    _isModify: null,
    _userId: null,
    _flag: true,
    init: function() {
        var _this = this;
        //新建表单提交
        _this.$addSubmit.click(function() {
            _this.verification();
        });
        //修改表单提交
        _this.$modifySubmit.click(function() {
            _this.verification();
        });

        //添加燃气表
        _this.$addGasBtn.click(function() {
            var mun = $("#formGasAdd").find(".gasList").length;
            if (mun > 10) {
                xxwsWindowObj.xxwsAlert('您添加的燃气表太多了，最多十个');
            } else {
                _this.gasText(mun + 1);
            }
        });
        //新建模态框加载完成
        _this.$addUserFrame.on('shown.bs.modal', function(e) {
            if ($("#formBasicsAdd").data("bootstrapValidator") != undefined) {
                $("#formBasicsAdd").data("bootstrapValidator").resetForm(true);
                // $("#formGasAdd").data("bootstrapValidator").resetForm(true);
            };
            if (_this._isModify == true) {
                _this.setModifyDetails();
            }
        });

        //详情模态框加载完成
        _this.$usreDetailsFrame.on('shown.bs.modal', function(e) {
            _this.getDetails();
        });
        //删除用户
        _this.$deleteUserBtn.click(function() {
            var defaultOptions = {
                tip: '慎重！此删除操作会导致该用户的相关数据移除，您是否确认删除该用户？',
                name_title: '提示',
                name_cancel: '取消',
                name_confirm: '确定',
                isCancelBtnShow: true,
                callBack: function() {
                    _this.deleteUser(_this._userId);
                }
            };
            xxwsWindowObj.xxwsAlert(defaultOptions);
        });

        //打开历史检查记录
        _this.$historyBtn.click(function() {
            _this.historyReset();
            _this.$historyInspectFrame.modal();
            _this.querryObj.groupId = _this._userId
            _this.getHistoryData();
        });
        _this.$historyInspectFrame.on('show.bs.modal', function(e) {
            // _this.querryObj.groupId = _this._userId
            // console.log("ddd")
            // _this.getHistoryData();
        });
        //打开历史维修记录模态框
        $(".getRepairHistory").click(function() {
            repairObj.openHistoryFrame(_this._userId);
        });
        $(".historyTimeBtn").click(function() {
            var txt = $(this).attr("data-value");
            if (txt == 'diy') {
                if ($("#historydateStart").val() == '') {
                    xxwsWindowObj.xxwsAlert('请选择起始时间');
                    return;
                }
                if ($("#historydateEnd").val() == '') {
                    xxwsWindowObj.xxwsAlert('请选择起始时间');
                    return;
                }
                _this.querryObj.startDate = $("#historydateStart").val();
                _this.querryObj.endDate = $("#historydateEnd").val();
                $(".historyTimeTxt").find(".historyTimeBtn").removeClass("active");
            } else {
                $(this).addClass("active");
                $(this).siblings("span").removeClass("active");
                _this.setDate(txt);
            }
            _this.getHistoryData();
        });

    },
    formReset: function() { //重置表单
        var _this = this;
        _this._gasObj = [];
        $(".text_num").text('(200字)');
        _this.$addUserFrame.find('input').val("");
        _this.$addUserFrame.find('textarea').val("");
        var selects = _this.$addUserFrame.find("select");
        for (var i = 0; i < selects.length; i++) {
            selects.eq(i).find('option:eq(0)').prop("selected", true);
        }
        if ($("#formGasAdd").data('bootstrapValidator') != undefined) {
            $("#formGasAdd").data('bootstrapValidator').destroy();
        };
        _this.$addUserFrame.find(".gasList").remove();
        $("select[name=userRegionList]").html('<option value="">请选择</option>');
        addressObj.setAdress();
        _this.getAreaList(false);

    },
    gasText: function(e) { //燃气表dom元素
        var gasId = baseOperation.createuuid();
        var txt = '<div class="gasList">' +
            '<div class="gasTitle">' +
            '<p>燃气表-' + e + '</p>' +
            '<input type="hidden" name="gasmeterName" value="燃气表-' + e + '">' +
            '<input type="hidden" name="objectId" value="' + gasId + '">' +
            '<input type="hidden" name="operationFlag" value="1">' +
            '<span class="closedGas"><img src="/src/images/user/closed.png" width="10" /></span>' +
            '</div>' +
            '<div class="formList">' +
            '<div class="formListHalf">' +
            '<div class="formListLeft"><i>*</i>类型</div>' +
            '<div class="formListRight">' +
            '<select class="form-control" name="gasmeterTypeCode">' +
            '<option value="GMT_01">机械表</option>' +
            '<option selected value="GMT_02">IC卡表</option>' +
            '<option value="GMT_03">远传表</option>' +
            '<option value="GMT_99">其他</option>' +
            '</select>' +
            '</div>' +
            '</div>' +
            '<div class="formListHalf">' +
            '<div class="formListLeft"><i>*</i>进气方向</div>' +
            '<div class="formListRight">' +
            '<select class="form-control" name="gasmeterEntermode">' +
            '<option value="左进">左进</option>' +
            '<option value="右进">右进</option>' +
            '</select>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '<div class="formList">' +
            '<div class="formListHalf">' +
            '<div class="formListLeft"><i>*</i>使用状态</div>' +
            '<div class="formListRight">' +
            '<select class="form-control" name="gasmeterStatusCode">' +
            '<option value="GMUS_01">在用</option>' +
            '<option value="GMUS_02">停用</option>' +
            '<option value="GMUS_03">已拆卸</option>' +
            '</select>' +
            '</div>' +
            '</div>' +
            '<div class="formListHalf">' +
            '<div class="formListLeft">生产日期</div>' +
            '<div class="formListRight">' +
            '<input type="text" name="manufactureDate" class="form-control pointer dateTimeAdd" placeholder="请选择日期" readonly>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '<div class="formList">' +
            '<div class="formListHalf">' +
            '<div class="formListLeft">生产厂家</div>' +
            '<div class="formListRight form-group">' +
            '<input type="text" name="manufacturer" class="form-control" />' +
            '</div>' +
            '</div>' +
            '<div class="formListHalf">' +
            '<div class="formListLeft">编号</div>' +
            '<div class="formListRight form-group">' +
            '<input type="text" name="gasmeterCode" class="form-control" />' +
            '</div>' +
            '</div>' +
            '</div>' +
            '<div class="formList">' +
            '<div class="formListHalf">' +
            '<div class="formListLeft">型号</div>' +
            '<div class="formListRight form-group">' +
            '<input type="text" name="gasmeterMode" class="form-control" />' +
            '</div>' +
            '</div>' +
            '<div class="formListHalf">' +
            '<div class="formListLeft">使用年限</div>' +
            '<div class="formListRight form-group">' +
            '<input type="text" name="serviceLife" class="form-control" />' +
            '</div>' +
            '</div>' +
            '</div>' +
            '<div class="formList">' +
            '<div class="formListLeft">规格</div>' +
            '<div class="formListRight form-group">' +
            '<input type="text" class="form-control" name="specifications" />' +
            '</div>' +
            '</div>' +
            '</div>';
        $("div.addGasBtn").before(txt);
    },
    verification: function(e) { //表单的验证
        var _this = this;
        if ($("#formBasicsAdd").find("select[name=areaCode]").val() == '') {
            xxwsWindowObj.xxwsAlert('请选择详细地址');
            return;
        }
        var options = {
            message: 'This value is not valid',
            feedbackIcons: {
                valid: 'glyphicon glyphicon-ok',
                invalid: 'glyphicon glyphicon-remove',
                validating: 'glyphicon glyphicon-refresh'　　　　　　　　
            },
            fields: {
                residential: {
                    validators: {
                        notEmpty: {
                            message: '请输入小区/院/村'
                        },
                        stringLength: {
                            max: 25,
                            message: '小区/院/村字数过长，不能大于25'
                        }
                    }
                },
                biulding: {
                    validators: {
                        stringLength: {
                            max: 15,
                            message: '楼号字数过长，不能大于15'
                        }
                    }
                },
                unit: {
                    validators: {
                        stringLength: {
                            max: 15,
                            message: '单元号字数过长，不能大于15'
                        }
                    }
                },
                room: {
                    validators: {
                        notEmpty: {
                            message: '请输入门牌号'
                        },
                        stringLength: {
                            max: 50,
                            message: '门牌号字数过长，不能大于50'
                        }
                    }
                },
                userFileName: {
                    validators: {
                        stringLength: {
                            max: 25,
                            message: '用户名称字数过长，不能大于25'
                        }
                    }
                },
                userFileCode: {
                    validators: {
                        stringLength: {
                            max: 25,
                            message: '用户编号字数过长，不能大于25'
                        }
                    }
                },
                contactUser: {
                    validators: {
                        stringLength: {
                            max: 25,
                            message: '联系人字数过长，不能大于25'
                        }
                    }
                },
                contactPhone: {
                    validators: {
                        regexp: {
                            regexp: /^((1\d{10})|(([0-9]{3,4}-)?[0-9]{7,8}))$/,
                            message: '联系电话输入错误'
                        }
                    }
                },
                alternativePhone: {
                    validators: {
                        regexp: {
                            regexp: /^((1\d{10})|(([0-9]{3,4}-)?[0-9]{7,8}))$/,
                            message: '备用电话输入错误'
                        }
                    }
                },
                identityCard: {
                    validators: {
                        stringLength: {
                            max: 18,
                            message: '身份证号字数过长，不能大于18'
                        }
                    }
                },
                pressureRangeMin: {
                    validators: {
                        numeric: {
                            message: '格式错误，只能是数字格式'
                        },
                        between: {
                            min: 0,
                            max: 10000,
                            message: '数值大小在0~~10000之间'
                        }
                    }
                },
                pressureRangeMax: {
                    validators: {
                        numeric: {
                            message: '格式错误，只能是数字格式'
                        },
                        between: {
                            min: 0,
                            max: 10000,
                            message: '数值大小在0~~10000之间'
                        }
                    }
                },
            }
        };
        var optionGas = {
            message: 'This value is not valid',
            feedbackIcons: {
                valid: 'glyphicon glyphicon-ok',
                invalid: 'glyphicon glyphicon-remove',
                validating: 'glyphicon glyphicon-refresh'　　　　　　　　
            },
            fields: {
                manufacturer: {
                    validators: {
                        stringLength: {
                            max: 25,
                            message: '生产厂家字数过长，不能大于25'
                        }
                    }
                },
                gasmeterCode: {
                    validators: {
                        stringLength: {
                            max: 30,
                            message: '编号字数过长，不能大于30'
                        }
                    }
                },
                gasmeterMode: {
                    validators: {
                        stringLength: {
                            max: 25,
                            message: '型号字数过长，不能大于25'
                        }
                    }
                },
                serviceLife: {
                    validators: {
                        stringLength: {
                            max: 15,
                            message: '使用年限字数过长，不能大于15'
                        }
                    }
                },
                specifications: {
                    validators: {
                        stringLength: {
                            max: 100,
                            message: '规格字数过长，不能大于100'
                        }
                    }
                }
            }
        };
        $("#formBasicsAdd").bootstrapValidator(options);
        $("#formBasicsAdd").data('bootstrapValidator').validate();
        if ($("#formGasAdd").data('bootstrapValidator') != undefined) {
            $("#formGasAdd").data('bootstrapValidator').destroy();
        };
        $("#formGasAdd").bootstrapValidator(optionGas);
        $("#formGasAdd").data('bootstrapValidator').validate();
        if ($("#formBasicsAdd").data('bootstrapValidator').isValid() == true && $("#formGasAdd").data('bootstrapValidator').isValid() == true) {
            _this.getFormData();
        } else {
            $("#addUserFrame .modal-body").scrollTop(0);
        }
    },
    getFormData: function() { //获取表单的数据
        var _this = this;
        var obj = fromObj.getForm($("#formBasicsAdd"));
        var userGasmeterList = [];
        var address = '';
        var regionId = obj.userRegionList;
        var address1 = $(".addressProvince").find("option:selected").text() + $(".addressCity").find("option:selected").text() + $(".addressCounty").find("option:selected").text() + $(".addressTown").find("option:selected").text();
        var address2 = obj.residential + ((obj.biulding == '') ? '' : ('-' + obj.biulding)) + ((obj.unit == '') ? '' : ('-' + obj.unit)) + '-' + obj.room;
        address = address1 + address2;
        if ($("#formGasAdd .gasList").length > 0) {
            for (var i = 0; i < $("#formGasAdd .gasList").length; i++) {
                var dataL = fromObj.getForm($("#formGasAdd .gasList").eq(i));
                userGasmeterList.push(dataL);
            }
        }
        obj.userGasmeterList = userGasmeterList;
        if (regionId == '') {
            obj.userRegionList = [];
        } else {
            obj.userRegionList = [{ regionId: regionId }];
        }
        obj.address = address;
        obj.objectId = _this._userId;
        obj.remark = $("#addUserFrame").find("textarea[name=remark]").val().trim();
        //修改燃气表判断
        if (_this._gasObj.length != 0 && _this._gasObj != null && _this._gasObj != undefined) {
            for (var i = 0; i < _this._gasObj.length; i++) {
                var gasJudge = false;
                gasid = _this._gasObj[i].objectId;
                for (var j = 0; j < obj.userGasmeterList.length; j++) {
                    if (gasid == obj.userGasmeterList[j].objectId) {
                        gasJudge = true;
                    }
                }
                if (gasJudge == false) {
                    _this._gasObj[i].operationFlag = -1;
                    obj.userGasmeterList.push(_this._gasObj[i]);
                }
            }
        }
        if (_this._isModify == true) {
            _this.modifyUser(obj);
        } else {
            obj.objectId = baseOperation.createuuid();
            _this.addUser(obj);
        }
    },
    addUser: function(param) { //新增用户
        var _this = this;
        if (_this._flag == true) {
            _this._flag = false;
            $.ajax({
                type: "POST",
                url: "/cloudlink-inspection-event/userArchive/save?token=" + lsObj.getLocalStorage('token'),
                contentType: "application/json",
                data: JSON.stringify(param),
                dataType: "json",
                success: function(data) {
                    if (data.success == 1) {
                        var defaultOptions = {
                            tip: '新建用户成功',
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
                        if (data.code == 'XE03001') {
                            xxwsWindowObj.xxwsAlert('新建用户失败，地址重复');
                        } else if (data.code == 'XE03002') {
                            xxwsWindowObj.xxwsAlert('用户编号重复');
                        } else {
                            xxwsWindowObj.xxwsAlert('新建用户失败');
                        }
                    }
                    _this.again();
                },
                error: function() {
                    xxwsWindowObj.xxwsAlert('新建用户失败');
                    _this.again();
                }
            });
        }
    },
    modifyUser: function(param) { //新增用户
        var _this = this;
        if (_this._flag == true) {
            _this._flag = false;
            $.ajax({
                type: "POST",
                url: "/cloudlink-inspection-event/userArchive/update?token=" + lsObj.getLocalStorage('token'),
                contentType: "application/json",
                data: JSON.stringify(param),
                dataType: "json",
                success: function(data) {
                    if (data.success == 1) {
                        var defaultOptions = {
                            tip: '修改用户成功',
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
                        if (data.code == 'XE03001') {
                            xxwsWindowObj.xxwsAlert('修改用户失败，地址重复');
                        } else if (data.code == 'XE03002') {
                            xxwsWindowObj.xxwsAlert('用户编号重复');
                        } else {
                            xxwsWindowObj.xxwsAlert('修改用户失败');
                        }
                    }
                    _this.again();
                },
                error: function() {
                    xxwsWindowObj.xxwsAlert('修改用户失败');
                    _this.again();
                }
            });
        }
    },
    setModifyDetails: function() { //编辑模态框打开设置信息
        var _this = this;
        var param = {
            objectId: _this._userId
        }
        _this._gasObj = [];
        $.ajax({
            type: "GET",
            url: "/cloudlink-inspection-event/commonData/userArchive/get?token=" + lsObj.getLocalStorage('token'),
            contentType: "application/json",
            data: param,
            dataType: "json",
            success: function(data) {
                if (data.success == 1) {
                    var obj = data.rows[0];
                    _this._gasObj = obj.userGasmeterBoList;
                    fromObj.setForm('addUserFrame', obj);
                    addressObj.setAdress(obj.areaCode);
                    if (obj.userGasmeterBoList.length > 0) {
                        for (var i = 0; i < obj.userGasmeterBoList.length; i++) {
                            var txt = '<div class="gasList">' +
                                '<div class="gasTitle">' +
                                '<p>' + obj.userGasmeterBoList[i].gasmeterName + '</p>' +
                                '<input type="hidden" name="gasmeterName" value="' + obj.userGasmeterBoList[i].gasmeterName + '">' +
                                '<input type="hidden" name="objectId" value="' + obj.userGasmeterBoList[i].objectId + '">' +
                                '<input type="hidden" name="operationFlag" value="2">' +
                                // '<span class="closedGas"><img src="/src/images/user/closed.png" width="10" /></span>' +
                                '</div>' +
                                '<div class="formList">' +
                                '<div class="formListHalf">' +
                                '<div class="formListLeft"><i>*</i>类型</div>' +
                                '<div class="formListRight">' +
                                '<select class="form-control" name="gasmeterTypeCode">' +
                                '<option value="GMT_01">机械表</option>' +
                                '<option selected value="GMT_02">IC卡表</option>' +
                                '<option value="GMT_03">远传表</option>' +
                                '<option value="GMT_99">其他</option>' +
                                '</select>' +
                                '</div>' +
                                '</div>' +
                                '<div class="formListHalf">' +
                                '<div class="formListLeft"><i>*</i>进气方向</div>' +
                                '<div class="formListRight">' +
                                '<select class="form-control" name="gasmeterEntermode">' +
                                '<option value="左进">左进</option>' +
                                '<option value="右进">右进</option>' +
                                '</select>' +
                                '</div>' +
                                '</div>' +
                                '</div>' +
                                '<div class="formList">' +
                                '<div class="formListHalf">' +
                                '<div class="formListLeft"><i>*</i>使用状态</div>' +
                                '<div class="formListRight">' +
                                '<select class="form-control" name="gasmeterStatusCode">' +
                                '<option value="GMUS_01">在用</option>' +
                                '<option value="GMUS_02">停用</option>' +
                                '<option value="GMUS_03">已拆卸</option>' +
                                '</select>' +
                                '</div>' +
                                '</div>' +
                                '<div class="formListHalf">' +
                                '<div class="formListLeft">生产日期</div>' +
                                '<div class="formListRight">' +
                                '<input type="text" value="' + obj.userGasmeterBoList[i].manufactureDate + '" name="manufactureDate" class="form-control pointer dateTimeAdd" placeholder="请选择日期" readonly>' +
                                '</div>' +
                                '</div>' +
                                '</div>' +
                                '<div class="formList">' +
                                '<div class="formListHalf">' +
                                '<div class="formListLeft">生产厂家</div>' +
                                '<div class="formListRight form-group">' +
                                '<input type="text" value="' + obj.userGasmeterBoList[i].manufacturer + '" name="manufacturer" class="form-control" />' +
                                '</div>' +
                                '</div>' +
                                '<div class="formListHalf">' +
                                '<div class="formListLeft">编号</div>' +
                                '<div class="formListRight form-group">' +
                                '<input type="text" value="' + obj.userGasmeterBoList[i].gasmeterCode + '" name="gasmeterCode" class="form-control" />' +
                                '</div>' +
                                '</div>' +
                                '</div>' +
                                '<div class="formList">' +
                                '<div class="formListHalf">' +
                                '<div class="formListLeft">型号</div>' +
                                '<div class="formListRight form-group">' +
                                '<input type="text" value="' + obj.userGasmeterBoList[i].gasmeterMode + '" name="gasmeterMode" class="form-control" />' +
                                '</div>' +
                                '</div>' +
                                '<div class="formListHalf">' +
                                '<div class="formListLeft">使用年限</div>' +
                                '<div class="formListRight form-group">' +
                                '<input type="text" value="' + obj.userGasmeterBoList[i].serviceLife + '" name="serviceLife" class="form-control" />' +
                                '</div>' +
                                '</div>' +
                                '</div>' +
                                '<div class="formList">' +
                                '<div class="formListLeft">规格</div>' +
                                '<div class="formListRight form-group">' +
                                '<input type="text" value="' + obj.userGasmeterBoList[i].specifications + '" class="form-control" name="specifications" />' +
                                '</div>' +
                                '</div>' +
                                '</div>';
                            $("div.addGasBtn").before(txt);
                        };
                        for (var i = 0; i < obj.userGasmeterBoList.length; i++) {
                            var dom = $("#formGasAdd").find(".gasList").eq(i);
                            dom.find('select[name=gasmeterTypeCode]').val(obj.userGasmeterBoList[i].gasmeterTypeCode);
                            dom.find('select[name=gasmeterEntermode]').val(obj.userGasmeterBoList[i].gasmeterEntermode);
                            dom.find('select[name=gasmeterStatusCode]').val(obj.userGasmeterBoList[i].gasmeterStatusCode);
                        }
                    };
                    $("select[name=userRegionList]").val(obj.regionId);

                    var numText = 200 - obj.remark.length;
                    $(".text_num").text('(' + numText + '字)');
                } else {
                    xxwsWindowObj.xxwsAlert('获取用户修改信息失败');
                }
            },
            error: function() {
                xxwsWindowObj.xxwsAlert('获取用户修改信息失败');
            }
        });
    },
    detailsReset: function() { //详情初始化
        var _this = this;
        _this.$usreDetailsFrame.find(".frameListRight p").text("------");
        _this.$usreDetailsFrame.find(".gasDetailsMain").html("");
    },
    getDetails: function() { //获取详情
        var _this = this;
        var param = {
            objectId: _this._userId
        }
        $.ajax({
            type: "GET",
            url: "/cloudlink-inspection-event/commonData/userArchive/get?token=" + lsObj.getLocalStorage('token'),
            contentType: "application/json",
            data: param,
            dataType: "json",
            success: function(data) {
                if (data.success == 1) {
                    var obj = data.rows[0];
                    fromObj.setDetails('usreDetailsFrame', obj);
                    if (obj.userGasmeterBoList.length > 0) {
                        for (var i = 0; i < obj.userGasmeterBoList.length; i++) {
                            var txt = '<div class="gasMainList">' +
                                '<div class="gasMainTitle">' +
                                '<p>' + obj.userGasmeterBoList[i].gasmeterName + '</p>' +
                                '</div>' +
                                '<div class="frameList">' +
                                '<div class="frameListHalf">' +
                                '<div class="frameListLeft">类型</div>' +
                                '<div class="frameListRight">' +
                                '<p data-name="installationTimeT">' + obj.userGasmeterBoList[i].gasmeterTypeName + '</p>' +
                                '</div>' +
                                '</div>' +
                                '<div class="frameListHalf">' +
                                '<div class="frameListLeft">进气方向</div>' +
                                '<div class="frameListRight">' +
                                '<p data-name="investmentTimeT">' + obj.userGasmeterBoList[i].gasmeterEntermode + '</p>' +
                                '</div>' +
                                '</div>' +
                                '</div>' +
                                '<div class="frameList">' +
                                '<div class="frameListHalf">' +
                                '<div class="frameListLeft">使用状态</div>' +
                                '<div class="frameListRight">' +
                                '<p data-name="installationTimeT">' + obj.userGasmeterBoList[i].gasmeterStatusName + '</p>' +
                                '</div>' +
                                '</div>' +
                                '<div class="frameListHalf">' +
                                '<div class="frameListLeft">生产日期</div>' +
                                '<div class="frameListRight">' +
                                '<p data-name="investmentTimeT">' + obj.userGasmeterBoList[i].manufactureDate + '</p>' +
                                '</div>' +
                                '</div>' +
                                '</div>' +
                                '<div class="frameList">' +
                                '<div class="frameListHalf">' +
                                '<div class="frameListLeft">生产厂家</div>' +
                                '<div class="frameListRight">' +
                                '<p data-name="installationTimeT">' + obj.userGasmeterBoList[i].manufacturer + '</p>' +
                                '</div>' +
                                '</div>' +
                                '<div class="frameListHalf">' +
                                '<div class="frameListLeft">编号</div>' +
                                '<div class="frameListRight">' +
                                '<p data-name="investmentTimeT">' + obj.userGasmeterBoList[i].gasmeterCode + '</p>' +
                                '</div>' +
                                '</div>' +
                                '</div>' +
                                '<div class="frameList">' +
                                '<div class="frameListHalf">' +
                                '<div class="frameListLeft">型号</div>' +
                                '<div class="frameListRight">' +
                                '<p data-name="installationTimeT">' + obj.userGasmeterBoList[i].gasmeterMode + '</p>' +
                                '</div>' +
                                '</div>' +
                                '<div class="frameListHalf">' +
                                '<div class="frameListLeft">使用年限</div>' +
                                '<div class="frameListRight">' +
                                '<p data-name="investmentTimeT">' + obj.userGasmeterBoList[i].serviceLife + '</p>' +
                                '</div>' +
                                '</div>' +
                                '</div>' +
                                '<div class="frameList">' +
                                '<div class="frameListLeft">规格</div>' +
                                '<div class="frameListRight">' +
                                '<p data-name="installationTimeT">' + obj.userGasmeterBoList[i].specifications + '</p>' +
                                '</div>' +
                                '</div>' +
                                '</div>';
                            $(".gasDetailsMain").append(txt);
                        }
                    } else {
                        $(".gasDetailsMain").html("<p class='gaslistNone'>暂无燃气表信息</p>");
                    }
                } else {
                    xxwsWindowObj.xxwsAlert('获取用户详情信息失败');
                }
            },
            error: function() {
                xxwsWindowObj.xxwsAlert('获取用户详情信息失败');
            }
        });
    },
    deleteUser: function(id) { //删除一个用户
        var param = {
            objectId: id
        };
        $.ajax({
            type: 'POST',
            url: "/cloudlink-inspection-event/userArchive/delete?token=" + lsObj.getLocalStorage('token'),
            contentType: "application/json",
            data: JSON.stringify(param),
            dataType: "json",
            success: function(data, status) {
                if (data.success == 1) {
                    var defaultOptions = {
                        tip: '用户删除成功！',
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
                        xxwsWindowObj.xxwsAlert("您没有删除用户的权限！");
                    } else if (data.code == "XE03004") {
                        xxwsWindowObj.xxwsAlert("该用户已存在安检记录，无法删除");
                    } else if (data.code == "XE03006") {
                        xxwsWindowObj.xxwsAlert("您没有删除用户的权限！");
                    } else {
                        xxwsWindowObj.xxwsAlert("用户删除失败！");
                    }
                }
            }
        });
    },
    deleteMoreUser: function(ids) { //删除多个用户
        var param = {
            idList: ids
        };
        $.ajax({
            type: 'POST',
            url: "/cloudlink-inspection-event/userArchive/deleteBatch?token=" + lsObj.getLocalStorage('token'),
            contentType: "application/json",
            data: JSON.stringify(param),
            dataType: "json",
            success: function(data, status) {
                if (data.success == 1) {
                    var defaultOptions = {
                        tip: '用户删除成功！',
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
                        xxwsWindowObj.xxwsAlert("您没有删除用户的权限！");
                    } else if (data.code == "XE03004") {
                        $(".hintsDeleteMainList ul").html("");
                        $("#validationDeleteFrame").modal();
                        var dataAll = data.rows;
                        if (dataAll.length > 0) {
                            for (var i = 0; i < dataAll.length; i++) {
                                var txt = '<li><span class="listLeft">' + (i + 1) + '</span><span class="listRight">' + dataAll[i].address + '</span></li>';
                                $(".hintsDeleteMainList ul").append(txt);
                            }
                        }
                    } else if (data.code == "XE03006") {
                        xxwsWindowObj.xxwsAlert("您没有删除用户的权限！");
                    } else {
                        xxwsWindowObj.xxwsAlert("用户删除失败！");
                    }
                }
            }
        });
    },
    getAreaList: function(boolean) { //获取片区下拉列表   
        var _this = this;
        var param = {
            keyword: '',
            pageNum: 1,
            pageSize: 10000
        }
        $.ajax({
            type: "POST",
            url: "/cloudlink-inspection-event/commonData/region/getPageList?token=" + lsObj.getLocalStorage('token'),
            contentType: "application/json",
            data: JSON.stringify(param),
            dataType: "json",
            success: function(data) {
                if (data.success == 1) {
                    var areaList = data.rows;
                    var txt = null;
                    if (boolean == true) {
                        txt = '<option value="">全部（片区）</option>';
                    } else {
                        txt = '<option value="">请选择</option>';
                    };
                    for (var i = 0; i < areaList.length; i++) {
                        txt += '<option value="' + areaList[i].objectId + '">' + areaList[i].regionName + '</option>';
                    };
                    if (boolean == true) {
                        txt += '<option value="none">无</option>';
                        $("select[name=areaList]").html(txt);
                    } else {
                        $("select[name=userRegionList]").html(txt);
                    }
                }
            },
        });
    },
    getQuartersList: function(areaId) { //获取小区下拉列表
        var _this = this;
        var param = {
            regionId: areaId,
            pageNum: 1,
            pageSize: 1000
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
    satisfaction: function(value) { //满意度星星的遍历
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
    historyReset: function() { //重置历史检查记录
        $("#historydateStart").val('');
        $("#historydateEnd").val('');
        $(".historyTimeBtn").removeClass("active");
        $(".historyTimeBtn").eq(0).addClass("active");
        $(".historyMainDetails").html('');
        this.querryObj.startDate = '';
        this.querryObj.endDate = '';
    },
    getHistoryData: function() { //获取历史检查记录
        var _this = this;
        $(".historyMainDetails").html('');
        $.ajax({
            type: "POST",
            url: "/cloudlink-inspection-event/commonData/securityCheckRecordHistory/getList?token=" + lsObj.getLocalStorage('token'),
            contentType: "application/json",
            data: JSON.stringify(_this.querryObj),
            dataType: "json",
            success: function(data) {
                if (data.success == 1) {
                    var dataAll = data.rows;
                    var txt = '';
                    if (dataAll.length > 0) {
                        for (var j = 0; j < dataAll.length; j++) {
                            //满意度
                            var starTxt = _this.satisfaction(dataAll[j].satisfaction);
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

                            txt += '<div class="frameDetailsMain">' +
                                '<div class="frameList">' +
                                '<div class="frameListHalf">' +
                                '<div class="frameListLeft">安检时间</div>' +
                                '<div class="frameListRight">' +
                                '<p>' + dataAll[j].securityCheckTime + '</p>' +
                                '</div>' +
                                '</div>' +
                                '<div class="frameListHalf">' +
                                '<div class="frameListLeft">安检人</div>' +
                                '<div class="frameListRight">' +
                                '<p>' + dataAll[j].createUserName + '</p>' +
                                '</div>' +
                                '</div>' +
                                '</div>' +
                                '<div class="frameList">' +
                                '<div class="frameListHalf">' +
                                '<div class="frameListLeft">安检计划</div>' +
                                '<div class="frameListRight">' +
                                '<p>' + dataAll[j].planName + '</p>' +
                                '</div>' +
                                '</div>' +
                                '<div class="frameListHalf">' +
                                '<div class="frameListLeft">入户情况</div>' +
                                '<div class="frameListRight">' +
                                '<p>' + dataAll[j].enterhomeSituationTypeName + '</p>' +
                                '</div>' +
                                '</div>' +
                                '</div>' +
                                '<div class="frameList">' +
                                '<div class="frameListHalf">' +
                                '<div class="frameListLeft">安全隐患</div>' +
                                '<div class="frameListRight">' +
                                '<p>' + securityTxt + '</p>' +
                                '</div>' +
                                '</div>' +
                                '<div class="frameListHalf">' +
                                '<div class="frameListLeft">整改时间</div>' +
                                '<div class="frameListRight">' +
                                '<p>' + dataAll[j].remediationTime + '</p>' +
                                '</div>' +
                                '</div>' +
                                '</div>' +
                                '<div class="frameList ' + securityClass + '">' +
                                '<div class="frameListLeft">隐患情况</div>' +
                                '<div class="frameListRight">' +
                                '<p class="hiddendangersT">' + txtDanger + '</p>' +
                                '</div>' +
                                '</div>' +
                                '<div class="frameList ' + securityClass + '">' +
                                '<div class="frameListLeft">隐患措施告知</div>' +
                                '<div class="frameListRight">' +
                                '<p>隐患整改措施已告知用户并解释清楚</p>' +
                                '</div>' +
                                '</div>' +

                                '<div class="frameList">' +
                                '<div class="frameListLeft">备注</div>' +
                                '<div class="frameListRight">' +
                                '<p>' + dataAll[j].remark + '</p>' +
                                '</div>' +
                                '</div>' +
                                '<div class="frameList">' +
                                '<div class="frameListLeft">照片</div>' +
                                '<div class="frameListRight">' +
                                '<ul>' + txtReImg + '</ul>' +
                                '</div>' +
                                '</div>' +

                                '<div class="frameList ' + successClass + '">' +
                                '<div class="frameListLeft">用户签字</div>' +
                                '<div class="frameListRight">' +
                                '<ul>' + txtUsImg + '</ul>' +
                                '</div>' +
                                '</div>' +
                                '<div class="frameList ' + successClass + '">' +
                                '<div class="frameListLeft">用户满意度</div>' +
                                '<div class="frameListRight satisfaction">' + starTxt + '</div>' +
                                '</div>' +

                                '</div>';
                        }
                    } else {
                        txt = "<span class='notEmptyData'>暂无检查记录</span>";
                    }
                    $(".historyMainDetails").append(txt);
                } else {
                    xxwsWindowObj.xxwsAlert("获取历史检查记录失败");
                }
            },
            error: function(data) {
                xxwsWindowObj.xxwsAlert("获取历史检查记录失败");
            }
        });

    },
    setDate: function(value) {
        var _this = this;
        switch (value) {
            case 'day':
                var date = new Date().Format('yyyy-MM-dd');
                _this.querryObj.startDate = date;
                _this.querryObj.endDate = date;
                break;
            case 'week':
                var date = new Date();
                _this.querryObj.startDate = date.getWeekStartDate().Format('yyyy-MM-dd');
                _this.querryObj.endDate = date.getWeekEndDate().Format('yyyy-MM-dd');
                break;
            case 'month':
                var date = new Date();
                _this.querryObj.startDate = date.getMonthStartDate().Format('yyyy-MM-dd');
                _this.querryObj.endDate = date.getMonthEndDate().Format('yyyy-MM-dd');
                break;
            default:
                _this.querryObj.startDate = '';
                _this.querryObj.endDate = '';
        }
    },
    again: function() {
        this._flag = true;
    }
};

//导出文件
var exportFileObj = {
    $exportAll: $("#export_all"),
    $exportChoice: $("#export_choice"),
    $templatesBtn: $("#templatesBtn"),
    expoerObj: {
        "regionId": "", //片区
        "residential": "", //小区
        "enterhomeUserTypeCode": '',
        "userStatusCode": "",
        "keyword": "",
        "pageNum": 1, //第几页
        "pageSize": 10, //每页记录数
        "idList": []
    },
    init: function() {
        var _this = this;
        //导出全部
        this.$exportAll.click(function() {
            _this.expoerObj.idList = [];
            _this.expoerCondition();
        });
        //导出所选
        this.$exportChoice.click(function() {
            var selectionsData = $('#userList').bootstrapTable('getSelections');
            _this.expoerObj.idList = [];
            if (selectionsData.length == 0) {
                xxwsWindowObj.xxwsAlert("请选择你需要导出的用户！");
                return false;
            } else {
                for (var i = 0; i < selectionsData.length; i++) {
                    _this.expoerObj.idList.push(selectionsData[i].objectId);
                }
                _this.expoerCondition();
            }
        });
        //下载模板
        _this.$templatesBtn.click(function() {
            _this.exportTemlates();
        });
    },
    expoerCondition: function() {
        $.extend(this.expoerObj, searchObj.querryObj);
        this.expoerData(this.expoerObj);
    },
    expoerData: function(date) {
        var options = {
            "url": '/cloudlink-inspection-event/commonData/userArchive/export?token=' + lsObj.getLocalStorage('token'),
            "data": date,
            "method": 'post'
        }
        this.downLoadFile(options);
    },
    exportTemlates: function() {
        var options = {
            "url": '/cloudlink-inspection-event/userArchive/downLoadTemplate?token=' + lsObj.getLocalStorage('token'),
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
        //初始化地址
        _this._addressObj = setAddress({
            defalutId: '', // 镇编码，可以不传，或传空，传入错误编码会使select无选择
            dataUrl: '/src/js/user/city.json', //必填， json包地址
            provinceSelector: '.province', //省选择器
            citySelector: '.city', //市选择器
            countySelector: '.county', //县选择器
            townSelector: '.country', //镇选择器
        });

        //文件上传模态框打开完成
        _this.$batchImportFrame.on('shown.bs.modal', function(e) {
            $(".feedback_img_file").find("input[type=file]").val("");
            _this._addressObj.initDefaultAddress();
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
        var areaCode = _this._addressObj.result.townCode;
        var val = $('.batchImportInput').val().trim();
        if (areaCode == "" || areaCode == null || areaCode == undefined) {
            xxwsWindowObj.xxwsAlert("请选择用户所在地区");
            return false;
        } else if (val == "" || val == null) {
            xxwsWindowObj.xxwsAlert("请选择上传的文件");
            return false;
        } else {
            var uploadId = $('.feedback_img_file').find('input').attr('id');
            _this.uploadFlie(uploadId, areaCode)
        }
    },
    uploadFlie: function(uploadId, areaCode) { //上传文件到阿里
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
                        _this.fileCheck(fileId, areaCode);
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
    fileCheck: function(fileId, areaCode) { //文件的校验
        var _this = this;
        var param = {
            fileId: fileId,
            areaCode: areaCode
        };
        $.ajax({
            type: 'POST',
            url: "/cloudlink-inspection-event/userArchive/importValidate?token=" + lsObj.getLocalStorage('token'),
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
                        _this.$transitionFrame.find(".transitionMain dd span").text("地址验证");
                        _this.fileCheckTwo();
                    } else {
                        var wrongData = data.rows[0].errors;
                        $(".hintsNum").text(wrongData.length);

                        _this.$transitionFrame.modal('hide');
                        _this.$hintsFrame.modal();
                        $(".hintsMainList ul").html("");
                        _this.$hintsFrame.find(".modal-header h3 span").text("数据格式规范验证");
                        _this.$hintsFrame.find(".hintsMainTitle i").text("必填项未填写、填写项不符合规范");
                        _this.again();
                        for (var i = 0; i < wrongData.length; i++) {
                            var colTxt = '';
                            if (wrongData[i].msg) {
                                colTxt = wrongData[i].msg + '行地址重复、';
                            }
                            if (wrongData[i].colErrors) {
                                for (var j = 0; j < wrongData[i].colErrors.length; j++) {
                                    var wrongTxt;
                                    if (wrongData[i].colErrors[j].msgType == 'notBlank') {
                                        wrongTxt = '列未填写';
                                    } else if (wrongData[i].colErrors[j].msgType == 'typemismatch' || wrongData[i].colErrors[j].msgType == 'integrality') {
                                        wrongTxt = '列填写不规范';
                                    } else if (wrongData[i].colErrors[j].msgType == 'addressDuplicate') {
                                        wrongTxt = '行地址重复';
                                    }
                                    colTxt += '第' + wrongData[i].colErrors[j].colNum + wrongTxt + '、';
                                }
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
                url: "/cloudlink-inspection-event/userArchive/importBatch?token=" + lsObj.getLocalStorage('token'),
                contentType: "application/json",
                // data: JSON.stringify(param),
                dataType: "json",
                success: function(data, status) {
                    if (data.success == 1) {
                        _this.$transitionFrame.modal('hide');
                        _this.again();
                        _this.$refrsetFrame.modal();
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
    searchObj.init();
    userTable.init();
    farmeObj.init();
    exportFileObj.init();
    importObj.init();
    //删除燃气表
    $(document).on('click', '.closedGas', function() {
        if ($("#formGasAdd").data('bootstrapValidator') != undefined) {
            $("#formGasAdd").data('bootstrapValidator').destroy();
        };
        $(this).closest(".gasList").remove();
        var mun = $("#formGasAdd").find(".gasList").length;
        if (mun > 0) {
            for (var i = 0; i < mun; i++) {
                var dom = $("#formGasAdd").find(".gasList").eq(i);
                dom.find('input[name=gasmeterName]').val("燃气表-" + (i + 1));
                dom.find('.gasTitle p').text("燃气表-" + (i + 1));
            }
        }
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
});

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
//判断时间选择是否有值
function dateChangeForSearch() {
    var startDate = $("#historydateStart").val();
    var endDate = $("#historydateEnd").val();
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