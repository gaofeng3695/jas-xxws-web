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
      currentDrawNode: [], //表示当前在地图上面绘制的点
      markerClusterer: null,
      defaultCursor: "",
      draggingCursor: "",
      allot: true, //已分配是否显示
      noallot: true,
      searchInput: "",
      nodeDetail: {
        name: "",
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
        inspectionDays: 1, //巡检天数
        inspectionTimes: "", //巡检频次
        inspectionInterval: "", //巡检间隔
        lon: "",
        lat: "",
        remark: "",
        effectiveRadius: "",
        personFormList: []
      },
      textCount: 160
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
    that.defaultCursor = that.mapObj.getDefaultCursor();
    that.draggingCursor = that.mapObj.getDraggingCursor();
    that._requestNode();
  },
  methods: {
    search: function () {
      var that = this;
      that.isShowTool = false;
      that._requestNode(that.searchInput, function () {
        that.isSearchNode = true;
        that.isDetailNode = false; //必经点详情列表隐藏
        that.isEditOrView = true;
        if (that.nodeInfoArrys.length == 0) {
          that.noResult = true;
        } else {
          that.noResult = false;
        }
        that.removePoint();
        that.mapObj.clearOverlays();
      })
    },
    _requestNode: function (value, callback) {
      var that = this;
      $.ajax({
        type: "post",
        contentType: "application/json",
        dataType: "json",
        url: "/cloudlink-inspection-event/necessityNode/getPage?token=" + lsObj.getLocalStorage('token'),
        data: JSON.stringify({
          "keyword": that.searchInput,
          pageNum: 1,
          pageSize: 100000,
          withRelationPerson: true,
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
      that.currentDrawNode = [];
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
        that.currentDrawNode.push({
          'status': data[i].distributionStatus + "",
          'key': data[i].objectId,
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
      if (!that.isEditOrView) {
        xxwsWindowObj.xxwsAlert("目前存在正在编辑的必经点，请先保存")
        return;
      }
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
        if (that.drawNodeArray[i].key == item.objectId) {
          var cenLng = that.drawNodeArray[i].value.getPosition().lng;
          var cenLat = that.drawNodeArray[i].value.getPosition().lat;
          that.mapObj.centerAndZoom(new BMap.Point(cenLng, cenLat), 19);
          that.currentEditNode = that.drawNodeArray[i];
          that.drawNodeArray[i].value.setAnimation(BMAP_ANIMATION_BOUNCE);
        } else {
          that.drawNodeArray[i].value.setAnimation();
        }
      }
      that._getNodeDetailById(item.objectId);
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
    _isHasDetailNode: function (value) {
      var that = this;
      if (that.currentEditNode && that.currentEditNode.status == value) {
        that.isDetailNode = false;
      }
    }, //用于判断页面上面是否存在详情点
    _addPoints: function (value) {
      var that = this;
      var markersArr = [];
      that.markerClusterer = null;
      if (!value) {} else {
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
    refreshDraw: function () { //刷新
      var that = this;
      that.removePoint();
      that.searchInput = "";
      that.mapObj.clearOverlays();
      that.isDetailNode = false; //必经点详情列表隐藏
      that.isSearchNode = false; //必经点列表隐藏
      that.isEditOrView = true;
      that.allot = true;
      that.noallot = true;
      that._requestNode();
    }, //刷新进行重新绘制  数据的请求
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
      that._isHasDetailNode(value); //进行详情页面的关闭
    },
    delObj: function (_arr, _obj) {
      if (_arr) {
        var length = _arr.length;
        for (var i = 0; i < length; i++) {
          if (_arr[i].key && _arr[i].key == _obj.key) {
            _arr.splice(i, 1);
            return _arr;
          }
        }
      }
    },
    getNode: function () {
      var that = this;
      that.isGetOrInput = false;
      that.mapObj.setDefaultCursor('crosshair');
      that.mapObj.setDraggingCursor('crosshair');
      that.initAddForm(); //每次新增之前先初始化页面
      that.mapObj.addEventListener("click", function (e) {
        if (that.isShowTool) {
          that.isShowTool = !that.isShowTool;
          var point = new BMap.Point(e.point.lng, e.point.lat);
          that.nodeForm.bdLon = e.point.lng;
          that.nodeForm.bdLat = e.point.lat;
          var marker = new BMap.Marker(point);
          that.mapObj.addOverlay(marker);
          that._locationBdFor84();
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
      $("#addEvent").on('shown.bs.modal', function (e) {
        var selectPeople = [];
        peopleTreeObj.requestPeopleTree("", selectPeople);
      });
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
    saveNode: function () { //保存修改后的
      var that = this;
      //修改保存之前进行巡检人员的处理
      var objs = [];
      if (!that.nodeDetail.personFormList) {
        that.nodeDetail.personNames = that.nodeDetail.personNames.split(",")
        that.nodeDetail.personIdList.forEach(function (item, index) {
          objs.push({
            personId: item,
            personName: that.nodeDetail.personNames[index]
          })
        });
        that.nodeDetail.personFormList = objs;
      }
      delete that.nodeDetail.personNames;
      delete that.nodeDetail.personIdList;
      $.ajax({
        type: "post",
        contentType: "application/json",
        url: "/cloudlink-inspection-event/necessityNode/update?token=" + lsObj.getLocalStorage('token'),
        data: JSON.stringify(that.nodeDetail),
        dataType: "json",
        success: function (data) {
          if (data.success == 1) {
            that.isEditOrView = !that.isEditOrView;
            that.refreshDraw();
            // if (that.nodeDetail.distributionStatus == 0) {
            //   that.currentEditNode.value.setIcon(new BMap.Icon("/src/images/node/noAllot.png", new BMap.Size(29, 42), {
            //     anchor: new BMap.Size(15, 42)
            //   }));
            // } else {
            //   that.currentEditNode.value.setIcon(new BMap.Icon("/src/images/node/allot.png", new BMap.Size(29, 42), {
            //     anchor: new BMap.Size(15, 42)
            //   }));
            // }
            // that.currentEditNode.value.disableDragging();
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
      if (that.verrify()) {
        that.nodeForm.personFormList = [];
        that.saveNodeToServer();
      }
    },
    next: function () {
      //首先进行验证
      var that = this;
      if (that.verrify()) {
        that.isFirst = false;
        that.isSecond = true;
      }
    },
    back: function () {
      /*如果是手动输入，则需要将坐标转换为百度坐标 */
      this.isFirst = true;
      this.isSecond = false;
    },
    saveInfo: function () {
      var that = this;
      var peopleArr = [];
      var peopleObj = peopleTreeObj.getSelectPeople();
      peopleObj.selectedArr.forEach(function (item) {
        peopleArr.push({
          personId: item.relationshipPersonId,
          personName: item.relationshipPersonName
        });
      });
      that.nodeForm.personFormList = peopleArr;
      that.saveNodeToServer();
    },
    saveNodeToServer: function () {
      var that = this;
      that.nodeForm.inspectionDays = 1;
      $.ajax({
        type: "post",
        contentType: "application/json",
        url: "/cloudlink-inspection-event/necessityNode/save?token=" + lsObj.getLocalStorage('token'),
        data: JSON.stringify(that.nodeForm),
        dataType: "json",
        success: function (data) {
          if (data.success == 1) {
            $("#addEvent").modal("hide");
            that.isFirst = true;
            that.isSecond = false;
            that.mapObj.setDefaultCursor(that.defaultCursor);
            that.mapObj.setDraggingCursor(that.draggingCursor);
            that.refreshDraw();
          }
        }
      });
    },

    initAddForm: function () {
      for (var key in this.nodeForm) {
        this.nodeForm[key] = "";
      }
    },
    _locationBd: function () {
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
        url: "/cloudlink-inspection-event/necessityNode/get?token=" + lsObj.getLocalStorage('token'),
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
    choosePeople: function () {
      var that = this;
      $("#choosePeople").modal();
      $("#choosePeople").on('shown.bs.modal', function (e) {
        var selectPeople = [];
        if (that.nodeDetail.personIdList && that.nodeDetail.personIdList.length > 0) {
          that.nodeDetail.personIdList.forEach(function (item) {
            selectPeople.push({
              relationshipPersonId: item
            });
          });
        }
        peopleTreeObj.requestPeopleTree("", selectPeople, "", "people_list1");
      });
    },
    savePeople: function () {
      var that = this;
      var peopleArr = [];
      var names = "";
      var peopleObj = peopleTreeObj.getSelectPeople();
      console.log(peopleObj.selectedArr);
      peopleObj.selectedArr.forEach(function (item) {
        peopleArr.push({
          personId: item.relationshipPersonId,
          personName: item.relationshipPersonName
        });
        names += item.relationshipPersonName + ",";
      });
      console.log(peopleArr);
      that.nodeDetail.personNames = names.substring(0, names.length - 1);
      that.nodeDetail.personFormList = peopleArr;
      $("#choosePeople").modal('hide');
    },
    cancelPeople: function () {
      $("#choosePeople").modal('hide');
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
      if (!that.nodeForm.inspectionTimes.trim()) {
        xxwsWindowObj.xxwsAlert("巡检频次不能为空");
        return false;
      }
      var regNum = /^[0-9]*$/;
      if (!regNum.test(this.nodeForm.inspectionTimes.trim())) {
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
      // if (!that.nodeForm.lon.trim()) {
      //   xxwsWindowObj.xxwsAlert("纬度不能为空");
      //   return false;
      // }
      // if (!that.nodeForm.lat.trim()) {
      //   xxwsWindowObj.xxwsAlert("经度不能为空");
      //   return false;
      // }
      // if (!that.nodeForm.location.trim()) {
      //   xxwsWindowObj.xxwsAlert("位置不能为空");
      //   return false;
      // }
      return true;
    },
  },
});