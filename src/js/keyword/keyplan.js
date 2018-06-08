var indexs = new Vue({
  el: "#page",
  data: function () {
    return {
      currentPlanId: "", //当前操作的计划
      currentStatus: "",
      title: "新建计划",
      taskForm: {
        name: "",
        code: "",
        startTime: "",
        endTime: "",
        remark: "",
      },
      detailForm: {
        name: "",
        code: "",
        startTime: "",
        endTime: "",
        remark: "",
        objectId: ""
      },
      textCount: 160,
      keyword: "",
      searchObj: {

      },
      isUpdateStartTime: false,
      isUpdateEndTime: false,
    }
  },
  watch: {
    'taskForm.remark': function (val, oldVal) {
      var that = this;
      if (val.length > 160) {
        that.taskForm.remark = val.substring(0, 160);
      }
      that.textCount = 160 - that.taskForm.remark.length;
    },

  },
  mounted: function () {
    this.initTable();
    this.bindDate();
  },
  methods: {
    initTable: function () {
      var that = this;
      $('#table').bootstrapTable({
        url: "/cloudlink-inspection-event/keyPointPlan/getPage?token=" + lsObj.getLocalStorage('token'),
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
          return res;
        },
        onLoadSuccess: function (data) {
          if (data.status == 1) {
            if (data.rows.length > 0) {} else {}
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
            field: 'publishStatus', //域值
            title: '状态',
            align: 'center',
            visible: true, //false表示不显示
            sortable: false, //启用排序
            // width:"10%",
            class: "W60",
            editable: true,
            formatter: function (value) {
              if (value == 0) {
                return '<span class="nopublish">未发布<span>'
              } else if (value == 1) {
                return '<span class="publish">已发布<span>'
              } else {
                return '<span class="closePlan">已关闭<span>'
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
          },
          {
            field: 'code', //域值
            title: '编号', //内容
            align: 'center',
            visible: true, //false表示不显示
            sortable: false, //启用排序
            width: '12%',
            editable: true,
            cellStyle: function (value, row, index) {
              return {
                css: {
                  "max-width": "300px",
                }
              };
            }
          },
          {
            field: 'startTime', //域值
            title: '开始时间', //内容
            align: 'center',
            visible: true, //false表示不显示
            sortable: false, //启用排序
            width: '15%',
            editable: true,
            formatter: function (value) {
              if (value) {
                return value.substring(0, 10);
              } else {
                return "";
              }
            }
          }, {
            field: 'endTime', //域值
            title: '结束时间', //内容
            align: 'center',
            visible: true, //false表示不显示
            sortable: false, //启用排序
            width: '15%',
            formatter: function (value) {
              if (value) {
                return value.substring(0, 10);
              } else {
                return "";
              }
            }
          },
          {
            field: 'operate1',
            title: '计划配置',
            align: 'center',
            width: "20%",
            events: {
              'click .publish1': function (e, value, row, index) {
                var tip = "您是否发布该计划？"
                if (row.publishStatus == 1) {
                  tip = "您是否关闭已发布的计划？"
                }
                var defaultOptions = {
                  tip: tip,
                  name_title: '提示',
                  name_cancel: '取消',
                  name_confirm: '确定',
                  isCancelBtnShow: true,
                  callBack: function () {
                    if (row.publishStatus == 1) {
                      that.cancelPublish(row.objectId);
                    } else {
                      that.toPublish(row.objectId);
                    }
                  }
                };
                xxwsWindowObj.xxwsAlert(defaultOptions);
                return false;
              },
              'click .setNode': function (e, value, row, index) {
                $("#chooseNode").modal();
                // $("#chooseNode").on('shown.bs.modal', function (e) {
                that.currentPlanId = row.objectId;
                chooseNode.requestNoAllNodes(); //请求所有的关键点
                // });
              }
            },
            formatter: function (value, row, index) {
              var publish = "publish1";
              var set = "setNode";
              var title = "发布";
              if (row.publishStatus == 0) {
                title = "发布";
              }
              if (row.publishStatus == 1) {
                title = "关闭计划";
              }
              if (row.publishStatus == -1) {
                publish = "publish1_end";
                title = "已关闭";
                set = "setNode_end";
              }
              return [
                '<a class="' + publish + '"  href="javascript:void(0)" title="' + title + '">',
                '<i></i>',
                '<a class="' + set + '"  href="javascript:void(0)" title="配置">',
                '<i></i>',
              ].join('');
            }
          },
          {
            field: 'operate',
            title: '操作',
            align: 'center',
            events: {
              //查看详情
              'click .check': function (e, value, row, index) {
                that.viewTask(row.objectId);
              },
              //删除
              'click .closed': function (e, value, row, index) {
                that.deleteTask(row.objectId);
              },
              'click .management': function (e, value, row, index) {
                that.editTask(row.objectId);
              },

            },
            width: '20%',
            formatter: function (value, row, index) {
              var close = "closed";
              var edit = "management";
              var publish = "publish1";
              var title = "发布";
              if (row.publishStatus == 0) {
                title = "发布";
              }
              if (row.publishStatus == 1) {
                title = "关闭计划";
              }
              if (row.publishStatus == -1) {
                publish = "publish1_end";
                edit = "management_end ";
                title = "已关闭";
              }
              return [
                // '<a class="' + publish + '"  href="javascript:void(0)" title="' + title + '">',
                // '<i></i>',
                '<a class="check" href="javascript:void(0)" title="查看">',
                '<i></i>',
                '<a class="' + edit + '" href="javascript:void(0)" title="编辑">',
                '<i></i>',
                '</a>',
                '<a class="closed"  href="javascript:void(0)" title="删除">',
                '<i></i>',
                '</a>',
              ].join('');
            }
          }
        ]
      });
    },
    addTask: function () {
      var that = this;
      that.title = "新建";
      that.initStatus();
      that.taskForm = {
        name: "",
        code: "",
        startTime: "",
        endTime: "",
        remark: "",
      };
      $("#task").modal();
    },
    editTask: function (objectId) {
      var that = this;
      that.title = "修改";

      $.ajax({
        type: "get",
        url: "/cloudlink-inspection-event/keyPointPlan/get?token=" + lsObj.getLocalStorage('token'),
        contentType: "application/json",
        dataType: "json",
        data: {
          id: objectId
        },
        success: function (data) {
          if (data.success == 1) {
            that.taskForm = data.rows[0];
            that.taskForm.startTime = data.rows[0].startTime.substring(0, 10);
            if (new Date(that.taskForm.startTime) <= new Date()) {
              that.isUpdateStartTime = true;
            }
            that.taskForm.endTime = data.rows[0].endTime.substring(0, 10);
            // if (new Date(that.taskForm.endTime) < new Date()) {
            //   that.isUpdateEndTime = true;
            // }
            $("#task").modal();
          } else {
            xxwsWindowObj.xxwsAlert("服务异常，请稍候尝试");
          }
        }
      })

    },
    viewTask: function (objectId) {
      var that = this;
      $.ajax({
        type: "get",
        url: "/cloudlink-inspection-event/keyPointPlan/get?token=" + lsObj.getLocalStorage('token'),
        contentType: "application/json",
        dataType: "json",
        data: {
          id: objectId
        },
        success: function (data) {
          if (data.success == 1) {
            $("#details").modal();
            that.detailForm = data.rows[0];
            that.detailForm.startTime = data.rows[0].startTime.substring(0, 10);
            that.detailForm.endTime = data.rows[0].endTime.substring(0, 10);
          } else {
            xxwsWindowObj.xxwsAlert("服务异常，请稍候尝试");
          }
        }
      });
    },
    deleteTask: function (objectId) {
      var that = this;
      var tip = "";
      $.ajax({
        type: "get",
        url: "/cloudlink-inspection-event/keyPointPlan/delete?token=" + lsObj.getLocalStorage('token'),
        contentType: "application/json",
        dataType: "json",
        data: {
          id: objectId,
          confirm: false,
        },
        success: function (data) {
          if (data.code == "GJD001") {
            tip = "该计划下存在关键点,是否继续删除"
          } else {
            tip = '您是否删除该计划？';
          }
          var defaultOptions = {
            tip: tip,
            name_title: '提示',
            name_cancel: '取消',
            name_confirm: '确定',
            isCancelBtnShow: true,
            callBack: function () {
              that.deleteTaskToServer(objectId);
            }
          };
          xxwsWindowObj.xxwsAlert(defaultOptions);
        }
      })
    },
    deleteTaskToServer: function (objectId) {
      var that = this;
      $.ajax({
        type: "get",
        url: "/cloudlink-inspection-event/keyPointPlan/delete?token=" + lsObj.getLocalStorage('token'),
        contentType: "application/json",
        dataType: "json",
        data: {
          id: objectId,
          confirm: true,
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
      })
    },
    toPublish: function (objectId) {
      var that = this;
      $.ajax({
        type: "get",
        url: "/cloudlink-inspection-event/keyPointPlan/publish?token=" + lsObj.getLocalStorage('token'),
        contentType: "application/json",
        dataType: "json",
        data: {
          id: objectId
        },
        success: function (data) {
          if (data.success == 1) {
            xxwsWindowObj.xxwsAlert("发布成功", function () {
              that.refreshTable();
            });
          } else {
            xxwsWindowObj.xxwsAlert("服务异常，请稍候尝试");
          }
        }
      })
    },
    cancelPublish: function (objectId) {
      var that = this;
      $.ajax({
        type: "get",
        url: "/cloudlink-inspection-event/keyPointPlan/cancel?token=" + lsObj.getLocalStorage('token'),
        contentType: "application/json",
        dataType: "json",
        data: {
          id: objectId
        },
        success: function (data) {
          if (data.success == 1) {
            xxwsWindowObj.xxwsAlert("关闭成功", function () {
              that.refreshTable();
            });
          } else {
            xxwsWindowObj.xxwsAlert("服务异常，请稍候尝试");
          }
        }
      });
    },
    saveTask: function () {
      var that = this;
      var url = "";
      var msg = "新增成功";
      if (that.taskForm.objectId) {
        url = "/cloudlink-inspection-event/keyPointPlan/update?token=" + lsObj.getLocalStorage('token');
        var msg = "修改成功";
      } else {
        url = "/cloudlink-inspection-event/keyPointPlan/save?token=" + lsObj.getLocalStorage('token');
      }
      if (that.verify()) {
        $.ajax({
          type: "post",
          contentType: "application/json",
          url: url,
          data: JSON.stringify(that.taskForm),
          dataType: "json",
          success: function (data) {
            if (data.success == 1) {
              xxwsWindowObj.xxwsAlert(msg, function () {
                $("#task").modal('hide');
                that.refreshTable();
              });
            } else {
              if (data.msg.indexOf("name") > -1) {
                xxwsWindowObj.xxwsAlert("该计划名称已经存在");
                return;
              }
              if (data.msg.indexOf("code") > -1) {
                xxwsWindowObj.xxwsAlert("该计划编号已经存在");
                return;
              }
              xxwsWindowObj.xxwsAlert("服务器异常，请稍候尝试");
            }
          }
        });
      }
    },
    bindDate: function () {
      var that = this;
      $("#startTime").datetimepicker({
        format: 'yyyy-mm-dd',
        minView: 'month',
        language: 'zh-CN',
        autoclose: true,
      }).on("click", function () {
        $("#startTime").datetimepicker("setStartDate", new Date());
        $("#startTime").datetimepicker("setEndDate", $("#endTime").val());
      }).on("changeDate", function (ev) {
        that.taskForm.startTime = ev.date.Format("yyyy-MM-dd");
      });
      $("#endTime").datetimepicker({
        format: 'yyyy-mm-dd',
        minView: 'month',
        language: 'zh-CN',
        autoclose: true,
      }).on("click", function () {
        if (new Date(that.taskForm.startTime) <= new Date()) {
          $("#endTime").datetimepicker("setStartDate", new Date());
        } else {
          $("#endTime").datetimepicker("setStartDate", $("#startTime").val());
        }
      }).on("changeDate", function (ev) {
        that.taskForm.endTime = ev.date.Format("yyyy-MM-dd");
      });
    },
    verify: function () {
      var that = this;
      if (!that.taskForm.name.trim()) {
        xxwsWindowObj.xxwsAlert("请输入计划名称");
        return false;
      }
      if (that.taskForm.name.length > 45) {
        xxwsWindowObj.xxwsAlert("计划名称长度不能超过45个");
        return false;
      }
      if (!that.taskForm.code.trim()) {
        xxwsWindowObj.xxwsAlert("请输入计划编号");
        return false;
      }
      if (!that.taskForm.startTime) {
        xxwsWindowObj.xxwsAlert("请选择开始时间");
        return false;
      }
      if (!that.taskForm.endTime) {
        xxwsWindowObj.xxwsAlert("请选择结束时间");
        return false;
      }
      return true;
    },
    changeStatus: function (e) {
      var t = e.target;
      this.currentStatus = $(t).attr('data-value');
      this.refreshTable();
    },
    refreshTable: function () {
      var that = this;
      that.searchObj.pageNum = '1';
      that.searchObj.keyword = that.keyword;
      that.searchObj.publishStatus = that.currentStatus;
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
    claerSearch: function () {
      var that = this;
      that.keyword = "";
      that.currentStatus = "";
      that.refreshTable();
    },
    initStatus: function () {
      this.isUpdateStartTime = false;
      this.isUpdateEndTime = false;
    }, //关于人员信息

  },
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
      // allowNoAllot: 1,
      // allowAllot: 1,
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
    isContent: function (item) {
      if (item.planNames) {
        return "已纳入计划【" + item.planNames + "】";
      } else {
        return "未纳入任何计划";
      }
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
          // item.allowNoAllot = 1;
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
    next: function () {
      var that = this;
      if (that.allotNodeArrsByServer.length > 0) {
        that.nodeAndPlanToServer(function () {
          $("#share").modal();
          // second.initTable();
          $("#share").on('shown.bs.modal', function (e) {
            second.initSearch(); //请求所有的关键点
          });
        });
      } else {
        xxwsWindowObj.xxwsAlert("请选择需要分配的必经点");
      }
    },
    submit: function () {
      var that = this;
      // if (that.allotNodeArrs.length == 0) {
      //   xxwsWindowObj.xxwsAlert("请选择需要分配的必经点");
      //   return;
      // }
      that.nodeAndPlanToServer(function () {
        that.noAllotNodeArrs = [];
        that.allotNodeArrs = [];
        that.chooseAllotNode = []; //选中已经分配的点
        that.chooseNoAllotNode = []; //选中的没有分配的点
        xxwsWindowObj.xxwsAlert("保存成功");

      });
    }, //进行计划和选择的关键点之间的关系存储
    nodeAndPlanToServer: function (callback) {
      var that = this;
      var obj = {
        planId: indexs.currentPlanId,
        keyPointIdList: []
      };
      that.allotNodeArrsByServer.forEach(function (item) {
        obj.keyPointIdList.push(item.objectId);
      });
      $.ajax({
        type: "post",
        contentType: "application/json",
        dataType: "json",
        url: "/cloudlink-inspection-event/keyPointPlan/updateRelationKeyPoint?token=" + lsObj.getLocalStorage('token'),
        data: JSON.stringify(obj),
        success: function (data) {
          if (data.success == 1) {
            $("#chooseNode").modal('hide');
            callback();
          }
        }
      });
    },
    requestNoAllNodes: function () {
      var that = this;
      that.noallotKeyWord = "";
      $.ajax({
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        url: "/cloudlink-inspection-event/keyPoint/getDistributableByPlanId?token=" + lsObj.getLocalStorage('token'),
        data: JSON.stringify({
          planId: indexs.currentPlanId,
        }),
        success: function (data) {
          if (data.success == 1) {
            // var alldatas = data.rows;
            that.noAllotNodeArrs = [];
            that.noAllotNodeArrsByServer = [];
            that.requestAllotNodes();
            if (data.rows.length > 0) {
              // var del = [];
              // if (that.allotNodeArrs.length > 0) {
              //   that.allotNodeArrs.forEach(function (item) {
              //     if (item.allowNoAllot) {
              //       del.push(item);
              //     }
              //   });
              //   if (del.length > 0) {
              //     del.forEach(function (item) {
              //       alldatas.forEach(function (child, index) {
              //         if (child.objectId == item.objectId) {
              //           alldatas.splice(index, 1);
              //           return;
              //         }
              //       })
              //     });
              //   }
              // }
              data.rows.forEach(function (item) {
                item.checked = false;
                that.noAllotNodeArrs.push(item);
                that.noAllotNodeArrsByServer.push(item);
              });
            }
          } else {
            xxwsWindowObj.xxwsAlert("服务异常，请稍候尝试");
          }
        }
      });
    },

    requestAllotNodes: function () {
      var that = this;
      that.allotKeyWord = "";
      $.ajax({
        type: "post",
        contentType: "application/json",
        dataType: "json",
        url: "/cloudlink-inspection-event/keyPoint/getListByPlanId?token=" + lsObj.getLocalStorage('token'),
        data: JSON.stringify({
          planId: indexs.currentPlanId,
        }),
        success: function (data) {
          if (data.success == 1) {
            that.allotNodeArrs = [];
            that.allotNodeArrsByServer = [];
            // var alldatas = data.rows;
            // if (data.rows.length > 0) {
            //   var del = [];
            //   if (that.noAllotNodeArrs.length > 0) {
            //     that.noAllotNodeArrs.forEach(function (item) {
            //       if (item.allowAllot) {
            //         del.push(item);
            //       }
            //     });
            //     if (del.length > 0) {
            //       del.forEach(function (item) {
            //         alldatas.forEach(function (child, index) {
            //           if (child.objectId == item.objectId) {
            //             alldatas.splice(index, 1);
            //             return;
            //           }
            //         })
            //       });
            //     }
            //   }
            //   console.log(alldatas);
            //   alldatas.forEach(function (item) {
            //     item.checked = false;
            //     that.allotNodeArrs.push(item);
            //   });
            // }
            if (data.rows.length > 0) {
              data.rows.forEach(function (item) {
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
    cancalChooseNode: function () {
      var that = this;
      that.initChoose();
      $("#chooseNode").modal('hide');
    },
    initChoose: function () {
      var that = this;
      that.isAllCheckedNoAllot = false;
      that.noAllotNodeArrs = [];
      that.allotNodeArrs = [];
      that.chooseAllotNode = []; //选中已经分配的点
      that.chooseNoAllotNode = []; //选中的没有分配的点
      that.toAllotBg = false;
      that.toNoAllot = true;
      that.toNoAllotBg = false;
      that.isAllChecked = false;
    }
  }
});

var second = new Vue({
  el: "#share",
  data: function () {
    return {
      mapObj: null,
      selectItems: [], //当前选中的行数
      nodeInfoArrys: [], //所有点信息
      drawNodeArray: [], //当前绘制的点信息
      currentAllotNode: [],
      currentNoAllotNode: [],
      markerAllotClusterer: null, //已分配绘制
      markerNOAllotClusterer: null, //未分配
      searchObj: {},
      keyword: "",
      distributionStatus: "",
      selectPersonArr: [],
      detailForm: {},
      allot: true,
      noallot: true,
    }
  },
  mounted: function () {
    var that = this;
    that.mapObj = new BMap.Map("allot_map"); // 创建Map实例
    var mPoint = new BMap.Point(116.404, 39.915);
    that.mapObj.centerAndZoom(mPoint, 15);
    that.mapObj.enableScrollWheelZoom();
    drafting('allot_map', 'drafting_down'); //启动拖拽
    that.bindEvent();
  },
  methods: {
    cancel: function () {
      $("#share").modal("hide");
    },
    bindEvent: function () {
      var that = this;
      $("#selectPeople").click(function () {
        that.selectPeople();
      })
    },
    initSearch: function () {
      var that = this;
      that.keyword = "";
      that.distributionStatus = "";
      that.searchObj={},
      that.allot = true;
      that.noallot = true;
      that.initTable();
    },
    initTable: function () {
      var that = this;
      $('#table1').bootstrapTable('destroy').bootstrapTable({
        url: "/cloudlink-inspection-event/keyPoint/getPageByPlanId?token=" + lsObj.getLocalStorage('token'),
        method: 'post',
        toolbar: "#toolbar1",
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
          that.searchObj.planId = indexs.currentPlanId;
          return that.searchObj;
        },
        responseHandler: function (res) {
          return res;
        },
        onRefresh: function () {
          if (that.distributionStatus == "0") {
            that.noallot = true;
          } else if (that.distributionStatus == "1") {
            that.allot = true;
          } else {
            that.noallot = true;
            that.allot = true;
          }
          that.removeAllotPoint();
          that.removeNoAllotPoint();
        },
        onLoadSuccess: function (data) {
          if (data.success == 1) {
            if (data.rows.length > 0) {
              that.nodeInfoArrys = data.rows;
              that.setPointCenter();
            } else {
              that.nodeInfoArrys = [];
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
              ].join('');
            }
          }
        ]
      });
    },
    refreshTable: function () {
      var that = this;
      that.removeNoAllotPoint();
      that.removeAllotPoint();
      that.searchObj.pageNum = '1';
      that.searchObj.keyword = that.keyword;
      that.searchObj.distributionStatus = that.distributionStatus;
      $('#table1').bootstrapTable('refreshOptions', {
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
      if (this.distributionStatus == "0") {
        this.noallot = true; //只要刷新表，就会进行点的重新绘制
      } else if (this.distributionStatus == "1") {
        this.allot = true;
      } else {
        this.allot = true; //只要刷新表，就会进行点的重新绘制
        this.noallot = true;
      }
      this.refreshTable();
    },
    singlePointLocation: function (selectedItem) {
      var that = this;
      if (selectedItem.distributionStatus == 0 && !that.noallot) {
        that.noallot = true;
        that._addNoAllotPoints();
      }
      if (selectedItem.distributionStatus == 1 && !that.allot) {
        that.allot = true;
        that._addAllotPoints();
      }
      that.mapObj.centerAndZoom(new BMap.Point(selectedItem.bdLon, selectedItem.bdLat), 18);
      for (var i = 0; i < that.drawNodeArray.length; i++) {
        if (that.drawNodeArray[i].key == selectedItem.objectId) {
          this.drawNodeArray[i].value.setAnimation(BMAP_ANIMATION_BOUNCE);
        } else {
          this.drawNodeArray[i].value.setAnimation();
        }
      }
    },
    removePoint: function () {
      var that = this;
      for (var i = 0; i < that.drawNodeArray.length; i++) {
        that.markerClusterer.removeMarker(that.drawNodeArray[i].value);
      }

    },
    setPointCenter: function () {
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
      that.drawPoint();
    },
    drawPoint: function () {
      var that = this;
      var myIcons = null;
      var markers = null;
      var point = null;
      that.removeAllotPoint();
      that.removeNoAllotPoint();
      that.currentAllotNode = []; //表示当前在地图上面绘制的已分配点
      that.currentNoAllotNode = []; //表示当前在地图上面绘制的未分配点
      that.drawNodeArray = [];
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

        markers.addEventListener("click", function (e) {
          that.pointInfo(e);
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
      }
      that._addAllotPoints(function () {
        that._addNoAllotPoints();
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
    },
    removeNoAllotPoint: function () {
      var that = this;
      if (!that.markerNOAllotClusterer) {
        return;
      }
      that.currentNoAllotNode.forEach(function (item) {
        that.markerNOAllotClusterer.removeMarker(item.value);
      });
    },
    allotBtn: function () {
      var that = this;
      if (that.allot) {
        that.allot = false;
        that.removeAllotPoint(); //移除已经分配的点
      } else {
        that.allot = true;
        that._addAllotPoints(); //移除已经分配的点
      }
    },
    noAllotBtn: function () {
      var that = this;
      if (that.noallot) {
        that.noallot = false;
        that.removeNoAllotPoint(); //移除已经分配的点
      } else {
        that.noallot = true;
        that._addNoAllotPoints();
      }
    },
    pointInfo: function (e) {
      var that = this;
      var opts = {
        width: 250, // 信息窗口宽度
        height: 80, // 信息窗口高度
      };
      var p = e.target;
      var id = "";
      var txts = "";
      var point = new BMap.Point(p.getPosition().lng, p.getPosition().lat);
      for (var i = 0; i < that.drawNodeArray.length; i++) {
        if (that.drawNodeArray[i].value == p) {
          id = that.drawNodeArray[i].key;
          break;
        }
      }
      for (var j = 0; j < that.nodeInfoArrys.length; j++) {
        if (that.nodeInfoArrys[j].objectId == id) {
          txts = '<div><p class="text">名称：' + that.nodeInfoArrys[j].name + '</p>' +
            '<p>编号：' + that.nodeInfoArrys[j].code + '</p>' +
            '<p>位置：' + that.nodeInfoArrys[j].location + '</p></div>';
          break;
        }
      }
      var infoWindow = new BMap.InfoWindow(txts, opts); // 创建信息窗口对象
      that.mapObj.openInfoWindow(infoWindow, point); //开启信息窗口
    },
    allotPeople: function (value) {
      var that = this;
      var selectPeople = [];
      that.selectItems = [];
      //是否选中条数
      if (value.objectId) {
        that.selectItems.push(value);
      } else {
        that.selectItems = $('#table1').bootstrapTable('getAllSelections');
      }
      if (that.selectItems.length == 0) {
        xxwsWindowObj.xxwsAlert("请选中一行数据");
        return;
      }
      $("#people").modal();
      $("#people").on('shown.bs.modal', function (e) {
        if (that.selectItems.length == 1 && that.selectItems[0].personIdList.length > 0) {
          that.selectItems[0].personIdList.forEach(function (item) {
            selectPeople.push({
              relationshipPersonId: item
            })
          });
          console.log(selectPeople);
          peopleTreeObj.requestPeopleTree($("#people"), selectPeople);
        } else {
          peopleTreeObj.requestPeopleTree($("#people"), selectPeople);
        }
      });
    },
    getNodeDeatilByObjectId: function (objectId) {
      $("#details").modal(); //打开详情模态框
      var that = this;
      $.ajax({
        type: "get",
        url: "/cloudlink-inspection-event/keyPoint/get?token=" + lsObj.getLocalStorage('token'),
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
        url: "/cloudlink-inspection-event/keyPoint/delete?token=" + lsObj.getLocalStorage('token'),
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
        planId: indexs.currentPlanId,
        keyPointIdList: [],
        personFormList: []
      };
      for (var i = 0; i < that.selectItems.length; i++) {
        obj.keyPointIdList.push(that.selectItems[i].objectId);
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
        url: "/cloudlink-inspection-event/keyPoint/updateRelationPerson?token=" + lsObj.getLocalStorage('token'),
        data: JSON.stringify(obj),
        success: function (data) {
          if (data.success == 1) {
            xxwsWindowObj.xxwsAlert("分配成功", function () {
              $("#people").modal("hide");
              that.refreshTable();
            });
          } else {
            xxwsWindowObj.xxwsAlert("服务异常，请稍候尝试");
          }
        }
      });
    },
    mapSwitch: function () { //地图展开、收缩的开关
      if ($(".bottom_btn span").hasClass("map_down")) {
        this.show();
      } else {
        this.hide();
      }
    },
    hide: function () {
      $("#allot_map").slideUp();
      $(".map_up").attr("class", "map_down");
      $(".change").css("display", "none");
    },
    show: function () {
      $("#allot_map").slideDown();
      $(".map_down").attr("class", "map_up");
      $(".change").css("display", "block");
    },
    back: function () {
      //地图相关数据 需要全部初始化
      var that = this;
      that.allot = true;
      that.noallot = true;
      that.removeAllotPoint();
      that.removeNoAllotPoint();
      //进行关于选点的数据初始化
      chooseNode.initChoose();
      $("#share").modal('hide');
      $("#chooseNode").modal();
      // $("#chooseNode").on('shown.bs.modal', function (e) {
      // that.currentPlanId = row.objectId;
      chooseNode.requestNoAllNodes(); //请求所有的关键点
      // });
    },

  }
});