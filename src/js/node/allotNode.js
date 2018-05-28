var index = new Vue({
  el: "#page-wrapper",
  data: function () {
    return {
      mapObj: null,
      nodeInfoArrys: [], //所有点信息
      drawNodeArray: [], //当前绘制的点信息
      markerClusterer: null,
      searchObj: {},
      selectPersonArr: [],
      detailForm:{}
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
        url: "../js/node/node.json", //请求数据url
        method: 'get',
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
          return that.searchObj;
        },
        responseHandler: function (res) {
          return res;
        },
        onLoadSuccess: function (data) {
          if (data.status == 1) {
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
            field: 'oid', //域值
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
            field: 'inspectionDays', //域值
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
            width: '25%',
            editable: true,
          }, {
            field: 'peopleList', //域值
            title: '巡检人员', //内容
            align: 'center',
            visible: true, //false表示不显示
            sortable: false, //启用排序
            width: '20%',
            editable: true,
          }, {
            field: 'operate',
            title: '操作',
            align: 'center',
            class: "W60",
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
              that.detailForm=row;
                $("#details").modal(); //打开详情模态框
                return false;
              },
              //查看详情
              'click .allotstyle': function (e, value, row, index) {
                that.allotPeople(row);
                return false;
              }
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
    singlePointLocation: function (selectedItem) {
      var that = this;
      var isExist = 0; //用于表示当前地图上面有无该店
      that.mapObj.centerAndZoom(new BMap.Point(selectedItem.bdLon, selectedItem.bdLat), 18);
      for (var i = 0; i < that.drawNodeArray.length; i++) {
        if (that.drawNodeArray[i].key == selectedItem.oid) {
          isExist++;
          this.drawNodeArray[i].value.setAnimation(BMAP_ANIMATION_BOUNCE);
        } else {
          this.drawNodeArray[i].value.setAnimation();
        }
      }
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
          'key': data[i].oid,
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
      var selectItem = [];
      //是否选中条数
      if (value.oid) {
        selectItem.push(value);
      } else {
        selectItem = $('#table').bootstrapTable('getAllSelections');
      }
      if (selectItem.length == 0) {
        xxwsWindowObj.xxwsAlert("请选中一行数据");
        return;
      }
      $("#stakeholder").modal();
      $("#stakeholder").on('shown.bs.modal', function (e) {
        if (selectItem.length == 1) {
          selectItem[0].peopleLiseId.forEach(function (item) {
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
    selectPeople: function () {
      var ids = []; //获取点的id
      var selectItem = $('#table').bootstrapTable('getAllSelections');
      for (var i = 0; i < selectItem.length; i++) {
        ids.push(selectItem[i].oid);
      }
      var dataObj = peopleTreeObj.getSelectPeople();
      alert("人员分配" + dataObj.selectedName);
    }
  }
});