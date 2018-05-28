var index = new Vue({
  el: "#app",
  data: function () {
    return {
      mapObj: null,
      isSearchNode: false, //是否展示搜索下拉面板
      isDetailNode: false, //点详细信息
      isShowTool: false, //是否展示增加方式列表
      isEditOrView: true,
      nodeInfoArrys: [], //所有点信息集合
      drawNodeArray: [], //绘制点
      currentEditNode: {}, //表示当前正要编辑的点
      currentDrawNode: [], //表示当前在地图上面绘制的点
      markerClusterer: null,
      defaultCursor: "",
      draggingCursor: "",
      allot: true, //已分配是否显示
      noallot: true,
      searchInput: "",
      nodeDetail: {
        name: "11",
        inspectionDays: 1
      },
      //新增基本使用数据
      isGetOrInput: false, //用于表示
      isSecond: false,
      isFirst: true,
      nodeForm: {
        location: "",
        name: "",
        code: "",
        inspectionDays: "",
        inspectionInterval: "",
        Lon: "",
        Lat: "",
        remark: "",
        effectiveRadius: ""
      },
      textCount: 160
    }
  },
  watch: {
    nodeForm: {
      handler: function (val) {
        var that = this;
        if (that.nodeForm.remark.length > 160) {
          that.nodeForm.remark = that.nodeForm.remark.substring(0, 160);
        }
        this.textCount = 160 - that.nodeForm.remark.length;
      },
      deep: true
    },

  },
  mounted: function () {
    var that = this;
    that.mapObj = new BMap.Map("container"); // 创建Map实例
    var mPoint = new BMap.Point(116.404, 39.915);
    that.mapObj.centerAndZoom(mPoint, 15);
    that.mapObj.enableScrollWheelZoom();
    that.defaultCursor = that.mapObj.getDefaultCursor();
    that.draggingCursor = that.mapObj.getDraggingCursor();
    that._requestNode();
    // $("#addEvent").modal()
  },
  methods: {
    search: function () {
      var that = this;
      that.isShowTool = false;
      // alert(this.searchInput);//进行ajax请求，获取点的信息
      that._requestNode(that.searchInput, function () {
        that.isSearchNode = true;
      })

    },
    _requestNode: function (value, callback) {
      var that = this;
      $.ajax({
        type: "get",
        contentType: "application/json",
        dataType: "json",
        url: "../js/node/node.json",
        data: {
          "keyword": that.searchInput
        },
        success: function (data) {
          if (data.status == 1) {
            that.nodeInfoArrys = data.rows;
            if (callback) {
              callback();
              return;
            }
            that._drawPoint(); //根据请求的数据，进行点的绘制
          }
        }
      });
    },
    _drawPoint: function () {
      var that = this;
      var myIcons = null;
      var markers = null;
      var point = null;
      that.drawNodeArray = [];
      var data = that.nodeInfoArrys;
      for (var i = 0; i < data.length; i++) {
        point = new BMap.Point(data[i].bdLon, data[i].bdLat);
        if (data[i].distributionStatus == 0) {
          myIcons = new BMap.Icon("/src/images/node/noallot.png", new BMap.Size(29, 42), {
            anchor: new BMap.Size(15, 42)
          });
        } else {
          myIcons = new BMap.Icon("/src/images/node/allot.png", new BMap.Size(29, 42), {
            anchor: new BMap.Size(15, 42)
          });
        }
        markers = new BMap.Marker(point, {
          icon: myIcons
        });
        that.drawNodeArray.push({
          'status': data[i].distributionStatus + "",
          'key': data[i].oid,
          'value': markers
        });
        that.currentDrawNode.push({
          'status': data[i].distributionStatus + "",
          'key': data[i].oid,
          'value': markers
        });
        markers.addEventListener("click", function (e) {
          if (!that.isShowTool) {
            that._pointClick(e);
          }
        });
        markers.addEventListener("dragging", function (e) {
          that._editNodeLocation(e);
        });
      }
      that._addPoints();
    },

    _pointClick: function (e) {
      var that = this;
      for (var i = 0; i < this.drawNodeArray.length; i++) {
        this.drawNodeArray[i].value.setAnimation();
      }
      var p = e.target;
      p.setAnimation(BMAP_ANIMATION_BOUNCE); //添加跳动
      for (var i = 0; i < this.drawNodeArray.length; i++) {
        if (this.drawNodeArray[i].value == p) {
          this.currentEditNode = this.drawNodeArray[i];
          this.getNodeDetailById(this.drawNodeArray[i].key);
        }
      }
    },
    _editNodeLocation: function (e) {
      var that = this;
      that.nodeDetail.bdLon = e.point.lng;
      that.nodeDetail.bdLat = e.point.lat;
      var point = new BMap.Point(that.nodeDetail.bdLon, that.nodeDetail.bdLat);
      new BMap.Geocoder().getLocation(point, function (result) {
        that.nodeDetail.location = result.address;
      });
    },
    getNodeDetailById: function (oid) {
      this.isDetailNode = true;
      for (var i = 0; i < this.nodeInfoArrys.length; i++) {
        if (this.nodeInfoArrys[i].oid == oid) {
          this.nodeDetail = this.nodeInfoArrys[i];
          return;
        }
      }
    },
    clickItem: function (item) {
      var that = this;
      if (item.distributionStatus == 0) {
        if (!that.noallot) {
          that.noallot = true;
          that._addPoints('0');
        }
      } else {
        if (!that.allot) {
          that.allot = true;
          that._addPoints('1');
        }
      }
      //将该店设置为中心点并进行跳动
      for (var i = 0; i < that.drawNodeArray.length; i++) {
        if (that.drawNodeArray[i].key == item.oid) {
          var cenLng = that.drawNodeArray[i].value.getPosition().lng;
          var cenLat = that.drawNodeArray[i].value.getPosition().lat;
          that.mapObj.centerAndZoom(new BMap.Point(cenLng, cenLat), 19);
          that.currentEditNode = that.drawNodeArray[i];
          that.drawNodeArray[i].value.setAnimation(BMAP_ANIMATION_BOUNCE);
        } else {
          that.drawNodeArray[i].value.setAnimation();
        }
      }
      that.getNodeDetailById(item.oid);
    },
    allotBtn: function () {
      var that = this;
      if (that.allot) {
        that.removePoint('1'); //移除已经分配的点
      } else {
        that._addPoints('1'); //移除已经分配的点
      }
      that.allot = !that.allot;
    },
    noAllotBtn: function () {
      var that = this;
      if (that.noallot) {
        that.removePoint('0'); //移除已经分配的点
      } else {
        that._addPoints('0'); //移除已经分配的点
      }
      that.noallot = !that.noallot;
    },
    _addPoints: function (value) {
      var that = this;
      var markersArr = [];
      that.markerClusterer = null;
      if (!value) {

      } else {
        that.drawNodeArray.forEach(function (item) {
          if (item.status == value) {
            that.currentDrawNode.push(item);
          }
        })
      }
      for (var i = 0; i < that.currentDrawNode.length; i++) {
        markersArr.push(that.currentDrawNode[i].value);
      }
      that.markerClusterer = new BMapLib.MarkerClusterer(that.mapObj, {
        markers: markersArr
      });
    },
    removePoint: function (value) {
      var that = this;
      var node = [];
      if (!that.markerClusterer) {
        return;
      }
      if (!value) {
        node = that.drawNodeArray;
      } else {
        that.drawNodeArray.forEach(function (item) {
          if (item.status == value) {
            node.push(item);
          }
        });
      }
      for (var i = 0; i < node.length; i++) {
        that.currentDrawNode = that.delObj(that.currentDrawNode, node[i]);
        that.markerClusterer.removeMarker(node[i].value);
      }
    },
    delObj: function (_arr, _obj) {
      var length = _arr.length;
      for (var i = 0; i < length; i++) {
        if (_arr[i].key && _arr[i].key == _obj.key) {
          _arr.splice(i, 1);
          return _arr;
        }
      }

    },
    getNode: function () {
      var that = this;
      that.mapObj.setDefaultCursor('crosshair');
      that.mapObj.setDraggingCursor('crosshair');
      that.initAddForm(); //每次新增之前先初始化页面
      that.mapObj.addEventListener("click", function (e) {
        if (that.isShowTool) {
          that.isShowTool = !that.isShowTool;
          var point = new BMap.Point(e.point.lng, e.point.lat);
          var marker = new BMap.Marker(point);
          that.mapObj.addOverlay(marker);
          new BMap.Geocoder().getLocation(point, function (result) {
            $("#addEvent").modal();
            $("#addEvent").on('shown.bs.modal', function (e) {
              var selectPeople = [];
              peopleTreeObj.requestPeopleTree("", selectPeople);
            });

            that.nodeForm.location = result.address;
          });
        }
      })
    },
    inputNode: function () {
      $("#addEvent").modal();
      this.isShowTool = !this.isShowTool;
      this.isGetOrInput = true;
    },
    addNode: function () {
      this.initAddForm();
      this.isShowTool = !this.isShowTool;
      this.isSearchNode = false;
    },
    editNode: function () { //编辑按钮
      var that = this;
      that.isEditOrView = !that.isEditOrView;
      /**编辑之前 先保留一份历史数据 */
      var history = {};
      for (var key in that.nodeDetail) {
        that.nodeDetail[key] = that.nodeDetail[key];
        history[key] = that.nodeDetail[key];
      }
      that.nodeDetail.history = history;
      /**编辑之前 先保留一份历史数据完成 */
      //进行该点实现高亮显示，并且可以移动
      that.currentEditNode.value.setAnimation();
      that.currentEditNode.value.setIcon(new BMap.Icon("/src/images/node/edit.png", new BMap.Size(29, 42), {
        anchor: new BMap.Size(15, 42)
      }));
      that.currentEditNode.value.enableDragging();
    },
    saveNode: function () { //保存修改后的
      var that = this;
      this.isEditOrView = !this.isEditOrView;
      if (that.nodeDetail.distributionStatus == 0) {
        that.currentEditNode.value.setIcon(new BMap.Icon("/src/images/node/noAllot.png", new BMap.Size(29, 42), {
          anchor: new BMap.Size(15, 42)
        }));
      } else {
        that.currentEditNode.value.setIcon(new BMap.Icon("/src/images/node/allot.png", new BMap.Size(29, 42), {
          anchor: new BMap.Size(15, 42)
        }));
      }
    },
    cancelEditNode: function () {
      //取消点的编辑
      var that = this;
      that.nodeDetail = that.nodeDetail.history;
      that.$set(that.nodeDetail, that.nodeDetail.history);
      delete that.nodeDetail.history;
      if (that.nodeDetail.distributionStatus == 0) {
        that.currentEditNode.value.setIcon(new BMap.Icon("/src/images/node/noAllot.png", new BMap.Size(29, 42), {
          anchor: new BMap.Size(15, 42)
        }));
      } else {
        that.currentEditNode.value.setIcon(new BMap.Icon("/src/images/node/allot.png", new BMap.Size(29, 42), {
          anchor: new BMap.Size(15, 42)
        }));
      }
      // var point = new BMap.Point(that.nodeDetail.bdLon, that.nodeDetail.bdLat);
      that.currentEditNode.value.setPosition(new BMap.Point(that.nodeDetail.bdLon, that.nodeDetail.bdLat));
      that.isEditOrView = !that.isEditOrView;
    },
    submit: function () {
      /*如果是手动输入，则需要将坐标转换为百度坐标 */

      var that = this;

      var coordinate = coordtransform.wgs84togcj02(that.nodeForm.Lon, that.nodeForm.Lat);
      var coordinateBd = coordtransform.gcj02tobd09(coordinate[0], coordinate[1]);
      that.nodeForm.bdLon = coordinateBd[0];
      that.nodeForm.bdLat = coordinateBd[1];
      var point = new BMap.Point(that.nodeForm.bdLon, that.nodeForm.bdLat);
      new BMap.Geocoder().getLocation(point, function (result) {
        that.nodeForm.location = result.address;
      });
      // if (that.verrify()) {
        that.isFirst = true;
        that.isSecond = false;
        index.mapObj.setDefaultCursor(index.defaultCursor);
        index.mapObj.setDraggingCursor(index.draggingCursor);
        $("#addEvent").modal("hide");
      // }
    },
    next: function () {
      //首先进行验证
      var that = this;
      // if (that.verrify()) {
        index.mapObj.setDefaultCursor(index.defaultCursor);
        index.mapObj.setDraggingCursor(index.draggingCursor);
        that.isFirst = false;
        that.isSecond = true;
      // }
    },
    back: function () {
      /*如果是手动输入，则需要将坐标转换为百度坐标 */
      this.isFirst = true;
      this.isSecond = false;
    },
    cancel: function () {
      index.mapObj.setDefaultCursor(index.defaultCursor);
      index.mapObj.setDraggingCursor(index.draggingCursor);
      this.isFirst = true;
      this.isSecond = false;
      $("#addEvent").modal("hide");
    },
    verrify: function () {
      //验证
      var that = this;
      if (!that.nodeForm.name.trim()) {
        xxwsWindowObj.xxwsAlert("必经点名称不能为空");
        return false;
      }
      if (that.nodeForm.name.length > 45) {
        xxwsWindowObj.xxwsAlert("必经点名称长度不能超过45个");
        return false;
      }
      if (!that.nodeForm.code.trim()) {
        xxwsWindowObj.xxwsAlert("必经点编号不能为空");
        return false;
      }
      if (that.nodeForm.code.length > 45) {
        xxwsWindowObj.xxwsAlert("必经点编号长度不能超过45个");
        return false;
      }
      if (!that.nodeForm.inspectionDays.trim()) {
        xxwsWindowObj.xxwsAlert("巡检频次不能为空");
        return false;
      }
      var regNum = /^[0-9]*$/;
      if (!regNum.test(this.nodeForm.inspectionDays.trim())) {
        xxwsWindowObj.xxwsAlert("巡检频次只能是整数");
        return false;
      }
      if (!that.nodeForm.inspectionInterval.trim()) {
        xxwsWindowObj.xxwsAlert("巡检间隔不能为空");
        return false;
      }
      var regNum1 = /^[0-9]+(()||(.[0-9]{1}))?$/;
      if (!regNum1.test(this.nodeForm.inspectionInterval.trim())) {
        xxwsWindowObj.xxwsAlert("巡检间隔为整数或者小数点后一位");
        return false;
      }
      if (!that.nodeForm.effectiveRadius.trim()) {
        xxwsWindowObj.xxwsAlert("有效半径不能为空");
        return false;
      }
      var regNum1 = /^[0-9]+(()||(.[0-9]{3}))?$/;
      if (!regNum1.test(this.nodeForm.effectiveRadius.trim())) {
        xxwsWindowObj.xxwsAlert("有效半径只能是数字");
        return false;
      }
      // if (!that.nodeForm.Lon.trim()) {
      //   xxwsWindowObj.xxwsAlert("纬度不能为空");
      //   return false;
      // }
      // if (!that.nodeForm.Lat.trim()) {
      //   xxwsWindowObj.xxwsAlert("经度不能为空");
      //   return false;
      // }
      // if (!that.nodeForm.location.trim()) {
      //   xxwsWindowObj.xxwsAlert("位置不能为空");
      //   return false;
      // }
      return true;
    },
    initAddForm: function () {
      for (var key in this.nodeForm) {
        this.nodeForm[key] = "";
      }
    }
  },
});



//  var coordinate = coordtransform.bd09togcj02(_this.addressObj.lng, _this.addressObj.lat);
// var coordinateGps = coordtransform.gcj02towgs84(coordinate[0], coordinate[1]);
// _this.addressObj.gpsLon = coordinateGps[0];
// _this.addressObj.gpsLat = coordinateGps[1];
// _this.addressObj.name = _this.$addressText.val().trim();

//新增的时候，需要传入百度坐标 wps坐标