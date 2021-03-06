var indexs = new Vue({
  el: "#page",
  data: function () {
    return {
      currentStatus: "",
      title: "新建计划",
      taskForm: {
        personNames: "", //安检人员
        name: "",
        code: "",
        startTime: "",
        endTime: "",
        remark: "",
        personFormList: []
      },
      detailForm: {
        personNames: "", //安检人员
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
      isUpdateEndTime: false
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
        url: "/cloudlink-inspection-event/necessityPlan/getPage?token=" + lsObj.getLocalStorage('token'),
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
          that.searchObj.withRelationPerson = true;
          // that.searchObj.orderBy = 'distributionStatus';
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
            width: '10%',
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
          }, {
            field: 'peopleCount', //域值
            title: '安检人数', //内容
            align: 'center',
            visible: true, //false表示不显示
            sortable: false, //启用排序  peopleCount
            width: '15%',
            formatter: function (value, row, index) {
              if (row.personIdList && row.personIdList.length > 0) {
                return row.personIdList.length;
              } else {
                return 0;
              }
            },
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
                var defaultOptions = {
                  tip: '您是否删除该计划？',
                  name_title: '提示',
                  name_cancel: '取消',
                  name_confirm: '确定',
                  isCancelBtnShow: true,
                  callBack: function () {
                    that.deleteTask(row.objectId);
                  }
                };
                xxwsWindowObj.xxwsAlert(defaultOptions);
                return false;
              },
              'click .management': function (e, value, row, index) {
                that.editTask(row.objectId);
              },
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
              }
            },
            width: '40%',
            formatter: function (value, row, index) {
              var title = "发布";
              var close = "closed";
              var edit = "management";
              var publish = "publish1";
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
                '<a class="' + publish + '"  href="javascript:void(0)" title="' + title + '">',
                '<i></i>',
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
        personNames: "", //安检人员
        name: "",
        code: "",
        startTime: "",
        endTime: "",
        remark: "",
        personFormList: []
      };
      $("#task").modal();
    },
    editTask: function (objectId) {
      var that = this;
      that.title = "修改";

      $.ajax({
        type: "get",
        url: "/cloudlink-inspection-event/necessityPlan/get?token=" + lsObj.getLocalStorage('token'),
        contentType: "application/json",
        dataType: "json",
        data: {
          id: objectId
        },
        success: function (data) {
          if (data.success == 1) {
            that.taskForm = data.rows[0];
            if (data.rows[0].personIdList && data.rows[0].personIdList.length > 0) {
              var arr = [];
              var personNames = data.rows[0].personNames.split(",");
              data.rows[0].personIdList.forEach(function (item, index) {
                arr.push({
                  personId: item,
                  personName: personNames[index]
                });
              });
              that.taskForm.personFormList = arr;
            }
            that.taskForm.startTime = data.rows[0].startTime.substring(0, 10);
            if (new Date(that.taskForm.startTime) <= new Date()) {
              that.isUpdateStartTime = true;
            }
            that.taskForm.endTime = data.rows[0].endTime.substring(0, 10);
            if (new Date(that.taskForm.endTime) <= new Date()) {
              that.isUpdateEndTime = true;
            }
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
        url: "/cloudlink-inspection-event/necessityPlan/get?token=" + lsObj.getLocalStorage('token'),
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
      $.ajax({
        type: "get",
        url: "/cloudlink-inspection-event/necessityPlan/delete?token=" + lsObj.getLocalStorage('token'),
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
      })
    },
    toPublish: function (objectId) {
      var that = this;
      $.ajax({
        type: "get",
        url: "/cloudlink-inspection-event/necessityPlan/publish?token=" + lsObj.getLocalStorage('token'),
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
        url: "/cloudlink-inspection-event/necessityPlan/cancel?token=" + lsObj.getLocalStorage('token'),
        contentType: "application/json",
        dataType: "json",
        data: {
          id: objectId
        },
        success: function (data) {
          if (data.success == 1) {
            xxwsWindowObj.xxwsAlert("取消成功", function () {
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
        url = "/cloudlink-inspection-event/necessityPlan/update?token=" + lsObj.getLocalStorage('token');
        var msg = "修改成功";
      } else {
        url = "/cloudlink-inspection-event/necessityPlan/save?token=" + lsObj.getLocalStorage('token');
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
        if (new Date(that.taskForm.startTime) < new Date()) {
          $("#endTime").datetimepicker("setStartDate", new Date());
        } else {
          $("#endTime").datetimepicker("setStartDate", $("#startTime").val());
        }
      }).on("changeDate", function (ev) {
        that.taskForm.endTime = ev.date.Format("yyyy-MM-dd");
      });
      $("#selectPeople").click(function () {
        that.getSelectPeople();
      })
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
      if (!that.taskForm.personNames) {
        xxwsWindowObj.xxwsAlert("请选择安检人员");
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
    selectPeople: function () {
      var that = this;
      //先去获取已经分配了点的人员
      var choosePoeple = [];
      $.ajax({
        type: "get",
        url: "/cloudlink-inspection-event/necessityNode/getRelationPerson?token=" + lsObj.getLocalStorage('token'),
        contentType: "application/json",
        dataType: "json",
        success: function (data) {
          if (data.success == 1) {
            choosePoeple = data.rows;
            that.renderPeople(choosePoeple);
          }
        }
      });
    },
    renderPeople: function (choosePoeple) {
      var that = this;
      var selectPeople = [];
      if (that.taskForm.personIdList && that.taskForm.personIdList.length > 0) {
        that.taskForm.personIdList.forEach(function (item) {
          selectPeople.push({
            relationshipPersonId: item
          });
        });
      }
      $("#people").modal();
      $("#people").on('shown.bs.modal', function (e) {
        peopleTreeObj.requestPeopleTree('', selectPeople, false, '', choosePoeple);
      });
    },
    getSelectPeople: function () {
      var that = this;
      var peopleArr = [];
      var peopleObj = peopleTreeObj.getSelectPeople();
      peopleObj.selectedArr.forEach(function (item) {
        peopleArr.push({
          personId: item.relationshipPersonId,
          personName: item.relationshipPersonName
        });
      });
      that.taskForm.personFormList = peopleArr;
      that.taskForm.personNames = peopleObj.selectedName;
      $('#people').modal('hide');
    },
  },

});