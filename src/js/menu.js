var vm = new Vue({
  el: '#menuCustom',
  data: {
    menuData: [],
    userBo: JSON.parse(lsObj.getLocalStorage("userBo")),
  },
  created () {
    // this.getMenuTree();
  },
  mounted () {
    this.getMenuTree();
  },
  methods: {
    getMenuTree () {
      console.log(JSON.parse(lsObj.getLocalStorage("userBo")))
      if (lsObj.getLocalStorage("menuInfo")&& JSON.parse(lsObj.getLocalStorage("menuInfo"))[0].text) {
        this.menuData = JSON.parse(lsObj.getLocalStorage("menuInfo"));
        return;
      }
      let _that = this;
      $.ajax({
        type: "get",
        url: "/cloudlink-core-framework/menu/getTree?token=" + lsObj.getLocalStorage('token'),
        contentType: "application/json",
        data: {
          "clientType": 'web',
        },
        dataType: "json",
        success: function (res) {
          if (res && res.success === 1) {
            _that.menuData = res.rows[0];
            lsObj.setLocalStorage("menuInfo", JSON.stringify(res.rows[0]));
          } else {
            xxwsWindowObj.xxwsAlert("服务异常，请稍候重试");
          }
        }
      });
    }
  }
})