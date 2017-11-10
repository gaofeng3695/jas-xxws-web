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
        sNetId_choosed: '', //被选中的管网的ID
        sLineId_choosed: '', //被选中的管线的ID
        oLine_toThow: '', //要显示详情的管线ID
        olineDetail_edited: '', //存在已被编辑的管线
        markerPoint : {"bdlon": 116.203929,"bdLat": 40.227286},//地图上的标注点，点击坐标后在地图上做标注 {"bdlon": 116.203929,"bdLat": 40.227286} || ''

        isLineList_entered: false, //是否进入了管线列表
        aNetDetails: [], //所有管网的详情数组
        aLineDetails: [], //所有管线的详情数组s
        domainValue: [], //所有的域值
    },
    computed: {
        aNetId_active: function() {
            return this.aNetDetails.filter(function(item) {
                return +item.pipeNetworkUsed === 1;
            });
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
            //return (function () {
            if (that.sNetId_choosed && !that.sLineId_choosed) {
                return that.aLineDetails.filter(function(item) {
                    return item.pipeNetworkId === that.sNetId_choosed;
                });
            }
            if (that.sLineId_choosed) {
                return that.aLineDetails.filter(function(item) {
                    return item.objectId === that.sLineId_choosed;
                });
            }
            return that.aLineDetails.filter(function(item) {
                for (var i = 0; i < that.aNetId_active.length; i++) {
                    if (that.aNetId_active[i].objectId === item.pipeNetworkId) {
                        return true;
                    }
                }
                return false;
            });
            //})();
        },
    },
    watch: {
        sLineId_choosed: function() {
            this.olineDetail_edited = '';

        }
    },
    components: {
        'pipe-left': pipe_left,
        'pipeline-baidumap': pipeline_baidumap,
        'pipeline-edit': pipeline_edit
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
                    "pageSize": 1000
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
        setMarkerPoint : function(oPoint){
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
        }

    }

});