var vue = new Vue({
  el: "#page-wrapper",
  data: function () {
    return {
      distributionStatus: "",
      keyword: "",
      searchObj: {},
      currentAllotPeople: {} //当前分配的人
    }
  },
  mounted: function () {
    this.initTable();
  },
  methods: {
    initTable: function () {
      var that = this;
      $('#table').bootstrapTable({
        url: "/cloudlink-inspection-event/regionalGroup/pageGroupPerson?token=" + lsObj.getLocalStorage('token'),
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
          return that.searchObj;
        },
        responseHandler: function (res) {
          return {
            rows: res.rows[0].resultList,
            total: res.rows[0].total
          }
        },
        onLoadError: function (res) {
          xxwsWindowObj.xxwsAlert("网络异常，请稍候尝试")
        },
        //表格的列
        columns: [
          // {
          //   field: 'state', //域值
          //   checkbox: true, //复选框
          //   align: 'center',
          //   visible: true, //false表示不显示
          //   sortable: false, //启用排序
          //   width: '3%',
          // },
          {
            field: 'groupId', //域值
            title: '名称',
            align: 'center',
            visible: false, //false表示不显示
            sortable: false, //启用排序
            editable: true,
          },{
            field: 'groupCompletePath', //域值
            title: '所属区域/分组',
            align: 'center',
            visible: true, //false表示不显示
            sortable: false, //启用排序

            editable: true,
          }, {
            field: 'personName', //域值
            title: '人员名称', //内容
            align: 'center',
            visible: true, //false表示不显示
            sortable: false, //启用排序

            editable: true,
            cellStyle: function (value, row, index) {
              return {
                css: {
                  "max-width": "300px",
                }
              };
            }
          }, {
            field: 'orgName', //域值
            title: '所在部门', //内容
            align: 'center',
            visible: true, //false表示不显示
            sortable: false, //启用排序
            editable: true,
          }, {
            field: 'keyPointCount', //域值
            title: '数量', //内容
            align: 'center',
            visible: true, //false表示不显示
            sortable: false, //启用排序
            editable: true,
            // formatter: function (val) {
            //   if (val == null || val == "") {
            //     return 0;
            //   } else {
            //     return val;
            //   }
            // }
          },

          {
            field: 'operate',
            title: '操作',
            align: 'center',
            class: "W60",
            events: {
              //查看详情
              'click .check': function (e, value, row, index) {
                // that.getNodeDeatilByObjectId(row.objectId);
                return false;
              },
              //查看详情
              'click .allotstyle': function (e, value, row, index) {
                that.allotNode(row);
                return false;
              },
            },
            width: '40%',
            formatter: function (value, row, index) {
              return [
                '<a class="allotstyle"  href="javascript:void(0)" title="分配">',
                '<i></i>',
                '</a>',
                // '<a class="check" data-toggle="modal" href="javascript:void(0)" title="查看">',
                // '<i></i>',
                '</a>',
              ].join('');
            }
          }
        ]
      });

    },
    chooseStatus: function (e) {
      var t = e.target;
      this.distributionStatus = $(t).attr('data-value');
      this.searchObj.pageNum = 1;
      this.refreshTable();
    },
    clearTable: function () {
      var that = this;
      that.keyword = "";
      that.distributionStatus = "";
      that.searchObj.pageNum = 1;
      that.refreshTable();
    },
    search: function () {
      var that = this;
      that.searchObj.pageNum = 1;
      that.refreshTable();
    },
    refreshTable: function () {
      var that = this;
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
    allotNode: function (row) {
      var that = this;
      that.currentAllotPeople = row;
      $("#chooseNode").modal();
      chooseNode.initChoose();
      chooseNode.requestAllNodes(); //请求所有的关键点
    }
  }
});
var chooseNode = new Vue({
  el: "#chooseNode",
  data: function () {
    return {
      //计划配置页面操作
      toAllot: true,
      toAllotBg: false,
      toNoAllot: true,
      toNoAllotBg: false,
      isAllChecked: false,
      isAllCheckedNoAllot: false,
      noAllotNodeArrs: [],
      allotNodeArrs: [],
      allotNodeArrsByServer: [],
      noAllotNodeArrsByServer: [],
      chooseAllotNode: [], //选中已经分配的点
      chooseNoAllotNode: [], //选中的没有分配的点
      noallotKeyWord: "",
      allotKeyWord: "",
    }
  },
  watch: {
    allotKeyWord: function () {
      var that = this;
      that.requestAllotNodesByLocal();
    },
    noallotKeyWord: function () {
      var that = this;
      that.requestNoAllNodesByLocal();
    },
    chooseAllotNode: function () {
      var that = this;
      if (that.chooseAllotNode.length > 0) {
        that.toAllot = false;
        that.toAllotBg = true;
      } else {
        that.toAllot = true;
        that.toAllotBg = false;
      }
    },
    chooseNoAllotNode: function () {
      var that = this;
      if (that.chooseNoAllotNode.length > 0) {
        that.toNoAllot = false;
        that.toNoAllotBg = true;
      } else {
        that.toNoAllot = true;
        that.toNoAllotBg = false;
      }
    }
  },
  methods: {
    requestAllotNodesByLocal: function () {
      var that = this;
      var keyword = that.allotKeyWord;
      that.allotNodeArrs = [];
      that.allotNodeArrsByServer.forEach(function (item, index) {
        if (keyword) {
          if (item.name.indexOf(keyword) > -1 || item.code.indexOf(keyword) > -1 || item.location.indexOf(keyword) > -1) {
            that.allotNodeArrs.push(item);
          }
        } else {
          that.allotNodeArrs.push(item);
        }
      });
    }, //本地搜索
    requestNoAllNodesByLocal: function () {
      var that = this;
      var keyword = that.noallotKeyWord;
      that.noAllotNodeArrs = [];
      that.noAllotNodeArrsByServer.forEach(function (item, index) {
        if (keyword) {
          if (item.name.indexOf(keyword) > -1 || item.code.indexOf(keyword) > -1 || item.location.indexOf(keyword) > -1) {
            that.noAllotNodeArrs.push(item);
          }
        } else {
          that.noAllotNodeArrs.push(item);
        }
      });
    },
    clickItem: function (item, index) {
      var that = this;
      if (item.checked) {
        that.allotNodeArrs.forEach(function (s, index1) {
          if (s.objectId == item.objectId) {
            that.allotNodeArrs[index1].checked = false;
            return;
          }
        });
        that.chooseAllotNode.forEach(function (items, index) {
          if (items.objectId == item.objectId) {
            that.chooseAllotNode.splice(index, 1);
          }
        });
      } else {
        that.allotNodeArrs.forEach(function (s, index1) {
          if (s.objectId == item.objectId) {
            that.allotNodeArrs[index1].checked = true;
            return;
          }
        });
        that.chooseAllotNode.push(item);
      }
      if (that.chooseAllotNode.length == that.allotNodeArrs.length) {
        that.isAllChecked = true;
      } else {
        that.isAllChecked = false;
      }
    },
    clickNoAllotItem: function (item, index) {
      var that = this;
      if (item.checked) {
        that.noAllotNodeArrs.forEach(function (s, index1) {
          if (s.objectId == item.objectId) {
            that.noAllotNodeArrs[index1].checked = false;
            return;
          }
        });
        that.chooseNoAllotNode.forEach(function (items, index) {
          if (items.objectId == item.objectId) {
            that.chooseNoAllotNode.splice(index, 1);
          }
        });
      } else {
        that.noAllotNodeArrs.forEach(function (s, index1) {
          if (s.objectId == item.objectId) {
            that.noAllotNodeArrs[index1].checked = true;
            return;
          }
        });
        that.chooseNoAllotNode.push(item);
      }
      if (that.chooseNoAllotNode.length == that.noAllotNodeArrs.length) {
        that.isAllCheckedNoAllot = true;
      } else {
        that.isAllCheckedNoAllot = false;
      }
    },
    toRight: function () {
      var that = this;
      if (that.chooseNoAllotNode.length > 0) {
        that.chooseNoAllotNode.forEach(function (item) {
          item.checked = false;
          that.allotNodeArrs.push(item);
          that.allotNodeArrsByServer.push(item);
          that.noAllotNodeArrsByServer.forEach(function (s, index) {
            if (s.objectId == item.objectId) {
              that.noAllotNodeArrsByServer.splice(index, 1);
              return;
            }
          });
          that.noAllotNodeArrs.forEach(function (s, index) {
            if (s.objectId == item.objectId) {
              that.noAllotNodeArrs.splice(index, 1);
              return;
            }
          });
        });
      }
      that.chooseNoAllotNode = [];
      that.isAllCheckedNoAllot = false;
    },
    toLeft: function () {
      var that = this;
      if (that.chooseAllotNode.length > 0) {
        that.chooseAllotNode.forEach(function (item) {
          item.checked = false;
          item.allowAllot = 1;
          that.noAllotNodeArrs.push(item);
          that.noAllotNodeArrsByServer.push(item);
          that.allotNodeArrsByServer.forEach(function (s, index) {
            if (s.objectId == item.objectId) {
              that.allotNodeArrsByServer.splice(index, 1);
              return;
            }
          });
          that.allotNodeArrs.forEach(function (s, index) {
            if (s.objectId == item.objectId) {
              that.allotNodeArrs.splice(index, 1);
              return;
            }
          });
        });
      }
      that.chooseAllotNode = [];
      that.isAllChecked = false;
    },
    isAllCheckedAllot: function () { //选择所有已经纳入的点
      var that = this;
      if (!that.isAllChecked) {
        that.isAllChecked = true;
        that.chooseAllotNode = [];
        that.allotNodeArrs.forEach(function (item) {
          item.checked = true;
          that.chooseAllotNode.push(item);
        });
      } else {
        that.isAllChecked = false;
        that.allotNodeArrs.forEach(function (item) {
          item.checked = false;
        });
        that.chooseAllotNode = [];
      }
    },
    isAllCheckedNoAllotNode: function () { //选择所有未纳入的点
      var that = this;
      if (!that.isAllCheckedNoAllot) {
        that.isAllCheckedNoAllot = true;
        that.chooseNoAllotNode = [];
        that.noAllotNodeArrs.forEach(function (item) {
          item.checked = true;
          that.chooseNoAllotNode.push(item);
        });
      } else {
        that.isAllCheckedNoAllot = false;
        that.noAllotNodeArrs.forEach(function (item) {
          item.checked = false;
        });
        that.chooseNoAllotNode = [];
      }
    },
    requestAllNodes: function () {
      var that = this;
      that.noallotKeyWord = "";
      $.ajax({
        type: "GET",
        contentType: "application/json",
        dataType: "json",
        url: "/cloudlink-inspection-event/keyPoint/listAssignedWithPerson?token=" + lsObj.getLocalStorage('token'),
        data: {
          groupId: vue.currentAllotPeople.groupId,
          personId: vue.currentAllotPeople.personId
        },
        success: function (data) {
          if (data.success == 1) {
            that.noAllotNodeArrs = [];
            that.noAllotNodeArrsByServer = [];
            if (data.rows[0].distributableKeyPointList.length > 0) {
              data.rows[0].distributableKeyPointList.forEach(function (item) {
                item.checked = false;
                that.noAllotNodeArrs.push(item);
                that.noAllotNodeArrsByServer.push(item);
              });
            }
            if (data.rows[0].assignedkeyPointList.length > 0) {
              data.rows[0].assignedkeyPointList.forEach(function (item) {
                item.checked = false;
                that.allotNodeArrs.push(item);
                that.allotNodeArrsByServer.push(item);
              });
            }
          } else {
            xxwsWindowObj.xxwsAlert("服务异常，请稍候尝试");
          }
        }
      });
    },
    submit: function () {
      var that = this;
      if (that.allotNodeArrs.length == 0) {
        xxwsWindowObj.xxwsAlert("请选择需要分配的关键点");
        return;
      }
      that.nodeAndPlanToServer(function () {
        $("#chooseNode").modal('hide');
        that.noAllotNodeArrs = [];
        that.allotNodeArrs = [];
        that.chooseAllotNode = []; //选中已经分配的点
        that.chooseNoAllotNode = []; //选中的没有分配的点
        xxwsWindowObj.xxwsAlert("分配成功", function () {
          vue.refreshTable();
        });
      });
    }, //进行计划和选择的关键点之间的关系存储
    nodeAndPlanToServer: function (callback) {
      var that = this;
      var obj = {
        groupId: vue.currentAllotPeople.groupId,
        personId: vue.currentAllotPeople.personId,
        personName: vue.currentAllotPeople.personName,
        keyPointIdList: []
      };
      that.allotNodeArrsByServer.forEach(function (item) {
        obj.keyPointIdList.push(item.objectId);
      });
      $.ajax({
        type: "post",
        contentType: "application/json",
        dataType: "json",
        url: "/cloudlink-inspection-event/keyPoint/updateWithPersonRelation?token=" + lsObj.getLocalStorage('token'),
        data: JSON.stringify(obj),
        success: function (data) {
          if (data.success == 1) {
            callback();
          } else {
            xxwsWindowObj.xxwsAlert("服务异常，请稍候尝试");
          }
        }
      });
    },
    cancalChooseNode: function () {
      var that = this;
      vue.refreshTable();
      $("#chooseNode").modal('hide');
    },
    initChoose: function () {
      var that = this;
      that.isAllCheckedNoAllot = false;
      that.noAllotNodeArrs = [];
      that.allotNodeArrs = [];
      that.chooseAllotNode = []; //选中已经分配的点
      that.chooseNoAllotNode = []; //选中的没有分配的点
      that.noAllotNodeArrsByServer = [];
      that.allotNodeArrsByServer = [];
      that.toAllotBg = false;
      that.toNoAllot = true;
      that.toNoAllotBg = false;
      that.isAllChecked = false;
      that.allotKeyWord = "";
      that.noallotKeyWord = "";
    }
  }
});