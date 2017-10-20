$(function() {
    taskObj.init();
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

    //上传图片-点击事件
    $(".addImg").click(function() {
        var imgNum = $(".feedback_img_list").find(".feedback_images").length;
        if (imgNum <= 4) {
            $(".upload_file").trigger("click");
        } else {
            xxwsWindowObj.xxwsAlert("最多上传五张图片");
        }
    });
});

/*删除图片*/
function closeImg(e) {
    var num = $(e).attr("data-key");
    $(e).closest(".feedback_images").remove();
    $(".feedback_img_file input[name=file]").each(function() {
        console.log($(this).attr("data-value"))
        if ($(this).attr("data-value") == num) {
            $(this).remove();
        }
    })
}
// 判断输入框的字数
function checkLen(obj) {
    var len = $(obj).val().length;
    if (len > 159) {
        $(obj).val($(obj).val().substring(0, 160));
    }
    var num = 160 - len;
    if (num < 0) {
        num = 0;
    }
    $(".text_num").text('(' + num + '字)');
}

//任务对象，根据任务id来操作
var taskObj = {
    $submit: $(".submit"),
    $taskM: $("#dispose"),
    _datatime: $("#datetime"),
    $receiveUser: $("input[name=receiveUser]"),
    receiveUserIdsArr: [],
    $objectId: null,
    $taskId: null,
    $flg: true,
    _taskType: null,
    init: function() {
        var _this = this;

        this.$submit.click(function() { //处置上报
            _this.submit();
        });
        this.$receiveUser.click(function() {
            $("#stakeholder").modal(); //打开人员模态框
            _this.requestPeopleTree();
        });
        $('#btn_selectPeople').click(function() { //确定选择人员
            _this.setSelectedPerson();
            //console.log(that.querryObj);
        });
    },
    taskOpen: function(e) { //打开摸态窗口
        this.$taskM.modal();
        var time = (new Date()).Format("yyyy-MM-dd HH:mm");
        this._datatime.text(time);
        this.$taskId = e;
    },
    submit: function() { //提交表单
        var _this = this;
        this.$objectId = baseOperation.createuuid();

        var content = $("#event_description").val().trim();
        this._taskType = $("input[name='taskType']:checked").val();
        var receiveUser = $("input[name='receiveUser']").val();
        // debugger;
        if (this.$flg == true) {
            this.$flg = false;
            if (content == "") {
                xxwsWindowObj.xxwsAlert("请描述处置的信息！");
                this.again();
                return false;
            } else if (this._taskType == "20") {
                if (receiveUser == '') {
                    xxwsWindowObj.xxwsAlert("请选择【请示】消息的接收人！");
                    this.again();
                    return false;
                }
            }
            var defaultOptions = {
                tip: '您是否确定提交处置信息？',
                name_title: '提示',
                name_cancel: '取消',
                name_confirm: '确定',
                isCancelBtnShow: true,
                callBack: function() {
                    _this.closedWhether(_this.$taskId);
                }
            };
            xxwsWindowObj.xxwsAlert(defaultOptions);
            _this.again();
        }

    },
    uploadFile: function() {
        var nImgHasBeenSendSuccess = 0;
        var _this = this;
        var files = $(".feedback_img_file").find("input[name=file]");
        if (files.length > 0) {
            for (i = 0; i < files.length; i++) {
                var picId = files.eq(i).attr("id");
                $.ajaxFileUpload({
                    url: "/cloudlink-core-file/attachment/web/v1/save?businessId=" + _this.$objectId + "&bizType=pic&token=" + lsObj.getLocalStorage('token'),
                    /*这是处理文件上传的servlet*/
                    secureuri: false,
                    fileElementId: picId, //上传input的id
                    dataType: "json",
                    type: "POST",
                    async: false,
                    success: function(data, status) {
                        var statu = data.success;
                        if (statu == 1) {
                            nImgHasBeenSendSuccess++;
                            if (nImgHasBeenSendSuccess == files.length) {
                                //上传表单
                                _this.uploadData();
                            }
                        } else {
                            xxwsWindowObj.xxwsAlert("当前网络不稳定");
                            _this.again();
                        }
                    }
                });
            }
        } else {
            //上传表单
            _this.uploadData();
        }
    },
    uploadData: function() {
        var _this = this;
        var eventData = this.formData();
        // console.log(JSON.stringify(eventData));
        $.ajax({
            type: 'POST',
            url: "/cloudlink-inspection-task/dispose/save?token=" + lsObj.getLocalStorage('token'),
            contentType: "application/json",
            data: JSON.stringify(eventData),
            dataType: "json",
            success: function(data, status) {
                if (data.success == 1) {
                    $("#event_description").val("");
                    $("input[name='receiveUser']").val("");
                    _this.$taskM.modal('hide');
                    window.location.reload();
                } else {
                    xxwsWindowObj.xxwsAlert("当前网络不稳定");
                    _this.again();
                }
            }
        })
    },
    formData: function() {
        var _this = this;
        var createTime = $("#datetime").text();
        var content = $("#event_description").val().trim();
        var dataMsg = {
            "objectId": this.$objectId,
            "type": _this._taskType,
            "content": content,
            "createTime": createTime,
            "taskId": _this.$taskId,
            "receiveUserIds": _this.receiveUserIdsArr,
        }
        return dataMsg;
    },
    requestPeopleTree: function() { //请求人员信息
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
                    xxwsWindowObj.xxwsAlert('网络连接出错！')
                    return;
                }
                that.aAllPeople = data.rows;
                that.renderPeopleTree(that.aAllPeople);
            },
            statusCode: {
                404: function() {
                    xxwsWindowObj.xxwsAlert('网络连接出错！');
                }
            }
        });
    },
    renderPeopleTree: function(data) { //遍历tree
        var that = this;
        //data = '';
        // console.log(data)
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
    setSelectedPerson: function() { //获取选中的人员
        var that = this;
        // that.aPeopleId = [];
        that.aPeopleName = [];
        that.receiveUserIdsArr = []; //人员数组
        var userObj = null;
        var arr = that.zTree.getCheckedNodes(true);
        arr.forEach(function(item, index) {
            if (item.isParent) {
                return;
            }
            userObj = {
                "userId": item.id,
                "userName": item.treenodename
            }
            that.receiveUserIdsArr.push(userObj);
            // that.aPeopleId.push(item.id);
            that.aPeopleName.push(item.treenodename);
        });
        that.$receiveUser.val(that.aPeopleName.join('，'));
        $('#stakeholder').modal('hide');
        console.log(JSON.stringify(this.formData()));
        // console.log(that.aPeopleName);
        // receiveUserIdsArr
    },
    initPeopleList: function() { //清空人员信息
        var that = this;
        that.aPeopleName = [];
        that.receiveUserIdsArr = [];
        that.$receiveUser.val('');
        if (that.zTree) {
            that.zTree.checkAllNodes(false);
        }
    },
    closedWhether: function(taskId) { //判断任务是否关闭
        var _this = this;
        $.ajax({
            type: 'GET',
            url: "/cloudlink-inspection-task/task/getTaskStatus?token=" + lsObj.getLocalStorage('token') + "&taskId=" + taskId,
            contentType: "application/json",
            dataType: "json",
            success: function(data, status) {
                console.log(data);
                if (data.success == 1) {
                    var taskState = data.rows;
                    if (taskState[0].status == 21) {
                        xxwsWindowObj.xxwsAlert("您好，该任务已经关闭！");
                        window.location.reload();
                        return false;
                    } else {
                        _this.uploadFile();
                        return true;
                    }
                }
            }
        })
    },
    again: function() {
        this.$flg = true;
    }
};