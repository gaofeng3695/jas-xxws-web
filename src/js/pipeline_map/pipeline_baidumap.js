var pipeline_baidumap = {
    template: '#pipeline_baidumap',
    props: {
        snetidchoosed: '', //被选中的管网的ID
        slineidchoosed: '', //被选中的管线的ID
        linedetails: {},
        markerpoint: {},
        linedetailsedited: {},
        istabshow: {
            default: false
        },
    },
    data: function() {
        //alert(this.linedetails)
        return {
            sCurrentTap: '', //draw,edit,keep,save
            twinkleTimes: null, //闪烁定时器
            activeLineShow: '', //当前选中的管线
            stopCenter: false,
            attrEdit: true, //右侧属性是否在编辑状态  true为不是编辑状态
        };
    },
    computed: {
        aLineDetailsToShow: function() {
            var _this = this;
            if (!this.linedetailsedited) {
                this.sCurrentTap = '';
            }
            var showLineAll = JSON.parse(JSON.stringify(_this.linedetails));
            showLineAll.forEach(function(item, index) {
                if (item.objectId == _this.linedetailsedited.objectId) {
                    showLineAll.splice(index, 1);
                    showLineAll.push(_this.linedetailsedited);
                    _this.activeLineShow = JSON.parse(JSON.stringify(_this.linedetailsedited));
                }
            });
            return showLineAll;
            // return (this.linedetails.length === 1 && this.linedetailsedited) ? [this.linedetailsedited] : this.linedetails;
        },
        isNoPoints: function() { //用来控制tab显示的标签
            // if (this.aLineDetailsToShow.length === 1) {
            //     if (this.aLineDetailsToShow[0].line.length === 0) {
            //         return true;
            //     }
            // }
            if (this.activeLineShow) {
                if (this.activeLineShow.line.length > 1) {
                    return true;
                } else {
                    if (!this.linedetailsedited) {
                        this.$emit("openguide");
                    }
                }
            }
            return false;
        },
        isEditable: function() { //控制管线是否为可编辑状态
            if (this.sCurrentTap === 'edit') {
                return true;
            }
            return false;
        },
        isDrawable: function() { //控制是否启用新增管线的点
            if (this.sCurrentTap === 'draw') {
                return true;
            }
            return false;
        }

    },
    watch: {
        slineidchoosed: function() {
            var _this = this;
            //放弃上次编辑，显示的管线数据还原
            _this.aLineDetailsToShow = JSON.parse(JSON.stringify(_this.linedetails));

            if (this.slineidchoosed) {
                _this.aLineDetailsToShow.forEach(function(item, index) {
                    if (item.objectId == _this.slineidchoosed) {
                        _this.activeLineShow = JSON.parse(JSON.stringify(item));
                    }
                });
                this._draw_lines();
            } else {
                _this.activeLineShow = '';
            }
            //管线选择改变，绘制编辑状态清空
            this.sCurrentTap = '';
            // console.log("管线选择改变")
        },
        sCurrentTap: function(newVal) {
            this._draw_lines();
            if (newVal === 'save') {
                //console.log('——————————触发保存')
                this.$emit('savedetail');
            } else {
                //console.log('——————————编辑状态发生改变')

            }
        },
        aLineDetailsToShow: function() {
            console.log('——————————数据来源发生改变')
            this._draw_lines();
        },
        markerpoint: function() {
            this._addPonitMarker();
        }
    },
    mounted: function() {
        this.mapObj = createMap({ //创建地图实例
            sNodeId: 'mapContainer'
        });
        this._addDrawLineEvent(this.mapObj.map);
        this._draw_lines(); //划线
        //console.log(this.markerPoint)
    },
    methods: {
        changeLineEditOpen: function(bloom) {
            this.attrEdit = bloom;
            if (bloom == false) {
                this.$emit("closedguide");
            }
        },
        changeTab: function(sTab) { //tab切换
            var _this = this;
            if (sTab == "save" && _this.activeLineShow.line.length < 2) {
                xxwsWindowObj.xxwsAlert("管线无终点，无法保存");
                return;
            }
            if (this.attrEdit) {
                if (this.sCurrentTap === sTab) {
                    this.sCurrentTap = ''
                } else {
                    this.sCurrentTap = sTab;
                }
            } else {
                xxwsWindowObj.xxwsAlert("当前管线属性处于编辑状态未保存,您是否放弃对当前的编辑?", function() {
                    _this.$emit("editclosed");
                    _this._draw_lines();
                    if (_this.sCurrentTap === sTab) {
                        _this.sCurrentTap = ''
                    } else {
                        _this.sCurrentTap = sTab;
                    }
                }, true);
            }
        },
        getActiveLineShow: function() { //获取选中管线数据
            var _this = this;
            if (_this.slineidchoosed) {
                _this.aLineDetailsToShow.forEach(function(item, index) {
                    if (item.objectId == _this.slineidchoosed) {
                        _this.activeLineShow = JSON.parse(JSON.stringify(item));
                    }
                });
            } else {
                _this.activeLineShow = '';
            }
        },
        openInfo: function(content, e) {
            var opts = {
                width: 400, // 信息窗口宽度
                height: 96, // 信息窗口高度
                enableMessage: true //设置允许信息窗发送短息
            };
            var p = e.point;
            var point = new BMap.Point(p.lng, p.lat);
            var infoWindow = new BMap.InfoWindow(content, opts); // 创建信息窗口对象
            this.mapObj.map.openInfoWindow(infoWindow, point); //开启信息窗口
        },
        _draw_lines: function() { //每次线的状态的改变都会触发此方法
            var that = this;
            var map = this.mapObj;
            var aline = this.aLineDetailsToShow;
            this.$emit('setmarkerpoint');
            map.clearOverlays(); //清空所有覆盖物


            if (that.isDrawable) { //只有划线状态才会更改鼠标样式
                map.map.setDefaultCursor('crosshair');
                map.map.setDraggingCursor('crosshair');
            } else {
                map.map.setDefaultCursor(that.defaultCursor);
                map.map.setDraggingCursor(that.draggingCursor);
                //console.log('that.defaultCursor: ',that.defaultCursor)
                //console.log('that.draggingCursor: ',that.draggingCursor)
            }

            if (!aline || aline.length === 0) {
                return;
            }
            that.topline = '';
            //console.log('绘制地图，清空所有覆盖物');
            var aPoints = [];

            if (that.isEditable || that.isDrawable) {} else {
                that._setlineBlink(aline);
            }
            aline.forEach(function(item, index) {
                if (!item.line || item.line.length === 0) { //没有坐标点就返回
                    return;
                }
                var isNoChoosed = !that.snetidchoosed && !that.slineidchoosed;
                var isFocusNet = Boolean(that.snetidchoosed && !that.slineidchoosed && that.snetidchoosed === item.pipeNetworkId);
                var isFocusLine = Boolean(that.slineidchoosed && that.slineidchoosed === item.objectId);

                if (that.linedetailsedited) {
                    var length = (map.getDistance(item.line) / 1000).toFixed(3);
                    // console.log('计算距离：',length)
                    // console.log('之前',item.pipeLength)
                    if (length !== item.pipeLength) {
                        // var oDetail = JSON.parse(JSON.stringify(that.aLineDetailsToShow[0]));
                        var oDetail = JSON.parse(JSON.stringify(that.activeLineShow));
                        oDetail.pipeLength = length;
                        // console.log('距离不一样，重新计算距离')
                        that.$emit('changeline', oDetail);
                        return;
                    }
                }
                // if (aline.length === 1) { //只有一条线的时候才会标注起止图表
                //     if (item.line.length > 0) {
                //         var startPoint = map.draw_pointMarker(item.line[0].bdLon, item.line[0].bdLat, map.startMarker);
                //     }
                //     if (item.line.length > 1) {
                //         var endMarker = map.draw_pointMarker(item.line[item.line.length - 1].bdLon, item.line[item.line.length - 1].bdLat, map.endMarker);
                //     }
                // }
                if (item.line.length == 1) {
                    var startPoint = map.draw_pointMarker(item.line[0].bdLon, item.line[0].bdLat, map.startMarker);
                } else if (item.line.length > 1) { //含有两个坐标点以上，画线
                    if (item.objectId == that.slineidchoosed) { //当前选中的线
                        var topline = map.draw_line(item.line, {
                            strokeColor: item.pipeColor,
                            strokeWeight: item.pipeWeight,
                            strokeStyle: item.pipeStyle, //dashed
                            strokeOpacity: 1,
                            enableEditing: that.isEditable || false,
                        });
                        //起点
                        var startPoint = map.draw_pointMarker(item.line[0].bdLon, item.line[0].bdLat, map.startMarker);
                        //终点
                        var endMarker = map.draw_pointMarker(item.line[item.line.length - 1].bdLon, item.line[item.line.length - 1].bdLat, map.endMarker);

                        // if ((that.isEditable || that.isDrawable) && index === 0) { //如果处于编辑状态，添加线的更新事件
                        if (that.isEditable || that.isDrawable) { //如果处于编辑状态，添加线的更新事件
                            //that.topline = '';
                            that.topline = topline;
                            that.topline.lineData = item;
                            that.topline.addEventListener('lineupdate', function() {
                                var linePoints = that.topline.getPath();
                                var lineLength = 0;
                                var line = linePoints.map(function(item, index, arr) {
                                    if (index > 0) {
                                        lineLength += map.map.getDistance(new BMap.Point(arr[index - 1].lng, arr[index - 1].lat), new BMap.Point(item.lng, item.lat));
                                    }
                                    return {
                                        "lon": "",
                                        "lat": "",
                                        "bdLon": item.lng,
                                        "bdLat": item.lat,
                                        "rowIndex": index
                                    }
                                });
                                // var oDetail = JSON.parse(JSON.stringify(that.aLineDetailsToShow[0]));
                                var oDetail = JSON.parse(JSON.stringify(item));
                                oDetail.line = line;
                                // that.activeLineShow.line = line;
                                oDetail.pipeLength = (lineLength / 1000).toFixed(3);
                                //console.log(oDetail);
                                that.$emit('changeline', oDetail);
                            })
                        }
                    } else {
                        var topline = map.draw_line(item.line, {
                            strokeColor: item.pipeColor,
                            strokeWeight: item.pipeWeight,
                            strokeStyle: item.pipeStyle, //dashed
                            strokeOpacity: 1,
                            enableEditing: false,
                        });
                    }

                    if (isFocusNet || isFocusLine) {
                        // that._setlineBlink(item);
                    }

                    topline.addEventListener('click', function(e) {
                        var showTxt = '<div class="lineDetails"><ul>\
                            <li><p class="text">管线名称：' + item.pipeLineName + '</p><p>管线编号：' + (item.pipeLineCode || "") + '</p></li>\
                            <li><p>管线类型：' + (item.pipeLineTypeName || "") + '</p><p>管线材质：' + (item.pipeMaterialName || "") + '</p></li>\
                            <li><p>管线管径：' + (item.pipeDiameter || "") + '</p><p>管线壁厚：' + (item.pipeThickness || "") + '</p></li>\
                            <li><p>使用状态：' + (item.pipeUsingStateName || "") + '</p><p>实际长度：' + (item.pipeFactLength || "") + '</p></li>\
                            </ul></div>';
                        // alert(item.objectId);
                        that.openInfo(showTxt, e);
                        // that.$emit('clickline', item);
                    });




                }
                if (!that.isEditable && !that.isDrawable) { //不是编辑和划线状态才会设置视野范围


                    if (isNoChoosed || isFocusNet || 　isFocusLine) {
                        aPoints = aPoints.concat(item.line.map(function(item) {
                            return new BMap.Point(item.bdLon, item.bdLat);
                        }));
                    }
                }

            });
            if (that.stopCenter) {
                aPoints = [];
                that.stopCenter = false;
            }
            if (aPoints.length > 0) {
                map.map.setViewport(aPoints, { //设定视野范围
                    enableAnimation: true,
                    margins: [0, 0, 0, 0],
                });
            }
        },
        _addDrawLineEvent: function(oMap) {
            var that = this;

            this.defaultCursor = oMap.getDefaultCursor();
            this.draggingCursor = oMap.getDraggingCursor();
            // console.log('this.defaultCursor: ',this.defaultCursor)
            // console.log('this.draggingCursor: ',this.draggingCursor)

            oMap.addEventListener("click", function(e) {
                if (!that.isDrawable) {
                    return;
                }
                var lon = e.point.lng;
                var lat = e.point.lat;
                var point = new BMap.Point(e.point.lng, e.point.lat);
                // var aLine = that.aLineDetailsToShow[0].line;
                var aLine = that.activeLineShow.line;
                // console.log(that.topline);
                if (that.topline) { //已经画过线
                    var lastPo = that.topline.getPath()[that.topline.getPath().length - 1];
                    if (lon == lastPo.lng && lat == lastPo.lat) {
                        that.topline.getPath().pop();
                        that.topline.setPath(that.topline.getPath().concat([point]));
                    } else {
                        that.topline.setPath(that.topline.getPath().concat([point]));
                    }
                } else {
                    if (aLine.length === 0) {
                        var line = [{
                            "lon": "",
                            "lat": "",
                            "bdLon": lon,
                            "bdLat": lat,
                            "rowIndex": 1
                        }];
                    } else if (aLine.length === 1) {
                        if (lon == aLine[0].bdLon && lat == aLine[0].bdLat) {
                            var line = [{
                                "lon": "",
                                "lat": "",
                                "bdLon": lon,
                                "bdLat": lat,
                                "rowIndex": 1
                            }];
                        } else {
                            var line = aLine.concat([{
                                "lon": "",
                                "lat": "",
                                "bdLon": lon,
                                "bdLat": lat,
                                "rowIndex": 2
                            }]);
                        }
                    }
                    // var oDetail = JSON.parse(JSON.stringify(that.aLineDetailsToShow[0]));
                    var oDetail = JSON.parse(JSON.stringify(that.activeLineShow));
                    oDetail.line = line;
                    //console.log(oDetail);
                    that.$emit('changeline', oDetail);
                }
            });
            oMap.addEventListener("mousemove", function(e) {
                if (!that.isDrawable) {
                    return;
                }
                if (that.dashLineDrawed) {
                    that.mapObj.map.removeOverlay(that.dashLineDrawed);
                }
                //console.log(that.aLineDetailsToShow)
                // var aLine = that.aLineDetailsToShow[0].line;
                var aLine = that.activeLineShow.line;
                if (aLine.length === 0) {
                    return;
                }
                var lastPoint = new BMap.Point(aLine[aLine.length - 1].bdLon, aLine[aLine.length - 1].bdLat);

                that.mapObj.map.removeOverlay(that.label);
                var lon = e.point.lng;
                var lat = e.point.lat;
                var newPointt = new BMap.Point(lon, lat);
                //console.log(e.point.lng + "," + e.point.lat);

                that.label = new BMap.Label("点击右键，结束绘制", { offset: new BMap.Size(10, -10), position: newPointt });
                that.label.setStyle({
                    color: "red",
                    fontSize: "12px",
                    padding: "2px 3px",
                    backgroundColor: '#fff',
                    fontFamily: "微软雅黑"
                });
                that.mapObj.map.addOverlay(that.label); // 将标注添加到地图中

                that.dashLineDrawed = that.mapObj.draw_line([lastPoint, newPointt], {
                    strokeColor: that.activeLineShow.pipeColor || "blue",
                    strokeWeight: that.activeLineShow.pipeWeight || 2,
                    strokeOpacity: 0.5,
                    strokeStyle: "dashed"
                }, true);
            });
            oMap.addEventListener("rightclick", function(e) {
                if (that.isEditable || that.isDrawable) {
                    that.sCurrentTap = '';
                    that.stopCenter = true;
                    if (that.dashLineDrawed) {
                        that.mapObj.map.removeOverlay(that.dashLineDrawed);
                    }
                    if (that.activeLineShow.line.length < 2) {
                        var oDetail = JSON.parse(JSON.stringify(that.activeLineShow));
                        oDetail.line = [];
                        that.$emit('changeline', oDetail);
                    }
                }
            });
        },
        _addPonitMarker: function() {
            this.mapObj.map.removeOverlay(this._pointMarker);
            if (this.markerpoint) {
                this._pointMarker = this.mapObj.draw_pointMarker(this.markerpoint.bdlon, this.markerpoint.bdLat);
            }
        },
        _setlineBlink: function(items) { //线闪烁方法
            var _this = this;
            var map = this.mapObj;
            clearInterval(_this.twinkleTimes);

            function twinkleOpen() { //添加闪烁线
                items.forEach(function(item, index) {
                    var isNoChoosed = !_this.snetidchoosed && !_this.slineidchoosed;
                    var isFocusNet = Boolean(_this.snetidchoosed && !_this.slineidchoosed && _this.snetidchoosed === item.pipeNetworkId);
                    var isFocusLine = Boolean(_this.slineidchoosed && _this.slineidchoosed === item.objectId);

                    if (item.line.length > 1) {
                        if (isFocusNet || isFocusLine) {
                            _this[item.objectId + '_'] = map.draw_line(item.line, {
                                strokeColor: "#00fff6",
                                strokeWeight: item.pipeWeight + 3,
                                strokeStyle: item.pipeStyle, //dashed
                                strokeOpacity: 1,
                            });
                        }
                    }
                })
            }

            function twinkleClose() { //删除闪烁线
                items.forEach(function(item, index) {
                    map.map.removeOverlay(_this[item.objectId + '_']);
                })
            }
            var m = 1;
            _this.twinkleTimes = setInterval(function() {
                m++;
                twinkleClose();
                if (m % 2 == 0) {
                    twinkleOpen();
                } else if (m > 6) {
                    clearInterval(_this.twinkleTimes);
                }
            }, 300);
        }
    },
};

var pipe_guide = {
    template: '#pipe_guide',
    data: function() {
        return {
            guidestates: false,
        }
    },
    methods: {
        startDraw: function() {
            this.$emit('guidedraw');
            this.guidestates = false;
        },
        openGuide: function() {
            this.guidestates = true;
        },
        closedGuide: function() {
            this.guidestates = false;
        },
    }
}