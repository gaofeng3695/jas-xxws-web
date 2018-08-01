var vue = new Vue({
  el: "#page-wrapper",
  data: function () {
    return {
      isDetail: false,
      currentDays: "",
      weeks: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
      days: [{
        month: 6,
        days: 1,
        finish: "21/21",
        finish1: 21 / 21
      }, {
        month: 6,
        days: 2,
        finish: "21/21",
        finish1: 21 / 21
      }, {
        month: 6,
        days: 3,
        finish: "13/13",
        finish1: 21 / 21
      }, {
        month: 6,
        days: 4,
        finish: "11/11",
        finish1: 21 / 21
      }, {
        month: 6,
        days: 5,
        finish: "11/11",
        finish1: 21 / 21
      }, {
        month: 6,
        days: 6,
        finish: "23/23",
        finish1: 21 / 21
      }, {
        month: 6,
        days: 7,
        finish: "10/10",
        finish1: 21 / 21
      }, {
        month: 6,
        days: 8,
        finish: "6/6",
        finish1: 21 / 21
      }, {
        month: 6,
        days: 9,
        finish: "11/11",
        finish1: 11 / 11
      }, {
        month: 6,
        days: 10,
        finish: "11/23"
      }, {
        month: 6,
        days: 11,
        finish: "11/23",
        finish1: 21 / 21
      }, {
        month: 6,
        days: 12,
        finish: "1/1",
        finish1: 11 / 11
      }, {
        month: 6,
        days: 13,
        finish: "11/23"
      }, {
        month: 6,
        days: 14,
        finish: "4/4",
        finish1: 11 / 11
      }, {
        month: 6,
        days: 15,
        finish: "5/5",
        finish1: 11 / 11
      }, {
        month: 6,
        days: 16,
        finish: "11/23"
      }, {
        month: 6,
        days: 17,
        finish: "7/7",
        finish1: 11 / 11
      }, {
        month: 6,
        days: 18,
        finish: "31/31",
        finish1: 11 / 11
      }, {
        month: 6,
        days: 19,
        finish: "11/23",
        finish1: 21 / 21
      }, {
        month: 6,
        days: 20,
        finish: "11/23"
      }, {
        month: 6,
        days: 21,
        finish: "11/23"
      }, {
        month: 6,
        days: 22,
        finish: "11/23"
      }, {
        month: 6,
        days: 23,
        finish: "11/23",
        finish1: 21 / 21
      }, {
        month: 6,
        days: 24,
        finish: "11/23"
      }, {
        month: 6,
        days: 25,
        finish: "11/23"
      }, {
        month: 6,
        days: 26,
        finish: "21/21",
        finish1: 21 / 21
      }, {
        month: 6,
        days: 27,
        finish: "11/23"
      }, {
        month: 6,
        days: 28,
        finish: "13/13",
        finish1: 21 / 21
      }, {
        month: 6,
        days: 29,
        finish: "11/11",
        finish1: 21 / 21
      }, {
        month: 6,
        days: 30,
        finish: "11/23"
      }],
      newDays: [],
      chooseDate: new Date(),
    }
  },
  watch: {
    chooseDate: function () {
      var that = this;
      that.initdays();
    }
  },
  mounted: function () {
    var that = this;
    that.initDate();
    that.initdays();
  },
  methods: {
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
      }).on("changeDate", function (ev) {
        that.chooseDate = ev.date;
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
      }
      that.newDays = that.newDays.concat(that.days);
      if (month == 2) {
        days = year % 4 == 0 ? 29 : 28;
        if (days == 29) that.newDays.pop();
        if (days == 28) that.newDays.splice(that.newDays.length - 2, 2);
      } else if (month == 1 || month == 3 || month == 5 || month == 7 || month == 8 || month == 10 || month == 12) {
        days = 31;
        that.newDays.push({
          month: 6,
          days: 31,
          finish: "11/23"
        })
      }
      if (that.newDays.length == 42) {
        return;
      } else {
        for (var j = 1; that.newDays.length < 42; j++) {
          var obj = {
            auto: "last",
            days: j,
            finish: "暂无"
          }
          that.newDays.push(obj);
        }
      }
    },
    viewDetail: function (e, item) {
      if (item.auto) {
        this.isDetail = false;
        return;
      }
      //进行div块的展示 位置在鼠标左边
      if (!this.currentDays || this.currentDays != item.days) {
        var w = document.body.offsetWidth;
        if (w - e.clientX < 300) {
          $(".list").css("left", "");
          $(".list").css("right", w - e.clientX);
        } else {
          $(".list").css("right", "");
          $(".list").css("left", e.clientX);
        }
        var h = document.body.offsetHeight;
        if (h - e.clientY < 400) {
          $(".list").css("top", "");
          $(".list").css("bottom", h - e.clientY);
        } else {
          $(".list").css("bottom", "");
          $(".list").css("top", e.clientY);
        }
        this.isDetail = true;
        this.currentDays = item.days;
        this.requestDetailByDays(); //进行查询 该天的详细信息
      }
    },
    isbg: function (item) {
      var that = this;
      if (!item.auto && item.days == new Date().getDate() && that.chooseDate.getMonth() == new Date().getMonth()) {
        return "chooseBg";
      }
      if (!item.auto) {
        if(that.chooseDate.getMonth()==new Date().getMonth()&& item.days > new Date().getDate()){
           return "";
        }
      }
      if (item.auto) {
        return " cover";
      }
      if (item.finish1 == 1) {
        return " bg1";
      }
      return "bg";
    },
    ifDetail: function (item) {
      var that = this;
      if (item.auto) {
        return false;
      } else {
        if (that.chooseDate.getMonth() != new Date().getMonth()) {
          return true;
        } else if (item.days > new Date().getDate()) {
          return false;
        }
      }
      return true;
    },
    remove: function (event) {
      var totar = event.relatedTarget || event.toElement; //鼠标指向的元素
      var t = event.target;
      if ($(totar).find(".isOutside").size() > 0 || $(totar).find(".week-item").size() > 0) {
        this.isDetail = false;
      }
    },
    requestDetailByDays: function () {
      var that = this;
      console.log("请求数据")
    }
  }
});