/**企业部门的tree,调用getAllData(frameName, parentId, childId)打开
 * frameName---字符串(必填),可以为""，用于辨别来自哪个窗口
 * parentId---部门id（必填），默认选中的节点
 * childId---部门id（选填），删除的节点
 */
/** 
 * 调用getSelectDepart()，返回所选节点对象obj = {key: "",value: arr };
 * obj.key 来自哪个窗口的名称
 * obj.value 节点的对象
 */



var departmentObj = {
    zTree: null,
    _frameName: null,
    init: function() {
        var _this = this;
    },
    getAllData: function(frameName, parentId, childId) { //获取所有的数据
        $("#departmentSelect").modal();
        var _this = this;
        var userBo = lsObj.getLocalStorage('userBo');
        _this_frameName = frameName;
        $.ajax({
            type: "GET",
            url: "/cloudlink-core-framework/organization/getTree?token=" + lsObj.getLocalStorage('token'),
            contentType: "application/json",
            data: {
                token: lsObj.getLocalStorage('token'),
                enterpriseId: JSON.parse(userBo).enterpriseId
            },
            dataType: "json",
            success: function(data) {
                _this.renderDepartment(data.rows, parentId, childId);
            }
        });
    },
    renderDepartment: function(e, parentId, childId) { //遍历部门tree，渲染页面
        var _this = this;
        var setting = {
            view: {
                showLine: true,
                showIcon: false,
                selectedMulti: false,
                txtSelectedEnable: true
            },
            data: {
                key: {
                    name: 'name'
                },
                simpleData: {
                    enable: true,
                    pIdKey: 'pid'
                }
            },
            check: {
                enable: true,
                chkStyle: "radio",
                autoCheckTrigger: true,
                radioType: "all"
            },
            callback: {
                beforeClick: function(treeId, treeNode, clickFlag) {
                    _this.zTree.checkNode(treeNode, true, true);
                    _this.zTree.expandNode(treeNode, true); //打开当前节点
                },
                beforeCheck: function(treeId, treeNode) {
                    _this.zTree.selectNode(treeNode); //设置默认被选中
                }
            }
        };
        _this.zTree = $.fn.zTree.init($("#departmentTree"), setting, e);
        _this.zTree.expandAll(true);
        var nodes = _this.zTree.getNodesByParam("id", parentId, null); //根据id查询节点对象数组
        _this.zTree.selectNode(nodes[0]); //设置默认被选中
        _this.zTree.checkNode(nodes[0], true, true);

        if (childId == null || childId == null || childId == undefined) {
            return;
        } else {
            _this.prohibitDepart(childId);
        }
    },
    getSelectDepart: function() { //获取选中的值
        var arr = this.zTree.getCheckedNodes(true);
        var obj = {
            key: _this_frameName,
            value: arr
        };
        $('#departmentSelect').modal('hide');
        return obj;
    },
    prohibitDepart: function(id) { //禁止节点被选中，以及子节点
        var _this = this;
        var childNodes = _this.zTree.getNodesByParam("id", id, null); //根据id查询节点对象数组
        // _this.zTree.setChkDisabled(childNodes[0], true, false, true);
        _this.zTree.removeNode(childNodes[0]);
    }
};

$(function() {
    departmentObj.init();
});