// window.onerror = function(msg, url, line) {
//     alert("erro" + msg + "\n" + url + ":" + line);
//     return true;
// };
var util = {
    updateArrayById: function(arr, sId, newVal) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].objectId === sId) {
                arr[i] = newVal;
                break;
            }
        }
        return [].concat(arr);
    },
    findItemInArrayById: function(arr, sId) {
        if (!arr && arr.length === 0) {
            return '';
        }
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].objectId === sId) {
                return arr[i];
            }
        }
        return '';
    }
};

var vm = new Vue({
    el: '#app',
    data: {
        aNetId_toShow: [], //要显示的管网IDs
        sNetId_choosed: '', //被选中的管网的ID
        sLineId_choosed: '', //被选中的管线的ID
        oLine_toThow: '', //要显示详情的管线ID
        olineDetail_edited: '', //存在已被编辑的管线
        markerPoint: '', //地图上的标注点，点击坐标后在地图上做标注 {"bdlon": 116.203929,"bdLat": 40.227286} || ''

        isLineList_entered: false, //是否进入了管线列表
        aNetDetails: [], //所有管网的详情数组
        aLineDetails: [], //所有管线的详情数组s
        domainValue: [], //所有的域值
        linesCount: 500, //管线最大数量（管线数量上限）
    },
    computed: {
        aNetId_active: function() {
            var arr = [];
            this.aNetDetails.forEach(function(item) {
                if (+item.pipeNetworkUsed === 1) {
                    arr.push(item.objectId);
                }
            });
            return arr;
        },
        oNetDetail_choosed: function() {
            var that = this;
            if (this.sNetId_choosed && !this.isLineList_entered) {
                return util.findItemInArrayById(this.aNetDetails, that.sNetId_choosed);
            }
            return '';
        },
        oLineDetail_choosed: function() {
            var that = this;
            if (this.sLineId_choosed) {
                return util.findItemInArrayById(this.aLineDetails, that.sLineId_choosed);
            }
            return '';
        },
        aLineDetailsToShow: function() {
            var that = this;
            if (that.sNetId_choosed && that.isLineList_entered) {
                return that.aLineDetails.filter(function(item) {
                    return item.pipeNetworkId === that.sNetId_choosed;
                });
            }
            return that.aLineDetails.filter(function(item) {
                for (var i = 0; i < that.aNetId_toShow.length; i++) {
                    if (that.aNetId_toShow[i] === item.pipeNetworkId) {
                        return true;
                    }
                }
                return false;
            });
            //})();
        },
    },
    watch: {
        aNetId_active: function(newval, oldval) {
            var arr = [].concat(this.aNetId_toShow);
            var isChange = false;

            newval.forEach(function(item) {
                if (oldval.indexOf(item) === -1) { //旧值中没有新值，就是新增的
                    if (arr.indexOf(item) === -1) { //显示数组中没有该值，就加进去
                        arr.push(item);
                        isChange = true;
                    }
                }
            });
            oldval.forEach(function(item) {
                if (newval.indexOf(item) === -1) { //新值中没有旧值，就是删除的
                    if (arr.indexOf(item) !== -1) { //显示数组中有该值，就从中剔除
                        var index = arr.indexOf(item);
                        arr.splice(index, 1);
                        isChange = true;
                    }
                }
            });
            isChange && (this.aNetId_toShow = arr);
        },
        sLineId_choosed: function() {
            this.olineDetail_edited = '';
        }
    },
    components: {
        'pipe-left': pipe_left,
        'pipeline-baidumap': pipeline_baidumap,
        'pipeline-edit': pipeline_edit,
        'pipe-guide': pipe_guide,
    },
    mounted: function() {
        //console.log('#app mounted');
        this._requestNetDetails();
        this._initOption();
        //this._requestLineDetails();
    },
    methods: {
        _initOption: function() {
            var that = this;
            $.ajax({
                type: "POST",
                url: "/cloudlink-inspection-event/domain/getListByDomainName?token=" + lsObj.getLocalStorage('token'),
                contentType: "application/json",
                data: JSON.stringify({ "domainNameList": ["pipe_line_type", "pipe_material", "pipe_pressure_grade", "pipe_using_state"] }),
                dataType: "json",
                success: function(data) {
                    if (data.success == 1) {
                        that.domainValue = data.rows;
                    } else {
                        xxwsWindowObj.xxwsAlert("服务异常，请稍候重试");
                    }
                }
            });

        },
        _requestNetDetails: function() { //请求管网详情列表
            var that = this;
            $.ajax({
                type: "POST",
                url: "/cloudlink-inspection-event/commonData/pipemapnetwork/getPageList?token=" + lsObj.getLocalStorage('token'),
                contentType: "application/json",
                data: JSON.stringify({
                    "pageNum": 1,
                    "pageSize": 1000
                }),
                dataType: "json",
                success: function(data) {
                    if (data.success == 1) {
                        that.aNetDetails = data.rows;
                        that._requestLineDetails();
                    } else {
                        xxwsWindowObj.xxwsAlert("服务异常，请稍候重试");
                    }
                }
            });
        },
        _requestLineDetails: function() { //请求管线详情列表
            var that = this;
            $.ajax({
                type: "POST",
                url: "/cloudlink-inspection-event/commonData/pipemaplinedetail/getPageList?token=" + lsObj.getLocalStorage('token'),
                contentType: "application/json",
                data: JSON.stringify({
                    "pageNum": 1,
                    "pageSize": that.linesCount
                }),
                dataType: "json",
                success: function(data) {
                    if (data.success == 1) {
                        that.aLineDetails = data.rows;
                    } else {
                        xxwsWindowObj.xxwsAlert("服务异常，请稍候重试");
                    }
                }
            });
        },
        // updateNetDetail: function(flag) {
        //     this.onetDetaul_edited = flag;
        // },
        setMarkerPoint: function(oPoint) {
            this.markerPoint = oPoint ? oPoint : '';
        },
        setsLine_toThow: function(oLine) { //设定要被展示管线详情的ID
            this.oLine_toThow = oLine || '';
            //console.log('要被展示管线详情的ID: ', this.oLine_toThow);
        },
        chooseNet: function(sNetId) { //选择管网，清空则传空
            this.sNetId_choosed = sNetId || '';
        },
        chooseLine: function(sLineId) { //选择管线，清空则传空
            this.sLineId_choosed = sLineId || '';
        },
        enterLineList: function(bol) {
            this.isLineList_entered = bol ? true : false;
        },
        updateNetDetailById: function(sId, flag) { //更新管网详情，入参管网Id 1:增加 2：删除 3:修改
            var that = this;
            switch (flag) {
                case 1:
                    that._getNetDetailById(sId, 1);
                    break;
                case 2:
                    that.aNetDetails = that.aNetDetails.filter(function(item) {
                        return item.objectId != sId;
                    });
                    that.aLineDetails = that.aLineDetails.filter(function(item) {
                        return item.pipeNetworkId != sId;
                    });
                    break;
                case 3:
                    that._getNetDetailById(sId, 3);
                    break;
                default:
                    break;
            }
        },
        _getNetDetailById: function(sId, flag) {
            var that = this;
            $.ajax({
                type: "GET",
                url: "/cloudlink-inspection-event/commonData/pipemapnetwork/get?token=" + lsObj.getLocalStorage('token'),
                contentType: "application/json",
                data: {
                    "objectId": sId
                },
                dataType: "json",
                success: function(data) {
                    if (data.success == 1) {
                        if (flag == 1) {
                            that.aNetDetails.unshift(data.rows[0]);
                        } else {
                            // that.aNetDetails.forEach(function (item, index) {
                            //     if (item.objectId == sId) {
                            //         return that.aNetDetails.splice(index, 1, data.rows[0]);
                            //     }
                            // });
                            that.aNetDetails = util.updateArrayById(that.aNetDetails, sId, data.rows[0]);
                        }
                    } else {
                        xxwsWindowObj.xxwsAlert("服务异常，请稍候重试");
                    }
                }
            });
        },
        updateLineDetailById: function(sId, flag) { //更新管线详情，入参管线Id
            var that = this;
            switch (flag) {
                case 1:
                    that._getLineDetailById(sId, 1);
                    break;
                case 2:
                    that.aLineDetails = that.aLineDetails.filter(function(item) {
                        return item.objectId != sId;
                    });
                    that.updateNetDetailById(that.sNetId_choosed, 3);
                    break;
                case 3:
                    that._getLineDetailById(sId, 3);
                    break;
                default:
                    break;
            }
        },
        _getLineDetailById: function(sId, flag) {
            var that = this;
            $.ajax({
                type: "GET",
                url: "/cloudlink-inspection-event/commonData/pipemapline/get?token=" + lsObj.getLocalStorage('token'),
                contentType: "application/json",
                data: {
                    "objectId": sId
                },
                dataType: "json",
                success: function(data) {
                    if (data.success == 1) {
                        if (flag == 1) {
                            that.aLineDetails.unshift(data.rows[0]);
                        } else {
                            // that.aLineDetails.forEach(function (item, index) {
                            //     if (item.objectId == sId) {
                            //         return that.aLineDetails.splice(index, 1, data.rows[0]);
                            //     }
                            // });
                            // console.log(data.rows[0])
                            // console.log(that.aLineDetails)
                            that.aLineDetails = util.updateArrayById(that.aLineDetails, sId, data.rows[0]);
                            that.olineDetail_edited = '';
                        }
                        that.updateNetDetailById(that.sNetId_choosed, 3);
                    } else {
                        xxwsWindowObj.xxwsAlert("服务异常，请稍候重试");
                    }
                }
            });
        },
        setNetIdToShow: function(sId) {
            if (!sId) {
                return;
            }
            var arr = [].concat(this.aNetId_toShow);
            var index = this.aNetId_toShow.indexOf(sId);
            if (index === -1) {
                arr.push(sId);
            } else {
                arr.splice(index, 1);
            }
            this.aNetId_toShow = arr;
        },
        editLineDetail: function(OLineDetail) { //变更坐标点，更改线的样式，传入关键点，点击保存
            //console.log('管线的坐标或者样式发生改变');
            this.olineDetail_edited = OLineDetail;
        },
        saveLineStyleAndPoint: function() {
            //console.log('——————————开始保存修改的管线数据数据')
            var that = this;
            var _data = JSON.parse(JSON.stringify(this.olineDetail_edited));
            delete _data.createTime;
            delete _data.createUserId;
            delete _data.createUserName;
            var sId = _data.objectId;
            $.ajax({
                type: "POST",
                url: "/cloudlink-inspection-event/commonData/pipemapline/update?token=" + lsObj.getLocalStorage('token'),
                contentType: "application/json",
                data: JSON.stringify(_data),
                dataType: "json",
                success: function(data) {
                    if (data.success == 1) {
                        //console.log(sId)
                        that.updateLineDetailById(sId, 3);
                    } else {
                        xxwsWindowObj.xxwsAlert("服务异常，请稍候重试");
                    }
                }
            });
        },
        guidedraw: function() { //从引导直接绘制
            this.$refs.cmap.changeTab('draw');
        },
        openGuide: function() { //打开绘制引导
            this.$refs.cguide.openGuide();
        },
        closedGuide: function() {
            this.$refs.cguide.closedGuide();
        },
        mapEdit: function(bloom) {
            this.$refs.cmap.changeLineEditOpen(bloom);
        },
        editClosed: function() {
            this.$refs.cedit.editChangeClose();
        },
        openNet: function(nid, lid) {
            this.$refs.clist.enterlinelist(true);
            this.$refs.clist.changelistNet(nid);
            this.$refs.clist.chooseLIneId(lid);
        },
    }

});