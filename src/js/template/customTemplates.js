var systemConfiguration = {
    $addType: $(".type_add"), // 创建类型按钮
    $emptyBtn: $(".emptyBtn"), ///清除模板按钮
    $modifyAdd: $("#eventTypeAdd"), //创建类型模态框 ID
    $modifyclear: $("#clearTemplate"), //清除模板模态框 ID
    $modifyedit: $("#eventTypeEdit"), //编辑模板模态框 ID
    $addBtn: $('#addType'), //创建类型确定按钮
    $modifyBtn: $("#modifyType"), //修改类型确定按钮
    _data: null,
    _systemData: null,
    _typeId: "",
    _modifyId: null,
    _verifiCode: null,
    init: function() {
        var that = this;
        /*tab切换*/
        $(".aTitle ul li").each(function(e) {
            $(this).click(function() {
                $(this).attr("class", "active").siblings("li").attr("class", "");
                $("div.template").eq(e).show().siblings("div").hide();
            });
        });
        that.initialization();
        //打开添加子部门模态框
        this.$addType.click(function() {
            $('.addEventTypeName .REGname').text("");
            $('.addEventTypeSymbol .REGsymbol').text("");
            $(".addEventTypeName").find("input[name=typeName]").val("");
            $("#eventTypeAdd .pictureBox ul li").removeClass("selected");
            if ($(".modify_order span").text() == "保存顺序") {
                var defaultOptions = {
                    tip: '您是否放弃顺序调整的修改操作？',
                    name_title: '提示',
                    name_cancel: '否',
                    name_confirm: '是',
                    isCancelBtnShow: true,
                    callBack: function() {
                        $(".modify_order span").text("修改顺序");
                        $(".modify_order").addClass("bgBlue").removeClass("bgRed");
                        if (that._typeId != "") {
                            that.typeListRend(that._typeId);
                            $('#radioGroup').closest(".form_radio").hide();
                            $('#radioGroup').prop("disabled", true).closest(".pay_list_c1").removeClass("on");
                            $('#radioType').prop("checked", true).closest(".pay_list_c1").addClass("on");
                            $(".addEventTypeName .list_l").html("<i>*</i>事件类型名称：");
                            $(".addEventTypeSymbol").hide();
                        } else {
                            that.typeListRend('0');
                            $('#radioGroup').closest(".form_radio").show();
                            $(".addEventTypeSymbol ul li").eq(0).addClass("selected");
                            $('#radioGroup').prop("disabled", false).prop("checked", true).closest(".pay_list_c1").addClass("on");
                            $('#radioType').closest(".pay_list_c1").removeClass("on");
                            $(".addEventTypeName .list_l").html("<i>*</i>事件组名称：");
                            $(".addEventTypeSymbol .list_l").html("<i>*</i>事件组符号：");
                            $(".addEventTypeSymbol").show();
                        }
                        that.$modifyAdd.modal();
                    }
                };
                xxwsWindowObj.xxwsAlert(defaultOptions);
            } else {
                if (that._typeId != "") {
                    $('#radioGroup').closest(".form_radio").hide();
                    $('#radioGroup').prop("disabled", true).closest(".pay_list_c1").removeClass("on");
                    $('#radioType').prop("checked", true).closest(".pay_list_c1").addClass("on");
                    $(".addEventTypeName .list_l").html("<i>*</i>事件类型名称：");
                    $(".addEventTypeSymbol").hide();
                } else {
                    $('#radioGroup').closest(".form_radio").show();
                    $(".addEventTypeSymbol ul li").eq(0).addClass("selected");
                    $('#radioGroup').prop("disabled", false).prop("checked", true).closest(".pay_list_c1").addClass("on");
                    $('#radioType').closest(".pay_list_c1").removeClass("on");
                    $(".addEventTypeName .list_l").html("<i>*</i>事件组名称：");
                    $(".addEventTypeSymbol .list_l").html("<i>*</i>事件组符号：");
                    $(".addEventTypeSymbol").show();
                }
                that.$modifyAdd.modal();
            }
        });
        // 打开清除模板模态框
        this.$emptyBtn.click(function() {
            $('.clearValidationCode').find("input[name=prompt]").val("");
            $('.errorPrompt').hide();
            that.imgCode();
            that.$modifyclear.modal();
        });
        //创建类型确定按钮
        this.$addBtn.click(function() {
            that.addType();
        });
        //修改类型确定按钮
        that.$modifyBtn.click(function() {
            that.modifyType(that._modifyId);
        });
        //上移
        $('body').on('click', '.move_up', function(e) {
            var $dom = $(this).closest("li");
            var curNum = $dom.find("input[name=typeNum]").val();
            if ($dom.index() == 0) {
                return;
            } else {
                var $prev = $dom.prev();
                $dom.find("input[name=typeNum]").val($prev.find("input[name=typeNum]").val());
                $dom.find('.clildren_order').text($dom.index());
                $prev.find("input[name=typeNum]").val(curNum);
                $prev.find('.clildren_order').text($dom.index() + 1);
                $dom.prev().before($dom);
            }
        });
        //下移
        $('body').on('click', '.move_down', function(e) {
            var $dom = $(this).closest("li");
            var curNum = $dom.find("input[name=typeNum]").val();
            if ($dom.index() == $('.move_down').length - 1) {
                return;
            } else {
                var $next = $dom.next();
                $dom.find("input[name=typeNum]").val($next.find("input[name=typeNum]").val());
                $dom.find('.clildren_order').text($dom.index() + 2);
                $next.find("input[name=typeNum]").val(curNum);
                $next.find('.clildren_order').text($dom.index() + 1);
                $dom.next().after($dom);
            }
        });
        //修改
        $('body').on('click', '.modifyed', function(e) {
            $('.modifyText .REGname').text("");
            $(".modifyText").find("input[name=typeName]").val($(this).closest("li").find(".children_typeName").text());
            $("#eventTypeEdit .pictureBox ul li").removeClass("selected");
            if (that._typeId != "") {
                $(".editEventTypeSymbol").hide();
            } else {
                $(".editEventTypeSymbol").show();
                var imgIcon = $(this).closest("li").find("span.children_pic").attr("data-img");
                var $dom = $("#eventTypeEdit .pictureBox ul li");
                for (var i = 0; i < $dom.length; i++) {
                    if ($dom.eq(i).attr("data-src") == imgIcon) {
                        $dom.eq(i).addClass("selected");
                    }
                }
            }
            var node = $(this).closest("li").find("span.children_pic").attr("data-node");
            if (node == "2") {
                $("#eventTypeEdit .modifyText .list_l").html("<i>*</i>事件组名称：");
                $("#eventTypeEdit .editEventTypeSymbol .list_l").html("<i>*</i>事件组符号：");
            } else {
                $("#eventTypeEdit .modifyText .list_l").html("<i>*</i>事件类型名称：");
                $("#eventTypeEdit .editEventTypeSymbol .list_l").html("<i>*</i>事件类型符号：");
            }
            that.$modifyedit.modal();
            that._modifyId = $(this).closest("li").find("input[name=typeId]").val();
        });
        //删除
        $('body').on('click', '.deleted', function(e) {
            var id = $(this).closest("li").find("input[name=typeId]").val();
            var defaultOptions = {
                tip: '您是否确认删除该类型？',
                name_title: '提示',
                name_cancel: '取消',
                name_confirm: '确定',
                isCancelBtnShow: true,
                callBack: function() {
                    that.deteleType(id);
                }
            };
            xxwsWindowObj.xxwsAlert(defaultOptions);
        });
        //点击修改顺序按钮改变li里图标颜色和自身的文字
        $('body').on('click', '.modify_order', function(e) {
            var txt = "保存顺序";
            var txt1 = "修改顺序";
            if ($(".child_list").find("li").length > 0) {
                if ($(this).find("span").text() == txt) {
                    $(".modify_order").addClass("bgBlue").removeClass("bgRed");
                    $('.move').addClass("move_uped").removeClass("move_up");
                    $('.down').addClass("move_downed").removeClass("move_down");
                    $('.modify').addClass("modifyed").removeClass("modifyedClose");
                    $('.delete').addClass("deleted").removeClass("deletedClose");
                    $(this).find("span").text(txt1);
                    that.saveOrder();
                } else {
                    $(".modify_order").addClass("bgRed").removeClass("bgBlue");
                    $('.move').addClass("move_up").removeClass("move_uped");
                    $('.down').addClass("move_down").removeClass("move_downed");
                    $('.modify').addClass("modifyedClose").removeClass("modifyed");
                    $('.delete').addClass("deletedClose").removeClass("deleted");
                    $(this).find("span").text(txt);
                }
            }
        });
        //左侧最顶级菜单的收缩
        $(".systemTitle .customImg").click(function(e) {
            if ($(this).hasClass("customImg1")) {
                $(this).removeClass("customImg1").addClass("customImg2");
                $('.systemTypeTree').hide();
            } else {
                $(this).removeClass("customImg2").addClass("customImg1");
                $('.systemTypeTree').show();
            }
            e.stopPropagation();
        });
        $(".customTitle .customImg").click(function(e) {
            if ($(this).hasClass("customImg1")) {
                $(this).removeClass("customImg1").addClass("customImg2");
                $('.customTypeTree').hide();
            } else {
                $(this).removeClass("customImg2").addClass("customImg1");
                $('.customTypeTree').show();
            }
            e.stopPropagation();
        });
        //左侧菜单的收缩
        $('body').on('click', '.status', function(e) {
            if ($(this).hasClass("openType")) {
                $(this).removeClass("openType").addClass("closeType");
                $(this).closest("li").find('.eventChildTree').hide();
            } else {
                $(this).removeClass("closeType").addClass("openType");
                $(this).closest("li").find('.eventChildTree').show();
            }
            e.stopPropagation();
        });
        // 左侧最顶级菜单点击事件
        $('body').on('click', '.customTitle', function() {
            var $dom = $(this);
            if ($(".modify_order span").text() == "保存顺序") {
                var defaultOptions = {
                    tip: '您是否放弃顺序调整的修改操作？',
                    name_title: '提示',
                    name_cancel: '否',
                    name_confirm: '是',
                    isCancelBtnShow: true,
                    callBack: function() {
                        $(".modify_order span").text("修改顺序");
                        $(".modify_order").addClass("bgBlue").removeClass("bgRed");
                        $(".customTemplateRend").removeClass("active");
                        $dom.addClass("active");
                        that.typeListRend('0');
                        that._typeId = "";
                    }
                };
                xxwsWindowObj.xxwsAlert(defaultOptions);
            } else {
                $(".customTemplateRend").removeClass("active");
                $dom.addClass("active");
                that.typeListRend('0');
                that._typeId = "";
            }
        });
        $('body').on('click', '.systemTitle', function() {
            $(".systemTemplateRend").removeClass("active");
            $(this).addClass("active");
            that.systemTypeListRend('0');
        });
        // 左侧点击事件
        $('body').on('click', '.customTemplateRend', function() {
            var $dom = $(this);
            var parentId = $(this).attr('dataid');
            if ($(".modify_order span").text() == "保存顺序") {
                var defaultOptions = {
                    tip: '您是否放弃顺序调整的修改操作？',
                    name_title: '提示',
                    name_cancel: '否',
                    name_confirm: '是',
                    isCancelBtnShow: true,
                    callBack: function() {
                        $(".modify_order span").text("修改顺序");
                        $(".modify_order").addClass("bgBlue").removeClass("bgRed");
                        $(".customTitle").removeClass("active");
                        $dom.addClass("active");
                        $dom.closest("li").siblings("li").find(".eventTitle").removeClass("active");
                        that._typeId = parentId;
                        that.typeListRend(parentId);
                    }
                };
                xxwsWindowObj.xxwsAlert(defaultOptions);
            } else {
                $(".customTitle").removeClass("active");
                $dom.addClass("active");
                $dom.closest("li").siblings("li").find(".eventTitle").removeClass("active");
                that._typeId = parentId;
                that.typeListRend(parentId);
            }
        });
        $('body').on('click', '.systemTemplateRend', function() {
            $(".systemTitle").removeClass("active");
            $(this).addClass("active");
            $(this).closest("li").siblings("li").find(".eventTitle").removeClass("active");
            var parentId = $(this).attr('dataid');
            that.systemTypeListRend(parentId);
        });
        //设置默认模板    
        $('body').on('click', '.defaultBtnSystem', function() {
            var defaultOptions = {
                tip: '您是否启用当前模板为事件类型模板？',
                name_title: '提示',
                name_cancel: '取消',
                name_confirm: '确定',
                isCancelBtnShow: true,
                callBack: function() {
                    that.defaultTemplate("0");
                    $(".systemButton").find("span").removeClass("defaultBtnSystem");
                    $(".customButton").find("span").addClass("defaultBtnCustom");
                    if (zhugeSwitch == 1) {
                        zhuge.track('设置系统模板为默认');
                    }
                }
            };
            xxwsWindowObj.xxwsAlert(defaultOptions);
        });
        $('body').on('click', '.defaultBtnCustom', function() {
            var defaultOptions = {
                tip: '您是否启用当前模板为事件类型模板？',
                name_title: '提示',
                name_cancel: '取消',
                name_confirm: '确定',
                isCancelBtnShow: true,
                callBack: function() {
                    that.defaultTemplate("1");
                    $(".customButton").find("span").removeClass("defaultBtnCustom");
                    $(".systemButton").find("span").addClass("defaultBtnSystem");
                    if (zhugeSwitch == 1) {
                        zhuge.track('设置自定义模板为默认');
                    }
                }
            };
            xxwsWindowObj.xxwsAlert(defaultOptions);
        });
        //清除模板里验证验证码
        $('#clearTypeTemplate').click(function() {
            var val = $('.clearValidationCode').find("input[name=prompt]").val().trim();
            var imgStr = that._verifiCode;
            var imgReg = new RegExp("^" + imgStr + "$", "gi");
            if (val == '' || val == null) {
                $('.errorPrompt').show();
                $('.errorPrompt span').text('请填写图片验证码');
                return false;
            } else if (!imgReg.test(val)) {
                $('.errorPrompt').show();
                $('.errorPrompt span').text('图片验证码填写错误');
                return false;
            } else {
                $('.errorPrompt').hide();
                that.clearTemplate();
            }
        });
        //刷新验证码
        $('.code').click(function() {
            that.imgCode();
        });
        //创建类型模态框里点击Radio事件
        $(".pay_list_c1").each(function(e) {
            $(this).click(function() {
                var value = $(this).find("input[name=nodeType]").val();
                if ($(this).find("input[name=nodeType]").prop("disabled")) {
                    return;
                };
                if (value == "2") {
                    $(".addEventTypeName .list_l").html("<i>*</i>事件组名称：");
                    $(".addEventTypeSymbol .list_l").html("<i>*</i>事件组符号：");
                } else {
                    $(".addEventTypeName .list_l").html("<i>*</i>事件类型名称：");
                    $(".addEventTypeSymbol .list_l").html("<i>*</i>事件类型符号：");
                }

                $(".pay_list_c1").removeClass("on");
                $(this).addClass("on");
                $(this).find("input[type='radio']").prop("checked", true);
            });
        });
        //创建类型和修改中 对选中的事件类型图标添加样式
        $(".pictureBox ul li").click(function() {
            $(this).siblings('li').removeClass('selected'); // 删除其他li的边框样式
            $(this).addClass('selected'); // 为当前li添加边框样式
        });
    },
    typeListRend: function(parentId) { //自定义类型列表渲染
        var that = this;
        $('.child_list').html("");
        var parentIcon = "";
        if (parentId != "0") {
            var parentType = Enumerable.From(that._data).Where(function(x) {
                return (x.objectId == '' + parentId);
            }).ToArray();
            parentIcon = parentType[0].iconName;
        }
        var arrRes = Enumerable.From(that._data).Where(function(x) {
            return (x.parentId == '' + parentId && x.active == 1);
        }).OrderBy(function(x) {
            return x.indexNum;
        }).ToArray();
        if (arrRes.length > 0) {
            for (i = 0; i < arrRes.length; i++) {
                var num = arrRes[i].indexNum;
                var id = arrRes[i].id;
                var iconName = arrRes[i].iconName;
                var name = arrRes[i].typeName;
                var txt = "";
                if (parentId == "0") {
                    txt = '<li>' +
                        '<input type="hidden" name="typeId" value="' + id + '" />' +
                        '<input type="hidden" name="typeNum" value="' + num + '" />' +
                        '<span class="clildren_order ellipsis">' + (i + 1) + '</span>' +
                        '<span class="children_pic" data-node="' + arrRes[i].nodeType + '" data-img="' + iconName + '"><img src="/src/images/common/eventTypeImg/' + iconName + ' "></span>' +
                        '<span class="children_typeName ellipsis">' + name + '</span>' +
                        '<span class="children_operation"><i class="delete deleted" title="删除"></i>' +
                        '<i class="modify modifyed" title="修改"></i>' +
                        '<i class="down move_downed" title="下移"></i>' +
                        '<i class="move move_uped" title="上移"></i></span>' +
                        '</li>';
                } else {
                    txt = '<li>' +
                        '<input type="hidden" name="typeId" value="' + id + '" />' +
                        '<input type="hidden" name="typeNum" value="' + num + '" />' +
                        '<span class="clildren_order ellipsis">' + (i + 1) + '</span>' +
                        '<span class="children_pic" data-node="' + arrRes[i].nodeType + '" data-img="' + parentIcon + '"><img src="/src/images/common/eventTypeImg/' + parentIcon + ' "></span>' +
                        '<span class="children_typeName ellipsis">' + name + '</span>' +
                        '<span class="children_operation"><i class="delete deleted" title="删除"></i>' +
                        '<i class="modify modifyed" title="修改"></i>' +
                        '<i class="down move_downed" title="下移"></i>' +
                        '<i class="move move_uped" title="上移"></i></span>' +
                        '</li>';
                }

                $('.child_list').append(txt);
            }
        } else {
            $('.child_list').html("<li style='text-align:center'>暂无数据</li>");
        }
    },
    systemTypeListRend: function(parentId) { //系统类型列表渲染
        var that = this;
        $('.systemChild_list').html("");
        var parentIcon = "";
        if (parentId != "0") {
            var parentType = Enumerable.From(that._systemData).Where(function(x) {
                return (x.objectId == '' + parentId);
            }).ToArray();
            parentIcon = parentType[0].iconName;
        }
        var arrRes = Enumerable.From(that._systemData).Where(function(x) {
            return (x.parentId == '' + parentId && x.active == 1);
        }).OrderBy(function(x) {
            return x.indexNum;
        }).ToArray();
        if (arrRes.length > 0) {
            for (i = 0; i < arrRes.length; i++) {
                var name = arrRes[i].typeName;
                var iconName = arrRes[i].iconName;
                var txt = "";
                if (parentId == "0") {
                    txt = '<li>' +
                        '<span class="clildren_order ellipsis">' + (i + 1) + '</span>' +
                        '<span class="children_pic" data-img="' + iconName + '"><img src="/src/images/common/eventTypeImg/' + iconName + ' "></span>' +
                        '<span class="children_typeName ellipsis">' + name + '</span>' +
                        '</li>';
                } else {
                    txt = '<li>' +
                        '<span class="clildren_order ellipsis">' + (i + 1) + '</span>' +
                        '<span class="children_pic" data-img="' + parentIcon + '"><img src="/src/images/common/eventTypeImg/' + parentIcon + ' "></span>' +
                        '<span class="children_typeName ellipsis">' + name + '</span>' +
                        '</li>';
                }
                $('.systemChild_list').append(txt);
            }
        } else {
            $('.systemChild_list').html("<li style='text-align:center'>暂无数据</li>");
        }
    },
    saveOrder: function() { //保存顺序接口       
        var that = this;
        var $dom = $(".child_list").find("li");
        var dataArr = [];
        for (var i = 0; i < $dom.length; i++) {
            var obj = {
                id: $dom.eq(i).find("input[name=typeId]").val(),
                indexNum: $dom.eq(i).find("input[name=typeNum]").val(),
            }
            dataArr.push(obj);
        }
        $.ajax({
            type: "POST",
            url: "/cloudlink-inspection-event/eventType/updateCustomEventTypeOrder?token=" + lsObj.getLocalStorage('token'),
            contentType: "application/json",
            data: JSON.stringify(dataArr),
            dataType: "json",
            success: function(data) {
                if (data.success == 1) {
                    var defaultOptions = {
                        tip: '修改顺序成功',
                        name_title: '提示',
                        name_cancel: '取消',
                        name_confirm: '确定',
                        isCancelBtnShow: false,
                        callBack: function() {
                            that.getAllData();
                        }
                    };
                    xxwsWindowObj.xxwsAlert(defaultOptions);
                } else {
                    xxwsWindowObj.xxwsAlert("修改顺序失败");
                }
            },
            error: function() {
                xxwsWindowObj.xxwsAlert("修改顺序失败");
            }
        });
    },
    getAllData: function() { //获取自定义模板数据接口
        var that = this;
        var type = "1";
        var condition = {
            type: type,
        };
        $.ajax({
            type: "POST",
            url: "/cloudlink-inspection-event/commonData/customOrSysEventType/getList?token=" + lsObj.getLocalStorage('token'),
            contentType: "application/json",
            data: JSON.stringify(condition),
            dataType: "json",
            success: function(data) {
                if (data.success == 1) {
                    that._data = data.rows;
                    that.renderEventType(that._data);
                    that.addActive();
                } else {
                    xxwsWindowObj.xxwsAlert("获取数据失败");
                }
            },
            error: function() {
                xxwsWindowObj.xxwsAlert("获取数据失败");
            }
        });
    },
    renderEventType: function(arr) { //渲染自定义模板左侧Tree
        $('.customTypeTree').html("");
        var arrTree = Enumerable.From(arr).Where(function(x) {
            return (x.parentId == '0' && x.active == 1);
        }).OrderBy(function(x) {
            return x.indexNum;
        }).ToArray();
        for (var i = 0; i < arrTree.length; i++) {
            var active = arrTree[i].active;
            var id = arrTree[i].objectId;
            var dataTxt = '';
            var className = "";
            var arrRes = Enumerable.From(arr).Where(function(x) {
                return (x.parentId == '' + id && x.active == 1);
            }).OrderBy(function(x) {
                return x.indexNum;
            }).ToArray();
            if (arrRes.length > 0) {
                className = "openType";
            }
            for (j = 0; j < arrRes.length; j++) {
                var name = arrRes[j].typeName;
                dataTxt += '<li><span class="fl bgType"></span><span class="fl ellipsis">' + name + '</span></li>';
            }
            if (arrTree[i].nodeType == "1") {
                divText = '<div dataid=' + id + '  dataActive=' + active + ' class="eventTitleType"><span class="fl bgType"></span><span class="fl ellipsis">' + arrTree[i].typeName + '</span><span class="fr pr10 status ' + className + '"></span></div>';
            } else if (arrTree[i].nodeType == "2") {
                divText = '<div dataid=' + id + '  dataActive=' + active + ' class="eventTitle customTemplateRend"><span class="fl bgGroup"></span><span class="fl ellipsis">' + arrTree[i].typeName + '</span><span class="fr pr10 status ' + className + '"></span></div>';
            }
            var txt = '<li>' + divText + '<ul class="eventChildTree">' + dataTxt + '</ul></li>';
            $('.customTypeTree').append(txt);
        }
    },
    getSystemData: function() { //获取系统模板数据接口
        var that = this;
        var type = "0";
        var condition = {
            type: type,
        };
        $.ajax({
            type: "POST",
            url: "/cloudlink-inspection-event/commonData/customOrSysEventType/getList?token=" + lsObj.getLocalStorage('token'),
            contentType: "application/json",
            data: JSON.stringify(condition),
            dataType: "json",
            success: function(data) {
                if (data.success == 1) {
                    that._systemData = data.rows;
                    that.renderSystemTree(that._systemData);
                } else {
                    xxwsWindowObj.xxwsAlert("获取数据失败");
                }
            },
            error: function() {
                xxwsWindowObj.xxwsAlert("获取数据失败");
            }
        });
    },
    renderSystemTree: function(arr) { //渲染系统模板左侧Tree
        $('.systemTypeTree').html("");
        var arrSystemTree = Enumerable.From(arr).Where(function(x) {
            return (x.parentId == '0' && x.active == 1);
        }).OrderBy(function(x) {
            return x.indexNum;
        }).ToArray();
        for (var i = 0; i < arrSystemTree.length; i++) {
            var active = arrSystemTree[i].active;
            var id = arrSystemTree[i].objectId;
            var dataTxt = '';
            var className = "";
            var arrRes = Enumerable.From(arr).Where(function(x) {
                return (x.parentId == '' + id && x.active == 1);
            }).OrderBy(function(x) {
                return x.indexNum;
            }).ToArray();
            if (arrRes.length > 0) {
                className = "openType";
            }
            for (j = 0; j < arrRes.length; j++) {
                var name = arrRes[j].typeName;
                dataTxt += '<li><span class="fl bgType"></span><span class="fl ellipsis">' + name + '</span></li>';
            }
            if (arrSystemTree[i].nodeType == "1") {
                divText = '<div dataid=' + id + '  dataActive=' + active + ' class="eventTitleType"><span class="fl bgType"></span><span class="fl ellipsis">' + arrSystemTree[i].typeName + '</span><span class="fr pr10 status ' + className + '"></span></div>';
            } else if (arrSystemTree[i].nodeType == "2") {
                divText = '<div dataid=' + id + '  dataActive=' + active + ' class="eventTitle systemTemplateRend"><span class="fl bgGroup"></span><span class="fl ellipsis">' + arrSystemTree[i].typeName + '</span><span class="fr pr10 status ' + className + '"></span></div>';
            }
            var txt = '<li>' + divText + '<ul class="eventChildTree">' + dataTxt + '</ul></li>';
            $('.systemTypeTree').append(txt);
        }
        this.systemTypeListRend("0");
    },
    addActive: function() { //左侧默认状态
        var that = this;
        if (that._typeId == "") {
            that.typeListRend("0");
            $(".customTitle").addClass("active");
            $(".customTemplateRend").removeClass("active");
        } else {
            that.typeListRend(that._typeId);
            $(".customTitle").removeClass("active");
            $(".customTemplateRend").removeClass("active");
            var $dom = $(".customTemplateRend");
            for (var i = 0; i < $dom.length; i++) {
                if ($dom.eq(i).attr("dataid") == that._typeId) {
                    $dom.eq(i).addClass("active");
                }
            }
        }
    },
    imgCode: function() { //图片验证码
        var imgStr = "";
        var az = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'z', 'x', 'c', 'v', 'b', 'n', 'm', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Z', 'X', 'C', 'V', 'B', 'N', 'M'];
        var dom1 = parseInt(Math.random() * 10000 % 62);
        var dom2 = parseInt(Math.random() * 10000 % 62);
        var dom3 = parseInt(Math.random() * 10000 % 62);
        var dom4 = parseInt(Math.random() * 10000 % 62);
        imgStr = az[dom1] + az[dom2] + az[dom3] + az[dom4];
        $('.code i').text(imgStr);
        this._verifiCode = imgStr;
    },
    addType: function() { //新增事件类型接口
        var that = this;
        var parentId = "0";
        var typeNameReg = /^.{2,10}$/;
        var typeName = $(".addEventTypeName").find("input[name=typeName]").val().trim();
        var val = $('input:radio[name="nodeType"]:checked').val();
        var uuid = baseOperation.createuuid();
        var objectId = baseOperation.createuuid();
        if (typeName == "" || typeName == null) {
            $('.addEventTypeName .REGname').text("*请填写类型名称");
            return false;
        } else if (!typeNameReg.test(typeName)) {
            $('.addEventTypeName .REGname').text("*类型名称为2-10个字符");
            return false;
        } else {
            $('.addEventTypeName .REGname').text("");
        }
        var imgIcon = "";
        if (that._typeId == "") {
            var $dom = $("#eventTypeAdd .pictureBox ul li");
            for (var i = 0; i < $dom.length; i++) {
                if ($dom.eq(i).hasClass("selected")) {
                    imgIcon = $dom.eq(i).attr("data-src");
                }
            }
            if (imgIcon == '') {
                $('.addEventTypeSymbol .REGsymbol').text("请选择类型符号");
                return false;
            } else {
                $('.addEventTypeSymbol .REGsymbol').text("");
            }
        } else {
            parentId = that._typeId;
        }
        $("#addType").attr("disabled", "disabled");
        var obj = {
            "id": uuid,
            "objectId": objectId,
            "typeName": typeName,
            "parentId": parentId,
            "iconName": imgIcon,
            "nodeType": val,
        };
        $.ajax({
            type: "POST",
            url: "/cloudlink-inspection-event/eventType/saveCustomEventType?token=" + lsObj.getLocalStorage('token'),
            contentType: "application/json",
            data: JSON.stringify(obj),
            dataType: "json",
            success: function(data) {
                if (data.success == 1) {
                    that.$modifyAdd.modal('hide');
                    var defaultOptions = {
                        tip: '新增事件类型成功',
                        name_title: '提示',
                        name_cancel: '取消',
                        name_confirm: '确定',
                        isCancelBtnShow: false,
                        callBack: function() {
                            that.getAllData();
                        }
                    };
                    xxwsWindowObj.xxwsAlert(defaultOptions);
                } else {
                    if (data.code == "XE02001") {
                        xxwsWindowObj.xxwsAlert("该事件类型名称已经存在，无法添加");
                    } else if (data.code == "XE02002") {
                        var removeId = data.rows[0].id;
                        var defaultOptions = {
                            tip: '该事件类型名称曾被使用，后被用户删除，其已存在于历史数据中，是否对其进行恢复？',
                            name_title: '提示',
                            name_cancel: '取消',
                            name_confirm: '确定',
                            isCancelBtnShow: true,
                            callBack: function() {
                                that.$modifyAdd.modal('hide');
                                that.recoveryType(removeId);
                            }
                        };
                        xxwsWindowObj.xxwsAlert(defaultOptions);
                    } else {
                        xxwsWindowObj.xxwsAlert("新增事件类型失败");
                    }
                }
                $("#addType").removeAttr("disabled");
            },
            error: function() {
                $("#addType").removeAttr("disabled");
                xxwsWindowObj.xxwsAlert("");
            }
        });
    },
    recoveryType: function(id) { //恢复事件类型接口
        var that = this;
        var param = {
            id: id
        }
        $.ajax({
            type: "POST",
            url: "/cloudlink-inspection-event/eventType/recoveryCustomEventType?token=" + lsObj.getLocalStorage('token'),
            contentType: "application/json",
            data: JSON.stringify(param),
            dataType: "json",
            success: function(data) {
                if (data.success == 1) {
                    var defaultOptions = {
                        tip: '恢复事件类型成功',
                        name_title: '提示',
                        name_cancel: '取消',
                        name_confirm: '确定',
                        isCancelBtnShow: false,
                        callBack: function() {
                            that.getAllData();
                        }
                    };
                    xxwsWindowObj.xxwsAlert(defaultOptions);
                } else {
                    xxwsWindowObj.xxwsAlert("恢复事件类型失败");
                }
            },
            error: function() {
                xxwsWindowObj.xxwsAlert("恢复事件类型失败");
            }
        });
    },
    modifyType: function(id) { //修改事件类型接口
        var that = this;
        var typeNameReg = /^.{2,10}$/;
        var typeName = $(".modifyText").find("input[name=typeName]").val().trim();
        var typeSymbol = $(".editEventTypeSymbol").find("textarea[name=typeSymbol]").val();
        if (typeName == "" || typeName == null) {
            $('.modifyText .REGname').text("*请填写类型名称");
            return false;
        } else if (!typeNameReg.test(typeName)) {
            $('.modifyText .REGname').text("*类型名称为2-10个字符");
            return false;
        } else {
            $('.modifyText .REGname').text("");
        }
        var imgIcon = "";
        if (that._typeId == "") {
            var $dom = $("#eventTypeEdit .pictureBox ul li");
            for (var i = 0; i < $dom.length; i++) {
                if ($dom.eq(i).hasClass("selected")) {
                    imgIcon = $dom.eq(i).attr("data-src");
                }
            }
        }
        // if (imgIcon == '') {
        //     $('.editEventTypeSymbol .REGsymbol').text("请选择类型符号");
        //     return false;
        // }
        $("#modifyType").attr("disabled", "disabled");
        var obj = {
            "id": id,
            "typeName": typeName,
            "iconName": imgIcon,
        };
        $.ajax({
            type: "POST",
            url: "/cloudlink-inspection-event/eventType/updateCustomEventType?token=" + lsObj.getLocalStorage('token'),
            contentType: "application/json",
            data: JSON.stringify(obj),
            dataType: "json",
            success: function(data) {
                if (data.success == 1) {
                    that.$modifyedit.modal('hide');
                    var defaultOptions = {
                        tip: '修改事件类型成功',
                        name_title: '提示',
                        name_cancel: '取消',
                        name_confirm: '确定',
                        isCancelBtnShow: false,
                        callBack: function() {
                            that.getAllData();
                        }
                    };
                    xxwsWindowObj.xxwsAlert(defaultOptions);

                } else {
                    if (data.code == "XE02001") {
                        xxwsWindowObj.xxwsAlert("该事件类型名称已经存在，无法修改");
                    } else if (data.code == "XE02002") {
                        xxwsWindowObj.xxwsAlert("您所修改的事件类型名称已存在于历史类型中，无法修改！");
                    } else {
                        xxwsWindowObj.xxwsAlert("修改事件类型失败");
                    }
                }
                $("#modifyType").removeAttr("disabled");
            },
            error: function() {
                xxwsWindowObj.xxwsAlert("修改事件类型失败");
                $("#modifyType").removeAttr("disabled");
            }
        });

    },
    deteleType: function(id) { //删除事件类型接口
        var that = this;
        var param = {
            id: id
        }
        $.ajax({
            type: "POST",
            url: "/cloudlink-inspection-event/eventType/deleteCustomEventType?token=" + lsObj.getLocalStorage('token'),
            contentType: "application/json",
            data: JSON.stringify(param),
            dataType: "json",
            success: function(data) {
                if (data.success == 1) {
                    var defaultOptions = {
                        tip: '事件类型删除成功',
                        name_title: '提示',
                        name_cancel: '取消',
                        name_confirm: '确定',
                        isCancelBtnShow: false,
                        callBack: function() {
                            that.getAllData();
                        }
                    };
                    xxwsWindowObj.xxwsAlert(defaultOptions);
                } else {
                    xxwsWindowObj.xxwsAlert("事件类型删除失败");
                }
            },
            error: function() {
                xxwsWindowObj.xxwsAlert("事件类型删除失败");
            }
        });
    },
    clearTemplate: function() { //清除自定义模板接口
        var that = this;
        $.ajax({
            type: "GET",
            url: "/cloudlink-inspection-event/eventType/cleanCustomTemplate?token=" + lsObj.getLocalStorage('token'),
            contentType: "application/json",
            dataType: "json",
            success: function(data) {
                that.$modifyclear.modal('hide');
                if (data.success == 1) {
                    that._typeId = "";
                    var defaultOptions = {
                        tip: '清除模板成功',
                        name_title: '提示',
                        name_cancel: '取消',
                        name_confirm: '确定',
                        isCancelBtnShow: false,
                        callBack: function() {
                            that.getAllData();
                        }
                    };
                    xxwsWindowObj.xxwsAlert(defaultOptions);
                } else {
                    xxwsWindowObj.xxwsAlert("清除模板失败");
                }
            },
            error: function() {
                xxwsWindowObj.xxwsAlert("清除模板失败");
            }
        });
    },
    initialization: function() { //打开页面调用接口
        var _this = this;
        $.ajax({
            type: "GET",
            url: "/cloudlink-inspection-event/eventType/currentTemplate?token=" + lsObj.getLocalStorage('token'),
            contentType: "application/json",
            dataType: "json",
            success: function(data) {
                if (data.success == 1) {
                    var mold = data.rows[0].options;
                    if (mold == "0") {
                        $(".customButton").find("span").addClass("defaultBtnCustom");
                        $(".aTitle ul li").eq(0).text("系统模板（默认）").attr("class", "active");
                        $(".aTitle ul li").eq(1).text("自定义模板");
                        $("div.template").eq(0).show().siblings("div").hide();
                    } else if (mold == "1") {
                        $(".systemButton").find("span").addClass("defaultBtnSystem");
                        $(".aTitle ul li").eq(1).text("自定义模板（默认）").attr("class", "active");
                        $(".aTitle ul li").eq(0).text("系统模板");
                        $("div.template").eq(1).show().siblings("div").hide();
                    }
                    _this.getAllData();
                    _this.getSystemData();
                } else {
                    xxwsWindowObj.xxwsAlert("获取数据失败");
                }
            },
            error: function() {
                xxwsWindowObj.xxwsAlert("获取数据失败");
            }
        });
    },
    defaultTemplate: function(num) { //设置默认模板接口
        var _this = this;
        var obj = {
            options: num
        };
        $.ajax({
            type: "POST",
            url: "/cloudlink-inspection-event/eventType/setEventTypeTemplate?token=" + lsObj.getLocalStorage('token'),
            contentType: "application/json",
            data: JSON.stringify(obj),
            dataType: "json",
            success: function(data) {
                if (data.success == 1) {
                    var defaultOptions = {
                        tip: '设置默认模板成功',
                        name_title: '提示',
                        name_cancel: '取消',
                        name_confirm: '确定',
                        isCancelBtnShow: false,
                        callBack: function() {
                            _this.changeTabName(num);
                        }
                    };
                    xxwsWindowObj.xxwsAlert(defaultOptions);
                } else {
                    xxwsWindowObj.xxwsAlert("设置默认模板失败");
                }
            },
            error: function() {
                xxwsWindowObj.xxwsAlert("设置默认模板失败");
            }
        });
    },
    changeTabName: function(num) { //改变tab名称
        if (num == "0") {
            $(".aTitle ul li").eq(0).text("系统模板（默认）");
            $(".aTitle ul li").eq(1).text("自定义模板");
        } else {
            $(".aTitle ul li").eq(0).text("系统模板");
            $(".aTitle ul li").eq(1).text("自定义模板（默认）");
        }
    },
};

// 初始化
$(function() {
    systemConfiguration.init();
});