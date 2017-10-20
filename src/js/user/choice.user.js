/**
 * 人员的选择，查看人员明细
 */

var choiceFrameObj = {
    $choiceAreaFrame: $("#choiceAreaFrame"),
    $choiceUserFrame: $("#choiceUserFrame"),
    $viewDetailFrame: $("#viewDetailFrame"),
    $choiceRegionFrame: $("#choiceRegionFrame"),
    $isChoiceBtn: $(".searchListBtn ul li"), //小区选择按钮
    $isRegionChoiceBtn: $(".regionSearchListBtn ul li"), //片区选择按钮
    $areaResetBtn: $(".resetBtn span"),
    $regionResetBtn: $(".regionResetBtn span"),
    $areaSearchBtn: $('.areaSearchBtn'),
    $regionSearchBtn: $('.regionSearchBtn'),
    _areaChoiceData: null,
    _regionChoiceData: null,
    _searchTxt: '',
    _regionSearchTxt: '',
    _areaId: null,
    _regionId: null,
    _planId: null,
    init: function() {
        var _this = this;
        //小区选择与未选择筛选
        _this.$isChoiceBtn.each(function(e) {
            $(this).click(function() {
                $(this).attr("class", "active");
                $(this).siblings("li").attr("class", "");
                _this.areaShowHide(e, _this._searchTxt);
            });
        });
        //片区选择与未选择筛选
        _this.$isRegionChoiceBtn.each(function(e) {
            $(this).click(function() {
                $(this).attr("class", "active");
                $(this).siblings("li").attr("class", "");
                _this.regionShowHide(e, _this._regionSearchTxt);
            });
        });
        //小区的搜索框确定
        _this.$areaSearchBtn.click(function() {
            _this._searchTxt = $(".areaSearchText").val().trim();
            var num = $(".searchListBtn").find(".active").index();
            _this.areaShowHide(num, _this._searchTxt);
        });
        //片区的搜索框确定
        _this.$regionSearchBtn.click(function() {
            _this._regionSearchTxt = $(".regionSearchText").val().trim();
            var num = $(".regionSearchListBtn").find(".active").index();
            _this.regionShowHide(num, _this._regionSearchTxt);
        });
        //重置小区选择
        _this.$areaResetBtn.click(function() {
            _this.searchAreaReset();
        });
        //重置片区选择
        _this.$regionResetBtn.click(function() {
            _this.searchRegionReset();
        });

        //小区选择模态框加载完
        _this.$choiceAreaFrame.on('shown.bs.modal', function(e) {
            $(".areaTitle span").text(0);
            _this.areaReset();
            _this.areaRendering();
        });
        //片区选择模态框加载完
        _this.$choiceRegionFrame.on('shown.bs.modal', function(e) {
            $(".regionTitle span").text(0);
            _this.regionReset();
            _this.regionRendering();
        });
        //选中片区
        $('.regionPlace').on('click', '.regionList', function() {
            // $(this).data('choiceArr', []);
            if ($(this).find("input[type=checkbox]").prop('checked') == false) {
                var num = $(this).find(".regionTotal").text();
                $(this).find(".regionMun").text(num);
                $(this).find("input[name=regionNumber]").val(num);
            } else {
                $(this).find(".regionMun").text(0);
                $(this).find("input[name=regionNumber]").val(0);
            }
            $(this).find("input[type=checkbox]").trigger("click");
        });
        //片区复选框选择
        $('.regionPlace').on('click', 'input[type=checkbox]', function(e) {
            $(this).closest(".regionList").data('choiceArr', []);
            if ($(this).prop('checked') == true) {
                var num = $(this).closest(".regionList").find(".regionTotal").text();
                $(this).closest(".regionList").find(".regionMun").text(num);
                $(this).closest(".regionList").find("input[name=regionNumber]").val(num);
            } else {
                $(this).closest(".regionList").find(".regionMun").text(0);
                $(this).closest(".regionList").find("input[name=regionNumber]").val(0);
            }
            e.stopPropagation();
        });

        //小区选择模态框隐藏后
        _this.$choiceAreaFrame.on('hide.bs.modal', function(e) {
            _this._areaChoiceData = null;
        });
        //片区选择模态框隐藏后
        _this.$choiceRegionFrame.on('hide.bs.modal', function(e) {
            _this._regionChoiceData = null;
        });
        //选中小区
        $('.areaPlace').on('click', '.areaList', function() {
            $(this).data('choiceArr', []);
            if ($(this).find("input[type=checkbox]").prop('checked') == false) {
                var num = $(this).find(".areaTotal").text();
                $(this).find(".areaMun").text(num);
                $(this).find("input[name=userNumber]").val(num);
            } else {
                $(this).find(".areaMun").text(0);
                $(this).find("input[name=userNumber]").val(0);
            }
            $(this).find("input[type=checkbox]").trigger("click");
        });

        //复选框选择
        $('.areaPlace').on('click', 'input[type=checkbox]', function(e) {
            $(this).closest(".areaList").data('choiceArr', []);
            if ($(this).prop('checked') == true) {
                var num = $(this).closest(".areaList").find(".areaTotal").text();
                $(this).closest(".areaList").find(".areaMun").text(num);
                $(this).closest(".areaList").find("input[name=userNumber]").val(num);
            } else {
                $(this).closest(".areaList").find(".areaMun").text(0);
                $(this).closest(".areaList").find("input[name=userNumber]").val(0);
            }
            e.stopPropagation();
        });
        //进入小区选用户，打开用户选择列表模态框
        $('.areaPlace').on('click', '.choiceOpenBtn', function(e) {
            _this._areaId = $(this).closest(".areaList").find(".areaName").text();
            $(".areaInformation .choiceAreaName").text(_this._areaId);
            var tatol = parseInt($(this).closest(".areaList").find(".areaTotal").text());
            var num = parseInt($(this).closest(".areaList").find("input[name=userNumber]").val());

            _this.$choiceUserFrame.find(".areaInformation .choiceAreaTotal").text(tatol);
            _this.$choiceUserFrame.find(".areaInformation .choiceAreaYes").text(num);
            _this.$choiceUserFrame.find(".areaInformation .choiceAreaNo").text(tatol - num);
            _this.$choiceUserFrame.data('dom', $(this).closest(".areaList"));
            //获取片区列表
            _this.getRegionList(_this._areaId);
            //判断选中
            if ($(this).closest(".areaList").find("input[type=checkbox]").prop('checked') == true && $(this).closest(".areaList").data('choiceArr').length == 0) {
                userChoiceTable._selectAll = true;
                userChoiceTable._userIdObj = {};
            } else {
                userChoiceTable.initializationData($(this).closest(".areaList").data('choiceArr'));
            }
            //重置搜索按钮
            userChoiceSearchObj.searchReset();
            _this.$choiceUserFrame.modal();
            e.stopPropagation();
        });
        _this.$choiceUserFrame.on('shown.bs.modal', function(e) {
            userChoiceSearchObj.querryObj.residential = _this._areaId;
            userChoiceSearchObj.defaultObj.residential = _this._areaId;
            userChoiceSearchObj.refreshTable();
        });
        //片区概况
        $('.areaPlace').on("click", ".areaSurvey a", function(e) {
            $(this).popover('show');
            e.stopPropagation();
        });

        _this.$viewDetailFrame.on('shown.bs.modal', function(e) {
            $("select[name=quartersList]").html('<option value="">全部（小区/院/村）</option>');
            if (_this._regionId) {
                userDetailedSearchObj.querryObj.regionId = _this._regionId;
                userDetailedSearchObj.defaultObj.regionId = _this._regionId;
                _this.getQuarterByArea(_this._regionId);
            }
            if (_this._planId) {
                userDetailedSearchObj.querryObj.planId = _this._planId;
                userDetailedSearchObj.defaultObj.planId = _this._planId;
                _this.getQuartersByPlan(_this._planId);
            }
            userDetailedSearchObj.searchReset();
            userDetailedSearchObj.refreshTable();
        });

    },
    searchAreaReset: function() { //重置小区选择
        var _this = this;
        _this._searchTxt = '';
        $(".areaSearchText").val("");
        _this.$isChoiceBtn.eq(0).attr("class", "active").siblings("li").attr("class", "");
        _this.areaShowHide(0, '');
    },
    searchRegionReset: function() { //重置片区选择
        var _this = this;
        _this._regionSearchTxt = '';
        $(".regionSearchText").val("");
        _this.$isRegionChoiceBtn.eq(0).attr("class", "active").siblings("li").attr("class", "");
        _this.regionShowHide(0, '');
    },
    areaShowHide: function(num, string) { //小区的显隐判断
        var arr = [];
        for (var i = 0; i < $('.areaPlace .areaList').length; i++) {
            arr.push($('.areaPlace .areaList').eq(i));
            $('.areaPlace .areaList').eq(i).hide();
        };
        var newArr = arr.filter(function(item) {
            return item.find(".areaName").text().indexOf(string) != -1;
        });
        if (newArr.length > 0) {
            for (var i = 0; i < newArr.length; i++) {
                if (num == 0) {
                    newArr[i].show();
                } else if (num == 1) {
                    if (newArr[i].find("input[type=checkbox]").prop("checked") == true) {
                        newArr[i].show();
                    };
                } else if (num == 2) {
                    if (newArr[i].find("input[type=checkbox]").prop("checked") == false) {
                        newArr[i].show();
                    };
                }
            }
        }
    },
    regionShowHide: function(num, string) { //片区的显隐判断
        var arr = [];
        for (var i = 0; i < $('.regionPlace .regionList').length; i++) {
            arr.push($('.regionPlace .regionList').eq(i));
            $('.regionPlace .regionList').eq(i).hide();
        };
        var newArr = arr.filter(function(item) {
            return item.find(".regionName").text().indexOf(string) != -1;
        });
        if (newArr.length > 0) {
            for (var i = 0; i < newArr.length; i++) {
                if (num == 0) {
                    newArr[i].show();
                } else if (num == 1) {
                    if (newArr[i].find("input[type=checkbox]").prop("checked") == true) {
                        newArr[i].show();
                    };
                } else if (num == 2) {
                    if (newArr[i].find("input[type=checkbox]").prop("checked") == false) {
                        newArr[i].show();
                    };
                }
            }
        }
    },
    areaReset: function() { //打开选择小区选择，重置
        var _this = this;
        _this._searchTxt = '';
        $(".areaSearchText").val("");
        _this.$isChoiceBtn.eq(0).attr("class", "active").siblings("li").attr("class", "");
        $(".areaPlace").html('');
    },
    regionReset: function() { //打开选择片区选择，重置
        var _this = this;
        _this._regionSearchTxt = '';
        $(".regionSearchText").val("");
        _this.$isRegionChoiceBtn.eq(0).attr("class", "active").siblings("li").attr("class", "");
        $(".regionPlace").html('');
    },
    areaRendering: function() { //加载小区
        var _this = this;
        var param = {
            pageNum: 1,
            pageSize: 100000
        }
        $.ajax({
            type: "POST",
            url: "/cloudlink-inspection-event/commonData/residential/getPageList?token=" + lsObj.getLocalStorage('token'),
            contentType: "application/json",
            data: JSON.stringify(param),
            dataType: "json",
            success: function(data) {
                if (data.success == 1) {
                    var dataAll = data.rows;
                    $(".areaTitle span").text(dataAll.length);
                    for (var i = 0; i < dataAll.length; i++) {
                        var regionHtml = null;
                        if (dataAll[i].regionDetail == '' || dataAll[i].regionDetail == null) {
                            regionHtml = '&nbsp;';
                        } else {
                            var regionTxtList = dataAll[i].regionDetail.replace(/,/g, "&lt;br&gt;");
                            regionHtml = '<a data-trigger="focus" data-html="true" data-content="' + regionTxtList + '" role="button" tabindex="0" data-placement="top" title="片区概况" ></a>';
                        }
                        var txt = '<div class="areaList">' +
                            '<dl>' +
                            '<dt>' +
                            '<input type="checkbox" name="">' +
                            '<input type="hidden" value="0" name="userNumber" >' +
                            '</dt>' +
                            '<dd>' +
                            '<p class="areaSurvey">' + regionHtml + '</p>' +
                            '<p class="areaNameP"><span class="areaName" data-placement="top" title="' + dataAll[i].residential + '">' + dataAll[i].residential + '</span></p>' +
                            '<p>已选<span class="areaMun">0</span>户/共<span class="areaTotal">' + dataAll[i].userCount + '</span>户</p>' +
                            '<p>' +
                            '<button class="btn choiceOpenBtn">选择用户</button>' +
                            '</p>' +
                            '</dd>' +
                            '</dl>' +
                            '</div>';
                        $(".areaPlace").append(txt);
                    }
                    _this.areaBoxChoice();
                }
            },
            error: function() {
                xxwsWindowObj.xxwsAlert('获取小区信息失败');
            }
        });
    },
    regionRendering: function() { //加载片区
        var _this = this;
        var param = {
            pageNum: 1,
            pageSize: 100000
        }
        $.ajax({
            type: "POST",
            url: "/cloudlink-inspection-event/commonData/regionResidential/getList?token=" + lsObj.getLocalStorage('token'),
            contentType: "application/json",
            data: JSON.stringify(param),
            dataType: "json",
            success: function(data) {
                if (data.success == 1) {
                    var dataAll = data.rows;
                    $(".regionTitle span").text(dataAll.length);
                    for (var i = 0; i < dataAll.length; i++) {
                        var txt = '<div class="regionList">' +
                            '<dl>' +
                            '<dt>' +
                            '<input type="checkbox" name="">' +
                            '<input type="hidden" value="0" name="regionNumber" >' +
                            '<input type="hidden" value="' + dataAll[i].objectId + '" name="regionId" >' +
                            '</dt>' +
                            '<dd>' +
                            '<p class="regionNameP"><span class="regionName" data-placement="top" title="' + dataAll[i].regionName + '">' + dataAll[i].regionName + '</span></p>' +
                            '<p>已选<span class="regionMun">0</span>户/共<span class="regionTotal">' + dataAll[i].households + '</span>户</p>' +
                            '<p class="regionContent" data-placement="top" title="' + dataAll[i].sphere + '">' + dataAll[i].sphere + '</p>' +
                            '</dd>' +
                            '</dl>' +
                            '</div>';
                        $(".regionPlace").append(txt);
                        $(".regionPlace").find(".regionList:last").data("regionTnfor", dataAll[i].userFileIdVoSet);
                    }
                    _this.regionBoxChoice();
                }
            },
            error: function() {
                xxwsWindowObj.xxwsAlert('获取片区信息失败');
            }
        });
    },
    areaBoxChoice: function() { //小区初始化被选中
        var _this = this;
        if (_this._areaChoiceData) {
            for (var i = 0; i < $(".areaPlace .areaList").length; i++) {
                var dom = $(".areaPlace .areaList").eq(i);
                for (var j = 0; j < _this._areaChoiceData.length; j++) {
                    if (dom.find('.areaNameP').text() == _this._areaChoiceData[j].residential) {
                        dom.find(".areaMun").text(_this._areaChoiceData[j].choiceNumber);
                        dom.find("input[name=userNumber]").val(_this._areaChoiceData[j].choiceNumber);
                        dom.data('choiceArr', _this._areaChoiceData[j].userFileIdSet);
                        dom.find("input[type=checkbox]").prop('checked', true);
                    }
                }
            }
        }
    },
    getRegionList: function(id) { //根据小区获取片区
        var _this = this;
        $("select[name=regionIdChoice]").html('<option value="">全部（片区）</option>');
        var param = {
            residential: id
        }
        $.ajax({
            type: "POST",
            url: "/cloudlink-inspection-event/commonData/regionOfResidential/getList?token=" + lsObj.getLocalStorage('token'),
            contentType: "application/json",
            data: JSON.stringify(param),
            dataType: "json",
            success: function(data) {
                if (data.success == 1) {
                    var dataAll = data.rows;
                    var txt = '<option value="">全部（片区）</option>';
                    for (var i = 0; i < dataAll.length; i++) {
                        txt += '<option value="' + dataAll[i].objectId + '">' + dataAll[i].regionName + '</option>'
                    }
                    txt += '<option value="none">无</option>';
                    $("select[name=regionIdChoice]").html(txt);
                }
            },
            error: function() {
                xxwsWindowObj.xxwsAlert('获取片区列表失败');
            }
        });
    },
    getQuartersByPlan: function(planId) { //根据计划获取小区下拉列表
        var _this = this;
        var param = {
            "planId": planId,
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
    getQuarterByArea: function(regionId) { //根据片区获取小区下拉列表
        var _this = this;
        var param = {
            "regionId": regionId,
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
    getAreaChoiceData: function() { //获取小区选择信息
        var _this = this;
        var userFileIdVoSet = [];
        var areaText = null;
        for (var i = 0; i < $(".areaPlace .areaList").length; i++) {
            var $dom = $(".areaPlace .areaList").eq(i);
            if ($dom.find('input[type=checkbox]').prop('checked') == true) {
                var obj = {
                    residential: $dom.find(".areaName").text(),
                    userFileIdSet: $dom.data('choiceArr'),
                    choiceNumber: parseInt($dom.find('input[type=hidden]').val())
                }
                userFileIdVoSet.push(obj);
            }
        }
        return userFileIdVoSet;
    },
    regionBoxChoice: function() { //片区初始化被选中
        var _this = this;
        if (_this._regionChoiceData) {
            for (var i = 0; i < $(".regionPlace .regionList").length; i++) {
                var dom = $(".regionPlace .regionList").eq(i);
                for (var j = 0; j < _this._regionChoiceData.length; j++) {
                    if (dom.find('input[name=regionId]').val() == _this._regionChoiceData[j]) {
                        dom.find(".regionMun").text(dom.find(".regionTotal").text());
                        dom.find("input[name=regionNumber]").val(dom.find(".regionTotal").text());
                        dom.find("input[type=checkbox]").prop('checked', true);
                    }
                }
            }
        }
    },
    getRegionChoiceData: function() { //获取片区选择信息
        var _this = this;
        var userFileIdVoSet = [];
        var ids = [];
        var areaText = null;
        for (var i = 0; i < $(".regionPlace .regionList").length; i++) {
            var $dom = $(".regionPlace .regionList").eq(i);
            if ($dom.find('input[type=checkbox]').prop('checked') == true) {
                ids.push($dom.find("input[name=regionId]").val());
                var arr = $dom.data("regionTnfor");
                for (var j = 0; j < arr.length; j++) {
                    userFileIdVoSet.push(arr[j]);
                }
            }
        }
        var obj = {
            key: ids,
            value: _this.mapVlaue(userFileIdVoSet)
        }
        return obj;
    },
    mapVlaue: function(arr) { //片区里面小区的查重
        var obj = {};
        for (var i = 0; i < arr.length; i++) {
            var key = arr[i].residential;
            if (obj.hasOwnProperty(key)) {
                var newObj = {
                    choiceNumber: obj[key].choiceNumber + arr[i].choiceNumber,
                    regionId: '',
                    residential: key,
                    userFileIdSet: obj[key].userFileIdSet.concat(arr[i].userFileIdSet),
                    userTotalCount: obj[key].userTotalCount
                };
                obj[key] = newObj;
            } else {
                obj[key] = arr[i];
            }
        }
        var newArr = [];
        for (var i in obj) {
            newArr.push(obj[i]);
        }
        return newArr;
    },
};

//人员选择高级搜索相关的对象与方法
var userChoiceSearchObj = {
    $items: $('.ChoiceTop .item'), //搜索条件dom
    $searchInput: $('#searchInputChoice'), //搜索关键词dom
    defaultObj: { //默认搜索条件
        "regionId": "", //片区
        "residential": "", //小区
        "enterhomeUserTypeCode": '',
        "userStatusCode": "",
        "keyword": "",
        "pageNum": 1, //第几页
        "pageSize": 100000, //每页记录数
        choiceCode: ''
    },
    querryObj: { //请求的搜索条件
        "regionId": "", //片区
        "residential": "", //小区
        "enterhomeUserTypeCode": '',
        "userStatusCode": "",
        "keyword": "",
        "pageNum": 1, //第几页
        "pageSize": 100000, //每页记录数
        choiceCode: ''
    },
    activeObj: { //高亮默认搜索条件，用于渲染页面
        "enterhomeUserTypeCode": "",
        "userStatusCode": "",
        choiceCode: ''
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
        $('#choiceUserTxtBtn').click(function() {
            var s = $(this).parent().find('input').val().trim();
            that.querryObj.keyword = s;
            that.refreshTable();
        });


        //片区下拉框选择
        $("select[name=regionIdChoice]").change(function() {
            that.querryObj.regionId = $(this).val();
            that.refreshTable();
        });

        /* 清空搜索条件 */
        $('#choiceResetBtn').click(function() {
            that.searchReset();
            that.refreshTable();
        });
    },
    searchReset: function() {
        this.defaultObj.pageSize = 100000;
        $.extend(this.querryObj, this.defaultObj);
        $("select[name=regionIdChoice]").val("");
        this.$searchInput.val("");
        this.renderActive();
    },
    refreshTable: function() {
        var that = this;
        that.querryObj.pageNum = 1;
        $('#userChoiceList').bootstrapTable('removeAll'); //清空数据
        $('#userChoiceList').bootstrapTable('refreshOptions', {
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

//人员查看高级搜索相关的对象与方法
var userDetailedSearchObj = {
    $items: $('.userDetailed .item'), //搜索条件dom
    $searchInput: $('#searchInputLook'), //搜索关键词dom
    defaultObj: { //默认搜索条件
        "residential": "",
        "regionId": "", //片区
        "planId": '', //计划id
        "enterhomeUserTypeCode": '',
        "userStatusCode": "",
        "keyword": "",
        "pageNum": 1, //第几页
        "pageSize": 50, //每页记录数
    },
    querryObj: { //请求的搜索条件
        "residential": "",
        "regionId": "",
        "planId": '', //计划id
        "enterhomeUserTypeCode": '',
        "userStatusCode": "",
        "keyword": "",
        "pageNum": 1, //第几页
        "pageSize": 50, //每页记录数
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
        //小区选择
        $("select[name=quartersList]").change(function() {
            that.querryObj.residential = $(this).val();
            that.refreshTable();
        });
        /* 搜索关键词 */
        $('#lookUserDetailedBtn').click(function() {
            var s = $(this).parent().find('input').val().trim();
            that.querryObj.keyword = s;
            that.refreshTable();
        });
        /* 清空搜索条件 */
        $('#lookUserDetailedreset').click(function() {
            that.searchReset();
            that.refreshTable();
        });
    },
    searchReset: function() {
        $.extend(this.querryObj, this.defaultObj);
        $("select[name=quartersList]").val("");
        this.$searchInput.val("");
        this.renderActive();
    },
    refreshTable: function() {
        var that = this;
        that.querryObj.keyword = that.$searchInput.val().trim();
        that.$searchInput.val(that.querryObj.keyword);
        that.querryObj.pageNum = 1;
        $('#userDetailedTable').bootstrapTable('removeAll'); //清空数据
        $('#userDetailedTable').bootstrapTable('refreshOptions', {
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

var userChoiceTable = {
    $userChoiceTrueBtn: $(".userChoiceTrueBtn"),
    _userIdObj: {},
    _selectAll: null,
    init: function() {
        var _this = this;
        _this.getTable();
        _this.getDetailTable();
        _this.arrRemove();
        //确定用户选择，关闭用户选择模态框
        _this.$userChoiceTrueBtn.click(function() {
            var arr = Object.keys(_this._userIdObj);
            var $dom = choiceFrameObj.$choiceUserFrame.data('dom');
            $dom.find(".areaMun").text(arr.length);
            $dom.find("input[type=hidden]").val(arr.length);
            $dom.data('choiceArr', arr);
            if (arr.length > 0) {
                $dom.find('input[type=checkbox]').prop('checked', true);
            } else {
                $dom.find('input[type=checkbox]').prop('checked', false);
            }
            choiceFrameObj.$choiceUserFrame.modal('hide');
        });
    },
    getTable: function() { //table 数据
        var _this = this;
        $('#userChoiceList').bootstrapTable({
            url: "/cloudlink-inspection-event/commonData/userArchive/getPageList?token=" + lsObj.getLocalStorage('token'), //请求数据url
            method: 'post',
            cache: false, //是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
            showHeader: true,
            showRefresh: false,
            pagination: true, //分页
            striped: true,
            sidePagination: 'server', //分页方式：client客户端分页，server服务端分页（*）
            pageNumber: 1,
            pageSize: 100000,
            pageList: [100000], //分页步进值
            search: false, //显示搜索框
            searchOnEnterKey: false,
            queryParamsType: '', //默认值为 'limit' ,在默认情况下 传给服务端的参数为：offset,limit,sort
            // 设置为 ''  在这种情况下传给服务器的参数为：pageSize,pageNumber
            queryParams: function(params) {
                userChoiceSearchObj.defaultObj.pageSize = 10;
                userChoiceSearchObj.defaultObj.pageNum = params.pageNumber;
                return userChoiceSearchObj.defaultObj;
            },
            onLoadSuccess: function(data) {
                if (data.success == 1) {
                    var chioceStr = userChoiceSearchObj.querryObj.choiceCode;
                    _this.srueChoice(data.rows, chioceStr);
                }
            },
            onCheckAll: function(rows) {
                for (var i = 0; i < rows.length; i++) {
                    _this._userIdObj[rows[i].objectId] = rows[i].objectId;
                }
            },
            onUncheckAll: function(rows) {
                for (var i = 0; i < rows.length; i++) {
                    delete _this._userIdObj[rows[i].objectId];
                }
            },
            onCheck: function(row) {
                _this._userIdObj[row.objectId] = row.objectId;
            },
            onUncheck: function(row) {
                var id = row.objectId;
                delete _this._userIdObj[id];
            },
            //表格的列
            columns: [{
                field: 'state', //域值
                checkbox: true, //复选框
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '5%',
            }, {
                field: 'userFileName', //域值
                title: '用户名称', //内容
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '13%',
                editable: true,
            }, {
                field: 'userFileCode', //域值
                title: '用户编号', //内容
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '12%',
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
                width: '20%',
                editable: true,
            }, {
                field: 'address', //域值
                title: '详细地址', //内容
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '30%',
                editable: true,
            }, ]
        });
    },
    getDetailTable: function() { //table 数据
        var _this = this;
        $('#userDetailedTable').bootstrapTable({
            url: "/cloudlink-inspection-event/commonData/userArchivePlanScope/getPageList?token=" + lsObj.getLocalStorage('token'), //请求数据url
            method: 'post',
            cache: false, //是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
            showHeader: true,
            showRefresh: false,
            pagination: true, //分页
            striped: true,
            sidePagination: 'server', //分页方式：client客户端分页，server服务端分页（*）
            pageNumber: 1,
            pageSize: 50,
            pageList: [50, 100, 150, 200], //分页步进值
            search: false, //显示搜索框
            searchOnEnterKey: false,
            queryParamsType: '', //默认值为 'limit' ,在默认情况下 传给服务端的参数为：offset,limit,sort
            // 设置为 ''  在这种情况下传给服务器的参数为：pageSize,pageNumber
            queryParams: function(param) {
                userDetailedSearchObj.defaultObj.pageSize = param.pageSize;
                userDetailedSearchObj.defaultObj.pageNum = param.pageNumber;
                return userDetailedSearchObj.defaultObj;
            },
            //表格的列
            columns: [{
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
                    field: 'residential', //域值
                    title: '所属小区/院/村', //内容
                    align: 'center',
                    visible: true, //false表示不显示
                    sortable: false, //启用排序
                    width: '15%',
                },
                {
                    field: 'address', //域值
                    title: '详细地址', //内容
                    align: 'center',
                    visible: true, //false表示不显示
                    sortable: false, //启用排序
                    width: '45%',
                }
            ]
        });
    },
    initializationData: function(arr) { //初始化用户被选中用户
        var _this = this;
        _this._userIdObj = {};
        if (arr) {
            for (var i = 0; i < arr.length; i++) {
                _this._userIdObj[arr[i]] = arr[i];
            }
        }
    },
    srueChoice: function(data, str) { //列表展示被选中以及显影
        var _this = this;
        var choiceYesArr = [];
        var arr = Object.keys(_this._userIdObj);

        //判断是否全选
        if (_this._selectAll == true) {
            $('#userChoiceList').bootstrapTable('checkAll');
            _this._selectAll = false;
            return;
        }

        for (var i = 0; i < data.length; i++) {
            for (var key in _this._userIdObj) {
                if (data[i].objectId == key) {
                    choiceYesArr.push(i);
                }
            }
        }

        for (var i = 0; i < choiceYesArr.length; i++) {
            $('#userChoiceList').bootstrapTable('check', choiceYesArr[i]);
        }
        if (str == 'yes') {
            for (var i = 0; i < data.length; i++) {
                $('#userChoiceList').bootstrapTable('hideRow', { index: i });
            }
            for (var j = 0; j < choiceYesArr.length; j++) {
                $('#userChoiceList').bootstrapTable('showRow', { index: choiceYesArr[j] });
            }
        } else if (str == 'no') {
            for (var i = 0; i < data.length; i++) {
                $('#userChoiceList').bootstrapTable('showRow', { index: i });
            }
            for (var j = 0; j < choiceYesArr.length; j++) {
                $('#userChoiceList').bootstrapTable('hideRow', { index: choiceYesArr[j] });
            }
        } else {
            for (var i = 0; i < data.length; i++) {
                $('#userChoiceList').bootstrapTable('showRow', { index: i });
            }
        }
    },
    arrRemove: function() { //数组方法扩展
        Array.prototype.indexOf = function(val) {
            for (var i = 0; i < this.length; i++) {
                if (this[i] == val) return i;
            }
            return -1;
        };
        Array.prototype.remove = function(val) {
            var index = this.indexOf(val);
            if (index > -1) {
                this.splice(index, 1);
            }
        };
        if (!Object.keys) {
            Object.keys = (function() {
                var hasOwnProperty = Object.prototype.hasOwnProperty,
                    hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
                    dontEnums = [
                        'toString',
                        'toLocaleString',
                        'valueOf',
                        'hasOwnProperty',
                        'isPrototypeOf',
                        'propertyIsEnumerable',
                        'constructor'
                    ],
                    dontEnumsLength = dontEnums.length;

                return function(obj) {
                    if (typeof obj !== 'object' && typeof obj !== 'function' || obj === null) throw new TypeError('Object.keys called on non-object');

                    var result = [];

                    for (var prop in obj) {
                        if (hasOwnProperty.call(obj, prop)) result.push(prop);
                    }

                    if (hasDontEnumBug) {
                        for (var i = 0; i < dontEnumsLength; i++) {
                            if (hasOwnProperty.call(obj, dontEnums[i])) result.push(dontEnums[i]);
                        }
                    }
                    return result;
                }
            })();
        };
    },
};

$(function() {
    choiceFrameObj.init();
    userChoiceSearchObj.init();
    userChoiceTable.init();
    userDetailedSearchObj.init();
    $(document).on("mouseover", ".areaName", function() {
        $(this).tooltip('show');
    });
    $(document).on("mouseover", ".regionName", function() {
        $(this).tooltip('show');
    });
    $(document).on("mouseover", ".regionContent", function() {
        $(this).tooltip('show');
    });
});