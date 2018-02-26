var vm = new Vue({
  el: '#menuCustom',
  data: {
    menuData: [],
    userBo: JSON.parse(lsObj.getLocalStorage("userBo")),
  },
  created () {
  },
  mounted () {
    this.getMenuTree();
  },
  methods: {
    getMenuTree () {
      var _that = this;
      $.ajax({
        type: "post",
        // url: "/cloudlink-core-framework/menu/getTree?token=" + lsObj.getLocalStorage('token'),
        url: "/cloudlink-core-framework/commonData/payMenu/getTreeData?token=" + lsObj.getLocalStorage("token"),
        contentType: "application/json",
        data: JSON.stringify({ "clientType": 'web' }),
        dataType: "json",
        success: function (res) {
          if (res && res.success === 1) {
            _that.menuData = res.rows;
            _that.addSysadmin(_that.menuData);
          } else {
            xxwsWindowObj.xxwsAlert("服务异常，请稍候重试");
          }
        }
      });
    },
    addSysadmin (arr) {
      for (var i = 0; i < arr.length; i++) {
        var item = arr[i];
        item.isSysadmin = 1;
        if ( item.routeUrl == '#/userList' || item.menuName== '企业管理') {
          item.isSysadmin = this.userBo.isSysadmin;
        } 
        if(item.children.length>0) {
          this.addSysadmin(item.children)
        }
      }
    }
  }
})