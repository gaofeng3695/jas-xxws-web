$(function() {
    tableObj.init();
    frameObj.init();
});
(function(window, $) {
    //表格相关操作对象
    var tableObj = {
        $toolbar: $("#toolbar"),
        $table: $("#table"),
        $addFormFrame: $("#addFormFrame"),
        eventMap: {
            "click #newlyBuild": "b_newlyBuild", //新建
            "click #exportAll": "b_exportAll", //导出全部
            "click #exportSelect": "b_exportSelect", //导出所选
            "click #deleteSelect": "b_deleteSelect", //删除所选
            "click #downloadMould": "b_downloadMould", //下载模板
            "click #importMould": "b_importMould", //导入模板
        },
        init: function() {
            var _this = this;
            this.bindBtnEvent();
        },
        bindBtnEvent: function() { //
            this.initializeOrdinaryEvent(this.eventMap);
        },
        initializeOrdinaryEvent: function(maps) { //按钮事件的绑定
            this._scanEventsMap(maps, true);
        },
        _scanEventsMap: function(maps, isOn) { //遍历绑定事件
            var delegateEventSplitter = /^(\S+)\s*(.*)$/;
            var type = isOn ? 'on' : 'off';
            for (var keys in maps) {
                if (maps.hasOwnProperty(keys)) {
                    if (typeof maps[keys] === 'string') {
                        maps[keys] = this[maps[keys]].bind(this);
                    }
                    var matchs = keys.match(delegateEventSplitter);
                    $('body')[type](matchs[1], matchs[2], maps[keys]);
                }
            }
        },
        b_newlyBuild: function(e) { //打开新建
            var id = e.currentTarget.id;
            var fu = $("#" + id).data("function");
            fu();
        },
        b_exportAll: function(e) { //导出全部
            var fn = $(e.currentTarget).data("function");
            fn();
        },
        b_exportSelect: function(e) { //导出所选
            var _this = this;
            var fn = $(e.currentTarget).data("function");
            fn();
        },
        b_deleteSelect: function(e) { //删除所选
            var _this = this;
            var fn = $(e.currentTarget).data("function");
            fn();
            // var selectionsData = _this.$table.bootstrapTable('getSelections');
            // if (selectionsData.length == 0) {
            //     xxwsWindowObj.xxwsAlert("请选择你需要导出的选项！");
            //     return false;
            // } else {
            //     _this.deleteSelect(url, selectionsData);
            // }
        },
        b_downloadMould: function(e) {
            var fn = $(e.currentTarget).data("function");
            fn();
        },
        b_importMould: function(e) {
            var fn = $(e.currentTarget).data("function");
            fn();
        },
        addTableTopBtn: function(obj) { //初始化添加table上面的按钮
            var _this = this;
            _this.$toolbar.html("");
            for (var key in obj) {
                var txt = _this.addTableTopBtnText(key, obj[key].name);
                _this.$toolbar.append(txt);
                _this.$toolbar.find("button:last").data("function", obj[key].function);
            }
        },
        addTableTopBtnText: function(value, name) { //table上面按钮的选择
            var _this = this;
            switch (value) {
                case "newlyBuild":
                    var txt = '<button id="newlyBuild" type="button" class="btn btn-default">' +
                        '<span class="glyphicon glyphicon-plus" aria-hidden="true"></span>&nbsp;' + name + '</button>';
                    return txt;
                    break;
                case "exportAll":
                    var txt = '<button id="exportAll" type="button" class="btn btn-default">' +
                        '<span class="glyphicon glyphicon-share" aria-hidden="true"></span>&nbsp;' + name + '</button>';
                    return txt;
                    break;
                case "exportSelect":
                    var txt = '<button id="exportSelect" type="button" class="btn btn-default">' +
                        '<span class="glyphicon glyphicon-saved" aria-hidden="true"></span>&nbsp;' + name + '</button>';
                    return txt;
                    break;
                case "deleteSelect":
                    var txt = '<button id="deleteSelect" type="button" class="btn btn-default">' +
                        '<span class="fa fa-w fa-trash" aria-hidden="true"></span>&nbsp;' + name + '</button>';
                    return txt;
                    break;
                case "downloadMould":
                    var txt = '<button id="downloadMould" type="button" class="btn btn-default">' +
                        '<span class="fa fa-w fa-download" aria-hidden="true"></span>&nbsp;' + name + '</button>';
                    return txt;
                    break;
                case "importMould":
                    var txt = '<button id="importMould" type="button" class="btn btn-default">' +
                        '<span class="fa fa-w fa-upload" aria-hidden="true"></span>&nbsp;' + name + '</button>';
                    return txt;
                    break;
                default:
                    return "";
                    break;
            }
        },
        expoerCondition: function(url, arr) { //导出文件
            var data = {};
            // $.extend(this.expoerObj, searchObj.querryObj);
            if (arr) {
                data.idList = arr;
            }
            this.expoerData(data, url);
        },
        expoerData: function(data, url) { //导出文件参数
            var options = {
                "url": url + '?token=' + lsObj.getLocalStorage('token'),
                "data": data,
                "method": 'post'
            }
            this.downLoadFile(options);
        },
        downLoadFile: function(options) { //导出文件方法
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
        },
        deleteSelect: function(url, arr) { //删除多个的方法
            var param = {
                idList: arr
            };
            $.ajax({
                type: 'POST',
                url: url + "?token=" + lsObj.getLocalStorage('token'),
                contentType: "application/json",
                data: JSON.stringify(param),
                dataType: "json",
                success: function(data, status) {
                    if (data.success == 1) {
                        var defaultOptions = {
                            tip: '删除成功！',
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
                            xxwsWindowObj.xxwsAlert("您没有删除的权限！");
                        } else {
                            xxwsWindowObj.xxwsAlert("删除失败！");
                        }
                    }
                }
            });
        },
        getTable: function(arr, url, boolean, obj) { //表格数据
            var _this = this;
            _this.$table.bootstrapTable({
                url: url + "?token=" + lsObj.getLocalStorage('token'), //请求数据url
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
                    // searchObj.defaultObj.pageSize = params.pageSize;
                    // searchObj.defaultObj.pageNum = params.pageNumber;
                    // return searchObj.defaultObj;
                    return {
                        "regionId": "", //片区
                        "residential": "", //小区
                        "enterhomeUserTypeCode": '',
                        "userStatusCode": "",
                        "keyword": "",
                        "pageNum": 1, //第几页
                        "pageSize": 10, //每页记录数
                    }
                },
                onDblClickRow: function(row) {
                    // facilityFrame._facilityId = row.objectId;
                    // facilityFrame.$facilityDetailsFrame.modal(); //打开详情模态框
                    // facilityFrame.clearfacilityDetails();
                    return false;
                },
                //表格的列
                columns: arr
            });
        },
    };
    window.tableObj = tableObj;
})(window, jQuery);

(function(window, $) {
    var frameObj = {
        $addFormFrame: $("#addFormFrame"),
        eventMap: {
            "click .formTxtBtn": "b_formClick", //表单的点击事件
        },
        init: function() {
            var _this = this;
            this.bindBtnEvent();
        },
        bindBtnEvent: function() { //
            this.initializeOrdinaryEvent(this.eventMap);
        },
        initializeOrdinaryEvent: function(maps) { //按钮事件的绑定
            this._scanEventsMap(maps, true);
        },
        _scanEventsMap: function(maps, isOn) { //遍历绑定事件
            var delegateEventSplitter = /^(\S+)\s*(.*)$/;
            var type = isOn ? 'on' : 'off';
            for (var keys in maps) {
                if (maps.hasOwnProperty(keys)) {
                    if (typeof maps[keys] === 'string') {
                        maps[keys] = this[maps[keys]].bind(this);
                    }
                    var matchs = keys.match(delegateEventSplitter);
                    $('body')[type](matchs[1], matchs[2], maps[keys]);
                }
            }
        },
        b_formClick: function(e) { //表单里元素点击事件
            var fn = this.$addFormFrame.data($(e.currentTarget).attr("name"));
            fn();
        },
        formAdditional: function(arr) { //from表单追加元素
            var _this = this;
            if (arr.length > 0) {
                var txt = "";
                for (var i = 0; i < arr.length; i++) {
                    var txtList = '';
                    if (arr[i].length == 1) {
                        txtList = _this.htmlAdditional(arr[i][0]);
                    } else {
                        for (var j = 0; j < arr[i].length; j++) {
                            var aa = _this.htmlAdditional(arr[i][j]);
                            txtList += '<div class="formListHalf">' + aa + '</div>'
                        }
                    }
                    if (txtList != '') {
                        txt += '<div class="formList">' + txtList + '</div>';
                    }
                }
                _this.$addFormFrame.find("form").append(txt);
                _this.$addFormFrame.find("form input").on('input propertychange', function() {
                    _this.validation($(this));
                });
                _this._bindingIn(arr);
            }
        },
        htmlAdditional: function(obj) { //form字段元素
            var _this = this;
            var i = "",
                txt = '',
                placeholder = '',
                dom = '';
            try {
                if (obj.notEmpty == true) {
                    i = '<i>*</i>';
                }
                if (obj.placeholder) {
                    placeholder = obj.placeholder;
                }
                //dom元素
                if (obj.type == 'text') {
                    dom = $('<input type="text" placeholder="' + placeholder + '" name="' + obj.name + '" class="form-control" />');

                } else if (obj.type == 'textarea') {
                    dom = $('<textarea class="form-control" placeholder="' + placeholder + '" name="' + obj.name + '"></textarea>');
                } else if (obj.type == 'select') {
                    dom = $('<select class="form-control name="' + obj.name + '""></select>');
                    for (var i = 0; i < obj.content.length; i++) {
                        var selectTxt = $('<option value="' + obj.content[i].value + '">' + obj.content[i].name + '</option>');
                        if (obj.content[i].selected == true) {
                            selectTxt.attr('selected', 'selected');
                        }
                        dom.append(selectTxt);
                    }
                } else {
                    dom = $('' + obj.htmlPart);
                }
                if (obj.readonly == true) {
                    dom.attr('readonly', 'readonly');
                }
                if (obj.callBack) {
                    dom.addClass("formTxtBtn");
                    _this.$addFormFrame.data(obj.name, obj.callBack);
                }
                txt = '<div class="formListLeft">' + i + obj.title + '</div>' +
                    '<div class="formListRight">' + dom[0].outerHTML + '</div>';
            } catch (error) {
                console.log(error);
            }
            return txt;
        },
        _bindingIn: function(arr) { //信息的绑定
            for (var i = 0; i < arr.length; i++) {
                for (var j = 0; j < arr[i].length; j++) {
                    if (arr[i][j].type == 'text' || arr[i][j].type == 'textarea') {
                        $('input[name=' + arr[i][j].name + ']').data('information', arr[i][j]);
                        $('textarea[name=' + arr[i][j].name + ']').data('information', arr[i][j]);
                    }
                }
            }
        },
        verification: function() { //表单的验证
            var _this = this;
            var _judge = true;
            var inputs = $("form").find("input");
            var textareas = $("form").find("textarea");
            if (inputs.length > 0) {
                for (var i = 0; i < inputs.length; i++) {
                    var judge = _this.validation(inputs.eq(i));
                    if (judge == false) {
                        _judge = false;
                    }
                }
            }
            if (textareas.length > 0) {
                for (var i = 0; i < textareas.length; i++) {
                    var judge = _this.validation(textareas.eq(i));
                    if (judge == false) {
                        _judge = false;
                    }
                }
            }
            return _judge;
        },
        validation: function(dom) {
            var _this = this;
            if (dom.next("span").length == 0) {
                dom.after("<span></span>");
            }
            var val = dom.val().trim();
            var obj = dom.data('information');
            if (obj.notEmpty == true) {
                if (val == "") {
                    dom.next("span").show().text("请输入" + obj.title);
                    return false;
                }
            };
            if (val.length > obj.leng) {
                dom.next("span").show().text(obj.title + "字数大于" + obj.leng);
                return false;
            };
            if (obj.validation) {
                if (obj.validation.regex) {
                    var reg = obj.validation.regex;
                    if (!reg.test(val)) {
                        dom.next("span").show().text(obj.title + "格式错误");
                        return false;
                    }
                }
                var typeD = _this.checkType(val, obj.validation.type);
                if (typeD == false) {
                    dom.next("span").show().text("格式错误");
                    return false;
                }
                // if (obj.validation.type == "number") {
                //     if (isNaN(val)) {
                //         dom.next("span").show().text("请输入数字");
                //         return false;
                //     }
                // }
                if (obj.validation.between) {
                    var num = parseInt(val);
                    if (num > obj.validation.between.max || num < obj.validation.between.min) {
                        dom.next("span").show().text("数值大小在" + obj.validation.between.min + "~~" + obj.validation.between.max + "之间");
                        return false;
                    }
                }
            }
            dom.next("span").hide();
            return true;
        },
        checkType: function(str, type) { //类型的判断
            switch (type) {
                case 'email':
                    return /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/.test(str);
                case 'phone':
                    return /^1[3|4|5|7|8][0-9]{9}$/.test(str);
                case 'tel':
                    return /^(0\d{2,3}-\d{7,8})(-\d{1,4})?$/.test(str);
                case 'number':
                    return /^[0-9]$/.test(str);
                case 'english':
                    return /^[a-zA-Z]+$/.test(str);
                case 'chinese':
                    return /^[\u4E00-\u9FA5]+$/.test(str);
                case 'lower':
                    return /^[a-z]+$/.test(str);
                case 'upper':
                    return /^[A-Z]+$/.test(str);
                default:
                    return true;
            }
        }
    }
    window.frameObj = frameObj;
})(window, jQuery);