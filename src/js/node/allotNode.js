var index = new Vue({
  el: "#page-wrapper",
  data: function () {
    return {
      mapObj: null,
      selectItems: [], //当前选中的行数
      nodeInfoArrys: [], //所有点信息
      drawNodeArray: [], //当前绘制的点信息
      markerClusterer: null,
      searchObj: {},
      keyword: "",
      distributionStatus: "",
      selectPersonArr: [],
      detailForm: {}
    }
  },
  mounted: function () {
    var that = this;
    that.mapObj = new BMap.Map("allot_map"); // 创建Map实例
    var mPoint = new BMap.Point(116.404, 39.915);
    that.mapObj.centerAndZoom(mPoint, 15);
    that.mapObj.enableScrollWheelZoom();
    drafting('allot_map', 'drafting_down'); //启动拖拽
    that.initTable();
    that.bindEvent();
  },
  methods: {
    bindEvent: function () {
      var that = this;
      $("#btn_selectPeople").click(function () {
        that.selectPeople();
      });
    },
    initTable: function () {
      var that = this;
      $('#table').bootstrapTable({
        url: "/cloudlink-inspection-event/necessityNode/getPage?token=" + lsObj.getLocalStorage('token'),
        method: 'post',
        toolbar: "#toolbar",
        toolbarAlign: "left",
        cache: false, //是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
        showHeader: true,
        showRefresh: true,
        pagination: true, //分页
        striped: true,
        sidePagination: 'server', //分页方式：client客户端分页，server服务端分页（*）
        pageNumber: 1,
        pageSize: 10,
        pageList: [10, 20, 50], //分页步进值
        search: false, //显示搜索框
        searchOnEnterKey: false,
        queryParamsType: '', //默认值为 'limit' ,在默认情况下 传给服务端的参数为：offset,limit,sort
        // 设置为 ''  在这种情况下传给服务器的参数为：pageSize,pageNumber
        queryParams: function (params) {
          that.searchObj.pageSize = params.pageSize;
          that.searchObj.pageNum = params.pageNumber;
          that.searchObj.orderDirection = 'asc';
          that.searchObj.orderBy = 'distributionStatus';
          that.searchObj.withRelationPerson = true;
          return that.searchObj;
        },
        responseHandler: function (res) {
          return res;
        },
        onLoadSuccess: function (data) {
          if (data.success == 1) {
            if (data.rows.length > 0) {
              that.nodeInfoArrys = data.rows;
              that.setPointCenter();
            } else {
              that.removePoint();
            }
          }
        },
        //表格的列
        columns: [{
            field: 'state', //域值
            checkbox: true, //复选框
            align: 'center',
            visible: true, //false表示不显示
            sortable: false, //启用排序
            width: '3%',
          }, {
            field: 'distributionStatus', //域值
            title: '状态',
            align: 'center',
            visible: true, //false表示不显示
            sortable: false, //启用排序
            class: "W60",
            editable: true,
            formatter: function (value) {
              if (value == 0) {
                return '<span class="noallot">未分配<span>'
              } else {
                return '<span class="allot">已分配<span>'
              }
            }
          }, {
            field: 'objectId', //域值
            title: '名称',
            align: 'center',
            visible: false, //false表示不显示
            sortable: false, //启用排序
            editable: true,
          }, {
            field: 'name', //域值
            title: '名称',
            align: 'center',
            visible: true, //false表示不显示
            sortable: false, //启用排序
            width: '15%',
            editable: true,
          }, {
            field: 'code', //域值
            title: '编号', //内容
            align: 'center',
            visible: true, //false表示不显示
            sortable: false, //启用排序
            width: '10%',
            editable: true,
            cellStyle: function (value, row, index) {
              return {
                css: {
                  "max-width": "300px",
                }
              };
            }
          }, {
            field: 'inspectionTimes', //域值
            title: '巡检频次', //内容
            align: 'center',
            visible: true, //false表示不显示
            sortable: false, //启用排序
            width: '5%',
            editable: true,
          }, {
            field: 'inspectionInterval', //域值
            title: '间隔时间', //内容
            align: 'center',
            visible: true, //false表示不显示
            sortable: false, //启用排序
            width: '5%',
            // editable: true,
          }, {
            field: 'effectiveRadius', //域值
            title: '有效半径', //内容
            align: 'center',
            visible: true, //false表示不显示
            sortable: false, //启用排序
            width: '5%',
            editable: true,
          },
          {
            field: 'location', //域值
            title: '位置', //内容
            align: 'center',
            visible: true, //false表示不显示
            sortable: false, //启用排序
            width: '35%',
            editable: true,
          }, {
            field: 'personIdList', //域值
            title: '巡检人员', //内容
            align: 'center',
            visible: true, //false表示不显示
            sortable: false, //启用排序
            width: '8%',
            editable: true,
            formatter: function (value) {
              if (value) {
                return value.length;
              } else {
                return "";
              }

            }
          }, {
            field: 'operate',
            title: '操作',
            align: 'center',
            // class: "W60",
            events: {
              //定位功能
              'click .location': function (e, value, row, index) {
                if ($(this).find('i').attr("class") == 'active') {} else {
                  $(".location").find('i').attr("class", "");
                  $(this).find('i').attr("class", "active");
                  that.singlePointLocation(row);
                }
                $('body,html').animate({
                  scrollTop: 0
                }, 500);
                return false;
              },
              //查看详情
              'click .check': function (e, value, row, index) {
                that.getNodeDeatilByObjectId(row.objectId);
                return false;
              },
              //查看详情
              'click .allotstyle': function (e, value, row, index) {
                that.allotPeople(row);
                return false;
              },
              // //删除
              // 'click .del': function (e, value, row, index) {
              //   var defaultOptions = {
              //     tip: '您是否删除该必经点？',
              //     name_title: '提示',
              //     name_cancel: '取消',
              //     name_confirm: '确定',
              //     isCancelBtnShow: true,
              //     callBack: function () {
              //       that.deleteNode(row.objectId);
              //     }
              //   };
              //   xxwsWindowObj.xxwsAlert(defaultOptions);
              //   return false;
              // }
            },
            width: '40%',
            formatter: function (value, row, index) {
              return [
                '<a class="allotstyle"  href="javascript:void(0)" title="分配">',
                '<i></i>',
                '<a class="location" href="javascript:void(0)" title="定位">',
                '<i></i>',
                '</a>',
                '<a class="check" data-toggle="modal" href="javascript:void(0)" title="查看">',
                '<i></i>',

                '</a>',
              ].join('');
            }
          }
        ]
      });

    },
    refreshTable: function () {
      var that = this;
      that.searchObj.pageNum = '1';
      that.searchObj.keyword = that.keyword;
      that.searchObj.distributionStatus = that.distributionStatus;
      $('#table').bootstrapTable('refreshOptions', {
        pageNumber: +that.searchObj.pageNum,
        pageSize: +that.searchObj.pageSize,
        queryParams: function (params) {
          that.searchObj.pageSize = params.pageSize;
          that.searchObj.pageNum = params.pageNumber;
          return that.searchObj;
        }
      });
    },
    clearTable: function () {
      var that = this;
      that.keyword = "";
      that.distributionStatus = "";
      that.refreshTable();
    },
    chooseStatus: function (e) {
      var t = e.target;
      this.distributionStatus = $(t).attr('data-value');
      this.refreshTable();
    },
    singlePointLocation: function (selectedItem) {
      var that = this;
      var isExist = 0; //用于表示当前地图上面有无该店
      that.mapObj.centerAndZoom(new BMap.Point(selectedItem.bdLon, selectedItem.bdLat), 18);
      for (var i = 0; i < that.drawNodeArray.length; i++) {
        if (that.drawNodeArray[i].key == selectedItem.objectId) {
          isExist++;
          this.drawNodeArray[i].value.setAnimation(BMAP_ANIMATION_BOUNCE);
        } else {
          this.drawNodeArray[i].value.setAnimation();
        }
      }
      console.log(isExist)
      if (isExist > 0) return;
      //如果当前地图上面没有该点，需要进行绘制
    },
    removePoint: function () {
      var that = this;
      for (var i = 0; i < that.drawNodeArray.length; i++) {
        that.markerClusterer.removeMarker(that.drawNodeArray[i].value);
      }

    },
    setPointCenter: function () {
      var that = this;
      that.removePoint(); //进行移除
      var arr = that.nodeInfoArrys.map(function (item, index) {
        return new BMap.Point(item.bdLon, item.bdLat);
      });
      that.mapObj.setViewport(arr, {
        zoomFactor: -1
      });
      that.drawPoint();
    },
    drawPoint: function () {
      var that = this;
      var myIcons = null;
      var markers = null;
      var point = null;
      that.drawNodeArray = [];
      var data = that.nodeInfoArrys;
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
      }
      that.addPoints();
    },
    addPoints: function () {
      var that = this;
      var markersArr = [];
      that.markerClusterer = null;
      for (var i = 0; i < that.drawNodeArray.length; i++) {
        markersArr.push(that.drawNodeArray[i].value);
      }
      that.markerClusterer = new BMapLib.MarkerClusterer(that.mapObj, {
        markers: markersArr
      });
    },
    allotPeople: function (value) {
      var that = this;
      var selectPeople = [];
      that.selectItems = [];
      //是否选中条数
      if (value.objectId) {
        that.selectItems.push(value);
      } else {
        that.selectItems = $('#table').bootstrapTable('getAllSelections');
      }
      if (that.selectItems.length == 0) {
        xxwsWindowObj.xxwsAlert("请选中一行数据");
        return;
      }
      $("#stakeholder").modal();
      $("#stakeholder").on('shown.bs.modal', function (e) {
        if (that.selectItems.length == 1) {
          that.selectItems[0].personIdList.forEach(function (item) {
            selectPeople.push({
              relationshipPersonId: item
            })
          });
          peopleTreeObj.requestPeopleTree($("#stakeholder"), selectPeople);
        } else {
          peopleTreeObj.requestPeopleTree($("#stakeholder"), selectPeople);
        }

      });

    },
    getNodeDeatilByObjectId: function (objectId) {
      $("#details").modal(); //打开详情模态框
      var that = this;
      $.ajax({
        type: "get",
        url: "/cloudlink-inspection-event/necessityNode/get?token=" + lsObj.getLocalStorage('token'),
        contentType: "application/json",
        dataType: "json",
        data: {
          id: objectId
        },
        success: function (data) {
          if (data.success == 1) {
            that.detailForm = data.rows[0];
            if (that.detailForm.personIdList) {
              that.detailForm.peopleCount = that.detailForm.personIdList.length;
            } else {
              that.detailForm.peopleCount = 0;
            }

          } else {
            xxwsWindowObj.xxwsAlert("服务异常，请稍候尝试");
          }
        }
      });
    },
    deleteNode: function (objectId) {
      var that = this;
      $.ajax({
        type: "get",
        url: "/cloudlink-inspection-event/necessityNode/delete?token=" + lsObj.getLocalStorage('token'),
        contentType: "application/json",
        dataType: "json",
        data: {
          id: objectId
        },
        success: function (data) {
          if (data.success == 1) {
            xxwsWindowObj.xxwsAlert("删除成功", function () {
              that.refreshTable();
            });
          } else {
            xxwsWindowObj.xxwsAlert("服务异常，请稍候尝试");
          }
        }
      });
    },
    selectPeople: function () {
      var that = this;
      var peopleArr = [];
      var peopleObj = peopleTreeObj.getSelectPeople();
      var obj = {
        necessityNodeIdList: [],
        personFormList: []
      };
      for (var i = 0; i < that.selectItems.length; i++) {
        obj.necessityNodeIdList.push(that.selectItems[i].objectId);
      }
      peopleObj.selectedArr.forEach(function (item) {
        peopleArr.push({
          personId: item.relationshipPersonId,
          personName: item.relationshipPersonName
        });
      });
      obj.personFormList = peopleArr;
      that.updateRelation(obj);
    },
    updateRelation: function (obj) {
      var that = this;
      $.ajax({
        type: "post",
        contentType: "application/json",
        dataType: "json",
        url: "/cloudlink-inspection-event/necessityNode/updateRelationPerson?token=" + lsObj.getLocalStorage('token'),
        data: JSON.stringify(obj),
        success: function (data) {
          if (data.success == 1) {
            xxwsWindowObj.xxwsAlert("分配成功", function () {
              that.refreshTable();
            });
          } else {
            xxwsWindowObj.xxwsAlert("服务异常，请稍候尝试");
          }
        }
      });
    }
  }
});