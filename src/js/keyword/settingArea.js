var vue = new Vue({
    el: ".page",
    data: function () {
        return {
            isRight: false,
            currentNode: {
                nodeId: "",
            }, //当前选中的节点
            disabled: true,
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
                pageNum: 10
            }
        }
    },
    watch: {
        'currentNode.nodeId': function () {
            if (this.currentNode.leaf) {
                this.disabled = false;
                // this.searchObj.ifRecursion = false;
            } else {
                this.disabled = true;
                // this.searchObj.ifRecursion = true;
            }
        }
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
                url: "/cloudlink-inspection-event/regionalGroup/getPersonByGroupId?token=" + lsObj.getLocalStorage('token'), //请求数据url
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
                queryParams: function (params) {
                    that.searchObj.pageSize = params.pageSize;
                    that.searchObj.pageNum = params.pageNumber;
                    that.searchObj.groupId = that.currentNode.nodeId;
                    that.searchObj.ifRecursion = that.currentNode.leaf ? false : true;
                    return that.searchObj;
                },
                responseHandler: function (res) {
                    return res;
                },
                //表格的列
                columns: [{
                        field: 'personName', //域值
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
                        formatter: function (value, row, index) {
                            if (value == null || value == "") {
                                return "";
                            } else {
                                return value;
                            }
                        }
                    },

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
                    _this.renderDepartment(data.rows);
                }
            });
        },
        renderDepartment: function (e) { //遍历部门tree，渲染页面
            var _this = this;
            var setting = {
                edit: {
                    enable: true,
                    showRemoveBtn: function setRemoveBtn(treeId, treeNode) {
                        return !treeNode.isParent;
                    }
                },
                view: {
                    showLine: false,
                    showIcon: false,
                    addDiyDom: function (treeId, treeNode) {
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
                        _this.zTree.expandNode(treeNode, true); //打开当前节点
                        _this.refreshTable();
                    },
                    beforeRemove: function (treeId, treeNode) {
                        var defaultOptions = {
                            tip: '是否删除',
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
                        $("#departmentAdd").modal();
                        return false;
                    }
                }
            };
            _this.zTree = $.fn.zTree.init($("#department_list"), setting, e);
            _this.zTree.expandAll(true);
            if (_this.currentNode.nodeId == '' || _this.currentNode.nodeId == null) {
                var nodes = _this.zTree.getNodes();
                _this.zTree.selectNode(nodes[0]);
                _this.currentNode.nodeId = nodes[0].id;
                _this.currentNode.nodeName = nodes[0].text;
                _this.currentNode.leaf = nodes[0].leaf;
            } else {
                var nodes = _this.zTree.getNodesByParam("id", _this.currentNode.nodeId, null); //根据id查询节点对象数组
                _this.zTree.selectNode(nodes[0]); //设置默认被选中
                _this.currentNode.nodeId = nodes[0].id;
                _this.currentNode.nodeName = nodes[0].text;
                _this.currentNode.leaf = nodes[0].leaf;
            }
        },
        createArea: function () {
            var that = this;
            delete that.form.id; //新增的时候没有id
            if (that.currentNode.nodeId) {
                that.form.parentId = that.currentNode.nodeId;
                that.form.parentName = that.currentNode.nodeName;
                that.form.level = 1;
            } else {
                that.form.parentId = '0';
                that.form.parentName = "";
                that.form.level = 0;
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
            if (that.form.title == '修改') {
                delete that.form.parentName;
                url = "/cloudlink-inspection-event/regionalGroup/update?token=" + lsObj.getLocalStorage('token');

            } else {
                url = "/cloudlink-inspection-event/regionalGroup/save?token=" + lsObj.getLocalStorage('token');
            }
            delete that.form.title;
            $.ajax({
                type: "POST",
                url: url,
                contentType: "application/json",
                data: JSON.stringify(that.form),
                dataType: "json",
                success: function (data) {
                    if (data.success == 1) {
                        that.cancel();
                        that.getAllData();
                    } else {

                    }
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
                        });
                    } else {
                        xxwsWindowObj.xxwsAlert("删除失败");
                    }
                }
            });
        },
        choosePeople: function () {
            $("#stakeholder").modal();
            $("#stakeholder").on('shown.bs.modal', function (e) {
                peopleTreeObj.requestPeopleTree($("#stakeholder"));
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
                        that.refreshTable();
                    } else {

                    }
                }
            });
        },
        refreshTable: function () {
            var that = this;
            $('#table').bootstrapTable('refreshOptions', {
                queryParams: function () {
                    that.searchObj.pageSize = 1;
                    that.searchObj.pageNum = 10;
                    that.searchObj.groupId = that.currentNode.nodeId;
                    that.searchObj.ifRecursion = that.currentNode.leaf ? false : true;
                    return that.searchObj;
                }
            });
        }
    }
});