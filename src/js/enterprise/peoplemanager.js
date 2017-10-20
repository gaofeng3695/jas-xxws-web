$(function() {
    usermanager.init();
});
var usermanager = {
    $addbut: $(".inviteuser"), //主页面绑定的邀请人员按钮
    $exportAll: $(".export-all"), //主页面绑定的导出当前台账的按钮
    $adduser: $("#addUser"), //编辑增加用户信息
    $editUser: $("#editUser"), //编辑用户信息
    $viewUser: $("#viewUser"), //用户页面的查看
    $updateuser: $(".updateuser"), //进行修改用户的监听
    $frozenuser: $(".frozenuser"), //用户的冻结
    $removeuser: $(".removeuser"), //移除
    $items: $('.top .item'), //搜索条件dom
    $searchInput: $("#searchInput"), //根据关键字进行搜索
    $searchreset: $(".search_reset"), //重置按钮的写法
    $btn_selectOrgan: $("#btn_selectOrgan"), //邀请页面部门的选择
    differenceInvite: "1", //用于区分组织机构模态框打开的是哪一个1表示邀请打开，2表示编辑打开
    edituserData: null, //进行编辑页面信息的存储
    activeObj: { "status": "0,-1,1" }, //用于高亮显示默认选中状态
    currentName: null, //用于存储当前页面的部门名称
    parentOrgId: null, //用于存储父部门Id
    currentId: null, //用于存储当前部门的Id
    chooseOrgId: null, //进行人员邀请的时候，进行部门的选择
    // editChooseOrgId: null, //进行编辑页面时候的选择
    operationhtml: null, //操作内容
    searchObj: {},
    $flag: true,
    defaultOptions: {
        tip: '冻结后，该用户将不能进行任何操作？',
        name_title: '提示',
        name_cancel: '取消',
        name_confirm: '确定',
        isCancelBtnShow: true
    },
    querryObj: { //请求的搜索条件
        "pageNum": 1, //第几页
        "pageSize": 10, //每页记录数
        "status": "0,-1,1"
    },
    init: function() {
        this.chooseon(); //初始化显示被选中的
        this.requestOrganTree("init"); //表示初始化的时候请求
        this.bindEvent();
    },
    chooseon: function() {
        var that = this;
        var $parent = that.$items.parent('[data-class="status"]');
        $parent.find(".item").removeClass('active');
        $parent.find(".item[data-value='" + that.activeObj.status + "']").addClass('active');
    },
    requestOrganTree: function(desc) { //请求组织机构
        var that = this;
        $.ajax({
            type: "GET",
            url: "/cloudlink-core-framework/organization/getTree",
            contentType: "application/json",
            data: {
                token: lsObj.getLocalStorage('token'),
                enterpriseId: JSON.parse(lsObj.getLocalStorage('userBo')).enterpriseId
            },
            dataType: "json",
            success: function(data) {
                if (data.success != 1) {
                    xxwsWindowObj.xxwsAlert('网络连接出错！');
                    return;
                }
                that.currentId = data.rows[0].id;
                that.currentName = data.rows[0].name;
                that.parentOrgId = data.rows[0].id;
                that.inittable(data.rows[0].id);
                if (desc == "init") {
                    that.renderOrganTree(data.rows);
                } else {
                    that.renderOrganTreeAndCheckbox(data.rows);
                }

            },
            statusCode: {
                404: function() {
                    xxwsWindowObj.xxwsAlert('网络连接出错！');
                }
            }
        });
    },
    renderOrganTree: function(data) { //遍历tree
        var that = this;
        var setting = {
            view: {
                showLine: false,
                showIcon: false,
                addDiyDom: function(treeId, treeNode) {
                    var spaceWidth = 0;
                    var switchObj = $("#" + treeNode.tId + "_switch"),
                        icoObj = $("#" + treeNode.tId + "_ico");
                    switchObj.remove();
                    icoObj.before(switchObj);
                    if (treeNode.level > 1) {
                        var spaceStr = "<span style='display: none;width:" + (spaceWidth * (treeNode.level - 1)) + "px'></span>";
                        switchObj.before(spaceStr);
                    }
                }
            },
            data: {
                key: {
                    name: 'name'
                },
                simpleData: {
                    enable: true,
                    idKey: 'id',
                }
            },
            callback: {
                onClick: this.zTreeOnClick
            }
        };
        that.zTree = $.fn.zTree.init($("#organ_list"), setting, data);
        $(".ztree").find("a").eq(0).addClass("curSelectedNode");
        // $(".ztree a").find("span").eq(0).remove();
        that.zTree.expandAll(true);
    },
    zTreeOnClick: function(event, treeId, treeNode) {
        $(".ztree").find("a").eq(0).removeClass("curSelectedNode");
        usermanager.currentName = treeNode.name;
        usermanager.currentId = treeNode.id;
        usermanager.refreshTable(treeNode.id);
    },
    inittable: function(currentId) { //初始化表格
        var that = this;
        $('#table').bootstrapTable({
            url: "/cloudlink-core-framework/user/queryPageByOrgId?token=" + lsObj.getLocalStorage('token'), //请求数据url
            method: 'GET',
            toolbar: "#toolbar",
            toolbarAlign: "left",
            cache: false, //是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
            showHeader: true,
            showRefresh: true,
            striped: true, //出现渐变色
            pagination: true, //分页
            sidePagination: 'server', //分页方式：client客户端分页，server服务端分页（*）
            pageNumber: 1,
            pageSize: 10,
            pageList: [10, 20, 50], //分页步进值
            queryParamsType: '', //默认值为 'limit' ,在默认情况下 传给服务端的参数为：offset,limit,sort
            // 设置为 ''  在这种情况下传给服务器的参数为：pageSize,pageNumber
            queryParams: function(params) {
                that.searchObj.pageSize = params.pageSize;
                that.searchObj.pageNum = params.pageNumber;
                that.searchObj.status = "0,1,-1";
                that.searchObj.orgId = currentId;
                that.searchObj.enterpriseId = JSON.parse(lsObj.getLocalStorage("userBo")).enterpriseId
                return that.searchObj;
            },
            responseHandler: function(res) {
                return res;
            },
            //表格的列
            columns: [{
                    field: 'userName', //域值
                    title: '姓名',
                    align: 'center',
                    visible: true, //false表示不显示
                    sortable: false, //启用排序
                    width: '15%',
                    editable: true,
                }, {
                    field: 'mobileNum', //域值
                    title: '手机号', //内容
                    align: 'center',
                    visible: true, //false表示不显示
                    sortable: false, //启用排序
                    width: '11%',
                    editable: true,
                }, {
                    field: 'orgName', //域值
                    title: '部门', //内容
                    align: 'center',
                    visible: true, //false表示不显示
                    sortable: false, //启用排序
                    width: '15%',
                    editable: true,
                }, {
                    field: 'roleNames', //域值
                    title: '角色', //内容
                    align: 'center',
                    visible: true, //false表示不显示
                    sortable: false, //启用排序
                    width: '13%',
                }, {
                    field: 'position', //域值
                    title: '职位', //内容
                    align: 'center',
                    visible: true, //false表示不显示
                    sortable: false, //启用排序
                    width: '15%',
                    editable: true,
                    formatter: function(value, row, index) {
                        if (value == null || value == "") {
                            return "";
                        } else {
                            return value;
                        }
                    }
                }, {
                    field: 'status', //域值
                    title: '人员状态', //内容
                    align: 'center',
                    visible: true, //false表示不显示
                    sortable: false, //启用排序
                    width: '10%',
                    editable: true,
                    formatter: function(value, row, index) {
                        if (value == 1) {
                            return "<span class='join'>已激活</span>";
                        } else if (value == "0") {
                            return "<span class='nojoin'>未激活</span>";
                        } else if (value == -1) {
                            return "<span class='frozen'>冻&nbsp&nbsp;&nbsp&nbsp;结</span>";
                        }

                    }
                },
                {
                    field: 'operation',
                    title: '操作',
                    align: 'center',
                    events: operateEvents,
                    formatter: function(value, row, index) {
                        var s = '';
                        if (row.status == 0) {
                            s += '<a class="inviter"  href="javascript:void(0)" title="再次邀请"><i></i></a>';
                        } else if (that.activeObj.status == '0,-1,1') {
                            s += '<a style="display:inline-block;width:22px;height:16px;"><i></i></a>';
                        }
                        s += '<a class="view"  href="javascript:void(0)" title="查看"><i></i></a>' +
                            '<a class="edituser"  href="javascript:void(0)" title="编辑"><i></i></a>' +
                            '<a class="remove"  href="javascript:void(0)" title="移除"><i></i></a>';
                        return [
                            s
                        ].join('');
                    }
                }
            ]
        });
    },
    refreshTable: function(currentId) { //根据条件进行筛选
        var that = this;
        that.querryObj.pageNum = '1';
        $('#table').bootstrapTable('refreshOptions', {
            pageNumber: +that.querryObj.pageNum,
            pageSize: +that.querryObj.pageSize,
            queryParams: function(params) {
                that.querryObj.pageSize = params.pageSize;
                that.querryObj.pageNum = params.pageNumber;
                that.querryObj.orgId = currentId;
                that.querryObj.enterpriseId = JSON.parse(lsObj.getLocalStorage("userBo")).enterpriseId
                    // alert(JSON.stringify(that.querryObj));
                return that.querryObj;
            }
        });
    },
    bindEvent: function() { //绑定监听事件
        var that = this;
        that.$addbut.click(function() {
            //打开新增用户的模态框
            $("#departments").val(that.currentName);
            that.$adduser.modal();
        });
        $(".departments").click(function() {
            that.differenceInvite = "1";
            if (that.chooseOrgId != null && that.chooseOrgId != "") {
                departmentObj.getAllData("", that.chooseOrgId);
            } else {
                departmentObj.getAllData("", that.currentId);
            }
        });
        $(".invite").click(function() {
            that.inviteUser("invite"); //用于表示点击邀请
            // console.log("dd")
        });
        $(".againinvite").click(function() {
            that.inviteUser("againinvite"); //用于表示再次邀请
        });
        that.$exportAll.click(function() {
            that.exportAll();
        });
        $(".editdepartment").click(function() {
            that.differenceInvite = "2";
            // if (that.editChooseOrgId != null && that.editChooseOrgId != "") {
            //     departmentObj.getAllData("", that.editChooseOrgId);
            // } else {
            departmentObj.getAllData("", that.edituserData.orgId);
            // }
        });
        that.$updateuser.click(function() {
            that.updateuserSave();
        });
        that.$frozenuser.click(function() {
            that.frozenuser(); //用户的冻结
        });
        that.$removeuser.click(function() {
            that.defaultOptions.tip = '您是否确定移除该用户？';
            that.defaultOptions.callBack = function() {
                that.removeUser(that.edituserData, "edit");
            };
            xxwsWindowObj.xxwsAlert(usermanager.defaultOptions);
        });
        /* 选择条件 */
        that.$items.click(function() {
            var key = $(this).parent().attr("data-class");
            var value = $(this).attr("data-value");
            that.querryObj.status = value;
            that.activeObj.status = value;
            that.refreshTable(that.currentId);
            that.chooseon();
        });
        $('#gf_Btn').click(function() {
            var s = $(this).parent().find('input').val();
            that.querryObj.keyWord = s;
            that.refreshTable(that.currentId);
        });
        /* keyup事件 */
        that.$searchInput.bind('keyup', function(event) {
            if (event.keyCode == "8") { //监听backspace事件
                var s = $(this).parent().find('input').val();
                that.querryObj.keyWord = s;
                that.refreshTable(that.currentId);
            }
        });
        that.$searchInput.keypress(function(e) {
            if (e && e.keyCode === 13) { // enter 键
                var s = $(this).parent().find('input').val();
                that.querryObj.keyWord = s;
                that.refreshTable(that.currentId);
            }
        });
        /**重置搜索按钮 */
        that.$searchreset.click(function() {
            that.querryObj.status = "0,-1,1";
            that.querryObj.keyWord = ""; //将搜索框里面的内容清空
            $("#searchInput").val(""); //将搜索框里面的内容清空
            that.activeObj.status = "0,-1,1";
            $(".ztree").find("a").removeClass("curSelectedNode");
            $(".ztree").find("a").eq(0).addClass("curSelectedNode");
            that.refreshTable(that.parentOrgId);
            that.chooseon();
        });
        /**关闭打开后的部门选择模态框 */
        that.$btn_selectOrgan.click(function() {
            var arr = departmentObj.getSelectDepart().value;
            if (that.differenceInvite == "1") {
                $("#departments").val(arr[0].name);
                that.chooseOrgId = arr[0].id;
            } else {
                $("#editdepartment").val(arr[0].name);
                that.edituserData.orgId = arr[0].id;
                that.edituserData.orgName = arr[0].name;
            }
        });
    },
    exportAll: function() {
        var that = this;
        var _data = {
            "enterpriseId": JSON.parse(lsObj.getLocalStorage("userBo")).enterpriseId, //企业ID 必填当前企业
            "orgId": that.currentId, // 所属部门
            "status": that.querryObj.status, //状态  1：加入  0：受邀  -1：冻结
            "token": lsObj.getLocalStorage("token")
        }
        if (that.querryObj.keyWord != null && that.querryObj.keyWord != "" && that.querryObj.keyWord != undefined) {
            _data.keyWord = that.querryObj.keyWord;
        }
        // alert(JSON.stringify(_data));
        var options = {
            "url": '/cloudlink-inspection-analysis/personalStatistical/exportUser',
            "data": _data,
            "method": 'GET'
        }
        that.downLoadFile(options);
    },
    downLoadFile: function(options) {
        var config = $.extend(true, {
            method: 'GET'
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
    againinviteUser: function(data) { //再次进行人员的邀请操作
        var that = this;
        var userBo = JSON.parse(lsObj.getLocalStorage("userBo"));
        var _data = {
            "userMode": "4",
            "enterpriseId": userBo.enterpriseId,
            "inviter": userBo.objectId,
            "invitedPhone": data.mobileNum,
            "signName": ""
        }
        $.ajax({
            url: "/cloudlink-core-framework/invite/sendInviteMsm",
            async: false,
            contentType: "application/json",
            data: JSON.stringify(_data),
            type: "post",
            dataType: "json",
            success: function(data, status) {
                if (data.success == 1) {
                    xxwsWindowObj.xxwsAlert("邀请成功");
                } else if (data.code == "301") {
                    xxwsWindowObj.xxwsAlert("该人员当日已经被邀请过，本日无法再次邀请");
                } else if (data.code == "302") {
                    xxwsWindowObj.xxwsAlert("发送短信异常，请联系管理员");
                } else {
                    xxwsWindowObj.xxwsAlert("服务异常，请稍候重试");
                }
            }
        });
    },
    inviteUser: function(des) { //新增页面人员的邀请操作
        var that = this;
        if (that.$flag == true) {
            that.$flag = false;
            var userBo = JSON.parse(lsObj.getLocalStorage("userBo"));
            var _data = {
                "inviteMode": "1",
                "inviter": userBo.objectId,
                "enterpriseId": userBo.enterpriseId,
                "token": lsObj.getLocalStorage("token"),
            }
            if (that.chooseOrgId != null && that.chooseOrgId != "") {
                _data.orgId = that.chooseOrgId;
            } else {
                _data.orgId = that.currentId;
            }
            if (that.addcheckInput()) {
                that.again();
                return;
            } else {
                var roleIds = $(".companyRole").val();
                var position = $("#addposition").val().trim();
                var userName = $("#addname").val().trim();
                var MobileNum = $("#tel").val().trim();
                _data.roleIds = roleIds;
                _data.userName = userName;
                _data.position = position;
                _data.mobileNum = MobileNum;
            }
            $.ajax({
                url: "/cloudlink-core-framework/invite/inviteUser",
                async: false,
                contentType: "application/json",
                data: JSON.stringify(_data),
                type: "post",
                dataType: "json",
                success: function(data, status) {
                    // console.log(data);
                    if (data.success == 1) {
                        xxwsWindowObj.xxwsAlert("邀请成功", function() {
                            if (des == "invite") {
                                $("#tel").val(""); //数据的清除
                                $("#addname").val("");
                                $("#addposition").val("");
                                // setTimeout(function() {
                                that.$adduser.modal('hide'); //模态框的关闭
                                // }, 5);
                                that.refreshTable(that.currentId);
                            } else {
                                that.refreshTable(that.currentId);
                                //数据的清除
                                $("#tel").val("");
                                $("#addname").val("");
                            }
                        });
                    } else if (data.code == "R01") {
                        xxwsWindowObj.xxwsAlert("该用户已加入企业，无需再次邀请。", function() {
                            $("#tel").val("");
                            $("#addname").val("");
                        });
                    } else if (data.code == "400") {
                        xxwsWindowObj.xxwsAlert("发送短信异常，请联系客服。", function() {
                            $("#tel").val("");
                            $("#addname").val("");
                        });
                    } else {
                        xxwsWindowObj.xxwsAlert("服务异常，请稍候重试。", function() {
                            $("#tel").val("");
                            $("#addname").val("");
                        });
                    }
                    that.again();
                },
                error: function() {
                    that.again();
                }
            });
        }
    },
    addcheckInput: function() {
        if (!checkname()) {
            return true;
        } else if (!checktel()) {
            return true;
        } else if (!checkposition()) {
            return true;
        } else {
            return false;
        }
    },
    initClickUser: function() { //进行点击选中一行记录的时候，进行信息的编辑页面的赋值
        var data = this.edituserData
        if (data.userName != null && data.userName != "") {
            $("#editname").val(data.userName);
        } else {
            $("#editname").val("");
        }
        if (data.mobileNum != null && data.mobileNum != "") {
            $("#edittel").val(data.mobileNum);
        } else {
            $("#edittel").val("");
        }
        if (data.sex != null && data.sex != "") {
            $(".editselectsex").val(data.sex);
        } else {
            $(".editselectsex").val("男");
        }
        if (data.roleIds != null && data.roleIds != "") {
            $(".editcompanyRole").val(data.roleIds);
        } else {
            $("#editcompanyRole").val("");
        }
        if (data.orgName != null && data.orgName != "") {
            $("#editdepartment").val(data.orgName);
        } else {
            $("#editdepartment").val("");
        }
        if (data.position != null && data.position != "") {
            $("#editposition").val(data.position);
        } else {
            $("#editposition").val("");
        }
        if (data.age != null && data.age != "") {
            $("#editage").val(data.age);
        } else {
            $("#editage").val("");
        }
        if (data.wechat != null && data.wechat != "") {
            $("#editwechat").val(data.wechat);
        } else {
            $("#editwechat").val("");
        }
        if (data.email != null && data.email != "") {
            $("#editemail").val(data.email);
        } else {
            $("#editemail").val("");
        }
        if (data.qq != null && data.qq != "") {
            $("#editqq").val(data.qq);
        } else {
            $("#editqq").val("");
        }

    },
    removeUser: function(data, desc) { //进行这一行人员删除  desc用于区分移除来自编辑页面还是外面的行数
        var that = this;
        var _data = {
            "objectId": data.objectId,
            "enterpriseId": data.enterpriseId
        }
        $.ajax({
            url: "/cloudlink-core-framework/user/removeFromEnterprise",
            async: false,
            contentType: "application/json",
            data: JSON.stringify(_data),
            type: "post",
            dataType: "json",
            success: function(data, status) {
                if (data.success == 1) {
                    xxwsWindowObj.xxwsAlert("移除成功", function() {
                        if (desc != null && desc != "") {
                            // setTimeout(function() {
                            that.$viewUser.modal('hide');
                            // }, 100);
                        }
                        that.refreshTable(that.currentId); //删除成功之后，进行表格的刷新
                    });
                } else {
                    xxwsWindowObj.xxwsAlert("服务异常，请稍候重试");
                }
            }
        });
    },
    updateuserSave: function() { //进行信息的修改保存
        var that = this;
        var data = that.edituserData;
        var _data = {
                'enterpriseId': that.edituserData.enterpriseId,
                'objectId': that.edituserData.objectId,
                'deleteRoleIds': that.edituserData.roleIds,
                'addRoleIds': $(".editcompanyRole").val(),
                'orgId': that.edituserData.orgId
            }
            // if (that.editChooseOrgId != null && that.editChooseOrgId != "") {
            //     _data.orgId = that.editChooseOrgId;
            // } else {
            // _data.orgId = that.edituserData.orgId;
            // }
        var editposition = $("#editposition").val().trim();
        if (editposition != "" && editposition != null) {
            if (checkposition(editposition)) {
                _data.position = editposition;
            } else {
                return;
            }
        } else {
            _data.position = "";
        }
        $.ajax({
            type: "POST",
            url: "/cloudlink-core-framework/user/update?token=" + lsObj.getLocalStorage('token'),
            contentType: "application/json",
            data: JSON.stringify(_data),
            dataType: "json",
            success: function(data) {
                if (data.success == 1) {
                    xxwsWindowObj.xxwsAlert("修改成功", function() {
                        $("#editposition").val("");
                        that.refreshTable(that.currentId);
                        // setTimeout(function() {
                        that.$editUser.modal('hide');
                        // }, 5);

                    });
                } else {
                    xxwsWindowObj.xxwsAlert("服务异常，请稍候重试");
                }
            }
        });
    },
    viewuserData: function(data) { //进行一行信息的查看
        if (data.objectId == JSON.parse(lsObj.getLocalStorage("userBo")).objectId) {
            $(".removeuser").css("display", "none");
            $(".frozenuser").css("display", "none");
        } else if (data.status == -1) {
            $(".removeuser").css("display", "inline-block");
            $(".frozenuser").css("display", "inline-block");
            $(".frozenuser").css("background", '#59b6fc');
            $(".frozenuser").text("账户激活");
        } else if (data.status == 0) {
            $(".removeuser").css("display", "inline-block");
            $(".frozenuser").css("display", "none");
        } else if (data.status == 1) {
            $(".removeuser").css("display", "inline-block");
            $(".frozenuser").css("display", "inline-block");
            $(".frozenuser").text("账户冻结");
        }

        if (data.userName != "" && data.userName != null) {
            $(".viewname").text(data.userName);
        } else {
            $(".viewname").text("");
        }
        if (data.roleNames != "" && data.roleNames != null) {
            $(".viewroleName").text(data.roleNames);
        } else {
            $(".viewroleName").text("");
        }
        if (data.mobileNum != "" && data.mobileNum != null) {
            $(".viewMobileNum").text(data.mobileNum);
        } else {
            $(".viewMobileNum").text("");
        }
        if (data.age != "" && data.age != null) {
            $(".editage").text(data.age);
        } else {
            $(".editage").text("");
        }
        if (data.wechat != "" && data.wechat != null) {
            $(".editwechat").text(data.wechat);
        } else {
            $(".editwechat").text("");
        }
        if (data.orgName != null && data.orgName != "") {
            $(".editorgName").text(data.orgName);
        } else {
            $(".editorgName").text("");
        }
        if (data.position != null && data.position != "") {
            $(".editposition").text(data.position);
        } else {
            $(".editposition").text("");
        }
        if (data.sex != null && data.sex != "") {
            $(".editsex").text(data.sex);
        } else {
            $(".editsex").text("男");
        }
        if (data.qq != null && data.qq != null) {
            $(".editqq").text(data.qq);
        } else {
            $(".editqq").text("");
        }
        if (data.email != null && data.email != "") {
            $(".editemail").text(data.email);
        } else {
            $(".editemail").text("");
        }
    },
    frozenuser: function() { //信息查看页面里面的用户冻结
        var that = this;
        if (that.edituserData.status == -1) {
            that.defaultOptions.tip = '激活后，该用户可以正常访问系统？';
            that.defaultOptions.callBack = function() {
                $.ajax({
                    url: "/cloudlink-core-framework/user/unfreeze",
                    async: false,
                    contentType: "application/json",
                    data: JSON.stringify({
                        'enterpriseId': that.edituserData.enterpriseId,
                        'objectId': that.edituserData.objectId
                    }),
                    type: "post",
                    dataType: "json",
                    success: function(data, status) {
                        if (data.success == 1) {
                            that.$viewUser.modal('hide');
                            $(".frozenuser").text("账户冻结");
                            that.refreshTable(that.currentId);
                            that.edituserData.status == 1;
                        } else {
                            xxwsWindowObj.xxwsAlert("服务异常，请稍候重试");
                        }
                    }
                });
            }
            xxwsWindowObj.xxwsAlert(that.defaultOptions);
        } else {
            that.defaultOptions.tip = '冻结后，该用户将不能进行任何操作？';
            that.defaultOptions.callBack = function() {
                $.ajax({
                    url: "/cloudlink-core-framework/user/freeze",
                    async: false,
                    contentType: "application/json",
                    data: JSON.stringify({
                        'enterpriseId': that.edituserData.enterpriseId,
                        'objectId': that.edituserData.objectId
                    }),
                    type: "post",
                    dataType: "json",
                    success: function(data, status) {
                        if (data.success == 1) {
                            that.$viewUser.modal('hide');
                            $(".frozenuser").text("账户激活");
                            that.refreshTable(that.currentId);
                            that.edituserData.status == -1;
                        } else {
                            xxwsWindowObj.xxwsAlert("服务异常，请稍候重试");
                        }
                    }
                });
            }
            xxwsWindowObj.xxwsAlert(that.defaultOptions);
        };

    },
    again: function() {
        this.$flag = true;
    }
}

window.operateEvents = {
    'click .view': function(e, value, row, index) {
        usermanager.$viewUser.modal();
        usermanager.edituserData = row; //编辑和查看用户信息
        usermanager.viewuserData(row);
    },
    'click .inviter': function(e, value, row, index) {
        usermanager.againinviteUser(row);
    },
    'click .remove': function(e, value, row, index) {
        if (row.objectId == JSON.parse(lsObj.getLocalStorage("userBo")).objectId) {
            alert("您是该企业的系统管理员，当前无法移除，如需移除，请您移交系统管理员权限。\n由新系统管理员进行移除。");
        } else {
            usermanager.defaultOptions.tip = '您是否确定移除该用户？';
            usermanager.defaultOptions.callBack = function() {
                usermanager.removeUser(row);
            };
            xxwsWindowObj.xxwsAlert(usermanager.defaultOptions);
        }
    },
    'click .edituser': function(e, value, row, index) {
        // $("#table").find("tr").removeClass("tablebg");
        // $("#table").find("tr").eq(parseInt(index) + 1).addClass("tablebg");
        usermanager.$editUser.modal() //编辑和查看用户信息
        usermanager.edituserData = row;
        usermanager.initClickUser();
    }
};

//input输入框的验证操作
/************** 姓名正则**************/
$('#addname').blur(function() {
    checkname();
});

function checkname() {
    var nameVal = $('#addname').val().trim();
    var nameReg = /^[a-zA-Z\u4e00-\u9fa5]/g;
    if (nameVal == "" || nameVal == null) {
        $('.addnameReg').text("请输入您的姓名");
        return false;
    } else if (nameVal.length > 15) {
        $('.addnameReg').text("您输入的姓名过长，最多15个字。");
        return false;
    } else if (nameVal.length < 2) {
        $('.addnameReg').text("您输入的姓名过短，最少2个字。");
        return false;
    } else if (!nameReg.test(nameVal)) {
        $('.addnameReg').text("您输入的姓名格式有误。");
        return false;
    } else {
        $('.addnameReg').text("");
        return true;
    }
}
/**************手机正则**************/
$('#tel').blur(function() {
    checktel();
});

function checktel() {
    var numberVal = $('#tel').val().trim();
    var numberReg = /^1\d{10}$/;
    if (numberVal == "" || numberVal == null) {
        $('.numberREG').text("请输入您的手机号");
        return false;
    } else if (!numberReg.test(numberVal)) {
        $('.numberREG').text("您输入的手机号有误");
        return false;
    } else {
        $('.numberREG').text("");
        return true;
    }
}
/**************职位正则**************/
$('#addposition').blur(function() {
    var emailVal = $('#addposition').val().trim();
    checkposition(emailVal);
});
$('#editposition').blur(function() {
    var emailVal = $('#editposition').val().trim();
    checkposition(emailVal);
});

function checkposition(emailVal) {
    var emailReg = /^[\u4E00-\u9FA5A-Za-z0-9]{2,15}$/;
    if (emailVal == "" || emailVal == null) {
        $('.positionReg').text("")
        return true;
    } else if (emailVal.length > 15) {
        $('.positionReg').text("您输入的职位过长，最多15字。");
        return false;
    } else if (!emailReg.test(emailVal)) {
        $('.positionReg').text("您输入的职位格式有误")
        return false;
    } else {
        $('.positionReg').text("")
        return true;
    }
}
/************** 年龄正则**************/
$('.age').blur(function() {
    var ageVal = $('.age').val().trim();
    if (ageVal == "" || ageVal == null) {
        $('.ageReg').text("请输入您的年龄");
        return false;
    } else {
        $('.ageReg').text("");
        return true;
    }
});

/**************微信**************/
$('.wechart').blur(function() {
    var wechartVal = $('.wechart').val().trim();
    if (wechartVal == "" || wechartVal == null) {
        $('.wechartReg').text("请输入您的微信号码");
        return false;
    } else {
        $('.wechartReg').text("");
        return true;
    }
});
/**************QQ**************/
$('.qq').blur(function() {
    var qqVal = $('.qq').val().trim();
    var qqReg = /^[1-9][0-9]{4,9}$/;
    if (qqVal == "" || qqVal == null) {
        $('.qqReg').text("请输入您的QQ号码");
        return false;
    } else if (!qqReg.test(qqVal)) {
        $('.qqReg').text("您输入的QQ号码有误");
        return false;
    } else {
        $('.qqReg').text("");
        return true;
    }
});
/**************邮箱**************/
$('.email').blur(function() {
    var emailVal = $('.email').val().trim();
    var emailReg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/;
    if (emailVal == "" || emailVal == null) {
        $('.emailReg').text("请输入您的邮箱");
        return false;
    } else if (!emailReg.test(emailVal)) {
        $('.emailReg').text("您输入的邮箱格式有误")
        return false;
    } else {
        $('.emailReg').text("")
        return true;
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