var index = new Vue({
  el: "#app",
  data: function () {
    return {
      mapObj: null,
      isSearchNode: false, //是否展示搜索下拉面板
      isDetailNode: false, //点详细信息
      isShowTool: false, //是否展示增加方式列表
      noResult: false,
      isEditOrView: true,
      nodeInfoArrys: [], //所有点信息集合
      drawNodeArray: [], //绘制点
      currentEditNode: {}, //表示当前正要编辑的点
      currentAllotNode: [], //表示当前在地图上面绘制的已分配点
      currentNoAllotNode: [], //表示当前在地图上面绘制的未分配点
      markerAllotClusterer: null, //已分配绘制
      markerNOAllotClusterer: null, //未分配
      defaultCursor: "",
      draggingCursor: "",
      allot: true, //已分配是否显示
      noallot: true,
      searchInput: "",
      nodeDetail: {
        name: "",
        inspectionDays: 1,
        groupId: "",
        groupName: ""
      },
      //新增基本使用数据
      isGetOrInput: false, //用于表示
      nodeForm: {
        location: "",
        name: "",
        code: "",
        inspectionDays: 1, //巡检天数
        inspectionTimes: "1", //巡检频次
        inspectionInterval: 1, //巡检间隔
        lon: "",
        lat: "",
        remark: "",
        effectiveRadius: "50",
        // personFormList: [],
        origin: "",
        groupName: "",
        groupId: "",
        category: "1", //关键点类别
      },
      textCount: 160,
      getNodeMarker: [],
    }
  },
  watch: {
    'nodeForm.remark': function (val, oldVal) {
      var that = this;
      if (val.length > 160) {
        that.nodeForm.remark = val.substring(0, 160);
      }
      that.textCount = 160 - that.nodeForm.remark.length;
    },
    'nodeForm.lon': function (val, oldVal) {
      var that = this;
      if (val == oldVal) {
        return;
      }
      if (that.nodeForm.lon && that.nodeForm.lat) {
        that._locationBd();
      }
    },
    'nodeForm.lat': function (val, oldVal) {
      var that = this;
      if (val == oldVal) {
        return;
      }
      if (that.nodeForm.lon && that.nodeForm.lat) {
        that._locationBd();
      }
    },
  },
  mounted: function () {
    var that = this;
    that.mapObj = new BMap.Map("container"); // 创建Map实例
    that.mapObj.enableScrollWheelZoom(true);
    var point = new BMap.Point(116.404, 39.915); // 创建点坐标
    that.mapObj.centerAndZoom(point, 10); // 初始化地图，设置中心点坐标和地图级别
    that.defaultCursor = that.mapObj.getDefaultCursor();
    that.draggingCursor = that.mapObj.getDraggingCursor();
    that._requestNode();
  },
  methods: {
    search: function () {
      var that = this;
      that.currentEditIsSave(function () {
        that.isShowTool = false;
        that.removeAllotPoint();
        that.removeNoAllotPoint();
        that.cancalNode();
        that._requestNode(that.searchInput, function () {
          /**一些状态需要初始化 */
          that.isSearchNode = true;
          that.isDetailNode = false; //必经点详情列表隐藏
          that.isEditOrView = true;
          that.allot = true;
          that.noallot = true;
          /**一些状态初始化完成 */
          if (that.nodeInfoArrys.length == 0) {
            that.noResult = true;
          } else {
            that.noResult = false;
          }
        });
      });
    },
    _requestNode: function (value, callback) {
      var that = this;
      that.nodeInfoArrys = [];
      $.ajax({
        type: "post",
        contentType: "application/json",
        dataType: "json",
        url: "/cloudlink-inspection-event/keyPoint/page?token=" + lsObj.getLocalStorage('token'),
        data: JSON.stringify({
          "keyword": that.searchInput,
          pageNum: 1,
          pageSize: 100000,
          orderBy: "distributionStatus",
          orderDirection: "asc"
        }),
        success: function (data) {
          if (data.success == 1) {
            that.nodeInfoArrys = data.rows;
            that._setMapCenterAndZoom();
            if (callback) {
              callback();
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
      var data = that.nodeInfoArrys;
      that.currentAllotNode = []; //表示当前在地图上面绘制的已分配点
      that.currentNoAllotNode = []; //表示当前在地图上面绘制的未分配点
      that.drawNodeArray = [];
      for (var i = 0; i < data.length; i++) {
        point = new BMap.Point(data[i].bdLon, data[i].bdLat);
        if (data[i].distributionStatus == 0) {
          myIcons = new BMap.Icon("/src/images/node/noAllot.png", new BMap.Size(29, 42), {
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
          'key': data[i].objectId,
          'value': markers
        });
        if (data[i].distributionStatus == 0) {
          that.currentNoAllotNode.push({
            'status': data[i].distributionStatus + "",
            'key': data[i].objectId,
            'value': markers
          });
        }
        if (data[i].distributionStatus == 1) {
          that.currentAllotNode.push({
            'status': data[i].distributionStatus + "",
            'key': data[i].objectId,
            'value': markers
          });
        }
        markers.addEventListener("click", function (e) {
          // if (!that.isShowTool) {
          that._pointClick(e);
          // }
        });
        markers.addEventListener("dragging", function (e) {
          that._editNodeLocation(e);
        });
      }
      that._addAllotPoints(function () {
        that._addNoAllotPoints();
      });
    },
    _pointClick: function (e) {
      var that = this;
      if (!that.isEditOrView) {
        var defaultOptions = {
          tip: '目前存在正在编辑的点，是否进行保存？',
          name_title: '提示',
          name_cancel: '取消',
          name_confirm: '确定',
          isCancelBtnShow: true,
          callBack: function () {
            that.saveNode(function () {
              that._getCurrentEditNode(e);
            });
          },
          cancelCallBack: function () {
            that.cancelEditNode();
          }
        };
        xxwsWindowObj.xxwsAlert(defaultOptions);
      } else {
        that._getCurrentEditNode(e);
      }
    },
    _getCurrentEditNode: function (e) { //获取当前编辑点击的点
      var that = this;
      for (var i = 0; i < that.drawNodeArray.length; i++) {
        that.drawNodeArray[i].value.setAnimation();
      }
      var p = e.target;
      p.setAnimation(BMAP_ANIMATION_BOUNCE); //添加跳动
      for (var i = 0; i < that.drawNodeArray.length; i++) {
        if (that.drawNodeArray[i].value == p) {
          that.currentEditNode = that.drawNodeArray[i];
          that._getNodeDetailById(that.drawNodeArray[i].key);
          return;
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
    _addAllotPoints: function (callback) {
      var that = this;
      var markersArr = [];
      that.markerAllotClusterer = null;
      that.currentAllotNode.forEach(function (item) {
        markersArr.push(item.value);
      });
      that.markerAllotClusterer = new BMapLib.MarkerClusterer(that.mapObj, {
        markers: markersArr,
      });
      if (typeof callback == 'function') {
        callback();
      }
    },
    _addNoAllotPoints: function () {
      var that = this;
      var markersArr = [];
      that.markerNOAllotClusterer = null;
      that.currentNoAllotNode.forEach(function (item) {
        markersArr.push(item.value);
      });
      var _styles = [{
        url: "/src/images/node/m0.png",
        size: new BMap.Size(53, 53)
      }]
      that.markerNOAllotClusterer = new BMapLib.MarkerClusterer(that.mapObj, {
        markers: markersArr,
        styles: _styles
      });
    },
    removeAllotPoint: function () {
      var that = this;
      if (!that.markerAllotClusterer) {
        return;
      }
      that.currentAllotNode.forEach(function (item) {
        that.markerAllotClusterer.removeMarker(item.value);
      });
      that._isHasDetailNode(); //进行详情页面的关闭
    },
    removeNoAllotPoint: function () {
      var that = this;
      if (!that.markerNOAllotClusterer) {
        return;
      }
      that.currentNoAllotNode.forEach(function (item) {
        that.markerNOAllotClusterer.removeMarker(item.value);
      });
      that._isHasDetailNode(); //进行详情页面的关闭
    },
    clickItem: function (item) {
      var that = this;
      if (!that.isEditOrView) {
        var defaultOptions = {
          tip: '目前存在正在编辑的点，是否进行保存？',
          name_title: '提示',
          name_cancel: '取消',
          name_confirm: '确定',
          isCancelBtnShow: true,
          callBack: function () {
            that.saveNode(function () {
              that.clickItemDetail(item);
            });
          },
          cancelCallBack: function () {
            that.cancelEditNode();
          }
        };
        xxwsWindowObj.xxwsAlert(defaultOptions);
      } else {
        that.clickItemDetail(item);
      }
    },
    clickItemDetail: function (item) {
      var that = this;
      if (item.distributionStatus == 0) {
        if (!that.noallot) {
          that.noallot = true;
          that._addNoAllotPoints();
        }
      } else {
        if (!that.allot) {
          that.allot = true;
          that._addAllotPoints();
        }
      }
      //将该店设置为中心点并进行跳动
      for (var i = 0; i < that.drawNodeArray.length; i++) {
        if (that.drawNodeArray[i].key == item.objectId) {
          var cenLng = that.drawNodeArray[i].value.getPosition().lng;
          var cenLat = that.drawNodeArray[i].value.getPosition().lat;
          that.mapObj.centerAndZoom(new BMap.Point(cenLng, cenLat), 19);
          that.drawNodeArray[i].value.setAnimation(BMAP_ANIMATION_BOUNCE);
          that.currentEditNode = that.drawNodeArray[i];
        } else {
          that.drawNodeArray[i].value.setAnimation();
        }
      }
      that._getNodeDetailById(item.objectId);
    },
    allotBtn: function () {
      var that = this;
      that.currentEditIsSave(function () {
        if (that.allot) {
          that.allot = false;
          that.removeAllotPoint(); //移除已经分配的点
        } else {
          that.allot = true;
          that._addAllotPoints(); //移除已经分配的点
        }
      });

    },
    noAllotBtn: function () {
      var that = this;
      that.currentEditIsSave(function () {
        if (that.noallot) {
          that.noallot = false;
          that.removeNoAllotPoint(); //移除已经分配的点
        } else {
          that.noallot = true;
          that._addNoAllotPoints();
        }
      });
    },
    refreshDraw: function () { //刷新
      var that = this;
      that.removeAllotPoint();
      that.removeNoAllotPoint();
      that.cancalNode(); //清除所有的点
      that.searchInput = "";
      that.isDetailNode = false; //必经点详情列表隐藏
      that.isSearchNode = false; //必经点列表隐藏
      that.isEditOrView = true;
      that.allot = true;
      that.noallot = true;
      that._requestNode();
    }, //刷新进行重新绘制  数据的请求

    _isHasDetailNode: function () {
      var that = this;
      if (!that.allot) {
        if (that.currentEditNode && that.currentEditNode.status == '1') {
          that.isDetailNode = false;
        }
      }
      if (!that.noallot) {
        if (that.currentEditNode && that.currentEditNode.status == '0') {
          that.isDetailNode = false;
        }
      }
    },
    //用于判断页面上面是否存在详情点
    getNode: function () { //取点录入
      var that = this;
      that.isGetOrInput = false; //用于判断84坐标系输入框是否出现
      that.isShowTool = !that.isShowTool;
      that.mapObj.setDefaultCursor('crosshair');
      that.mapObj.setDraggingCursor('crosshair');
      that.initAddForm(); //每次新增之前先初始化页面
      that.mapObj.addEventListener("click", function (e) {
        if (that.mapObj.getDefaultCursor() == "crosshair") {
          var point = new BMap.Point(e.point.lng, e.point.lat);
          that.nodeForm.bdLon = e.point.lng;
          that.nodeForm.bdLat = e.point.lat;
          that.nodeForm.origin = 1;
          var masker = new BMap.Marker(point);
          that.getNodeMarker.push(masker);
          that.mapObj.addOverlay(masker);
          that._locationBdFor84();
          new BMap.Geocoder().getLocation(point, function (result) {
            that.nodeForm.location = result.address;
            $("#addEvent").modal();
          });
        }
      })
    },
    inputNode: function () { //手动录入
      $("#addEvent").modal();
      this.isShowTool = !this.isShowTool;
      this.isGetOrInput = true;
      this.nodeForm.origin = 2;
    },
    addNode: function () { //点击添加
      var that = this;
      that.currentEditIsSave(function () {
        that.initAddForm();
        that.isShowTool = !that.isShowTool;
        that.isSearchNode = false;
      });
    },
    editNode: function () { //编辑按钮
      var that = this;
      that.isEditOrView = false;
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
    delNode: function () {
      var that = this;
      var tip = '您是否删除该关键点？';
      // if (that.nodeDetail.planNames) {
      //   tip = "删除该点，将影响【" + that.nodeDetail.planNames + "】等计划，是否继续删除!";
      // }
      var defaultOptions = {
        tip: tip,
        name_title: '提示',
        name_cancel: '取消',
        name_confirm: '确定',
        isCancelBtnShow: true,
        callBack: function () {
          that._delNodeToServer();
        }
      };
      xxwsWindowObj.xxwsAlert(defaultOptions);
    },
    _delNodeToServer: function () {
      var that = this;
      $.ajax({
        type: "get",
        url: "/cloudlink-inspection-event/keyPoint/delete?token=" + lsObj.getLocalStorage('token'),
        contentType: "application/json",
        dataType: "json",
        data: {
          id: that.nodeDetail.objectId
        },
        success: function (data) {
          if (data.success == 1) {
            xxwsWindowObj.xxwsAlert("删除成功", function () {
              that.isDetailNode = false;
              that.isEditOrView = true;
              that.delArrById();
              if (that.nodeDetail.distributionStatus == 0) {
                that.markerNOAllotClusterer.removeMarker(that.currentEditNode.value);
              } else {
                that.markerAllotClusterer.removeMarker(that.currentEditNode.value);
              }
            });
          } else {
            xxwsWindowObj.xxwsAlert("服务异常，请稍候尝试");
          }
        }
      });
    },
    delArrById: function () {
      var that = this;
      that.drawNodeArray.forEach(function (item, index) {
        if (item.key == that.nodeDetail.objectId) {
          that.currentNoAllotNode.splice(index, 1);
        }
      });
      if (that.nodeDetail.distributionStatus == 0) {
        that.currentNoAllotNode.forEach(function (item, index) {
          if (item.key == that.nodeDetail.objectId) {
            that.currentNoAllotNode.splice(index, 1);
          }
        });
      } else {
        that.currentNoAllotNode.forEach(function (item, index) {
          if (item.key == that.nodeDetail.objectId) {
            that.currentNoAllotNode.splice(index, 1);
          }
        });
      }
    },
    saveNode: function (callback) { //保存修改后的
      var that = this;
      //修改保存之前进行巡检人员的处理
      var objs = [];
      if (that.verrify(that.nodeDetail)) {
        $.ajax({
          type: "get",
          contentType: "application/json",
          url: "/cloudlink-inspection-event/keyPoint/updateCheckGroup?token=" + lsObj.getLocalStorage('token'),
          data: {
            id: that.nodeDetail.objectId,
            groupId: that.nodeDetail.groupId
          },
          dataType: "json",
          success: function (data) {
            if (data.success == 1) {
              if (data.rows[0] == true) {
                var defaultOptions = {
                  tip: '该关键点所在组已经分配到人，是否需要移到其他组进行重新分配',
                  name_title: '提示',
                  name_cancel: '取消',
                  name_confirm: '确定',
                  isCancelBtnShow: true,
                  callBack: function () {
                    that.isUpdateToServer();
                  },
                  cancelCallBack: function () {
                    that.nodeDetail.groupId = that.nodeDetail.history.groupId;
                    that.nodeDetail.groupName = that.nodeDetail.history.groupName;
                  },
                };
                xxwsWindowObj.xxwsAlert(defaultOptions);
              } else {
                that.isUpdateToServer();
              }
            } else {
              xxwsWindowObj.xxwsAlert("服务器异常，请稍候尝试");
            }
          }
        })
      };
    },
    isUpdateToServer: function () {
      var that = this;
      $.ajax({
        type: "post",
        contentType: "application/json",
        url: "/cloudlink-inspection-event/keyPoint/update?token=" + lsObj.getLocalStorage('token'),
        data: JSON.stringify(that.nodeDetail),
        dataType: "json",
        success: function (data) {
          if (data.success == 1) {
            that.isEditOrView = !that.isEditOrView;
            if (typeof callback === 'function') {
              if (that.nodeDetail.distributionStatus == 0) {
                that.currentEditNode.value.setIcon(new BMap.Icon("/src/images/node/noAllot.png", new BMap.Size(29, 42), {
                  anchor: new BMap.Size(15, 42)
                }));
              } else {
                that.currentEditNode.value.setIcon(new BMap.Icon("/src/images/node/allot.png", new BMap.Size(29, 42), {
                  anchor: new BMap.Size(15, 42)
                }));
              }
              callback();
            } else {
              that.refreshDraw();
            }
          }
        }
      });
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
      that.currentEditNode.value.setPosition(new BMap.Point(that.nodeDetail.bdLon, that.nodeDetail.bdLat));
      that.currentEditNode.value.disableDragging();
      that.isEditOrView = !that.isEditOrView;
    },
    submit: function () {
      /*如果是手动输入，则需要将坐标转换为百度坐标 */
      var that = this;
      if (that.verrify(that.nodeForm)) {
        that.saveNodeToServer();
      }
    },
    saveNodeToServer: function () {
      var that = this;
      that.nodeForm.inspectionDays = 1;
      $.ajax({
        type: "post",
        contentType: "application/json",
        url: "/cloudlink-inspection-event/keyPoint/save?token=" + lsObj.getLocalStorage('token'),
        data: JSON.stringify(that.nodeForm),
        dataType: "json",
        success: function (data) {
          if (data.success == 1) {
            $("#addEvent").modal("hide");
            xxwsWindowObj.xxwsAlert("保存成功");
            that.mapObj.setDefaultCursor(that.defaultCursor);
            that.mapObj.setDraggingCursor(that.draggingCursor);
            that.refreshDraw();
          } else {
            if (data.msg.indexOf("name") > -1) {
              xxwsWindowObj.xxwsAlert("关键点名称重复");
              return;
            }
            if (data.msg.indexOf("code") > -1) {
              xxwsWindowObj.xxwsAlert("关键点编号重复");
              return;
            }
            xxwsWindowObj.xxwsAlert("服务器异常，请稍候尝试");
          }
        }
      });
    },
    initAddForm: function () {
      this.nodeForm.name = "";
      this.nodeForm.code = "";
      this.nodeForm.groupId = "";
      this.nodeForm.groupName = "";
    },
    _locationBd: function () { //84转百度
      var that = this;
      var coordinate = coordtransform.wgs84togcj02(that.nodeForm.lon, that.nodeForm.lat);
      var coordinateBd = coordtransform.gcj02tobd09(coordinate[0], coordinate[1]);
      that.nodeForm.bdLon = coordinateBd[0];
      that.nodeForm.bdLat = coordinateBd[1];
      var point = new BMap.Point(that.nodeForm.bdLon, that.nodeForm.bdLat);
      new BMap.Geocoder().getLocation(point, function (result) {
        that.nodeForm.location = result.address;
      });
    },
    _locationBdFor84: function () {
      var that = this;
      var coordinate = coordtransform.bd09togcj02(that.nodeForm.bdLon, that.nodeForm.bdLat);
      var coordinateBd = coordtransform.gcj02towgs84(coordinate[0], coordinate[1]);
      that.nodeForm.lon = coordinateBd[0];
      that.nodeForm.lat = coordinateBd[1];
    },
    _getNodeDetailById: function (oid) {
      var that = this;
      $.ajax({
        type: "get",
        url: "/cloudlink-inspection-event/keyPoint/get?token=" + lsObj.getLocalStorage('token'),
        contentType: "application/json",
        dataType: "json",
        data: {
          id: oid
        },
        success: function (data) {
          if (data.success == 1) {
            that.nodeDetail = data.rows[0];
            that.isDetailNode = true;
          } else {
            xxwsWindowObj.xxwsAlert("服务异常，请稍候尝试");
          }
        }
      })
    },

    verrify: function (obj) {

      //验证
      var that = this;
      if (!obj.name.trim()) {
        xxwsWindowObj.xxwsAlert("关键点名称不能为空");
        return false;
      }
      if (obj.name.length > 45) {
        xxwsWindowObj.xxwsAlert("关键点名称长度不能超过45个");
        return false;
      }
      if (!obj.code.trim()) {
        xxwsWindowObj.xxwsAlert("关键点编号不能为空");
        return false;
      }
      if (obj.code.length > 45) {
        xxwsWindowObj.xxwsAlert("关键点编号长度不能超过45个");
        return false;
      }
      var times = obj.inspectionTimes + "";
      if (!times.trim()) {
        xxwsWindowObj.xxwsAlert("巡检频次不能为空");
        return false;
      }
      var regNum = /^[0-9]*$/;
      if (!regNum.test(times)) {
        xxwsWindowObj.xxwsAlert("巡检频次只能是整数");
        return false;
      }
      var interval = obj.inspectionInterval + "";
      if (!interval.trim()) {
        xxwsWindowObj.xxwsAlert("巡检间隔不能为空");
        return false;
      }
      var regNum1 = /^[0-9]+(()||(.[0-9]{1}))?$/;
      if (!regNum1.test(interval.trim())) {
        xxwsWindowObj.xxwsAlert("巡检间隔为整数或者小数点后一位");
        return false;
      }
      var r = obj.effectiveRadius + "";
      if (!r.trim()) {
        xxwsWindowObj.xxwsAlert("有效半径不能为空");
        return false;
      }
      var regNum1 = /^[0-9]+(()||(.[0-9]{3}))?$/;
      if (!regNum1.test(r.trim())) {
        xxwsWindowObj.xxwsAlert("有效半径只能是数字");
        return false;
      }
      var lon = obj.lon + "";
      if (!lon.trim()) {
        xxwsWindowObj.xxwsAlert("经度不能为空");
        return false;
      }
      var lat = obj.lat + "";
      if (!lat.trim()) {
        xxwsWindowObj.xxwsAlert("经度不能为空");
        return false;
      }
      if (!obj.location.trim()) {
        xxwsWindowObj.xxwsAlert("位置不能为空");
        return false;
      }
      if (!obj.groupName) {
        xxwsWindowObj.xxwsAlert("请选择所属组");
        return false;
      }
      return true;
    },
    cancalNode: function () { //取消点的增加
      var that = this;
      that.mapObj.setDefaultCursor(that.defaultCursor);
      that.mapObj.setDraggingCursor(that.draggingCursor);
      that.getNodeMarker.forEach(function (item) {
        that.mapObj.removeOverlay(item);
      });
      that.isShowTool = false;
      $("#addEvent").modal("hide");
    },
    currentEditIsSave: function (callback) { //当前存在点的编辑，是否进行取消或者保存
      var that = this;
      if (!that.isEditOrView) {
        var defaultOptions = {
          tip: '目前存在正在编辑的点，是否进行保存？',
          name_title: '提示',
          name_cancel: '取消',
          name_confirm: '确定',
          isCancelBtnShow: true,
          callBack: function () {
            that.saveNode(function () {
              callback();
            });
          },
          cancelCallBack: function () {
            that.cancelEditNode();
          }
        };
        xxwsWindowObj.xxwsAlert(defaultOptions);
      } else {
        callback();
      }
    },
    chooseGroup: function () {
      var that = this;
      $("#departmentSelect").modal();
      $("#departmentSelect").on('shown.bs.modal', function (e) {
        var selectArr = [];
        if (!that.isEditOrView) {
          selectArr.push({
            id: that.nodeDetail.groupId,
          });
        }
        groupTreeObj.requestPeopleTree(selectArr, 'radio');
      });
    },
    quiteChooseGroup: function () {
      var that = this;
      var obj = groupTreeObj.getSelectGroup();
      if (obj.length == 0) {
        xxwsWindowObj.xxwsAlert("请选择所属组");
        return;
      }
      if (!that.isEditOrView) {
        that.nodeDetail.groupName = obj[0] ? obj[0].name : "";
        that.nodeDetail.groupId = obj[0] ? obj[0].id : "";
      } else {
        that.nodeForm.groupName = obj[0] ? obj[0].name : "";
        that.nodeForm.groupId = obj[0] ? obj[0].id : "";
      }
      $("#departmentSelect").modal('hide');
    },
    _setMapCenterAndZoom: function () {
      var that = this;
      var data = that.nodeInfoArrys;
      var _length = data.length;
      var _arr = [];
      try {
        for (var i = 0; i < _length; i++) {
          if (data[i].bdLon != "" && data[i].bdLat != "") {
            _arr.push(new BMap.Point(data[i].bdLon, data[i].bdLat));
          }
        }
        if (_arr.length > 0) {
          that.mapObj.setViewport(_arr, {
            zoomFactor: -1
          });
        } else {
          var point = new BMap.Point(116.404, 39.915); // 创建点坐标
          that.mapObj.centerAndZoom(point, 5); // 初始化地图，设置中心点坐标和地图级别
        }
      } catch (e) {
        var point = new BMap.Point(116.404, 39.915); // 创建点坐标
        that.mapObj.centerAndZoom(point, 5); // 初始化地图，设置中心点坐标和地图级别
      }
    },
  },
});