var searchObj = { //维修维护工单列表高级搜索
    $items: $('.top .item'), //搜索条件dom
    $searchInput: $('#searchInput'), //搜索关键词dom
    $startDate: $("#datetimeStart"),
    $endDate: $("#datetimeEnd"),
    defaultObj: { //默认搜索条件
        "status": "", //1 待维修、2：已完成 为空代表查询全部
        "startDate": "", //开始日期
        "endDate": "", //结束日期
        "keywordWeb": "", //高级搜索关键词
        "originTypeCode": "",
        "ids": [],
        "pageNum": 1, //第几页
        "pageSize": 10 //每页记录数
    },
    querryObj: { //请求的搜索条件
        "status": "", //1 待维修、2：已完成 为空代表查询全部
        "startDate": "", //开始日期
        "endDate": "", //结束日期
        "keywordWeb": "", //高级搜索关键词
        "originTypeCode": "",
        "ids": [],
        "pageNum": 1, //第几页
        "pageSize": 10 //每页记录数
    },
    activeObj: { //高亮默认搜索条件，用于渲染页面
        "status": "",
        "originTypeCode": "",
        "date": "all",
    },
    init: function() {
        this.bindEvent();
        this.renderActive();
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
            case 'week':
                var date = new Date();
                that.querryObj.startDate = date.Format('yyyy-MM-dd');
                that.querryObj.endDate = that.GetDateStr(7);
                break;
            case 'harfMonth':
                var date = new Date();
                that.querryObj.startDate = date.Format('yyyy-MM-dd');
                that.querryObj.endDate = that.GetDateStr(15);
                break;
            case 'month':
                var date = new Date();
                that.querryObj.startDate = date.Format('yyyy-MM-dd');
                that.querryObj.endDate = that.GetDateStr(30);
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
        $('#workList').bootstrapTable('removeAll'); //清空数据
        $('#workList').bootstrapTable('refreshOptions', {
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

        $('.time-limit').datetimepicker({
            format: 'yyyy-mm-dd',
            minView: 'month',
            language: 'zh-CN',
            autoclose: true,
            startDate: new Date()
        });
    },
    GetDateStr: function(AddDayCount) {
        var dd = new Date();
        dd.setDate(dd.getDate() + AddDayCount); //获取AddDayCount天后的日期 
        var y = dd.getFullYear();
        var m = dd.getMonth() + 1; //获取当前月份的日期 
        var d = dd.getDate();
        if (m < 10) {
            m = "0" + m;
        }
        if (d < 10) {
            d = "0" + d;
        }
        return y + "-" + m + "-" + d;
    }
};

var addressSearchObj = { //入户整改 用户地址搜索
    $items: $('.ChoiceTop .item'), //搜索条件dom
    $addressSearchInput: $('#addressSearchInput'), //搜索关键词dom
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
            that.querryObj.regionId = $(this).val();
            that.querryObj.residential = '';
            that.refreshTable();
        });
        /* 搜索关键词 */
        $('#address_gf_Btn').click(function() {
            var s = $(this).parent().find('input').val().trim();
            that.querryObj.keyword = s;
            that.refreshTable();
        });

        /* keyup事件 */
        that.$addressSearchInput.keypress(function(e) {
            if (e && e.keyCode === 13) { // enter 键
                that.refreshTable();
            }
        });
        /* 清空搜索条件 */
        $('#address_reset_Btn').click(function() {
            //请求数据还原到初始话
            that.emptySelect();
            // $.extend(that.querryObj, that.defaultObj);
            // $("select[name=areaList]").val("");
            // that.$addressSearchInput.val("");
            // that.renderActive();
            that.refreshTable();
        });
    },
    refreshTable: function() {
        var that = this;
        that.querryObj.keyword = that.$addressSearchInput.val().trim();
        that.$addressSearchInput.val(that.querryObj.keyword);
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
    emptySelect: function() { //清空条件
        $.extend(this.querryObj, this.defaultObj);
        $("select[name=areaList]").val("");
        this.$addressSearchInput.val("");
        this.renderActive();
    }
};

var facilitySearchObj = { //管网设施 设施选择搜索
    $items: $('.facilityTop .item'), //搜索条件dom
    $facilitySearchInput: $('#facilitySearchInput'), //搜索关键词dom
    defaultObj: { //默认搜索条件
        "pipelineTypeCode": "",
        "facilityTypeCodeList": [],
        "keyword": "",
        "pageNum": 1, //第几页
        "pageSize": 10, //每页记录数
    },
    querryObj: { //请求的搜索条件
        "pipelineTypeCode": "",
        "facilityTypeCodeList": [],
        "keyword": "",
        "pageNum": 1, //第几页
        "pageSize": 10, //每页记录数
    },
    activeObj: { //高亮默认搜索条件，用于渲染页面
        "pipelineTypeCode": "",
        "facilityTypeCodeList": "",
    },
    init: function() {
        this.renderActive(); //初始化显示被选中
        this.bindEvent(); //监听事件
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
            if (key == "facilityTypeCodeList") {
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
        });
        /* 搜索关键词 */
        $('#facility_gf_Btn').click(function() {
            var s = $(this).parent().find('input').val().trim();
            that.querryObj.keyword = s;
            that.refreshTable();
        });

        /* keyup事件 */
        that.$facilitySearchInput.keypress(function(e) {
            if (e && e.keyCode === 13) { // enter 键
                that.refreshTable();
            }
        });
        /* 清空搜索条件 */
        $('#facility_reset_Btn').click(function() {
            //请求数据还原到初始话
            that.emptySelect();
            that.refreshTable();
        });
    },
    refreshTable: function() {
        var that = this;
        that.querryObj.keyword = that.$facilitySearchInput.val().trim();
        that.$facilitySearchInput.val(that.querryObj.keyword);
        that.querryObj.pageNum = '1';
        $('#facilityList').bootstrapTable('removeAll'); //清空数据
        $('#facilityList').bootstrapTable('refreshOptions', {
            pageNumber: +that.querryObj.pageNum,
            pageSize: +that.querryObj.pageSize,
            queryParams: function(params) {
                that.querryObj.pageSize = params.pageSize;
                that.querryObj.pageNum = params.pageNumber;
                return that.querryObj;
            }
        });
    },
    emptySelect: function() { //清空条件
        $.extend(this.querryObj, this.defaultObj);
        this.$facilitySearchInput.val("");
        this.renderActive();
    }
};

var eventSearchObj = { //巡检事件 事件选择搜索
    queryObj: { //对象，必填，传输给后台的对象，也会用来初始化html视图展示，高亮显示
        keyword: '',
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
                    that.foramtEventType(data.rows);
                    var obj = that.createSearchTemplateObj(that.aActiveData, that.hisData);
                    that.searchInst = createSearhTemplate(obj);
                    if (that.hisData.length > 0) {
                        that.bindEvent();
                        that.renderEventTypeTree(that.hisData);
                    }
                } else {
                    xxwsWindowObj.xxwsAlert("获取事件类型失败！");
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
        that.hisData = aHisData;
        that.aActiveData = aActiveData.filter(function(item) {
            return item;
        });
    },
    _initSearcEventType: function(aActiveData, hisData) { //返回组装后的事件类型
        var that = this;
        var aItems = [{
            name: '全部',
            value: '',
        }].concat(aActiveData);
        aItems.push(
            hisData.length > 0 && ['<span class="fl history">',
                '<span class="fl itemHisData">历史类型：</span>',
                '<span class="peo_wrapper" data-class="userIds">',
                '<span class="peo_border">',
                '<input id="hisTypeInput" class="peo_selected" readonly>',
                '<span class="mybtn"></span>',
                '</span>',
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
                widthRate: [0, 12, 0], //必填 宽度比 数值1-12,总和为12，可参考bootstrap的栅格系统
                data: [ //必填 数组，数组项：对象，'date', html字符串模板
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
        $('#eventList').bootstrapTable('refreshOptions', {
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

var userTable = { //维修维护以及用户地址 设施选择 事件选择 维修人列表页面的展示相关JS
    _flag: true,
    _againArea: null,
    _selectPeople: [],
    _isModify: null,
    init: function() {
        var that = this;
        that.getTable();
        that.getAdress();
        that.getFacility();
        that.getEvent();
        $(".selectUserBtn").click(function() {
            that.getSelectAdress();
        });
        $(".selectPeopleBtn").click(function() {
            that.getSelectPeople();
        });
        $(".selectFacilityBtn").click(function() {
            that.getSelectFacility();
        });
        $(".selectEventBtn").click(function() {
            that.getSelectEvent();
        });
    },
    getTable: function() { //table 数据
        var that = this;
        $('#workList').bootstrapTable({
            url: "/cloudlink-inspection-event/commonData/maintenanceWork/getPageList?token=" + lsObj.getLocalStorage('token'), //请求数据url
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
            onLoadSuccess: function(data) {},
            onDblClickRow: function(row) {
                repairObj.openDetailsFrame(row.objectId, row.originTypeCode); //打开详情模态框
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
                field: 'maintenanceCode', //域值
                title: '维修编号', //内容
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '12%',
                editable: true,
            }, {
                field: 'originTypeName', //域值
                title: '维修来源', //内容
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '8%',
                editable: true,
            }, {
                field: 'status', //域值
                title: '维修状态', //内容
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '8%',
                editable: true,
                formatter: function(value, row, index) {
                    if (value == 1) {
                        var val = "待维修"
                        return "<span class='atatus_" + (parseInt(row.status) + 1) + "'>" + val + "</span>";
                    } else if (value == 2) {
                        var val = "已完成"
                        return "<span class='atatus_" + (parseInt(row.status) + 1) + "'>" + val + "</span>";
                    } else {
                        return "";
                    }
                }
            }, {
                field: 'remediationTime', //域值
                title: '维修期限', //内容
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '10%',
            }, {
                field: 'relationshipPersonNames', //域值
                title: '维修人', //内容
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '15%',
                editable: true,
                formatter: function(value, row, index) {
                    return "<span class='atatus_people' title='" + value + "'>" + value + "</span>";
                },
            }, {
                field: 'createUserName', //域值
                title: '创建人', //内容
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '8%',
            }, {
                field: 'address', //域值
                title: '地址', //内容
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '22%',
                editable: true,
            }, {
                field: 'operate',
                title: '操作',
                align: 'center',
                events: that.tableEvent(),
                width: '13%',
                formatter: that.tableOperation,
            }]
        });
    },
    tableOperation: function(value, row, index) { //操作按钮
        var modifyClass = null;
        if (row.status == 2) {
            modifyClass = 'modify_end';
        } else {
            modifyClass = 'modify';
        }
        return [
            '<a class="look" href="javascript:void(0)" title="查看">',
            '<i></i>',
            '</a>',
            '<a class="' + modifyClass + '" href="javascript:void(0)" title="修改">',
            '<i></i>',
            '</a>',
            '<a class="export" href="javascript:void(0)" title="导出详情">',
            '<i></i>',
            '</a>',
        ].join('');
    },
    tableEvent: function() { //按钮相关的事件
        var that = this;
        return {
            //查看工单
            'click .look': function(e, value, row, index) {
                repairObj.openDetailsFrame(row.objectId, row.originTypeCode);
            },
            //修改工单
            'click .modify': function(e, value, row, index) {
                repairObj.openDetailsFrame(row.objectId, row.originTypeCode, true);
            },
            //导出工单
            'click .export': function(e, value, row, index) {
                exportObj.exportDetails(row.objectId);
            }
        }
    },
    renderPeopleTree: function(data) { //遍历tree
        var that = this;
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
        that.setSelectPeople(); //再次进来 显示选中状态
    },
    requestPeopleTree: function() { //请求人员信息
        var that = this;
        if (that.aAllPeople) {
            that.renderPeopleTree(that.aAllPeople);
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
    setSelectPeople: function() { //设置被选中的人员
        var that = this;
        if (that._selectPeople.length > 0) {
            for (var i = 0; i < that._selectPeople.length; i++) {
                var nodes = that.zTree.getNodesByParam("id", that._selectPeople[i].relationshipPersonId, null); //根据id查询节点对象数组
                that.zTree.checkNode(nodes[0], true, true);
            }
        }
    },
    getSelectPeople: function() { //获取选中的人员
        var that = this;
        that.aPeopleName = [];
        that._selectPeople = []; //人员数组
        var userObj = null;
        var arr = that.zTree.getCheckedNodes(true);
        arr.forEach(function(item, index) {
            if (item.isParent) {
                return;
            }
            userObj = {
                relationshipPersonId: item.id,
                relationshipPersonName: item.treenodename
            }
            that._selectPeople.push(userObj);
            that.aPeopleName.push(item.treenodename);
        });
        if (that._isModify) {
            detailsV.getSelectPerson(that._selectPeople, that.aPeopleName.join('，'));
        } else {
            createmaintenance.selectPeople = that.aPeopleName.join('，');
        }
        $('#chooseRepairer').modal('hide');
    },
    getAdress: function() { //获取用户地址列表
        $('#userList').bootstrapTable({
            url: "/cloudlink-inspection-event/commonData/userArchive/getPageList?token=" + lsObj.getLocalStorage('token'), //请求数据url
            method: 'post',
            cache: false, //是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
            showHeader: true,
            showRefresh: false,
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
                addressSearchObj.defaultObj.pageSize = params.pageSize;
                addressSearchObj.defaultObj.pageNum = params.pageNumber;
                return addressSearchObj.defaultObj;
            },
            onClickRow: function(row, index) {
                $('#userList').bootstrapTable('check', index.index());
            },
            //表格的列
            columns: [{
                field: 'state', //域值
                radio: true, //单选框
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '6%',
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
                width: '10%',
                editable: true,
            }, {
                field: 'userStatusName', //域值
                title: '用户状态', //内容
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '10%',
            }, {
                field: 'regionName', //域值
                title: '所属片区', //内容
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '12%',
                editable: true,
            }, {
                field: 'residential', //域值
                title: '小区/院/村', //内容
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '12%',
            }, {
                field: 'address', //域值
                title: '详细地址', //内容
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '30%',
                editable: true,
            }]
        });
    },
    getAreaList: function() { //获取片区下拉列表   
        var that = this;
        if (that._againArea) {
            return;
        } else {
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
                        that._againArea = true;
                        var areaList = data.rows;
                        var txt = null;
                        txt = '<option value="">全部（片区）</option>';
                        for (var i = 0; i < areaList.length; i++) {
                            txt += '<option value="' + areaList[i].objectId + '">' + areaList[i].regionName + '</option>';
                        };
                        txt += '<option value="none">无</option>';
                        $("select[name=areaList]").html(txt);
                    }
                },
            });
        }
    },
    getSelectAdress: function() { //获取当前选择的用户地址的Id
        var addressId = $('#userList').bootstrapTable('getSelections');
        if (addressId.length > 0) {
            createmaintenance.determine(addressId[0].objectId, addressId[0].address, addressId[0].userFileName, addressId[0].contactPhone);
        }
        $("#choiceUserFrame").modal('hide');
    },
    getFacility: function() { //获取设施设施
        $('#facilityList').bootstrapTable({
            url: "/cloudlink-inspection-event/facility/getPageList?token=" + lsObj.getLocalStorage('token'), //请求数据url
            method: 'post',
            cache: false, //是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
            showHeader: true,
            showRefresh: false,
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
                facilitySearchObj.defaultObj.pageSize = params.pageSize;
                facilitySearchObj.defaultObj.pageNum = params.pageNumber;
                return facilitySearchObj.defaultObj;
            },
            onClickRow: function(row, index) {
                $('#facilityList').bootstrapTable('check', index.index());
            },
            //表格的列
            columns: [{
                field: 'state', //域值
                radio: true, //单选框
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '6%',
            }, {
                field: 'facilityName', //域值
                title: '设施名称', //内容
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '12%',
                editable: true,
            }, {
                field: 'facilityCode', //域值
                title: '设施编号', //内容
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
                width: '12%',
                editable: true,
            }, {
                field: 'pipelineTypeName', //域值
                title: '管网类型', //内容
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '12%',
                editable: true,
            }, {
                field: 'facilityStatusName', //域值
                title: '设施状态', //内容
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '12%',
            }, {
                field: 'address', //域值
                title: '事件地点', //内容
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '34%',
                editable: true,
            }]
        });
    },
    getSelectFacility: function() { //获取当前选择的设施的Id
        var facilityId = $('#facilityList').bootstrapTable('getSelections');
        if (facilityId.length > 0) {
            createmaintenance.determineFac(facilityId[0].objectId, facilityId[0].address, facilityId[0].facilityName, facilityId[0].facilityCode, facilityId[0].facilityTypeName);
        }
        $("#choiceFacFrame").modal('hide');
    },
    getEvent: function() { //获取事件
        $('#eventList').bootstrapTable({
            url: "/cloudlink-inspection-event/eventInfo/web/v1/getPageList?token=" + lsObj.getLocalStorage('token'), //请求数据url
            method: 'post',
            cache: false, //是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
            showHeader: true,
            showRefresh: false,
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
                eventSearchObj.queryObj.pageSize = params.pageSize;
                eventSearchObj.queryObj.pageNum = params.pageNumber;
                return eventSearchObj.queryObj;
            },
            onClickRow: function(row, index) {
                $('#eventList').bootstrapTable('check', index.index());
            },
            //表格的列
            columns: [{
                field: 'state', //域值
                radio: true, //单选框
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '6%',
            }, {
                field: 'eventCode', //域值
                title: '事件编号', //内容
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '14%',
                editable: true,
            }, {
                field: 'occurrenceTime', //域值
                title: '事件发生时间', //内容
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
                width: '20%',
                editable: true,
            }, {
                field: 'address', //域值
                title: '事件地点', //内容
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '27%',
                editable: true,
            }, {
                field: 'inspectorName', //域值
                title: '上报人', //内容
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '18%',
                editable: true,
            }]
        });
    },
    getSelectEvent: function() { //获取当前选择的事件的Id
        var eventId = $('#eventList').bootstrapTable('getSelections');
        if (eventId.length > 0) {
            createmaintenance.determineEvent(eventId[0].objectId, eventId[0].address, eventId[0].eventCode, eventId[0].fullTypeName);
        }
        $("#choiceEventFrame").modal('hide');
    },
    creatmtc: function(num) { //新建维修类型的判断
        var that = this;
        //打开模态框 清除之前选中的维修人员
        that._selectPeople.length = [];
        //清除新建维修模态框开始
        createmaintenance.originTypeCode = "";
        createmaintenance.originTypeName = "";
        createmaintenance.reason = "";
        createmaintenance.remediationTime = "";
        createmaintenance.selectPeople = "";
        createmaintenance.repairObj.maintenanceName = "";
        createmaintenance.repairObj.typeCode = "";
        createmaintenance.repairObj.typeName = "";
        createmaintenance.repairObj.address = "";
        createmaintenance.repairObj.buzId = "";
        createmaintenance.repairObj.contactPhone = "";
        $(".textarea_text span.text_num").text("(200字)"); //维修原因默认显示字数恢复到200
        //清除新建维修模态框结束
        $('#maintenanceAdd').modal();
        createmaintenance.originTypeCode = num;
        if (num == 'MO_01') {
            createmaintenance.originTypeName = "入户整改";
            createmaintenance.is_show = "newHouseHold";
            if (zhugeSwitch == 1) {
                zhuge.track('点击新建入户整改维修工单');
            }
        } else if (num == 'MO_02') {
            createmaintenance.originTypeName = "管网设施";
            createmaintenance.is_show = "newFacility";
            if (zhugeSwitch == 1) {
                zhuge.track('点击新建管网设施维修工单');
            }
        } else if (num == 'MO_03') {
            createmaintenance.originTypeName = "巡检事件";
            createmaintenance.is_show = "newEvent";
            if (zhugeSwitch == 1) {
                zhuge.track('点击新建巡检事件维修工单');
            }
        } else {
            createmaintenance.originTypeName = "其他维修";
            createmaintenance.is_show = "newOther";
            if (zhugeSwitch == 1) {
                zhuge.track('点击新建其他维修工单');
            }
        }
    }
};

//========组件相关js开始============//
var newHouseHold = { //新建入户整改维修组件相关JS
    props: ["repairdate"],
    template: '<div><div class="householdList">' +
        '<div class="householdHalf">' +
        '<div class="householdHalfLeft changeText">用户名称</div>' +
        '<div class="householdHalfRight changeLogo">' +
        '<input type="text" readonly="readonly" onfocus="this.blur()" name="maintenanceName" v-model="maintenanceName" class="form-control" />' +
        '</div>' +
        '</div>' +
        '<div class="householdHalf">' +
        '<div class="householdHalfLeft changePhone">联系方式</div>' +
        '<div class="householdHalfRight changeNumber">' +
        '<input type="text" name="contactPhone" readonly="readonly" onfocus="this.blur()" v-model="contactPhone" class="form-control" />' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="householdList">' +
        '<div class="householdHalfLeft changeAdress"><i>*</i>用户地址</div>' +
        '<div class="householdHalfRight changeAdressLogo has-feedback" @click="useradress">' +
        '<input type="text" class="form-control hand" readonly="readonly" onfocus="this.blur()" v-model="address" name="address" /><span class="adressLogo"></span>' +
        '</div>' +
        '</div></div>',
    data: function() {
        return this.repairdate;
    },
    watch: {

    },
    methods: {
        useradress: function() {
            userTable.getAreaList();
            addressSearchObj.emptySelect();
            addressSearchObj.refreshTable();
            $("#choiceUserFrame").modal();
        },
    }
};
var newFacility = { //新建管网设施维修组件相关JS
    props: ["repairdate"],
    template: '<div><div class="householdList">' +
        '<div class="householdHalf">' +
        '<div class="householdHalfLeft changeText"><i>*</i>设施选择</div>' +
        '<div class="householdHalfRight changeLogo has-feedback" @click="choosefac">' +
        '<input type="text" readonly="readonly" onfocus="this.blur()" name="maintenanceName" v-model="maintenanceName" class="form-control hand" /><span class="facchooseLogo"></span>' +
        '</div>' +
        '</div>' +
        '<div class="householdHalf">' +
        '<div class="householdHalfLeft changePhone">设施类型</div>' +
        '<div class="householdHalfRight changeNumber">' +
        '<input type="text" name="typeName" readonly="readonly" onfocus="this.blur()" v-model="typeName" class="form-control" />' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="householdList">' +
        '<div class="householdHalfLeft changeAdress">设施位置</div>' +
        '<div class="householdHalfRight changeAdressLogo">' +
        '<input type="text" class="form-control" readonly="readonly" onfocus="this.blur()" v-model="address" name="address" />' +
        '</div>' +
        '</div></div>',
    data: function() {
        return this.repairdate;
    },
    methods: {
        choosefac: function() { //新建管网设施维修里 设施选择事件
            facilitySearchObj.emptySelect();
            facilitySearchObj.refreshTable();
            $("#choiceFacFrame").modal();
        },
    }
};
var newEvent = { //新建巡检事件维修组件相关JS
    props: ["repairdate"],
    template: '<div><div class="householdList">' +
        '<div class="householdHalf">' +
        '<div class="householdHalfLeft changeText"><i>*</i>事件选择</div>' +
        '<div class="householdHalfRight changeLogo has-feedback" @click="chooseevent">' +
        '<input type="text" readonly="readonly" onfocus="this.blur()" name="facChoose" v-model="maintenanceName" class="form-control hand" /><span class="eventLogo"></span>' +
        '</div>' +
        '</div>' +
        '<div class="householdHalf">' +
        '<div class="householdHalfLeft changePhone">事件类型</div>' +
        '<div class="householdHalfRight changeNumber">' +
        '<input type="text" name="typeCode" v-model="typeName" readonly="readonly" onfocus="this.blur()" class="form-control" />' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="householdList">' +
        '<div class="householdHalfLeft changeAdress">事件位置</div>' +
        '<div class="householdHalfRight changeAdressLogo">' +
        '<input type="text" class="form-control" v-model="address" readonly="readonly" onfocus="this.blur()" name="address" />' +
        '</div>' +
        '</div></div>',
    data: function() {
        return this.repairdate;
    },
    methods: {
        chooseevent: function() { //新建巡检事件维修里 联系人事件
            // userTable.getEvent();
            $(".gf_reset_Btn").trigger("click");
            // eventSearchObj._clearHisActive();
            // eventSearchObj.refreshTable();
            $("#choiceEventFrame").modal();
        },
    }
};
var newOther = { //新建其他维修组件相关JS
    props: ["repairdate"],
    template: '<div><div class="householdList">' +
        '<div class="householdHalf">' +
        '<div class="householdHalfLeft changeText"><i>*</i>联系人</div>' +
        '<div class="householdHalfRight changeLogo">' +
        '<input type="text" name="contact" v-model="maintenanceName" class="form-control" />' +
        '</div>' +
        '</div>' +
        '<div class="householdHalf">' +
        '<div class="householdHalfLeft changePhone"><i>*</i>联系电话</div>' +
        '<div class="householdHalfRight changeNumber">' +
        '<input type="text" name="contactPhone" v-model="contactPhone" class="form-control" />' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="householdList">' +
        '<div class="householdHalfLeft changeAdress"><i>*</i>地址</div>' +
        '<div class="householdHalfRight changeAdressLogo">' +
        '<input type="text" class="form-control" v-model="address" name="address" />' +
        '</div>' +
        '</div></div>',
    data: function() {
        return this.repairdate;
    },
}
var createmaintenance = new Vue({ //vue 实例化操作
    el: '#maintenanceAdd',
    data: {
        is_show: "newHouseHold",
        originTypeCode: "",
        originTypeName: "",
        name: JSON.parse(lsObj.getLocalStorage('userBo')).userName,
        reason: "", //维修原因（入户整改）、维修原因（管道设施）、维修原因（巡检事件）、维修原因（其他维修）
        remediationTime: "", //维修期限
        selectPeople: "",
        repairObj: {
            "maintenanceName": "", //用户名称（入户整改）、设施名称（管道设施）、事件编号（巡检事件）、联系人（其他维修）
            "typeCode": "", //设施类型（管道设施）、事件类型（巡检事件）
            "typeName": "", //设施类型（管道设施）、事件类型（巡检事件）
            "address": "", //用户地址（入户整改）、设施位置（管道设施）、事件地点（巡检事件）、地址（其他维修）
            "buzId": "", //用户档案ID（入户整改）、管道设施ID（管道设施）、事件ID（巡检事件）
            "contactPhone": ""
        },
    },
    components: {
        newHouseHold: newHouseHold,
        newFacility: newFacility,
        newEvent: newEvent,
        newOther: newOther,
    },
    methods: {
        chooserepairer: function(boolean) { //新建维修里 维修人事件
            $("#chooseRepairer").modal();
            userTable._isModify = boolean;
            userTable.requestPeopleTree();
        },
        determine: function(id, address, name, tel) {
            var that = this;
            Vue.set(that.repairObj, 'maintenanceName', name);
            Vue.set(that.repairObj, 'buzId', id);
            Vue.set(that.repairObj, 'contactPhone', tel);
            Vue.set(that.repairObj, 'address', address);
        },
        determineFac: function(id, address, name, typeCode, typeName) {
            var that = this;
            Vue.set(that.repairObj, 'maintenanceName', name);
            Vue.set(that.repairObj, 'buzId', id);
            Vue.set(that.repairObj, 'typeCode', typeCode);
            Vue.set(that.repairObj, 'typeName', typeName);
            Vue.set(that.repairObj, 'address', address);
        },
        determineEvent: function(id, address, name, typeName) {
            var that = this;
            Vue.set(that.repairObj, 'maintenanceName', name);
            Vue.set(that.repairObj, 'buzId', id);
            Vue.set(that.repairObj, 'typeName', typeName);
            Vue.set(that.repairObj, 'address', address);
        },
        judge: function() { //新建维修 验证判断
            //验证用户名称 设施选择 时间选择 联系人 地址是否为空
            var numReg = /^((1\d{10})|(([0-9]{3,4}-)?[0-9]{7,8}))$/;
            if (this.is_show == "newHouseHold") {
                if (this.repairObj.address == "" || this.repairObj.address == "null") {
                    xxwsWindowObj.xxwsAlert("请选择用户地址");
                    return false;
                }
            } else if (this.is_show == "newFacility") {
                if (this.repairObj.maintenanceName == "" || this.repairObj.maintenanceName == "null") {
                    xxwsWindowObj.xxwsAlert("请选择设施");
                    return false;
                }
            } else if (this.is_show == "newEvent") {
                if (this.repairObj.maintenanceName == "" || this.repairObj.maintenanceName == "null") {
                    xxwsWindowObj.xxwsAlert("请选择事件");
                    return false;
                }
            } else {
                if ((this.repairObj.maintenanceName).trim() == "" || (this.repairObj.maintenanceName).trim() == "null") {
                    xxwsWindowObj.xxwsAlert("请填写联系人");
                    return false;
                } else if ((this.repairObj.maintenanceName).trim().length > 20) {
                    xxwsWindowObj.xxwsAlert("联系人不能超过20个字符");
                    return false;
                } else if ((this.repairObj.contactPhone).trim() == "" || (this.repairObj.contactPhone).trim() == "null") {
                    xxwsWindowObj.xxwsAlert("请填写联系电话");
                    return false;
                } else if (!numReg.test((this.repairObj.contactPhone).trim())) {
                    xxwsWindowObj.xxwsAlert("联系电话格式填写错误");
                    return false;
                } else if ((this.repairObj.address).trim() == "" || (this.repairObj.address).trim() == "null") {
                    xxwsWindowObj.xxwsAlert("请填写地址");
                    return false;
                } else if ((this.repairObj.address).trim().length > 50) {
                    xxwsWindowObj.xxwsAlert("地址不能超过50个字符");
                    return false;
                }
            }
            //验证 维修人 维修期限 维修原因是否为空
            if (this.selectPeople == "" || this.selectPeople == "null") {
                xxwsWindowObj.xxwsAlert("请选择维修人");
                return false;
            } else if (this.remediationTime == "" || this.remediationTime == "null") {
                xxwsWindowObj.xxwsAlert("请选择维修期限");
                return false;
            } else if ((this.reason).trim() == "" || (this.reason).trim() == "null") {
                xxwsWindowObj.xxwsAlert("请填写维修原因")
                return false;
            } else {
                this.creatsubmit();
            }
        },
        creatsubmit: function() { //新建用户事件
            var that = this;
            var dynamicObj = that.repairObj;
            //清除空格
            dynamicObj.maintenanceName = (dynamicObj.maintenanceName).trim();
            dynamicObj.contactPhone = (dynamicObj.contactPhone).trim();
            dynamicObj.address = (dynamicObj.address).trim();
            that.reason = (that.reason).trim();
            $(".creatSubmit").attr("disabled", "disabled");
            var obj = {
                originTypeCode: that.originTypeCode,
                originTypeName: that.originTypeName,
                remediationTime: that.remediationTime,
                reason: that.reason,
                maintenanceCode: (new Date()).Format("yyyyMMddHHmmssS"),
                relationshipPerson: userTable._selectPeople
            };
            $.extend(obj, dynamicObj, true);
            $.ajax({
                type: "POST",
                url: "/cloudlink-inspection-event/commonData/maintenanceWork/save?token=" + lsObj.getLocalStorage('token'),
                contentType: "application/json",
                data: JSON.stringify(obj),
                dataType: "json",
                success: function(data) {
                    if (data.success == 1) {
                        var defaultOptions = {
                            tip: '新建维修成功',
                            name_title: '提示',
                            name_cancel: '取消',
                            name_confirm: '确定',
                            isCancelBtnShow: false,
                            callBack: function() {
                                $("#maintenanceAdd").modal('hide');
                                window.location.reload();
                            }
                        };
                        xxwsWindowObj.xxwsAlert(defaultOptions);
                        if (zhugeSwitch == 1) {
                            zhuge.track('新建维修工单成功');
                        }

                    } else {
                        xxwsWindowObj.xxwsAlert('新建维修失败');
                        if (zhugeSwitch == 1) {
                            zhuge.track('新建维修工单失败');
                        }
                    }
                    $(".creatSubmit").removeAttr("disabled");
                },
                error: function() {
                    $(".creatSubmit").removeAttr("disabled");
                    xxwsWindowObj.xxwsAlert('新建维修失败');
                    if (zhugeSwitch == 1) {
                        zhuge.track('新建维修工单失败');
                    }
                }
            });
        }
    }
});
//========组件相关js结束============//

function dateChangeForSearch() { //判断时间选择是否有值
    var startDate = $("#datetimeStart").val();
    var endDate = $("#datetimeEnd").val();
    if (startDate != "" && endDate !== "") {
        $("#diyDateBtn").addClass("active");
    } else {
        $("#diyDateBtn").removeClass("active");
    }
}

function checkLen(obj) { //判断输入框文字的个数
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

var exportObj = { //导出台账 导出工单 导出详情
    $exportAll: $("#export_all"), //全部台账
    $exportChoice: $("#export_choice"), //已选台账
    $exportAllWorksheet: $("#export_all_worksheet"), //全部工单
    $exportChoiceWorksheet: $("#export_choice_worksheet"), //已选工单
    expoerObj: {
        "startDate": "", //开始维修期限 包含开始日期
        "endDate": "", //结束维修期限 包含结束日期
        "originTypeCode": "", // 来源类型（maintenance_orgin）MO_01（入户整改）、MO_02（管道设施）、MO_03（巡检事件）、MO_99（其他维修）空代表全部
        "status": "", // 维修状态 1：待维修、2：已完成
        "keywordWeb": "", // web关键字匹配：维修编号、维修期限、维修人、创建人、地址
        "ids": [], // 维修单objectId 数组，无值传空数组。
    },
    urlObj: {
        "accountUrl": '/cloudlink-inspection-event/commonData/maintenanceAccount/export?token=' + lsObj.getLocalStorage('token'), //导出台账接口
        "workUrl": '/cloudlink-inspection-event/commonData/maintenanceWork/export?token=' + lsObj.getLocalStorage('token'), //导出工单接口
    },
    init: function() {
        var that = this;
        this.$exportAll.click(function() { //导出全部台账
            that.expoerObj.ids = [];
            that.expoerCondition(that.urlObj.accountUrl);
        });
        this.$exportChoice.click(function() { //导出已选台账
            var selectionsData = $('#workList').bootstrapTable('getSelections');
            that.expoerObj.ids = [];
            if (selectionsData.length == 0) {
                xxwsWindowObj.xxwsAlert("请选择你需要导出的台账！");
                return false;
            } else {
                for (var i = 0; i < selectionsData.length; i++) {
                    that.expoerObj.ids.push(selectionsData[i].objectId);
                }
                that.expoerCondition(that.urlObj.accountUrl);
            }
        });
        this.$exportAllWorksheet.click(function() { //导出全部工单
            that.expoerObj.ids = [];
            that.expoerCondition(that.urlObj.workUrl);
        });
        this.$exportChoiceWorksheet.click(function() { //导出已选工单
            var selectionsData = $('#workList').bootstrapTable('getSelections');
            that.expoerObj.ids = [];
            if (selectionsData.length == 0) {
                xxwsWindowObj.xxwsAlert("请选择你需要导出的工单！");
                return false;
            } else {
                for (var i = 0; i < selectionsData.length; i++) {
                    that.expoerObj.ids.push(selectionsData[i].objectId);
                }
                that.expoerCondition(that.urlObj.workUrl);
            }
        });
    },
    exportDetails: function(id) { //导出详情
        var that = this;
        var expoerObj = {
            "startDate": "", //开始维修期限 包含开始日期
            "endDate": "", //结束维修期限 包含结束日期
            "originTypeCode": "", // 来源类型（maintenance_orgin）MO_01（入户整改）、MO_02（管道设施）、MO_03（巡检事件）、MO_99（其他维修）空代表全部
            "status": "", // 维修状态 1：待维修、2：已完成
            "keywordWeb": "", // web关键字匹配：维修编号、维修期限、维修人、创建人、地址
            "ids": [], // 维修单objectId 数组，无值传空数组。
        };
        expoerObj.ids.push(id);
        that.expoerData(expoerObj, that.urlObj.workUrl);
    },
    expoerCondition: function(URL) {
        var searchMsg = searchObj.querryObj;
        this.expoerObj.startDate = searchMsg.startDate;
        this.expoerObj.endDate = searchMsg.endDate;
        this.expoerObj.originTypeCode = searchMsg.originTypeCode;
        this.expoerObj.status = searchMsg.status;
        this.expoerObj.keywordWeb = searchMsg.keywordWeb;
        this.expoerData(this.expoerObj, URL);
    },
    expoerData: function(date, url) {
        var options = {
            "url": url,
            "data": date,
            "method": 'post'
        };
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

$(function() { //数据初始化
    searchObj.init();
    userTable.init();
    addressSearchObj.init();
    facilitySearchObj.init();
    eventSearchObj.init();
    exportObj.init();
    //通过该方法来为每次弹出的模态框设置最新的zIndex值，从而使最新的modal显示在最前面
    $(document).on('show.bs.modal', '.modal', function(event) {
        if ($(this).hasClass("in")) {
            return;
        } else {
            var zIndex = 1040 + (10 * $('.modal:visible').length);
            $(this).css('z-index', zIndex);
            setTimeout(function() {
                $('.modal-backdrop').not('.modal-stack').css('z-index', zIndex - 1).addClass('modal-stack');
            }, 0);
        }
    });
    $(document).on('hidden.bs.modal', '.modal', function(event) {
        if ($('.modal:visible').length > 0) {
            $("body").addClass("modal-open");
        }
    });
});