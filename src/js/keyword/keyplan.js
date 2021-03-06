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
    $("[data-toggle='popover']").popover();
    // $("[data-toggle='tooltip']").tooltip();
  },
  methods: {
    initTable: function () {
      var that = this;
      $('#table').bootstrapTable({
        url: "/cloudlink-inspection-event/keyPointPlan/page?token=" + lsObj.getLocalStorage('token'),
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
          // $("[data-toggle='tooltip']").tooltip();
          $("[data-toggle='popover']").popover();
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
            editable: true,
            class: "W100",
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
            title: '计划名称',
            align: 'center',
            visible: false, //false表示不显示
            sortable: false, //启用排序
            editable: true,
          }, {
            field: 'name', //域值
            title: '计划名称',
            align: 'center',
            visible: true, //false表示不显示
            sortable: false, //启用排序
            width: '10%',
            editable: true,
          },
          {
            field: 'code', //域值
            title: '计划编号', //内容
            align: 'center',
            visible: true, //false表示不显示
            sortable: false, //启用排序
            width: '10%',
            editable: true
          }, {
            field: 'startTime', //域值
            title: '开始时间', //内容
            align: 'center',
            visible: true, //false表示不显示
            sortable: false, //启用排序
            width: '10%',
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
            width: '10%',
            formatter: function (value) {
              if (value) {
                return value.substring(0, 10);
              } else {
                return "";
              }
            }
          },
          {
            field: 'groupCount', //域值
            title: '所含分组数', //内容
            align: 'center',
            visible: true, //false表示不显示
            sortable: false, //启用排序
            width: "10%",
            editable: true,
            formatter: function (value, row, index) {
              var groupName = "<ul>";
              if (row.relationGroupBoList.length > 0) {
                row.relationGroupBoList.forEach(function (item) {
                  groupName += "<li class='groupItem hidd'><span>" + item.parentGroupName + "</span>->" + item.groupName + "</li>";
                });
                groupName += "</ul>";
                return '<span title="分组详情"  data-html="true"  data-trigger=" hover" 	data-container="body" data-toggle="popover" data-placement="right" 	data-content="' + groupName + '"><span class="showTip">' + row.relationGroupBoList.length + '</span></span>';
              } else {
                return 0;
              }
            }
          },
          {
            field: 'personCount', //域值
            title: '所含人数', //内容
            align: 'center',
            visible: true, //false表示不显示
            sortable: false, //启用排序
            width: "10%",
            editable: true,
            formatter: function (value, row, index) {
              var persons = [];
              if (row.relationPersonBoList.length > 0) {
                row.relationPersonBoList.forEach(function (item) {
                  persons.push(item.personName);
                });
              }
              if (persons.length > 0) {
                var person = "<ul>";
                for (var i = 0; i < persons.length; i++) {
                  if (i % 2 == 0) {
                    person += "<span style='display:inline-block;width:120px;' class='hidd'>" + persons[i] + "</span>"
                  } else {
                    person += "<span style='display:inline-block;width:120px;padding-left:5px;' class='hidd'>" + persons[i] + "</span>"
                  }
                }
                return '<span title="人员详情" data-html="true" data-trigger="hover" data-container="body" data-toggle="popover" data-placement="right" 	data-content="' + person + '"><span class="showTip">' + row.relationPersonBoList.length + '</span></span>';
              } else {
                return row.relationPersonBoList.length;
              }
            }
          },
          {
            field: 'keyPointCount', //域值
            title: '所含关键点数', //内容
            align: 'center',
            visible: true, //false表示不显示
            sortable: false, //启用排序
            width: "10%",
            editable: true
          },

          {
            field: 'operate1',
            title: '计划配置',
            align: 'center',
            width: "15%",
            events: {
              'click .publish1': function (e, value, row, index) {
                var tip = "您是否发布该计划？";
                if (row.publishStatus == 2) {
                  tip = "您是否重新发布该计划？"
                }
                var defaultOptions = {
                  tip: tip,
                  name_title: '提示',
                  name_cancel: '取消',
                  name_confirm: '确定',
                  isCancelBtnShow: true,
                  callBack: function () {
                    that.toPublish(row.objectId);
                  }
                };
                xxwsWindowObj.xxwsAlert(defaultOptions);
                return false;
              },
              'click .ban': function (e, value, row, index) {
                var defaultOptions = {
                  tip: "您是否关闭该计划？",
                  name_title: '提示',
                  name_cancel: '取消',
                  name_confirm: '确定',
                  isCancelBtnShow: true,
                  callBack: function () {
                    that.cancelPublish(row.objectId);
                  }
                };
                xxwsWindowObj.xxwsAlert(defaultOptions);
              },
              'click .setNode': function (e, value, row, index) {
                that.openChooseGroup(row);
              }
            },
            formatter: function (value, row, index) {
              var publish = "publish1";
              var set = "setNode";
              var ban = "ban";
              var title = "发布计划";
              if (row.publishStatus == 0) {
                ban = "ban_end";
              }
              if (row.publishStatus == 1) {
                set = "setNode_end";
                publish = "publish1_end";
              }
              if (row.publishStatus == 2) {
                title = "重新发布";
                publish = "publish1";
                set = "setNode";
                ban = "ban_end";
              }
              return [
                '<a class="' + publish + '"  href="javascript:void(0)" title="' + title + '">',
                '<i></i>',
                '<a class="' + set + '"  href="javascript:void(0)" title="配置">',
                '<i></i>',
                '<a class="' + ban + '"  href="javascript:void(0)" title="关闭计划">',
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
                var defaultOptions = {
                  tip: "您是否删除该计划？",
                  name_title: '提示',
                  name_cancel: '取消',
                  name_confirm: '确定',
                  isCancelBtnShow: true,
                  callBack: function () {
                    that.deleteTask(row.objectId);
                  }
                };
                xxwsWindowObj.xxwsAlert(defaultOptions);

              },
              'click .management': function (e, value, row, index) {
                that.editTask(row.objectId);
              },

            },
            width: '15%',
            formatter: function (value, row, index) {
              var closed = "closed";
              var edit = "management";
              var publish = "publish1";
              var title = "发布";
              if (row.publishStatus == 0) {
                title = "发布";
              }
              if (row.publishStatus == 1) {
                edit = "management_end ";
                title = "关闭计划";
                closed = "closed_end";
              }
              if (row.publishStatus == 2) {
                publish = "publish1_end";
                // edit = "management_end ";
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
                '<a class="' + closed + '"  href="javascript:void(0)" title="删除">',
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
      that.title = "新建【关键点巡检计划】";
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
      that.title = "修改【关键点巡检计划】";
      that.isUpdateStartTime = false;
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
            if (data.rows[0].publishStatus == 1) {
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
      $.ajax({
        type: "get",
        url: "/cloudlink-inspection-event/keyPointPlan/delete?token=" + lsObj.getLocalStorage('token'),
        contentType: "application/json",
        dataType: "json",
        data: {
          id: objectId,
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
            if (data.code == "GJD_PLAN_003") {
              xxwsWindowObj.xxwsAlert("该计划下还未分配到区域/分组，请先分配");
              return;
            }
            if (data.code == "GJD_PLAN_004") {
              xxwsWindowObj.xxwsAlert("您所选择的区域/分组【" + data.msg + "】，还未分配巡检人员，请先进行【区域分组管理】进行人员分配");
              return;
            }
            if (data.code == "GJD_PLAN_005") {
              xxwsWindowObj.xxwsAlert("该计划结束时间小于今天，无法发布");
              return;
            }
            if (data.code == "GJD_PLAN_006") {
              xxwsWindowObj.xxwsAlert("您所选择的区域/分组【" + data.msg + "】所含关键点，还未分配巡检人员，请先进行【人员关键点设置】");
              return;
            }
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
        startDate: new Date(),
        endDate: $("#endTime").val()
      }).on("hide", function () {
        // console.log(ev);
        // that.taskForm.startTime = ev.date.Format("yyyy-MM-dd");
        that.taskForm.startTime = $("#startTime").val();
      });
      $("#endTime").datetimepicker({
        format: 'yyyy-mm-dd',
        minView: 'month',
        language: 'zh-CN',
        autoclose: true,
      }).on("click", function () {
        if (that.taskForm.startTime == "" || new Date(that.taskForm.startTime) <= new Date()) {
          $("#endTime").datetimepicker("setStartDate", new Date());
        } else {
          $("#endTime").datetimepicker("setStartDate", $("#startTime").val());
        }
      }).on("hide", function () {
        that.taskForm.endTime = $("#endTime").val();
        // that.taskForm.endTime = ev.date.Format("yyyy-MM-dd");
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
    getGroupByPlanId: function () {
      var that = this;
      var obj = {
        planId: that.currentPlanId,
        groupIdList: []
      };
      var groupArr = groupTreeObj.getSelectGroup();
      if (groupArr.length == 0) {
        xxwsWindowObj.xxwsAlert("请至少选择一个分组");
        return;
      }
      for (var i = 0; i < groupArr.length; i++) {
        obj.groupIdList.push(groupArr[i].id);
      }
      that.setGroupAndPlanToServer(obj);
    },
    setGroupAndPlanToServer: function (obj) {
      var that = this;
      $.ajax({
        type: "post",
        contentType: "application/json",
        url: "/cloudlink-inspection-event/keyPointPlan/updateRelationGroup?token=" + lsObj.getLocalStorage('token'),
        data: JSON.stringify(obj),
        dataType: "json",
        success: function (data) {
          if (data.success == 1) {
            $("#people").modal('hide');
            xxwsWindowObj.xxwsAlert("分配成功", function () {
              that.refreshTable();
            });
          } else {
            $("#people").modal('hide');
            xxwsWindowObj.xxwsAlert("分配失败");
          }
        }
      });
    },
    openChooseGroup: function (row) {
      var that = this;
      that.currentPlanId = row.objectId;
      $.ajax({
        type: "GET",
        contentType: "application/json",
        url: "/cloudlink-inspection-event/keyPointPlan/getRelationGroup?token=" + lsObj.getLocalStorage('token'),
        data: {
          planId: that.currentPlanId
        },
        dataType: "json",
        success: function (data) {
          if (data.success == 1) {
            var selectArr = [];
            data.rows.forEach(function (item) {
              selectArr.push({
                id: item
              })
            });
            $("#people").modal();
            groupTreeObj.requestPeopleTree(selectArr, 'checkBox'); //请求所有的关键点
          } else {
            xxwsWindowObj.xxwsAlert("服务异常，请稍候尝试");
          }
        }
      });

    }
  },
});