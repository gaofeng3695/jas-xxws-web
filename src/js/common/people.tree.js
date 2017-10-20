/**企业部门的tree,调用requestPeopleTree(frameName,selectArr,boolean)打开
 * frameName---字符串(必填),可以为""，用于辨别来自哪个窗口
 * selectArr---人员数组（必填），默认选中的节点
 * boolean---ture or false（选填），删除自己
 */
/** 
 * 调用getSelectPeople()，返回所选节点对象obj = {key: "",selectedArr: arr,selectedName:names };
 * obj.key 来自哪个窗口的名称
 * obj.selectedArr 人员数组
 * obj.selectedName 名字组合
 */

var peopleTreeObj = {
    $tree: $("#people_list"),
    _frameName: null,
    aPeopleName: [],
    selectPersonArr: [],
    init: function() {},
    requestPeopleTree: function(frameName, selectArr, boolean) { //请求人员信息
        var _this = this;
        _this.selectPersonArr = [];
        _this._frameName = frameName;
        if (selectArr) {
            for (var i = 0; i < selectArr.length; i++) {
                _this.selectPersonArr[i] = selectArr[i];
            }
        }
        if (_this.aAllPeople) {
            _this.renderPeopleTree(_this.aAllPeople);
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
                if (boolean == true) {
                    //数组中删除本人
                    for (var i = 0; i < peopleAllArr.length; i++) {
                        if (peopleAllArr[i].id == JSON.parse(lsObj.getLocalStorage('userBo')).objectId) {
                            peopleAllArr.splice(i, 1);
                        }
                    }
                }

                _this.aAllPeople = peopleAllArr;
                _this.renderPeopleTree(_this.aAllPeople);
            },
            statusCode: {
                404: function() {
                    xxwsWindowObj.xxwsAlert('获取人员信息失败！');
                }
            }
        });
    },
    renderPeopleTree: function(data) { //遍历tree
        var _this = this;
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
        _this.zTree = $.fn.zTree.init(_this.$tree, setting, data);
        _this.zTree.expandAll(true);
        _this.setSelectPeople();
    },
    setSelectPeople: function() { //设置被选中的人员
        var _this = this;
        if (_this.selectPersonArr.length > 0) {
            for (var i = 0; i < _this.selectPersonArr.length; i++) {
                var nodes = _this.zTree.getNodesByParam("id", _this.selectPersonArr[i].relationshipPersonId, null); //根据id查询节点对象数组
                _this.zTree.checkNode(nodes[0], true, true);
            }
        }
    },
    getSelectPeople: function() { //获取选中的人员
        var _this = this;
        _this.aPeopleName = [];
        _this.selectPersonArr = []; //人员数组
        var userObj = null;
        var arr = _this.zTree.getCheckedNodes(true);
        arr.forEach(function(item, index) {
            if (item.isParent) {
                return;
            }
            userObj = {
                relationshipPersonId: item.id,
                relationshipPersonName: item.treenodename
            }
            _this.selectPersonArr.push(userObj);
            _this.aPeopleName.push(item.treenodename);
        });
        var selectedObj = {
            key: _this._frameName,
            selectedArr: _this.selectPersonArr,
            selectedName: _this.aPeopleName.join('，')
        };
        $('#stakeholder').modal('hide');
        return selectedObj;
    },
    initPeopleList: function() { //清空人员信息
        var _this = this;
        _this.aPeopleName = [];
        _this.selectPersonArr = [];
        _this.$receiveUser.val('');
        if (_this.zTree) {
            _this.zTree.checkAllNodes(false);
        }
    },
};
$(function() {
    peopleTreeObj.init();
});