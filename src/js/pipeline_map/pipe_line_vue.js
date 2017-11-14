var pipe_left_top = { //局部组件的命名使用下划线连接的形式
    props: {
        title: {
            type: String,
        }
    },
    template: '#pipe_left_top',
    methods: {
        click1: function() {
            this.$emit('click1');
        }
    },

};
var pipe_line_list = {
    props: {
        pointerdatas: {
            type: Array,
        },
        currentnetname: {
            type: String,
        },
        slineid: {
            type: String,
        },

        linetotal: {
            type: Number
        },
        olinedetailedited: {
            type: [String, Object],
        }
    },
    template: '#pipe_line_list',
    components: {
        'pipe-left-top': pipe_left_top,
    },
    methods: {
        deleteLine: function(item) {
            var that = this;
            xxwsWindowObj.xxwsAlert("您是否确定要删除该管线?", function() {
                $.ajax({
                    type: "POST",
                    url: "/cloudlink-inspection-event/commonData/pipemapline/delete?token=" + lsObj.getLocalStorage('token'),
                    contentType: "application/json",
                    data: JSON.stringify({ "objectId": item.objectId }),
                    dataType: "json",
                    success: function(data) {
                        if (data.success == 1) {
                            /*此处针对BO进行重新存储*/
                            xxwsWindowObj.xxwsAlert("删除成功", function() {
                                //此处调用父级方法，进行列表刷新
                                if (item.objectId == that.slineid) {
                                    that.$emit('checkedline', "");
                                }
                                that.$emit("updatelinedetailbyid", item.objectId, 2);
                            });
                        } else {
                            xxwsWindowObj.xxwsAlert("服务异常，请稍候重试");
                        }
                    }
                });
            }, true);
        },
        clickLi: function(item) {
            var that = this;
            if (that.olinedetailedited && item.objectId != that.slineid) {
                xxwsWindowObj.xxwsAlert("当前管线已修改未保存,您是否放弃对当前管线的编辑?", function() {
                    that.$emit('checkedline', item.objectId);
                }, true);
            } else {
                that.$emit('checkedline', item.objectId);
            }
        },
        createInfo: function() {
            if (this.linetotal > 199) {
                xxwsWindowObj.xxwsAlert("您已达到系统规定管线数量(200条)，无法继续新建，如需新建请联系客服。");
                return;
            }
            var styleobj = {
                title: '新增管线',
                width: '800',
                height: '610',
            };
            var inputobj = {
                "pipeLineName": "",
                "pipeDiameter": "",
                "pipeThickness": "",
                "pipeLineRemark": "",
                "pipeLineCode": "",
                "pipeLineTypeCode": "",
                "pipePressureValue": "",
                "pipeFactLength": "",
                "pipeMaterialCode": "", //管线材质      
                "pipePressureGradeCode": "", //压力等级     
                "pipeUsingStateCode": "", //使用状态
            };
            var aFooters = [{ "title": "新建", "bgcolor": "#59b6fc", "color": "#fff", "disabled": false }, { "title": "取消", "bgcolor": "#fff", "color": "#333", "disabled": false }, ];
            this.$emit('createinfo', styleobj, inputobj, aFooters);
        },
        back: function() {
            var that = this;
            if (that.olinedetailedited) {
                xxwsWindowObj.xxwsAlert("当前管线已修改未保存,您是否放弃对当前管线的编辑?", function() {
                    that.$emit('changelist');
                    that.$emit('checkedline', '');
                    that.$emit('enterlinelist', false);
                }, true);
            } else {
                that.$emit('changelist');
                that.$emit('checkedline', '');
                that.$emit('enterlinelist', false);
            }
        }
    },
}


var pipe_net_list = {
    props: {
        pipenetdatas: {
            type: Array,
        },
        snetid: {
            type: String
        },
        linetotal: {
            type: Number,
        },
        anetidtoshow: {
            type: [Array, String, Object],
        }
    },
    template: '#pipe_net_list',
    components: {
        'pipe-left-top': pipe_left_top,
    },

    methods: {
        deleteNet: function(item) {
            var that = this;
            xxwsWindowObj.xxwsAlert("您是否确定要删除该管网?", function() {
                $.ajax({
                    type: "POST",
                    url: "/cloudlink-inspection-event/commonData/pipemapnetwork/delete?token=" + lsObj.getLocalStorage('token'),
                    contentType: "application/json",
                    data: JSON.stringify({ "objectId": item.objectId }),
                    dataType: "json",
                    success: function(data) {
                        if (data.success == 1) {
                            /*此处针对BO进行重新存储*/
                            xxwsWindowObj.xxwsAlert("删除成功", function() {
                                if (item.objectId == that.snetid) {
                                    that.$emit('chooseNet', "");
                                }
                                //此处调用父级方法，进行列表刷新
                                that.$emit("updatenetdetailbyid", item.objectId, 2);
                            });
                        } else {
                            xxwsWindowObj.xxwsAlert("服务异常，请稍候重试");
                        }
                    }
                });
            }, true);
        },
        editNet: function(item) {
            //打开模态框，并且赋值
            var styleobj = {
                title: '修改管网',
                width: '600',
                height: '356',
            };
            var inputobj = {
                "pipeNetworkName": item.pipeNetworkName,
                "pipeNetworkRemark": item.pipeNetworkRemark,
                "objectId": item.objectId,
                "pipeNetworkUsed": item.pipeNetworkUsed,
            };
            var aFooters = [{ "title": "确定", "bgcolor": "#59b6fc", "color": "#fff", "disabled": false }, { "title": "取消", "bgcolor": "#fff", "color": "#333", "disabled": false }];
            this.$emit('createinfo', styleobj, inputobj, aFooters);
        },
        enterInto: function(item) { //进入管线列表
            this.$emit('enterlinelist', true);
            this.$emit('changelist', item);
        },
        createInfo: function() {
            var styleobj = {
                title: '新增管网',
                width: '600',
                height: '356',
            };
            var inputobj = {
                "pipeNetworkName": "",
                "pipeNetworkRemark": "",
            };
            var aFooters = [{ "title": "确定", "bgcolor": "#59b6fc", "color": "#fff", "disabled": false }, { "title": "取消", "bgcolor": "#fff", "color": "#333", "disabled": false }];
            this.$emit('createinfo', styleobj, inputobj, aFooters);
        },
        clickLi: function(item) {
            // if (this.onetdetauledited && item.objectId != this.snetid) {
            //     xxwsWindowObj.xxwsAlert("当前存在正在编辑的管网属性，是否放弃修改", function() {
            //         this.$emit('chooseNet', item.objectId);
            //     }, true);
            // } else {
            this.$emit('chooseNet', item.objectId);
            // }
        },
        checkNetToS: function(item) {
            var that = this;
            var data = {
                objectId: item.objectId,
            };
            if (+item.pipeNetworkUsed == "1") {
                xxwsWindowObj.xxwsAlert("当前管网已启用，是否确认关闭?", function() {
                    data.pipeNetworkUsed = 0;
                    that.startPipe(data);
                }, true);
            } else {
                xxwsWindowObj.xxwsAlert("您是否确认启用当前管网?", function() {
                    //与服务器进行通讯，然后刷新列表
                    data.pipeNetworkUsed = 1;
                    that.startPipe(data);
                }, true);
            }
        },
        startPipe: function(_data) {
            var that = this;
            $.ajax({
                type: "POST",
                url: "/cloudlink-inspection-event/pipemapnetwork/updateStatus?token=" + lsObj.getLocalStorage('token'),
                contentType: "application/json",
                data: JSON.stringify(_data),
                dataType: "json",
                success: function(data) {
                    if (data.success == 1) {
                        that.$emit("setnetidtoshow", _data.objectId);
                        if (+_data.pipeNetworkUsed == "1") {
                            that.$emit("updatenetdetailbyid", _data.objectId, 3);
                            xxwsWindowObj.xxwsAlert("启用成功");
                        } else {
                            that.$emit("updatenetdetailbyid", _data.objectId, 3);
                            xxwsWindowObj.xxwsAlert("关闭成功");
                        }

                    } else {
                        xxwsWindowObj.xxwsAlert("服务异常，请稍候重试");
                    }
                }
            });
        },
        setNetIdToShow: function(sId) {
            this.$emit("setnetidtoshow", sId);
        }
    },
}


var pipe_left = {
    props: {
        pipenetdatas: {
            type: Array,
        },
        pointerdatas: {
            type: Array,
        },
        snetid: {
            type: String
        },
        slineid: {
            type: String,
        },
        olinedetailedited: {
            type: [String, Object],
        },
        // olinetoshow: {
        //     type: [String, Object],
        // },
        domainvalue: {
            type: Array,
        },
        anetidtoshow: {
            type: [Array, String, Object],
        }
    },
    data: function() {
        var that = this;
        return {
            currentList: 'net',
            styleobj: {},
            currentNetName: '',
            chooseLine: [],
            netshow: false,
            pipeshow: false,
            show: true,
            pipeEditShow: false,
            lineTotal: that.pointerdatas.length,
            styleeditobj: {},
            aFooters: {},
            inputobj: {},
        }
    },
    watch: {
        pointerdatas: function() {
            var that = this;
            that.chooseLine = that.pointerdatas.filter(function(items) {
                return items.pipeNetworkId == that.snetid;
            });
            that.lineTotal = that.pointerdatas.length;
        },
        // olinetoshow: function() {
        //     this.styleeditobj = {
        //         title: '管线详情',
        //         width: '800',
        //         height: '515',
        //     };
        //     this.aFooters = [{ "title": "关闭", "bgcolor": "#fff", "color": "#333", "disabled": false }, ];
        //     if (this.olinetoshow) {
        //         this.pipeEditShow = true;
        //     } else {
        //         this.pipeEditShow = false;
        //     }
        // },
        domainvalue: function() {
            this.fieldValue();
        }
    },

    computed: {
        slidestyle: function() {
            return {
                'margin-left': this.currentList === "net" ? '0px' : '-270px '
            };
        },
        warpperslidestyle: function() {
            return {
                'margin-left': this.show ? '0px' : '-270px '
            };
        },

    },
    mounted: function() {
        $(".scroll").mCustomScrollbar({
            theme: "minimal-dark",
            advanced: {
                updateOnContentResize: true
            }
        });
        $(document).on("click", '#pipeConstructionDate', function() {
            $(this).datetimepicker({
                format: 'yyyy-mm-dd',
                minView: 'month',
                autoclose: true,
                endDate: new Date(),
            });
            $(this).datetimepicker('show').on('changeDate', function() {
                $(this).datetimepicker('hide');
            });
        });

    },
    template: '#pipe-left',
    components: {
        'pipe-line-list': pipe_line_list,
        'pipe-net-list': pipe_net_list,
    },
    methods: {
        chooseNet: function(objectId) {
            this.$emit('choosenet', objectId);
        },
        checkedline: function(objectId) {
            this.$emit('checkedline', objectId);
        },
        enterlinelist: function(falg) {
            this.$emit('enterlinelist', falg);
        },
        updateNetDetailById: function(objectId, flag) {
            this.$emit("updatenetdetailbyid", objectId, flag);
        },
        updateLineDetailById: function(objectId, flag) {
            this.$emit("updatelinedetailbyid", objectId, flag);
        },
        setnetidtoshow: function(sId) {
            this.$emit("setnetidtoshow", sId);
        },
        changeListShow: function() {
            if (this.show) {
                $(".up_btn").addClass("direction");
            } else {
                $(".up_btn").removeClass("direction");
            }
            this.show = !this.show;
        },
        changelist: function(item) {
            if (item) {
                this.currentList = 'line';
                this.currentNetName = item.pipeNetworkName;
                this.chooseLine = this.pointerdatas.filter(function(items) {
                    return items.pipeNetworkId == item.objectId;
                });
            } else {
                this.currentList = 'net';
            }
        },
        createInfo: function(styleobj, inputobj, aFooters) {
            this.styleobj = styleobj;
            this.inputobj = inputobj;
            this.aFooters = aFooters;
            if (this.styleobj.title == "新增管网" || this.styleobj.title == "修改管网") {
                this.netshow = !this.netshow;
            }
            if (this.styleobj.title == "新增管线") {
                this.pipeshow = !this.pipeshow;
            }
        },
        createSave: function() {
            if (this.styleobj.title == "新增管网") {
                this.saveNet();
            } else if (this.styleobj.title == "修改管网") {
                this.updateNet();
            } else {
                this.saveLine();
            }
        },
        updateNet: function(data) {
            var that = this;
            var _data = {
                "objectId": that.inputobj.objectId,
                "pipeNetworkName": that.inputobj.pipeNetworkName.trim(),
                "pipeNetworkRemark": that.inputobj.pipeNetworkRemark.trim(),
                "pipeNetworkUsed": that.inputobj.pipeNetworkUsed,
            };
            if (that.verifyNet()) {
                $.ajax({
                    type: "POST",
                    url: "/cloudlink-inspection-event/commonData/pipemapnetwork/update?token=" + lsObj.getLocalStorage('token'),
                    contentType: "application/json",
                    data: JSON.stringify(_data),
                    dataType: "json",
                    success: function(data) {
                        if (data.success == 1) {
                            xxwsWindowObj.xxwsAlert("修改管网属性成功", function() {
                                that.netshow = !that.netshow;
                                that.$emit("updatenetdetailbyid", _data.objectId, 3);
                            });
                        } else {
                            xxwsWindowObj.xxwsAlert("服务异常，请稍候重试");
                        }
                    },
                    error: function() {
                        xxwsWindowObj.xxwsAlert("服务异常，请稍候重试");
                    }
                });
            }
        },
        saveNet: function() {
            var that = this;
            var _data = {
                "objectId": baseOperation.createuuid(),
                "pipeNetworkName": that.inputobj.pipeNetworkName.trim(),
                "pipeNetworkRemark": that.inputobj.pipeNetworkRemark.trim(),
                "pipeNetworkUsed": 0,
            };
            if (that.verifyNet()) {
                $.ajax({
                    type: "POST",
                    url: "/cloudlink-inspection-event/commonData/pipemapnetwork/save?token=" + lsObj.getLocalStorage('token'),
                    contentType: "application/json",
                    data: JSON.stringify(_data),
                    dataType: "json",
                    success: function(data) {
                        if (data.success == 1) {
                            /*此处针对BO进行重新存储*/
                            xxwsWindowObj.xxwsAlert("新增管网成功", function() {
                                that.$emit("setnetidtoshow", _data.objectId);
                                that.netshow = !that.netshow;
                                that.$emit("updatenetdetailbyid", _data.objectId, 1);
                            });
                        } else {
                            xxwsWindowObj.xxwsAlert("服务异常，请稍候重试");
                        }
                    }
                });
            }
        },
        canceledit: function() {
            this.$emit("olinechange", "");
        },
        saveLine: function() {
            var that = this;
            var _data = {
                objectId: baseOperation.createuuid(),
                pipeNetworkId: this.snetid,
                pipeLineName: this.inputobj.pipeLineName.trim(), //管线名称
                pipeDiameter: this.inputobj.pipeDiameter.trim(), //管线管径
                pipeThickness: this.inputobj.pipeThickness.trim(), //管线壁厚
                pipeLineRemark: this.inputobj.pipeLineRemark.trim(), //管线备注
                pipeLineCode: this.inputobj.pipeLineCode.trim(), //管线编码
                pipeMaterialCode: this.inputobj.pipeMaterialCode, //管线材质
                pipeLineTypeCode: this.inputobj.pipeLineTypeCode, //管线类型
                pipePressureGradeCode: this.inputobj.pipePressureGradeCode, //压力等级
                pipePressureValue: this.inputobj.pipePressureValue.trim(), //压力值
                pipeConstructionDate: $("#pipeConstructionDate").val(), //建设时间
                pipeUsingStateCode: this.inputobj.pipeUsingStateCode, //使用状态
                pipeFactLength: this.inputobj.pipeFactLength.trim(), //管线实际长度
                pipeColor: "#2ecf03",
                pipeStyle: "solid",
                pipeWeight: "3",
            };
            if (that.verifyPipe()) {
                $.ajax({
                    type: "POST",
                    url: "/cloudlink-inspection-event/commonData/pipemapline/save?token=" + lsObj.getLocalStorage('token'),
                    contentType: "application/json",
                    data: JSON.stringify(_data),
                    dataType: "json",
                    success: function(data) {
                        if (data.success == 1) {
                            /*此处针对BO进行重新存储*/
                            xxwsWindowObj.xxwsAlert("新增管线成功", function() {
                                that.pipeshow = !that.pipeshow;
                                that.$emit("updatelinedetailbyid", _data.objectId, 1);
                            });
                        } else {
                            xxwsWindowObj.xxwsAlert("服务异常，请稍候重试");
                        }
                    }
                });
            }
        },
        verifyNet: function() {
            var that = this;
            //进行填报管网验证
            if (that.inputobj.pipeNetworkName.trim().length == 0) {
                xxwsWindowObj.xxwsAlert("管网名称不能为空");
                return false;
            }
            if (that.inputobj.pipeNetworkName.trim().length > 50) {
                xxwsWindowObj.xxwsAlert("管网名称长度不能超过50个字");
                return false;
            }
            if (that.inputobj.pipeNetworkRemark.trim().length > 201) {
                xxwsWindowObj.xxwsAlert("管网备注不能超过200个字");
                return false;
            }
            return true;
        },
        verifyPipe: function() {
            if (this.inputobj.pipeLineName.trim().length == 0) {
                xxwsWindowObj.xxwsAlert("管线名称不能为空");
                return false;
            }
            if (this.inputobj.pipeLineName.trim().length > 50) {
                xxwsWindowObj.xxwsAlert("管线名称长度不能超过50个字");
                return false;
            }
            if (this.inputobj.pipeLineCode.trim().length > 20) {
                //针对材质写正则
                xxwsWindowObj.xxwsAlert("管线编号不能超过20个字");
                return false;
            }
            if (this.inputobj.pipeDiameter.trim().length > 50) {
                //针对管径写正则
                xxwsWindowObj.xxwsAlert("管线管径长度不能超过50个字");
                return false;
            }
            if (this.inputobj.pipeThickness.trim().length > 50) {
                //针对壁厚写正则
                xxwsWindowObj.xxwsAlert("管线壁厚长度不能超过50个字");
                return false;
            }
            if (this.inputobj.pipePressureValue.trim().length > 0) {
                //针对管线长度写正则
                var regNum1 = /^[0-9]{1,1}\d{0,5}(\.\d{1,2})?$/;
                if (!regNum1.test(this.inputobj.pipePressureValue.trim())) {
                    xxwsWindowObj.xxwsAlert("管线压力格式错误");
                    return false;
                }
            }
            if (this.inputobj.pipeFactLength.trim().length > 0) {
                //针对管线长度写正则
                var regNum = /^[0-9]{1,1}\d{0,8}(\.\d{1,3})?$/;
                if (!regNum.test(this.inputobj.pipeFactLength.trim())) {
                    xxwsWindowObj.xxwsAlert("管线实际长度格式错误");
                    return false;
                }
            }
            if (this.inputobj.pipeLineRemark.trim().length > 201) {
                //针对管线备注写正则
                xxwsWindowObj.xxwsAlert("管线备注长度不能超过200个字");
                return false;
            }
            return true;
        },
        fieldValue: function() {
            this.pipeLineTypeOption = [{
                code: "",
                value: "请选择管线类型",
            }];
            this.pipeMaterOption = [{
                code: "",
                value: "请选择管线材质",
            }];
            this.pipePressureGrade = [{
                code: "",
                value: "请选择压力等级",
            }];
            this.pipeUsingState = [{
                code: "",
                value: "请选择使用状态",
            }];
            this.pipeLineTypeOption = this.pipeLineTypeOption.concat((this.domainvalue.filter(function(item, index) {
                return item.domainName == "pipe_line_type";
            })));
            this.pipeMaterOption = this.pipeMaterOption.concat((this.domainvalue.filter(function(item, index) {
                return item.domainName == "pipe_material";
            })));
            this.pipePressureGrade = this.pipePressureGrade.concat((this.domainvalue.filter(function(item, index) {
                return item.domainName == "pipe_pressure_grade";
            })));
            this.pipeUsingState = this.pipeUsingState.concat((this.domainvalue.filter(function(item, index) {
                return item.domainName == "pipe_using_state";
            })));
        }
    }
}