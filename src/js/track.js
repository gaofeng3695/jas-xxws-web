var trackObj = {
    $items: $('.top .item'), //搜索条件dom
    $searchInput: $('#searchInput'), //搜索关键词dom
    $peopleInput: $('#peopleInput'),

    tracksIdsArr: [], //存放已被选中的轨迹ID
    aPeopleId: [],
    aPeopleName: [],
    sCurrentTrackId: '',
    defaultObj: { //默认搜索条件
        "status": "1,0", //1:有事件，0：无事件，1,0:全部
        "startDate": '', //开始日期
        "endDate": '', //结束日期
        "keyword": "", //巡线人，巡线编号
        "userIds": "", //逗号分隔的userId
        "pageNum": 1, //第几页
        "pageSize": 10 //每页记录数
    },
    querryObj: { //请求的搜索条件
        "status": "1,0", //1:有事件，0：无事件，1,0:全部
        "startDate": '', //开始日期
        "endDate": '', //结束日期
        "keyword": "", //巡线人，巡线编号
        "userIds": "", //逗号分隔的userId
        "pageNum": 1, //第几页
        "pageSize": 10 //每页记录数
    },
    activeObj: { //高亮默认搜索条件，用于渲染页面
        "status": "1,0",
        "date": "all"
    },
    init: function() {
        var that = this;
        ////console.log(that.$items);
        that.renderActive();
        that.bindEvent();
        that.bindDateDiyEvent();
        that.bindPeopleEvent();
        that.initTable();
        /*$('#gf_people').modal({});*/

    },
    renderActive: function(obj) {
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
            /*var key = $(this).parent()[0].dataset.class;*/
            var key = $(this).parent().attr("data-class");
            ////console.log(key)
            var value = $(this).attr("data-value");
            ////console.log(value)
            if (key === 'date') {
                that.setDate(value);
            } else {
                that.querryObj[key] = value;
            }
            var obj = {};
            obj[key] = value;
            //that.querryObj.keyword = that.$searchInput.val();
            that.renderActive(obj);
            that.refreshTable();

        });
        /* 搜索关键词 */
        $('#gf_Btn').click(function() {
            //that.querryObj.keyword = that.$searchInput.val();
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
            /*Object.assign(that.querryObj, that.defaultObj);*/
            $.extend(that.querryObj, that.defaultObj);
            $('#datetimeStart').val("");
            $('#datetimeEnd').val("");
            $("#diyDateBtn").removeClass("active");
            $('#searchInput').val('');
            that.initPeopleList();
            that.renderActive();
            that.refreshTable();
        });
        /* 导出数据 */
        $('#export_all').click(function() {
            that.requestOutput(0);
            if (zhugeSwitch == 1) {
                zhuge.track('导出巡检记录', {
                    'action': '导出全部'
                });
            }
        });
        $('#export_choice').click(function() {
            that.requestOutput(2);
            if (zhugeSwitch == 1) {
                zhuge.track('导出巡检记录', {
                    'action': '导出已选'
                });
            }
        });
        /* 模态框导出数据 */
        $('#modal_output').click(function() {
            that.requestOutput(1, that.sCurrentTrackId);
            if (zhugeSwitch == 1) {
                zhuge.track('导出巡检记录', {
                    'action': '模态框导出'
                });
            }
        });
    },
    bindPeopleEvent: function() {
        var that = this;
        /* 显示人员模态框 */
        that.$peopleInput.parent().click(function() {
            that.requestPeopleTree();
            $('#gf_people').modal({});
        });
        /* 确定选中的人员 */
        $('#btn_selectPeople').click(function() {
            that.setSelectedPerson();
            that.querryObj.userIds = that.aPeopleId.join(',');
            //console.log(that.querryObj);
            that.refreshTable();
        });
        /* 按人员搜索 */
        /*$('#serach_by_peo').click(function(){
            that.querryObj.userIds = that.$peopleInput.val();
            that.refreshTable();
        });*/
        /* 清空搜索条件 */
        $('#clear_people').click(function() {
            that.initPeopleList();
            that.refreshTable();
        });
    },
    bindDateDiyEvent: function() {
        var that = this;
        var $startInput = $("#datetimeStart");
        var $endInput = $("#datetimeEnd");
        $startInput.datetimepicker({
            format: 'yyyy-mm-dd',
            minView: 'month',
            language: 'zh-CN',
            autoclose: true,
            // startDate: new Date()
        }).on("click", function() {
            $startInput.datetimepicker("setEndDate", $endInput.val());
        });
        $endInput.datetimepicker({
            format: 'yyyy-mm-dd',
            minView: 'month',
            language: 'zh-CN',
            autoclose: true,
            // startDate: new Date()
        }).on("click", function() {
            $endInput.datetimepicker("setStartDate", $startInput.val());
        });

        $('#diyDateBtn').on('click', function() {
            var s = $startInput.val();
            var e = $endInput.val();
            if (!s) {
                xxwsWindowObj.xxwsAlert('请选择开始时间');
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
    setTracksIdsArr: function(row) { //传入单条obj，或多条obj的数组
        var that = this;
        if (row instanceof Array) {
            that.tracksIdsArr = row.map(function(item) {
                return item.objectId;
            })
        } else {
            var s = row.objectId;
            var index = that.tracksIdsArr.indexOf(s);
            if (index === -1) {
                that.tracksIdsArr.push(s);
            } else {
                that.tracksIdsArr.splice(index, 1);
            }
        }
    },
    refreshTable: function() {
        var that = this;
        that.querryObj.keyword = that.$searchInput.val();
        that.querryObj.pageNum = '1'; /**/
        $('#gf_table').bootstrapTable('refreshOptions', {
            pageNumber: +that.querryObj.pageNum,
            pageSize: +that.querryObj.pageSize,
            queryParams: function(params) {
                that.querryObj.pageSize = params.pageSize;
                that.querryObj.pageNum = params.pageNumber;
                return that.querryObj;
            }
        });
    },
    requestDetails: function(sId) {
        var that = this;
        that.initDetails();
        $('#gf_detail').modal({});
        $.ajax({
            type: "GET",
            url: "/cloudlink-inspection-event/inspectionRecord/web/v1/get",
            contentType: "application/json",
            data: {
                token: lsObj.getLocalStorage('token'),
                id: sId
            },
            dataType: "json",
            success: function(data) {
                ////console.log(data);
                if (data.success != 1) {
                    xxwsWindowObj.xxwsAlert('网络连接出错！code:-1')
                    return;
                }
                $('#gf_detail').modal({});

                that.renderDetails(data.rows[0]);
            },
            statusCode: {
                404: function() {
                    xxwsWindowObj.xxwsAlert('网络连接出错！code:404');
                }
            }
        });
    },
    renderDetails: function(obj) {
        var sDate = obj.beginTime.slice(0, 11);
        var aDate = sDate.split('-');
        var date = new Date(aDate[0], (+aDate[1]) - 1, aDate[2]);
        var cDay = date.getChinaDay();
        var sBeginTime = date.Format('yyyy年MM月dd日') + '&nbsp;&nbsp;&nbsp;' + '星期' + cDay;
        $('#gf_detail .beginTime_title').html(sBeginTime);
        $('#gf_detail .orgName').html(obj.orgName);
        $('#gf_detail .inspectorName').html(obj.inspectorName);
        $('#gf_detail .eventCount').html(obj.eventCount);
        $('#gf_detail .beginTime').html(obj.beginTime);
        $('#gf_detail .endTime').html(obj.endTime);
        $('#gf_detail .wholeTime').html(obj.wholeTime);
        $('#gf_detail .distance').html((obj.distance / 1000).toFixed(2));
        this.creteTable(obj);
        setTimeout(function() {
            $('#details_content').scrollTop(0)
        }, 1000)

        //$('#gf_detail .else_desc').html();

    },
    creteTable: function(obj) {
        $(".middle").html("");
        var html = '<tr>' +
            '<td class="key bg center">序号</td>' +
            '<td class="value bg center">巡线事件类型</td>' +
            '<td class="key bg noPadding center ">事件数量</td>' +
            ' <td class="value bg center">事件详细记录</td>' +
            '</tr>';
        if (obj.eventContent.length > 0) {
            obj.eventContent.forEach(function(item, index, arr) {
                html += '<tr>' +
                    '<td class="center">' + (index + 1) + '</td>' +
                    '<td  class="center">' + item.parentName + '</td>' +
                    ' <td class="center">' + item.eventCount + '</td>' +
                    '<td class="center">' + item.eventTypeDesc + '</td>' +
                    ' </tr>'
            });
        } else {
            html += '<tr>' +
                '<td class="center">1</td>' +
                '<td  class="center">无</td>' +
                ' <td class="center"></td>' +
                '<td class="center"></td>' +
                ' </tr>'
        }
        $(".middle").append(html);
    },
    initDetails: function() {
        var that = this;

        $('#gf_detail .beginTime_title').html('--');
        $('#gf_detail .orgName').html('--');
        $('#gf_detail .inspectorName').html('--');
        $('#gf_detail .eventCount').html('--');
        $('#gf_detail .beginTime').html('--');
        $('#gf_detail .endTime').html('--');
        $('#gf_detail .wholeTime').html('--');
        $('#gf_detail .distance').html('--');
        $('#gf_detail .happen').html('');
        $('#gf_detail .none').html('√');
        $('#gf_detail .event_desc').html('');
        //$('#gf_detail').modal('handleUpdate');
    },
    requestOutput: function(flag, sId) {
        //flag :
        // 0 : all
        // 1 : 单条
        // 2 ： 使用数组
        var that = this;
        var obj = {};
        /*Object.assign(obj, that.querryObj);*/
        $.extend(obj, that.querryObj);
        delete obj.pageSize;
        delete obj.pageNum;
        obj.ids = "";
        if (flag == 1) {
            obj.ids = sId;
        }
        if (flag == 2) {
            if (that.tracksIdsArr.length === 0) {
                xxwsWindowObj.xxwsAlert('请选择需要导出的记录！');
                return;
            }
            obj.ids = that.tracksIdsArr.join(',');
        }
        //console.log(obj);
        commonObj.downloadFile({
            url: "/cloudlink-inspection-event/inspectionRecord/exportWord?token=" + lsObj.getLocalStorage('token'),
            data: obj,
            method: 'post'
        });
    },
    requestPeopleTree: function() {
        var that = this;
        if (that.aAllPeople) {
            //that.renderPeopleTree(that.aAllPeople);
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
                //console.log(data);
                if (data.success != 1) {
                    xxwsWindowObj.xxwsAlert('网络连接出错！code:-1')
                    return;
                }
                that.aAllPeople = data.rows;
                that.renderPeopleTree(that.aAllPeople);
            },
            statusCode: {
                404: function() {
                    xxwsWindowObj.xxwsAlert('网络连接出错！code:404');
                }
            }
        });
    },
    initTable: function() {
        var that = this;
        $('#gf_table').bootstrapTable({
            url: "/cloudlink-inspection-event/inspectionRecord/web/v1/getPageList?token=" + lsObj.getLocalStorage('token'), //请求数据url
            method: 'post',
            toolbar: "#toolbar",
            toolbarAlign: "left",
            cache: false, //是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
            striped: true,
            showHeader: true,
            showRefresh: true,
            pagination: true, //分页
            sidePagination: 'server', //分页方式：client客户端分页，server服务端分页（*）
            pageNumber: that.querryObj.pageNum,
            pageSize: that.querryObj.pageSize,
            pageList: [10, 20, 50], //分页步进值
            search: false, //显示搜索框
            searchOnEnterKey: false,
            sortable: false,
            queryParamsType: '',
            queryParams: function(params) {
                that.querryObj.pageSize = params.pageSize;
                that.querryObj.pageNum = params.pageNumber;
                ////console.log(that.querryObj)
                return that.querryObj;
            },
            /*responseHandler : function(res){
                //console.log(res);
            },*/
            //表格的列
            columns: [{
                    field: 'state', //域值
                    checkbox: true, //复选框
                    align: 'center',
                    valign: 'middle',
                    visible: true, //false表示不显示
                    sortable: false, //启用排序
                    width: '5%',
                }, {
                    field: 'name', //域值
                    title: '巡线编号', //标题
                    align: 'center',
                    visible: true, //false表示不显示
                    sortable: true, //启用排序
                    width: '15%',
                    editable: true,
                }, {
                    field: 'beginTime', //域值
                    title: '开始时间', //内容
                    align: 'center',
                    visible: true, //false表示不显示
                    sortable: true, //启用排序
                    width: '15%',
                    editable: true,
                }, {
                    field: 'endTime', //域值
                    title: '结束时间', //内容
                    align: 'center',
                    visible: true, //false表示不显示
                    sortable: true, //启用排序
                    width: '15%',
                    editable: true,
                }, {
                    field: 'inspectorName', //域值
                    title: '巡线人', //内容
                    align: 'center',
                    visible: true, //false表示不显示
                    sortable: true, //启用排序
                    width: '10%',
                    editable: true,
                }, {
                    field: 'wholeTime', //域值
                    title: '巡线总时长', //内容
                    align: 'center',
                    visible: true, //false表示不显示
                    sortable: true, //启用排序
                    width: '10%',
                    editable: true,
                }, {
                    field: 'distance', //域值
                    title: '巡线里程（公里）', //内容
                    align: 'center',
                    visible: true, //false表示不显示
                    sortable: true, //启用排序
                    width: '10%',
                    editable: true,
                    formatter: function(value, row, index) {
                        return (value / 1000).toFixed(2);
                    }
                },
                {
                    field: 'eventCount', //域值
                    title: '事件上报', //内容
                    align: 'center',
                    visible: true, //false表示不显示
                    sortable: true, //启用排序
                    width: '10%',
                    editable: true,
                },
                {
                    field: 'operate',
                    title: '操作',
                    align: 'center',
                    events: that.tabelEventObj(),
                    width: '10%',
                    formatter: that.table_operateFormatter
                }
            ]
        });
        that.table_bindEvent();
    },
    tabelEventObj: function() {
        var that = this;
        return {
            //查看详情
            'click .see': function(e, value, row, index) {
                ////console.log(row.objectId)
                //$(this).css("color", "red");
                that.requestDetails(row.objectId);
                that.sCurrentTrackId = row.objectId;
                //that.showModal();
                return false;
            },
            //导出word
            'click .out': function(e, value, row, index) {
                ////console.log(row.objectId)
                that.requestOutput(1, row.objectId);
                return false;
            }
        }
    },
    table_operateFormatter: function(value, row, index) {
        return [
            '<a class="see" href="javascript:void(0)" title="查看">',
            '<i style="margin: 0 5px;" ></i>',
            '</a>',
            '<a class="out" href="javascript:void(0)" title="导出">',
            '<i style="margin: 0 5px;"></i>',
            '</a>',
        ].join('');
    },
    table_bindEvent: function() {
        var that = this;
        $('#gf_table')
            .on('check.bs.table', function(e, row) { //单选一行
                that.setTracksIdsArr(row);
            })
            .on('uncheck.bs.table', function(e, row) { //取消单选一行
                that.setTracksIdsArr(row);
            })
            .on('check-all.bs.table', function(e, rows) { //全选
                that.setTracksIdsArr(rows);
            })
            .on('uncheck-all.bs.table', function(e, rows) { //取消全选
                that.tracksIdsArr = [];
            })
            .on('post-body.bs.table', function() { //取消全选
                that.tracksIdsArr = [];
            })
    },
    renderPeopleTree: function(data) {
        var that = this;
        //data = '';
        ////console.log(data)
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
    setSelectedPerson: function() {
        var that = this;
        that.aPeopleId = [];
        that.aPeopleName = [];
        var arr = that.zTree.getCheckedNodes(true);
        arr.forEach(function(item, index) {
            if (item.isParent) {
                return;
            }
            that.aPeopleId.push(item.id);
            that.aPeopleName.push(item.treenodename);
        })
        that.$peopleInput.val(that.aPeopleName.join('，'));
        $('#gf_people').modal('hide');
        //console.log(that.aPeopleId);
        //console.log(that.aPeopleName);
    },
    initPeopleList: function() {
        var that = this;
        that.aPeopleId = [];
        that.aPeopleName = [];
        that.$peopleInput.val('');
        that.querryObj.userIds = '';
        if (that.zTree) {
            that.zTree.checkAllNodes(false);
        }
    }
};
trackObj.init();

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