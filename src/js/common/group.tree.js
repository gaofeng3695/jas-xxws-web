var groupTreeObj = {
    $tree: $("#group_list"),
    selectGroupArr: [],
    aAllGroup: [],
    init: function () {},
    requestPeopleTree: function (selectArr) { //请求人员信息
        var _this = this;
        _this.selectGroupArr = [];
        if (selectArr) {
            for (var i = 0; i < selectArr.length; i++) {
                _this.selectGroupArr[i] = selectArr[i];
            }
        }
        if (_this.aAllGroup.length > 0) {
            _this.renderGroupTree(_this.aAllGroup);
            return;
        }
        $.ajax({
            type: "POST",
            url: "/cloudlink-inspection-event/regionalGroup/listTree?token=" + lsObj.getLocalStorage('token'),
            contentType: "application/json",
            dataType: "json",
            success: function (data) {
                if (data.success != 1) {
                    xxwsWindowObj.xxwsAlert('获取信息失败！');
                    return;
                }
                _this.aAllGroup = data.rows;
                _this.renderGroupTree(data.rows);
            },
            statusCode: {
                404: function () {
                    xxwsWindowObj.xxwsAlert('获取信息失败！');
                }
            }
        });
    },
    renderGroupTree: function (data) { //遍历tree
        var _this = this;
        var setting = {
            view: {
                showLine: true
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
                enable: true,
                chkStyle: "radio",
                radioType: "all"
            }
        };
        _this.zTree = $.fn.zTree.init($("#group_list"), setting, data);
        _this.zTree.expandAll(true);
        _this.setSelectGroup();

    },
    setSelectGroup: function () { //设置被选中的人员
        var _this = this;
        if (_this.selectGroupArr.length > 0) {
            for (var i = 0; i < _this.selectGroupArr.length; i++) {
                var nodes = _this.zTree.getNodesByParam("id", _this.selectGroupArr[i].id, null); //根据id查询节点对象数组
                _this.zTree.checkNode(nodes[0], true, true);
            }
        }
    },
    getSelectGroup: function () { //
        var _this = this;

        _this.selectGroupArr = [];
        var groupObj = null;
        var arr = _this.zTree.getCheckedNodes(true);
        arr.forEach(function (item, index) {
            if (item.isParent) {
                return;
            }
            groupObj = {
                id: item.id,
                name: item.text
            }
            _this.selectGroupArr.push(groupObj);
        });
        return _this.selectGroupArr;
    },

};
$(function () {
    groupTreeObj.init();
});