var indexs = new Vue({
  el: "#page",
  data: function () {
    return {
      searchObj: {

      }
    }
  },
  mounted: function () {
    this.initTable();
  },
  methods: {
    initTable: function () {
      var that = this;
      $('#table').bootstrapTable({
        url: "../js/node/task.json", //请求数据url
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
              // that.nodeInfoArrys = data.rows;

            } else {

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
          field: 'taskStatus', //域值
          title: '状态',
          align: 'center',
          visible: true, //false表示不显示
          sortable: false, //启用排序
          class: "W60",
          editable: true,
          formatter: function (value) {
            if (value == 0) {
              return '<span class="nopublish">未发布<span>'
            } else {
              return '<span class="publish">已发布<span>'
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
          field: 'taskName', //域值
          title: '名称',
          align: 'center',
          visible: true, //false表示不显示
          sortable: false, //启用排序
          width: '15%',
          editable: true,
        }, {
          field: 'taskCode', //域值
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
          field: 'startTime', //域值
          title: '开始时间', //内容
          align: 'center',
          visible: true, //false表示不显示
          sortable: false, //启用排序
          width: '15%',
          editable: true,
        }, {
          field: 'endTime', //域值
          title: '结束时间', //内容
          align: 'center',
          visible: true, //false表示不显示
          sortable: false, //启用排序
          width: '15%',
          // editable: true,
        }, {
          field: 'createUser', //域值
          title: '创建人', //内容
          align: 'center',
          visible: true, //false表示不显示
          sortable: false, //启用排序
          width: '15%',
          // editable: true,
        }, {
          field: 'operate',
          title: '操作',
          align: 'center',
          events: {
            //查看详情
            'click .check': function (e, value, row, index) {
              view.viewTask(row);
            },
            //删除
            'click .closed': function (e, value, row, index) {
              var defaultOptions = {
                tip: '您是否删除该任务？',
                name_title: '提示',
                name_cancel: '取消',
                name_confirm: '确定',
                isCancelBtnShow: true,
                callBack: function () {
                  alert("调用删除计划的方法")
                }
              };
              xxwsWindowObj.xxwsAlert(defaultOptions);
              return false;
            },
            'click .management': function (e, value, row, index) {
              taskForm.editTask(row);
            },
            'click .publish1': function (e, value, row, index) {
              var defaultOptions = {
                tip: '您是否发布该任务？',
                name_title: '提示',
                name_cancel: '取消',
                name_confirm: '确定',
                isCancelBtnShow: true,
                callBack: function () {
                  alert("调用发布计划的方法")
                }
              };
              xxwsWindowObj.xxwsAlert(defaultOptions);
              return false;
            }
          },
          width: '40%',
          formatter: function (value, row, index) {
            var close = "";
            var edit = "";
            var publish = "";
            if (row.taskStatus == 0) {
              close = "closed";
              edit = "management";
              publish = "publish1";
            } else {
              close = "closed_end";
              edit = "management_end ";
              publish = "publish1_end"
            }
            return [
              '<a class="' + publish + '  href="javascript:void(0)" title="发布">',
              '<i></i>',
              '<a class="check" href="javascript:void(0)" title="查看">',
              '<i></i>',
              '<a class="' + edit + ' href="javascript:void(0)" title="编辑">',
              '<i></i>',
              '</a>',
              '<a class="' + close + '"  href="javascript:void(0)" title="删除">',
              '<i></i>',
              '</a>',
            ].join('');
          }
        }]
      });
    },
    addTask: function () {
      taskForm.addTask();
    }
  }
});

var taskForm = new Vue({
  el: "#task",
  data: function () {
    return {
      title: "新建任务",
      taskForm: {
        people: "", //巡检人员
        taskName: "",
        taskCode: "",
        startTime: "",
        endTime: "",
        remark: ""
      }
    }
  },
  mounted: function () {
    this.bindDate(); //进行时间控件的绑定
  },
  methods: {
    addTask: function () {
      var that = this;
      that.title = "新建"
      that.taskForm = {
        people: "", //巡检人员
        taskName: "",
        taskCode: "",
        startTime: "",
        endTime: "",
        remark: ""
      };
      $("#task").modal();
    },
    editTask: function (row) {
      var that = this;
      that.title = "修改";
      for (var key in row) {
        that.taskForm[key] = row[key];
      }
      $("#task").modal();
    },

    saveTask: function () {
      alert("进行任务的保存")
    },
    selectPeople: function () {
      var selectPeople = [];
      $("#people").modal();
      $("#people").on('shown.bs.modal', function (e) {
        peopleTreeObj.requestPeopleTree($("#people"), selectPeople);
      });
    },
    getSelectPeople: function () {
      var dataObj = peopleTreeObj.getSelectPeople();
      this.taskForm.people = dataObj.selectedName;
      $('#people').modal('hide');
    },
    bindDate: function () {
      var that = this;
      $("#startTime").datetimepicker({
        format: 'yyyy-mm-dd',
        minView: 'month',
        language: 'zh-CN',
        autoclose: true,
      }).on("click", function () {
        $("#startTime").datetimepicker("setEndDate", $("#endTime").val());
      });
      $("#endTime").datetimepicker({
        format: 'yyyy-mm-dd',
        minView: 'month',
        language: 'zh-CN',
        autoclose: true,
      }).on("click", function () {
        $("#endTime").datetimepicker("setStartDate", $("#startTime").val())
      });
      $("#choose").click(function () {
        that.getSelectPeople();
      });
    }
  }
});




var view = new Vue({
  el: "#details",
  data: function () {
    return {
      title: "任务详情",
      detailForm: {
        people: "", //巡检人员
        taskName: "",
        taskCode: "",
        startTime: "",
        endTime: "",
        remark: "",
        oid: ""
      }
    }
  },
  mounted: function () {

  },
  methods: {
    viewTask: function (row) {
      var that = this;
      $("#details").modal();

      for (var key in row) {
        that.detailForm[key] = row[key];
      }

    },
  }
});