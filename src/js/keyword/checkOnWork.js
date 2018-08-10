var vue = new Vue({
  el: "#page-wrapper",
  data: function () {
    return {
      isDetail: false,
      taskObj: {
        "startDate": "2018-08-01",
        "endDate": "2018-08-31",
        "userId": "",
      },
      currentDays: "",
      searchObj: {},
      weeks: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
      days: [],
      newDays: [],
      chooseDate: new Date(),
      people: "",
    }
  },
  watch: {
    people: function () {
      var that = this;
      that.taskObj.userId = that.people;
      that.getParams();
    },
    chooseDate: function () {
      this.getParams();
    }
  },
  mounted: function () {
    var that = this;
    that.initDate();
    that.requestPeopleList(); //请求企业下面的人员
  },
  methods: {
    getParams: function () {
      var that = this;
      var year = that.chooseDate.getFullYear();
      var month = that.chooseDate.getMonth();
      if (month < 9) {
        month = month + 1;
        month = "0" + month;
      } else {
        month = month + 1;
      }
      that.taskObj.startDate = year + "-" + month + "-01";
      var myDate = new Date(year, month, 0);
      that.taskObj.endDate = year + "-" + month + "-" + myDate.getDate();
      $("#datetimepicker").val(year + "-" + month);
      that.requestTask();
    },
    initDate: function () {
      var that = this;
      $("#datetimepicker").datetimepicker({
        language: 'zh-CN',
        format: 'yyyy-mm',
        weekStart: 1,
        todayBtn: 1,
        autoclose: 1,
        todayHighlight: 1,
        startView: 3, //这里就设置了默认视图为年视图
        minView: 3, //设置最小视图为年视图
        forceParse: 0,
        endDate: new Date()
      }).on("changeDate", function (ev) {
        that.chooseDate = ev.date;
      });
    },
    requestTask: function () {
      var that = this;
      that.days = [];
      $.ajax({
        type: "POST",
        url: "/cloudlink-inspection-event/keyPointTask/workAttendance?token=" + lsObj.getLocalStorage('token'),
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify(that.taskObj),
        success: function (data) {
          if (data.success == 1) {
            data.rows.forEach(function (item) {
              var finish = "0%";
              if (new Date(item.inspectionDate) > new Date()) {
                finish = "暂无"
              } else {
                if (item.totalCount && item.finishedCount) {
                  finish = item.finishedCount + "/" + item.totalCount;
                } else if (item.totalCount && !item.finishedCount) {
                  finish = 0 + "/" + item.totalCount;
                } else {
                  finish = 0 + "/" + 0;
                }
              }
              var obj = {
                days: new Date(item.inspectionDate).getDate(),
                inspectionDate: item.inspectionDate,
                totalCount: item.totalCount,
                finishedCount: item.finishedCount,
                finish: finish
              }
              that.days.push(obj);
            });
            that.initdays();
          } else {
            xxwsWindowObj.xxwsAlert("服务异常，请稍候尝试");
          }
        }
      });
    },
    initdays: function () {
      var that = this;
      var year = that.chooseDate.getFullYear();
      var month = that.chooseDate.getMonth() + 1;
      var week = "7123456".split("")[new Date(Date.UTC(year, month - 1, 1)).getDay()];
      that.newDays = [];
      if (week < 7) {
        var days = "";
        if (month == 0) {
          days = new Date(year - 1, 12, 0).getDate();
        } else {
          days = new Date(year, month - 1, 0).getDate();
        }
        for (var i = 0; i < week; i++) {
          var obj = {
            auto: "last",
            days: days,
            finish: "暂无"
          }
          days--;
          that.newDays.unshift(obj);
        }
      } //上面获取上一个月最后有几天
      that.newDays = that.newDays.concat(that.days);
      if (that.newDays.length == 42) {
        return;
      } else {
        for (var j = 1; that.newDays.length < 42; j++) { //取值取下个月的最后几天
          var obj = {
            auto: "next",
            days: j,
            finish: "暂无"
          }
          that.newDays.push(obj);
        }
      }
    },
    viewDetail: function (e, item) {
      var that = this;
      if (item.auto) {
        that.isDetail = false;
        return;
      }
      that.searchObj.userId = that.people;
      that.searchObj.inspectionDate = item.inspectionDate;
      $("#taskList").modal();
      that.requestDetailByDays();
    },
    isbg: function (item) {
      var that = this;
      if (!item.auto && item.days == new Date().getDate() && that.chooseDate.getMonth() == new Date().getMonth()) {
        return "chooseBg";
      }

      if (!item.auto) {
        if (that.chooseDate.getMonth() == new Date().getMonth() && item.days > new Date().getDate()) {
          return "";
        }
        if (that.chooseDate.getMonth() > new Date().getMonth() && !(that.chooseDate.getFullYear() < new Date().getFullYear())) {
          return "";
        }
      }
      if (item.auto) {
        return " cover";
      }
      if (item.totalCount && item.finishedCount && item.finishedCount == item.totalCount) {
        return " bg1";
      }
      return "bg";
    },
    ifDetail: function (item) {
      var that = this;
      if (item.auto) {
        return false;
      } else {
        if (that.chooseDate.getMonth() > new Date().getMonth() && !(that.chooseDate.getFullYear() < new Date().getFullYear())) {
          return false
        }
        if (that.chooseDate.getMonth() != new Date().getMonth()) {
          return true;
        }
        if (item.days > new Date().getDate()) {
          return false;
        }
      }
      return true;
    },
    requestDetailByDays: function () {
      var that = this;
      $('#table').bootstrapTable('destroy').bootstrapTable({
        url: "/cloudlink-inspection-event/keyPointTask/workAttendanceDetail?token=" + lsObj.getLocalStorage('token'),
        method: 'post',
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
          };
        },
        //表格的列
        columns: [{
            field: 'planName', //域值
            title: '计划名称',
            align: 'center',
            visible: true, //false表示不显示
            sortable: false, //启用排序
            width: '10%',
            editable: true,
          },
          {
            field: 'groupName', //域值
            title: '分组', //内容
            align: 'center',
            visible: true, //false表示不显示
            sortable: false, //启用排序
            width: '10%',
            editable: true,
          }, {
            field: 'keyPointName', //域值
            title: '关键点名称', //内容
            align: 'center',
            visible: true, //false表示不显示
            sortable: false, //启用排序
            width: '10%',
          },
          {
            field: 'checkStatus', //域值
            title: '状态', //内容
            align: 'center',
            visible: true, //false表示不显示
            sortable: false, //启用排序
            width: "10%",
            editable: true,
            formatter: function (a) {
              if (a == 0) {
                return '未检查'
              } else {
                return '已检查'
              }
            }
          }
        ]
      });
    },
    cancalNode: function () {
      $('#table').bootstrapTable('destroy');
      $("#taskList").modal('hide');
    },
    requestPeopleList: function () { //请求该企业下面的所有人员
      var that = this;
      $.ajax({
        type: "POST",
        url: "/cloudlink-core-framework/user/queryList?token=" + lsObj.getLocalStorage('token'),
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify({
          enterpriseId: JSON.parse(lsObj.getLocalStorage("userBo")).enterpriseId,
          status: "1"
        }),
        success: function (data) {
          if (data.success == 1) {
            var options = "";
            data.rows.forEach(function (item) {
              options += "<option value=" + item.objectId + ">" + item.userName + "</option>"
            });
            $("#people").append(options);
            that.people = JSON.parse(lsObj.getLocalStorage("userBo")).objectId;
          } else {
            xxwsWindowObj.xxwsAlert("服务异常，请稍候尝试");
          }
        }
      });
    },
  }
});