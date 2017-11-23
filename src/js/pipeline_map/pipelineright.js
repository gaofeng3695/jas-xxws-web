var pipe_right_title = { //右侧title组件
    template: '#pipe-right-title',
    methods: {
        tabchange: function(sTap, bgcolor) {
            this.$emit('tabchange', sTap);
            $(bgcolor.currentTarget).attr("class", "active").siblings('li').attr("class", "");
        }
    },
};

var pipe_right_content_attribute = { //右侧属性组件
    props: ["detail", "domainvalue", "editdetails"],
    template: '#pipe-right-content-attribute',
    data: function() {
        return {
            isDisable: true,
            changeObj: {},
            pipeLineTypeOption: [],
            pipeMaterOption: [],
            pipePressureGrade: [],
            pipeUsingState: [],
        }
    },
    watch: {
        detail: function() {
            var that = this;
            this.isDisable = true;
            this.$nextTick(function() {
                that.changeObj = {};
                $.extend(that.changeObj, that.detail);
            });
            // 切换管线 默认  属性模块打开
            $(".left-edit-shrink").removeClass("fa-chevron-down").addClass("fa-chevron-up");
            $(".rightcontent").show();
        },
        domainvalue: function() {
            this.fieldValue();
        },
        isDisable: function() {
            this.$emit('attredit', this.isDisable);
        },
    },
    methods: {
        changeIsDisable: function() {
            var that = this;
            this.isDisable = true;
            this.$nextTick(function() {
                that.changeObj = {};
                $.extend(that.changeObj, that.detail);
            });
        },
        save_attribute: function(e) {
            var _this = this;
            if (_this.editdetails) {
                xxwsWindowObj.xxwsAlert("当前管线已修改未保存,您是否放弃对当前管线的编辑?", function() {
                    _this.$emit('checkedcloselines');
                    // if (_this.isDisable) {
                    //     _this.isDisable = false;
                    // } else {
                    //     _this.verifyPipe();
                    // }
                }, true);
            } else {
                if (_this.isDisable) {
                    setTimeout(function() {
                        _this.isDisable = false;
                    }, 0);
                } else {
                    _this.verifyPipe();
                }
            }
        },
        //管线修改提交
        lineModify: function() {
            var that = this;
            var pipeFactLength = that.changeObj.pipeFactLength;
            if (pipeFactLength == "" || pipeFactLength == null) {
                pipeFactLength = null;
            }
            var _data = {
                objectId: that.detail.objectId, //管线主键ID
                pipeNetworkId: that.detail.pipeNetworkId, //所属管网主键
                pipeLineName: that.changeObj.pipeLineName, //管线名称
                pipeLineCode: that.changeObj.pipeLineCode, //管线编码
                pipeLineTypeCode: that.changeObj.pipeLineTypeCode, //管线类型
                pipeMaterialCode: that.changeObj.pipeMaterialCode, //材质
                pipeDiameter: that.changeObj.pipeDiameter, //管径
                pipeThickness: that.changeObj.pipeThickness, //壁厚
                pipePressureGradeCode: that.changeObj.pipePressureGradeCode, //压力等级
                pipePressureValue: that.changeObj.pipePressureValue, //压力值
                pipeConstructionDate: $("#constructionDate").val(), //建设时间
                pipeUsingStateCode: that.changeObj.pipeUsingStateCode, //使用状态
                pipeLength: that.detail.pipeLength, //管线长度
                pipeFactLength: pipeFactLength, //管线实际长度（人工输入的长度）
                pipeLineRemark: that.changeObj.pipeLineRemark, //备注
            };
            $.ajax({
                type: "POST",
                url: "/cloudlink-inspection-event/pipemapline/updateProperty?token=" + lsObj.getLocalStorage('token'),
                contentType: "application/json",
                data: JSON.stringify(_data),
                dataType: "json",
                success: function(data) {
                    if (data.success == 1) {
                        xxwsWindowObj.xxwsAlert("修改管线属性成功", function() {
                            that.$emit('savelineattribute', _data.objectId, 3);
                        });
                    } else {
                        xxwsWindowObj.xxwsAlert("服务异常，请稍候重试");
                    }
                },
                error: function(data) {
                    xxwsWindowObj.xxwsAlert("服务异常，请稍候重试");
                }
            });
        },
        //管线编辑验证
        verifyPipe: function() {
            var regNum = /^[0-9]{1,1}\d{0,8}(\.\d{1,3})?$/;
            if (this.changeObj.pipeLineName.trim().length == 0) {
                xxwsWindowObj.xxwsAlert("管线名称不能为空");
                return false;
            } else if (this.changeObj.pipeLineName.trim().length > 50) {
                xxwsWindowObj.xxwsAlert("管线名称长度不能超过50个字");
                return false;
            } else if (this.changeObj.pipeLineCode.trim().length > 20) {
                xxwsWindowObj.xxwsAlert("管线编号不能超过20个字");
                return false;
            } else if (this.changeObj.pipeDiameter.trim().length > 50) {
                //针对管径写正则
                xxwsWindowObj.xxwsAlert("管线管径长度不能超过50个字");
                return false;
            } else if (this.changeObj.pipeThickness.trim().length > 50) {
                //针对壁厚写正则
                xxwsWindowObj.xxwsAlert("管线壁厚长度不能超过50个字");
                return false;
            } else if (this.verifyPressure() == false) {
                return false;
            } else if (this.changeObj.pipeFactLength != null && this.changeObj.pipeFactLength.trim().length > 0) {
                if (!regNum.test(this.changeObj.pipeFactLength.trim())) {
                    xxwsWindowObj.xxwsAlert("管线实际长度格式不正确（最大999999999.999）");
                    return false;
                } else {
                    this.lineModify(this.changeObj)
                }
            } else {
                this.lineModify(this.changeObj)
            }
        },
        //域值的渲染过滤
        fieldValue: function() {
            this.pipeLineTypeOption = this.domainvalue.filter(function(item, index) {
                return item.domainName == "pipe_line_type";
            });
            this.pipeMaterOption = this.domainvalue.filter(function(item, index) {
                return item.domainName == "pipe_material"
            });
            this.pipePressureGrade = this.domainvalue.filter(function(item, index) {
                return item.domainName == "pipe_pressure_grade"
            });
            this.pipeUsingState = this.domainvalue.filter(function(item, index) {
                return item.domainName == "pipe_using_state"
            });
        },
        verifyPressure: function() {
            var regPressure = /^[0-9]{1,1}\d{0,5}(\.\d{1,2})?$/;
            if (this.changeObj.pipePressureValue != null && this.changeObj.pipePressureValue.trim().length > 0) {
                if (!regPressure.test(this.changeObj.pipePressureValue.trim())) {
                    xxwsWindowObj.xxwsAlert("管线压力格式不正确（最大999999.99）");
                    return false;
                } else {
                    return true;
                }
            } else {
                return true;
            }
        }
    },
};

var pipe_right_content_style = { //右侧样式组件
    template: '#pipe-right-content-style',
    props: ["detailstyle"],
    data: function() {
        return {
            lineWeight: {},
            lineColor: {},
            lineStyle: {}
        }
    },
    watch: {
        detailstyle: function() {
            if (this.detailstyle.pipeStyle == "solid") {
                $('select').val("1")
            } else if ((this.detailstyle.pipeStyle == "dashed")) {
                $('select').val("2");
            }
            $(".bgColorStyle").css("background-color", this.detailstyle.pipeColor);
            $(".borderColorStyle").css("border-color", this.detailstyle.pipeColor);
            $(".borderColorStyle").css("border-style", this.detailstyle.pipeStyle);
            $(".preview").css({ "height": this.detailstyle.pipeWeight, "background-color": this.detailstyle.pipeColor });
            if (this.detailstyle.pipeWeight == "" || this.detailstyle.pipeWeight == null) {
                this.detailstyle.pipeWeight = "2"
                $(".preview").height("2px");
                $(".scale div").css({ "width": "12px", "background-color": this.detailstyle.pipeColor });
                $("#btn").css("left", "12px");
            } else {
                $(".scale div").css({ "width": (this.detailstyle.pipeWeight) * 6, "background-color": this.detailstyle.pipeColor });
                $("#btn").css("left", (this.detailstyle.pipeWeight) * 6);
            }
        }
    },
    mounted: function() {
        var that = this;
        //边线颜色的设置
        $(".bgcolor").colorpicker({
            fillcolor: true,
            success: function(o, color) {
                $(".bgColorStyle").css("background", color);
                $(".borderColorStyle").css("border-color", color);
                $(".scale div").css("background-color", color);
                $(".preview").css("background-color", color);
                var oDetail = JSON.parse(JSON.stringify(that.detailstyle));
                oDetail.pipeColor = color; ////储存改变后线颜色的值
                that.$emit("styleedit", oDetail);
            }
        });
        //边线样式的设置
        $(".chooseStyle").change(function() {
            var val = $('.chooseStyle').val();
            if (val == 1) {
                $(".borderColorStyle").css("border-style", "solid");
                var oDetail = JSON.parse(JSON.stringify(that.detailstyle));
                oDetail.pipeStyle = "solid"; //储存改变后线类型的值
            } else {
                $(".borderColorStyle").css("border-style", "dashed");
                var oDetail = JSON.parse(JSON.stringify(that.detailstyle));
                oDetail.pipeStyle = "dashed"; //储存改变后线类型的值
            }
            that.$emit("styleedit", oDetail);
        });
        //进度条插件
        var scale = function(btn, bar) {
            this.btn = document.getElementById(btn);
            this.bar = document.getElementById(bar);
            this.fontSizeVal = document.getElementById("font_size");
            this.step = this.bar.getElementsByTagName("div")[0];
            this.init();
        };
        scale.prototype = {
            init: function() {
                var f = this,
                    g = document,
                    b = window,
                    m = Math;
                f.btn.onmousedown = function(e) {
                    var x = (e || b.event).clientX;
                    var l = this.offsetLeft;
                    var max = f.bar.offsetWidth - this.offsetWidth;
                    g.onmousemove = function(e) {
                        var thisX = (e || b.event).clientX;
                        var to = m.min(max, m.max(-2, l + (thisX - x)));
                        f.btn.style.left = to + 'px';
                        f.ondrag(m.round(m.max(0, to / max) * 100), to);
                        b.getSelection ? b.getSelection().removeAllRanges() : g.selection.empty();
                    };
                    g.onmouseup = new Function('this.onmousemove=null');
                };
            },
            ondrag: function(pos, x) {
                this.step.style.width = Math.max(0, x) + 'px';
                var num = (pos - pos % 5.26) / 5.26 + 1;
                this.fontSizeVal.value = Math.round(num);
                //拖拽进度条 效果预览跟随改变
                var oDetail = JSON.parse(JSON.stringify(that.detailstyle));
                oDetail.pipeWeight = Math.round(num); //储存改变后线宽的值
                that.$emit("styleedit", oDetail);
            }
        };
        new scale('btn', 'bar');
        //价格输入验证 正整数
        $('#font_size').on('input proprarychange', function(h) {
            var val = $(this).val().trim();
            var length = val.length;
            var reg = /[\D]/g;
            if (reg.test(val) || val > 20) {
                $(this).val(val.substring(0, length - 1))
                return;
            } else if (val == 0) {
                $(this).val("1")
                val = 1;
            }
            $('.scale>div').width(val * 6);
            $('#btn').attr('style', 'left:' + val * 6 + 'px');
            //改变input值 效果预览宽度跟随改变
            if (val == "" || val == null) {
                $(".preview").height(0);
            } else {
                $(".preview").height(val);
            }
            var oDetail = JSON.parse(JSON.stringify(that.detailstyle));
            oDetail.pipeWeight = val; //储存改变后线宽的值
            that.$emit("styleedit", oDetail);
        })
    }
};

var pipe_right_content_point = { //右侧坐标点组件
    template: '#pipe-right-content-point',
    props: ["detailPointer", "markerpoint"],
    data: function() {
        return {};
    },
    methods: {
        setMarkPoint: function(item) {
            if (!item) {
                this.$emit("setmarkerpoint", '');
                return;
            }
            var obj = { "bdlon": item.bdLon, "bdLat": item.bdLat };
            this.$emit("setmarkerpoint", obj);
        },
        deletePointer: function(index) {
            var that = this;
            var defaultOptions = {
                tip: '是否确定删除坐标点？',
                name_title: '提示',
                name_cancel: '取消',
                name_confirm: '确定',
                isCancelBtnShow: true,
                callBack: function() {
                    var oDetail = JSON.parse(JSON.stringify(that.detailPointer));
                    var arr = oDetail.line;
                    arr.splice(index, 1);
                    //把修改的坐标点传给父组件
                    that.$emit("pointedit", oDetail);
                }
            };
            xxwsWindowObj.xxwsAlert(defaultOptions);
        },
        pointerImport: function() { //导入坐标点
            this.$emit("pointerImport");
        },
        downTemplate: function() { //下载坐标点模板
            var options = {
                "url": '/cloudlink-inspection-event/templatedownload/excelDownload?token=' + lsObj.getLocalStorage('token'),
                "method": 'post'
            }
            this.downLoadFile(options);
        },
        downLoadFile: function(options) { //坐标点模板的方法
            var config = $.extend(true, {
                method: 'post'
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
    }
};
//管线详细信息
var pipeline_edit = {
    props: {
        linedetail: {
            type: [Object, String],
        },
        editdetail: {
            type: [Object, String],
        },
        domainvalue: {
            type: [Object, String, Array],
        },
        markerpoint: {
            type: [Object, String, Array],
        }
    },
    template: '#pipeline_edit',
    components: {
        'pipe-right-title': pipe_right_title,
        'pipe-right-content-attribute': pipe_right_content_attribute,
        'pipe-right-content-style': pipe_right_content_style,
        'pipe-right-content-point': pipe_right_content_point,
    },
    computed: {
        linedata: function() {
            return (this.editdetail == "") ? this.linedetail : this.editdetail;
        }
    },
    data: function() {
        return {
            sCurrentTap: 'attributeShow',
            show: false,
            errorinfo: false
        };
    },
    mounted: function() {
        $(".scrollpointer").mCustomScrollbar({
            theme: "minimal-dark",
            advanced: {
                updateOnContentResize: true
            }
        });
        $(document).on("click", '#constructionDate', function() {
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
    methods: {
        mapEdit: function(bloom) { //改变绘制地图的状态
            this.$emit('mapedit', bloom);
        },
        tabchange: function(sTap) {
            this.sCurrentTap = sTap;
            $(".rightcontent").show();
        },
        checkedcloselines: function(e) {
            var _this = this;
            var id = _this.linedetail.objectId;
            _this.$emit('checkedcloseline');
            setTimeout(function() {
                _this.$emit('checkedcloseline', id);
                _this.$refs.cattr.save_attribute();
            }, 100);

        },
        //点击关闭右侧管线编辑属性
        pipeNeLineClose: function() {
            var that = this;
            if (that.editdetail) {
                xxwsWindowObj.xxwsAlert("当前管线已修改未保存,您是否放弃对当前管线的编辑?", function() {
                    that.$emit('checkedcloseline');
                }, true);
            } else {
                that.$emit('checkedcloseline');
            }
        },
        shrink: function(e) {
            $('.rightcontent').slideToggle(500);
            if ($(e.currentTarget).hasClass("fa-chevron-down")) {
                $(e.currentTarget).removeClass("fa-chevron-down").addClass("fa-chevron-up");
            } else {
                $(e.currentTarget).addClass("fa-chevron-down").removeClass("fa-chevron-up");
            }
        },
        pointerImport: function() {
            this.styleobj = {
                title: "导入坐标",
                width: "800",
                height: "400",
            };
            this.aFooters = [{ "title": "上传", "color": "#fff", "bgcolor": "#59B6FC", "disabled": false }, { "title": "取消", "color": "#333", "bgcolor": "#fff", "disabled": false }];
            this.show = true;
            this._flag = true;
        },
        cancel: function() {
            this.show = false;
        },
        close: function() {
            this.errorinfo = false;
        },
        browse: function() {
            $(".upload_picture").trigger("click");
        },
        uploadbtn: function() {
            this.importVerification();
        },
        importVerification: function() { //提交的时候表单验证
            var that = this;
            var val = $('.batchImportInput').val().trim();
            if (val == "" || val == null) {
                xxwsWindowObj.xxwsAlert("请选择上传的文件");
                return false;
            } else {
                var uploadId = $('.feedback_img_file').find('input').attr('id');
                that.uploadFlie(uploadId)
            }
        },
        uploadFlie: function(uploadId) { //上传文件到阿里
            var that = this;
            var objectId = baseOperation.createuuid();
            if (that._flag == true) {
                that._flag = false;
                $.ajaxFileUpload({
                    url: "/cloudlink-core-file/attachment/web/v1/save?businessId=" + objectId + "&bizType=excel&token=" + lsObj.getLocalStorage("token"),
                    secureuri: false,
                    fileElementId: uploadId, //上传input的id
                    dataType: "json",
                    type: "POST",
                    async: false,
                    success: function(data) {
                        if (data.success == 1) {
                            var fileId = data.rows[0].fileId;
                            that.fileCheck(fileId);
                        } else {
                            that.again();
                            xxwsWindowObj.xxwsAlert("校验失败，请稍后重试");
                        }
                    },
                    error: function(data) {
                        that.again();
                        xxwsWindowObj.xxwsAlert("校验失败，请稍后重试");
                    }
                });
            }
        },
        fileCheck: function(fileId) { //文件的校验
            var that = this;
            var param = {
                fileId: fileId
            };
            $.ajax({
                type: 'POST',
                url: "/cloudlink-inspection-event/pipemapline/importValidation?token=" + lsObj.getLocalStorage('token'),
                contentType: "application/json",
                data: JSON.stringify(param),
                dataType: "json",
                success: function(data, status) {
                    var state = data.rows[0].status;
                    var total = data.rows[0].total;
                    var errors = data.rows[0].errors;
                    var converted = data.rows[0].converted;
                    if (data.success == 1) {
                        if (state == 1) {
                            // if (total === converted) {
                            var oDetail = JSON.parse(JSON.stringify(that.linedetail));
                            var id = oDetail.objectId;
                            var arr = data.rows[0].line;
                            var newArr = [];
                            arr.forEach(function(tear, index) {
                                var obj = {
                                    lon: tear.lon,
                                    lat: tear.lat,
                                    bdLon: tear.bdLon,
                                    bdLat: tear.bdLat,
                                    pipeLineId: id
                                }
                                newArr.push(obj);
                            });
                            //导入的坐标点替换原来的坐标点
                            oDetail.line = newArr;
                            //把修改的坐标点传给父组件
                            that.changelinefn(oDetail);
                            xxwsWindowObj.xxwsAlert("坐标点导入成功");
                            that.show = false;
                            // } else {
                            //     xxwsWindowObj.xxwsAlert("坐标点导入失败");
                            // }
                        } else {
                            that.show = false;
                            that.pointerstyleobj = {
                                title: "坐标点规范验证",
                                width: "600",
                                height: "400",
                            };
                            that.pointeraFooters = [{ "title": "关闭", "color": "#333", "bgcolor": "#fff", "disabled": false }];
                            that.errorinfo = true;
                            setTimeout(function() {
                                $(".hintsTotal").text(total);
                                $(".hintsNum").text(errors.length);
                                for (i in errors) {
                                    var lonlat = data.rows[0].errors[i].msg.split(',')
                                    var txt = '<li><span class="rownum listLeft">' + errors[i].rowNum + '</span><span class="lon listRight">' + ((lonlat[0] == "null") ? "" : lonlat[0]) + '</span><span class="lat listRight">' + ((lonlat[1] == "null") ? "" : lonlat[1]) + '</span><span class="errorinfo listRight">数据类型不匹配</span></li>'
                                    $(".hintsMainList ul").append(txt);
                                }
                            }, 0);
                        }
                    } else {
                        xxwsWindowObj.xxwsAlert("校验失败，请稍后重试");
                        that.again();
                    }
                },
                error: function(data) {
                    that.again();
                    xxwsWindowObj.xxwsAlert("校验失败，请稍后重试");
                }
            });
        },
        again: function() {
            this._flag = true;
        },
        changelinefn: function(obj) {
            this.$emit('changelinefn', obj);
        },
        savelineattribute: function(id, num) {
            this.$emit('saveline', id, num);
        },
        setmarkerpoint: function(markpoint) {
            this.$emit('setmarkerpoint', markpoint);
        },
        editChangeClose: function() {
            this.$refs.cattr.changeIsDisable();
        },
    },
};