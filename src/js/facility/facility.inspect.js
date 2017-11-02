/*
 *设施检查记录
 */
var inspectRecordObj = {
    _recordId: null,
    init: function() {
        var _this = this;
        _this.getTable();
        //详情模态框加载完
        historyDetailsObj.$historyDetailsFrame.on('shown.bs.modal', function(e) {
            document.getElementById('historyDetailsFrameT').scrollTop = 0;
            historyDetailsObj.geiHistoryDetails(_this._recordId);
        });
    },
    getTable: function() { //table 数据
        var _this = this;
        $('#tableInspect').bootstrapTable({
            url: "/cloudlink-inspection-event/facilityRecord/getPageList?token=" + lsObj.getLocalStorage('token'), //请求数据url
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
                _this._recordId = row.objectId;
                historyDetailsObj.$historyDetailsFrame.modal(); //打开详情模态框
                historyDetailsObj.clearHistoryDetails();
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
                field: 'facilityCheckTime', //域值
                title: '检查时间',
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '18%',
                editable: true,
            }, {
                field: 'facilityName', //域值
                title: '设施名称', //内容
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '12%',
                editable: true,
            }, {
                field: 'facilityTypeName', //域值
                title: '设施类型', //内容
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '9%',
                editable: true,
            }, {
                field: 'isLeakageName', //域值
                title: '漏气状态', //内容
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '9%',
                cellStyle: function(value, row, index) {
                    if (row.isLeakage == 0) {
                        return {
                            css: {
                                "color": "#333",
                            }
                        };
                    } else {
                        return {
                            css: {
                                "color": "#ef1010",
                            }
                        };
                    }
                },
                formatter: function(value, row, index) {
                    if (row.isLeakage == 1) {
                        return "漏气";
                    } else {
                        return "未漏气";
                    }
                }
            }, {
                field: 'facilityCheckResultName', //域值
                title: '检查结果', //内容
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '9%',
                editable: true,
                cellStyle: function(value, row, index) {
                    if (row.facilityCheckResult == 0) {
                        return {
                            css: {
                                "color": "#333",
                            }
                        };
                    } else {
                        return {
                            css: {
                                "color": "#ef1010",
                            }
                        };
                    }
                }
            }, {
                field: 'createUserName', //域值
                title: '检查人员', //内容
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '9%',
                // editable: true,
            }, {
                field: 'address', //域值
                title: '详细地址', //内容
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '20%',
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
        var deleteClass = null;
        if (JSON.parse(lsObj.getLocalStorage('userBo')).isSysadmin == 1) {
            deleteClass = 'delete';
        } else {
            if (row.createUserId == JSON.parse(lsObj.getLocalStorage('userBo')).objectId) {
                deleteClass = 'delete';
            } else {
                deleteClass = 'delete_end';
            }
        };
        return [
            '<a class="look" data-toggle="modal" href="javascript:void(0)" title="查看">',
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
                _this._recordId = row.objectId;
                historyDetailsObj.$historyDetailsFrame.modal(); //打开详情模态框
                historyDetailsObj.clearHistoryDetails();
                return false;
            },
            //删除计划
            'click .delete': function(e, value, row, index) {
                var defaultOptions = {
                    tip: '您是否删除该设施检查记录？',
                    name_title: '提示',
                    name_cancel: '取消',
                    name_confirm: '确定',
                    isCancelBtnShow: true,
                    callBack: function() {
                        historyDetailsObj.deleteHistory(row.objectId);
                    }
                };
                xxwsWindowObj.xxwsAlert(defaultOptions);
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
        "facilityCheckResult": "",
        "isLeakage": "",
        "facilityTypeCode": "",
        "facilityId": "",
        "startDate": "", //开始日期
        "endDate": "", //结束日期
        "keyword": "", //高级搜索关键词
        "pageNum": 1, //第几页
        "pageSize": 10 //每页记录数
    },
    querryObj: { //请求的搜索条件
        "facilityCheckResult": "",
        "isLeakage": "",
        "facilityTypeCode": "",
        "facilityId": "",
        "startDate": "", //开始日期
        "endDate": "", //结束日期
        "keyword": "", //巡线人，巡线编号
        "pageNum": 1, //第几页
        "pageSize": 10 //每页记录数
    },
    activeObj: { //高亮默认搜索条件，用于渲染页面
        "facilityCheckResult": "",
        "isLeakage": "",
        "facilityTypeCode": "",
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
        $('#tableInspect').bootstrapTable('removeAll'); //清空数据
        $('#tableInspect').bootstrapTable('refreshOptions', {
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
};
//导出文件
var exportFileObj = {
    $exportAll: $("#export_all"),
    $exportChoice: $("#export_choice"),
    expoerObj: {
        "facilityCheckResult": "",
        "isLeakage": "",
        "facilityTypeCode": "",
        "facilityId": "",
        "startDate": "", //开始日期
        "endDate": "", //结束日期
        "keyword": "", //高级搜索关键词
        "pageNum": 1, //第几页
        "pageSize": 10, //每页记录数
        "idList": []
    },
    init: function() {
        var _this = this;
        this.$exportAll.click(function() {
            _this.expoerObj.idList = [];
            _this.expoerCondition();
        });
        this.$exportChoice.click(function() {
            var selectionsData = $('#tableInspect').bootstrapTable('getSelections');
            _this.expoerObj.idList = [];
            if (selectionsData.length == 0) {
                xxwsWindowObj.xxwsAlert("请选择你需要导出的设施检查记录！");
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
            "url": '/cloudlink-inspection-event/facilityRecord/exportWord?token=' + lsObj.getLocalStorage('token'),
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

$(function() {
    inspectRecordObj.init();
    searchObj.init();
    exportFileObj.init();
});