var vue = new Vue({
    el: ".page",
    data: function () {
        return {
            isRight: false,
            currentNode: {
                nodeId: "",
            }, //当前选中的节点
            disabled: true,
            addGroup: "",
            form: {
                objectId: "",
                title: '添加',
                parentId: 0,
                name: "",
                parentName: "",
                level: 0,
                seq: 0
            },
            searchObj: {
                pageSize: 1,
                pageNum: 10,
                groupId: ""
            },
            selectPeopleArr: [],
            isHtml: true,
        }
    },
    watch: {
        // 'currentNode.nodeId': function () {
        // console.log(this.currentNode);
        //     if (this.currentNode.leaf) {
        //         this.disabled = false;
        //     } else {
        //         this.disabled = true;
        //     }
        // }
    },
    mounted: function () {
        var that = this;
        that.getAllData(); //获取所有的分组信息
        that.inittable();
    },
    methods: {
        inittable: function () { //初始化表格
            var that = this;
            $('#table').bootstrapTable({
                url: "/cloudlink-inspection-event/regionalGroup/pagePersonByGroupId?token=" + lsObj.getLocalStorage('token'), //请求数据url
                method: 'post',
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
                queryParams: function (params) {
                    that.searchObj.pageSize = params.pageSize;
                    that.searchObj.pageNum = params.pageNumber;
                    that.searchObj.groupId = that.currentNode.nodeId || "";
                    that.searchObj.ifRecursion = that.currentNode.leaf ? false : true;
                    return that.searchObj;
                },
                responseHandler: function (res) {
                    that.selectPeopleArr = [];
                    res.rows[0].resultList.forEach(function (item) {
                        var obj = {
                            relationshipPersonId: item.personId,
                            relationshipPersonName: item.personName
                        }
                        that.selectPeopleArr.push(obj);
                    });
                    return {
                        rows: res.rows[0].resultList,
                        total: res.rows[0].total
                    }
                },
                //表格的列
                columns: [{
                        field: 'parentGroupName', //域值
                        title: '区域', //内容
                        align: 'center',
                        visible: true, //false表示不显示
                        sortable: false, //启用排序
                        width: '25%',
                        editable: true,
                    }, {
                        field: 'groupName', //域值
                        title: '分组', //内容
                        align: 'center',
                        visible: true, //false表示不显示
                        sortable: false, //启用排序
                        width: '25%',
                        editable: true,
                    }, {
                        field: 'personName', //域值
                        title: '姓名',
                        align: 'center',
                        visible: true, //false表示不显示
                        sortable: false, //启用排序
                        width: '25%',
                        editable: true,
                    },

                    {
                        field: 'orgName', //域值
                        title: '部门', //内容
                        align: 'center',
                        visible: true, //false表示不显示
                        sortable: false, //启用排序
                        width: '25%',
                        editable: true,
                    }
                ]
            });
        },
        getAllData: function () { //获取所有的数据
            var _this = this;
            $.ajax({
                type: "POST",
                url: "/cloudlink-inspection-event/regionalGroup/listTree?token=" + lsObj.getLocalStorage('token'),
                contentType: "application/json",
                dataType: "json",
                success: function (data) {
                    data.rows[0].text = JSON.parse(lsObj.getLocalStorage("userBo")).enterpriseName;
                    _this.renderDepartment(data.rows);
                }
            });
        },
        renderDepartment: function (e) { //遍历部门tree，渲染页面
            var _this = this;
            var setting = {
                edit: {
                    enable: true,
                    removeTitle: "删除",
                    renameTitle: "修改",
                    showRemoveBtn: function setRemoveBtn(treeId, treeNode) {
                        return treeNode.id && _this.currentNode.nodeId == treeNode.id;
                    },
                    showRenameBtn: function setRenameBtn(treeId, treeNode) {
                        return treeNode.id && _this.currentNode.nodeId == treeNode.id;
                    },
                },
                view: {
                    showTitle: false,
                    showLine: false,
                    showIcon: false,
                    addDiyDom: function (treeId, treeNode) {
                        var spaceWidth = 0;
                        var switchObj = $("#" + treeNode.tId + "_switch");
                        var icoObj = $("#" + treeNode.tId + "_ico");
                        switchObj.remove();
                        if (!treeNode.leaf) {
                            icoObj.before(switchObj);
                        }
                        var sObj = $("#" + treeNode.tId + "_span"); //获取节点信息
                        var title = "添加分组";
                        if (!treeNode.id) {
                            title = "添加区域";
                        }
                        var addStr = "<span class='button add' id='addBtn_" + treeNode.tId + "' title='" + title + "' ></span>"; //定义添加按钮
                        if (!treeNode.leaf || treeNode.parentId == '0') {
                            sObj.before(addStr); //加载添加按钮
                            $("#addBtn_" + treeNode.tId).bind("click", function (e) {
                                e.stopPropagation();
                                _this.createArea();
                            });
                        }
                        if (treeNode.level > 1) {
                            var spaceStr = "<span style='display: none;width:" + (spaceWidth * (treeNode.level - 1)) + "px'></span>";
                            switchObj.before(spaceStr);
                        }
                    },
                },
                data: {
                    key: {
                        name: 'text'
                    },
                    simpleData: {
                        enable: true,
                        pIdKey: 'pid'
                    }
                },
                check: {
                    enable: false,
                    chkStyle: "checkbox",
                },
                callback: {
                    beforeClick: function (treeId, treeNode) {
                        _this.currentNode.nodeId = treeNode.id;
                        _this.currentNode.nodeName = treeNode.text;
                        _this.currentNode.leaf = treeNode.leaf;
                        _this.currentNode.parentId = treeNode.parentId;
                        _this.zTree.expandNode(treeNode, true); //打开当前节点
                        _this.refreshTable();
                        $(".node_name").removeClass("clickNade");
                        $("#" + treeNode.tId + "_a").find(".node_name").addClass("clickNade");
                        $(".add").css("display", 'none');
                        $("#" + treeNode.tId + "_a").find(".add").css("display", "block");
                        //点击的节点是不是又子集
                        if (treeNode.children.length > 0 || (treeNode.parentId != "0" && treeNode.parentId != null)) {
                            _this.isHtml = true;
                            if (treeNode.parentId != "0" && treeNode.parentId != null) {
                                _this.disabled = false;
                            } else {
                                _this.disabled = true;
                            }
                        } else {
                            _this.isHtml = false;
                        }
                    },
                    beforeRemove: function (treeId, treeNode) {
                        var defaultOptions = {
                            tip: '是否删除？',
                            name_title: '提示',
                            name_cancel: '取消',
                            name_confirm: '确定',
                            isCancelBtnShow: true,
                            callBack: function () {
                                _this._delNodeToServer(treeNode);
                            }
                        };
                        xxwsWindowObj.xxwsAlert(defaultOptions);
                        return false;
                    },
                    beforeEditName: function (treeId, treeNode) {
                        var nodes = _this.zTree.getNodesByParam("id", treeNode.parentId, null);
                        _this.form.parentName = nodes.length > 0 ? nodes[0].text : "";
                        _this.form.title = "修改";
                        _this.form.objectId = treeNode.id;
                        _this.form.name = treeNode.text;
                        _this.form.parentId = treeNode.parentId;
                        if (treeNode.parentId == '0') {
                            _this.addGroup = "区域名称：";
                        } else {
                            _this.addGroup = "分组名称：";
                        }
                        $("#departmentAdd").modal();
                        return false;
                    }
                }
            };
            _this.zTree = $.fn.zTree.init($("#department_list"), setting, e);
            _this.zTree.expandAll(true);
            if (_this.currentNode.nodeId == '' || _this.currentNode.nodeId == null) {
                var nodes = _this.zTree.getNodes();
                _this._setCurrenrNode(nodes[0]);
            } else {
                var nodes = _this.zTree.getNodesByParam("id", _this.currentNode.nodeId, null); //根据id查询节点对象数组
                _this._setCurrenrNode(nodes[0]);
            }
        },
        _setCurrenrNode: function (node) {
            var that = this;
            $("#" + node.tId + "_a").find(".add").css("display", "block");
            that.zTree.selectNode(node);
            that.currentNode.nodeId = node.id;
            that.currentNode.nodeName = node.text;
            if (node.children.length > 0 || (node.parentId != "0" && node.parentId != null)) {
                that.isHtml = true;
                if (node.parentId != null && node.parentId != "0") {
                    that.disabled = false;
                } else {
                    that.disabled = true;
                }
            } else {
                that.isHtml = false;
            }
        },
        createArea: function () {
            var that = this;
            delete that.form.id; //新增的时候没有id
            that.form.title = '添加';
            if (that.currentNode.parentId != '0' && that.currentNode.leaf) {
                xxwsWindowObj.xxwsAlert("区域划分不能再细分");
                return;
            }
            if (that.currentNode.nodeId) {
                that.form.parentId = that.currentNode.nodeId;
                // that.form.parentName = that.currentNode.nodeName;
                that.form.level = 1;
                that.addGroup = "分组名称：";
            } else {
                that.form.parentId = '0';
                // that.form.parentName = "";
                that.form.level = 0;
                that.addGroup = "区域名称：";
            }
            that.form.name = "";
            $("#departmentAdd").modal();
        },
        cancel: function () {
            $("#departmentAdd").modal('hide');
        },
        save: function () {
            var that = this;
            var url = "";
            var msg = "";
            if (that.form.name.trim() == "") {
                var tip = that.addGroup.subString(0, that.addGroup.length);
                xxwsWindowObj.xxwsAlert(tip + "不能为空");
                return;
            }
            if (that.form.title == '修改') {
                delete that.form.parentName;
                msg = "修改";
                url = "/cloudlink-inspection-event/regionalGroup/update?token=" + lsObj.getLocalStorage('token');

            } else {
                msg = "保存";
                url = "/cloudlink-inspection-event/regionalGroup/save?token=" + lsObj.getLocalStorage('token');
            }
            $.ajax({
                type: "POST",
                url: url,
                contentType: "application/json",
                data: JSON.stringify(that.form),
                dataType: "json",
                success: function (data) {
                    if (data.success == 1) {
                        xxwsWindowObj.xxwsAlert(msg + "成功", function () {
                            that.cancel();
                            that.getAllData();
                        });
                    } else {
                        if (data.code == "4005") {
                            xxwsWindowObj.xxwsAlert("该名称已存在");
                            return;
                        }
                        xxwsWindowObj.xxwsAlert(msg + "失敗");
                    }
                },
                error: function () {
                    xxwsWindowObj.xxwsAlert(msg + "失敗");
                }
            });
        },
        _delNodeToServer: function (treeNode) {
            var that = this;
            $.ajax({
                type: "GET",
                url: "/cloudlink-inspection-event/regionalGroup/delete?token=" + lsObj.getLocalStorage('token'),
                contentType: "application/json",
                data: {
                    id: treeNode.id
                },
                dataType: "json",
                success: function (data) {
                    if (data.success == 1) {
                        xxwsWindowObj.xxwsAlert("删除成功", function () {
                            that.getAllData();
                            that.currentNode.nodeId = "";
                        });
                    } else {
                        xxwsWindowObj.xxwsAlert("删除失败");
                    }
                },
                error: function (data) {
                    xxwsWindowObj.xxwsAlert("删除失败");
                }
            });
        },
        choosePeople: function () {
            var that = this;
            $("#selectPeople").modal();
            $("#selectPeople").on('shown.bs.modal', function (e) {
                peopleTreeObj.requestPeopleTree($("#selectPeople"), that.selectPeopleArr);
            });
        },
        selectPeople: function () {
            var that = this;
            var peopleObj = peopleTreeObj.getSelectPeople();
            var form = {
                groupId: that.currentNode.nodeId
            };
            var personFormList = [];
            if (peopleObj.selectedArr.length > 0) {
                peopleObj.selectedArr.forEach(function (item) {
                    var obj = {
                        personId: item.relationshipPersonId,
                        personName: item.relationshipPersonName
                    };
                    personFormList.push(obj);
                });
            }
            form.personFormList = personFormList;
            that.addRelationToServer(form);
        },
        addRelationToServer: function (obj) {
            var that = this;
            $.ajax({
                type: "POST",
                url: "/cloudlink-inspection-event/regionalGroup/updateWithPersonRelation?token=" + lsObj.getLocalStorage('token'),
                contentType: "application/json",
                data: JSON.stringify(obj),
                dataType: "json",
                success: function (data) {
                    if (data.success == 1) {
                        xxwsWindowObj.xxwsAlert("分配成功", function () {
                            $("#selectPeople").modal('hide');
                            that.refreshTable();
                        });
                    } else {
                        xxwsWindowObj.xxwsAlert("分配失败");
                    }
                }
            });
        },
        refreshTable: function () {
            var that = this;
            $('#table').bootstrapTable('refreshOptions', {
                queryParams: function () {
                    that.searchObj.pageSize = 10;
                    that.searchObj.pageNum = 1;
                    that.searchObj.groupId = that.currentNode.nodeId || "";
                    that.searchObj.ifRecursion = that.currentNode.leaf ? false : true;
                    return that.searchObj;
                }
            });
        }
    }
});