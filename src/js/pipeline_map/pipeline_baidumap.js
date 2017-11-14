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
        };
    },
    computed: {
        aLineDetailsToShow: function() {
            if (!this.linedetailsedited) {
                this.sCurrentTap = '';
            }
            return (this.linedetails.length === 1 && this.linedetailsedited) ? [this.linedetailsedited] : this.linedetails;
        },
        isNoPoints: function() { //用来控制tab显示的标签
            if (this.aLineDetailsToShow.length === 1) {
                if (this.aLineDetailsToShow[0].line.length === 0) {
                    return true;
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
            if (this.slineidchoosed) {
                this._draw_lines();
            }
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
        changeTab: function(sTab) { //tab切换
            if (this.sCurrentTap === sTab) {
                this.sCurrentTap = ''
            } else {
                this.sCurrentTap = sTab;
            }
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
                        var oDetail = JSON.parse(JSON.stringify(that.aLineDetailsToShow[0]));
                        oDetail.pipeLength = length;
                        // console.log('距离不一样，重新计算距离')
                        that.$emit('changeline', oDetail);
                        return;
                    }
                }
                if (aline.length === 1) { //只有一条线的时候才会标注起止图表
                    if (item.line.length > 0) {
                        var startPoint = map.draw_pointMarker(item.line[0].bdLon, item.line[0].bdLat, map.startMarker);
                    }
                    if (item.line.length > 1) {
                        var endMarker = map.draw_pointMarker(item.line[item.line.length - 1].bdLon, item.line[item.line.length - 1].bdLat, map.endMarker);
                    }
                }

                if (item.line.length > 1) { //含有两个坐标点以上，画线
                    var topline = map.draw_line(item.line, {
                        strokeColor: item.pipeColor,
                        strokeWeight: item.pipeWeight,
                        strokeStyle: item.pipeStyle, //dashed
                        strokeOpacity: 1,
                        enableEditing: that.isEditable || false,
                    });

                    if (isFocusNet || isFocusLine) {
                        that._setlineBlink(item);
                    }

                    topline.addEventListener('click', function() {

                        //alert(item.objectId);
                        that.$emit('clickline', item);
                    });

                    if ((that.isEditable || that.isDrawable) && index === 0) { //如果处于编辑状态，添加线的更新事件
                        //that.topline = '';
                        that.topline = topline;
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
                            var oDetail = JSON.parse(JSON.stringify(that.aLineDetailsToShow[0]));
                            oDetail.line = line;
                            oDetail.pipeLength = (lineLength / 1000).toFixed(3);
                            //console.log(oDetail);
                            that.$emit('changeline', oDetail);
                        })
                    }


                }
                if (!that.isEditable && !that.isDrawable) { //不是编辑和划线状态才会设置视野范围


                    if (isNoChoosed || isFocusNet || 　isFocusLine) {
                        aPoints = aPoints.concat(item.line.map(function(item) {
                            return new BMap.Point(item.bdLon, item.bdLat);
                        }));
                    }
                }

            });
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
                var aLine = that.aLineDetailsToShow[0].line;


                if (that.topline) { //已经画过线
                    that.topline.setPath(that.topline.getPath().concat([point]));
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
                        var line = aLine.concat([{
                            "lon": "",
                            "lat": "",
                            "bdLon": lon,
                            "bdLat": lat,
                            "rowIndex": 2
                        }]);
                    }
                    var oDetail = JSON.parse(JSON.stringify(that.aLineDetailsToShow[0]));
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
                var aLine = that.aLineDetailsToShow[0].line;
                if (aLine.length === 0) {
                    return;
                }
                var lastPoint = new BMap.Point(aLine[aLine.length - 1].bdLon, aLine[aLine.length - 1].bdLat);


                var lon = e.point.lng;
                var lat = e.point.lat;
                var newPointt = new BMap.Point(lon, lat);
                //console.log(e.point.lng + "," + e.point.lat);

                that.dashLineDrawed = that.mapObj.draw_line([lastPoint, newPointt], {
                    strokeColor: that.aLineDetailsToShow[0].pipeColor || "blue",
                    strokeWeight: that.aLineDetailsToShow[0].pipeWeight || 2,
                    strokeOpacity: 0.5,
                    strokeStyle: "dashed"
                }, true);
            });
            oMap.addEventListener("rightclick", function(e) {
                if (that.isEditable || that.isDrawable) {
                    that.sCurrentTap = '';
                    if (that.dashLineDrawed) {
                        that.mapObj.map.removeOverlay(that.dashLineDrawed);
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
        _setlineBlink: function(item) {
            var map = this.mapObj;
            this[item.objectId + '_'] = map.draw_line(item.line, {
                strokeColor: '#000',
                strokeWeight: item.pipeWeight + 2,
                strokeStyle: item.pipeStyle, //dashed
                strokeOpacity: 1,
            });
            setInterval(function() {
                map.map.removeOverlay(this[item.objectId + '_']);
                // if ()
            }, 100);
        }
    },
};