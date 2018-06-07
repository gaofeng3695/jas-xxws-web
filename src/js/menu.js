var vm = new Vue({
  el: '#menuCustom',
  data: {
    menuData: [],
    userBo: JSON.parse(lsObj.getLocalStorage("userBo")),
    initRouteName: ''
  },
  created: function () {},
  mounted: function () {
    // this.$nextTick(function () {
    this.getMenuTree();
    // })
  },
  methods: {
    getMenuTree: function () {
      var _that = this;
      $.ajax({
        type: "post",
        // url: "/cloudlink-core-framework/menu/getTree?token=" + lsObj.getLocalStorage('token'),
        url: "/cloudlink-core-framework/commonData/payMenu/getTreeData?token=" + lsObj.getLocalStorage("token"),
        contentType: "application/json",
        data: JSON.stringify({
          "clientType": 'web'
        }),
        dataType: "json",
        success: function (res) {
          if (res && res.success === 1) {
            _that.menuData = res.rows;
            _that.addSysadmin(_that.menuData, false);
            setTimeout(function () {
              routerObj.init()
            }, 100);
          } else {
            xxwsWindowObj.xxwsAlert("服务异常，请稍候重试");
          }
        }
      });
    },
    addSysadmin: function (arr, parent) {
      for (var i = 0; i < arr.length; i++) {
        var item = arr[i];
        if (parent) {
          var lockIcon = item.pageUrl && item.pageUrl.length > 0 ? '0' : '1';
          str = str + lockIcon;
          if (str.indexOf('0') == -1) {
            parent.lockIcon = true;
          } else {
            parent.lockIcon = false;
          }
        } else {
          item.lockIcon = false;
        }
        item.isSysadmin = 1;
        if (item.routeUrl == '#/userList' || item.menuName == '企业管理') {
          item.isSysadmin = this.userBo.isSysadmin;
        }
        if (item.children.length > 0) {
          var str = '';
          this.addSysadmin(item.children, item)
        }
      }
    },
    loadRelativePage: function (route) {
      var menuData = this.menuData;
      var pageUrl;
      var _that = this;
      if (route.indexOf("#") === -1) {
        // 用户的个人中心
        pageUrl = route;
      } else {
        pageUrl = this.routeRedirect(route, menuData) || '';
      }
      document.getElementById("page-wrapper").src = pageUrl;
      if (pageUrl == '/src/html/menuRedirect.html' || '') {
        $("#confirmModal").modal('show');
        $('#confirmModal').on('hide.bs.modal', function () {
          if (_that.initRouteName) {
            var preventUrl = location.hash !== '#/' + _that.initRouteName ? _that.initRouteName : _that.initRouteName;
          } else {
            var preventUrl = 'index';
          }
          var href = location.href;
          window.location.href = href.replace(/#[\s\S]+/, "#/" + preventUrl);
          // var preventUrl = sessionStorage.getItem('routeUrl');
        })
      } else {
        var $domArr = document.querySelectorAll('.side-nav li a')
        $($domArr).removeClass('active');
        for (var i = 0; i < $domArr.length; i++) {
          var _this = $domArr[i];
          if (_this.hash === location.hash) {
            $(_this).addClass('active');
            return;
          }
        }
      }
    },
    routeRedirect: function (route, menuData) {
      var pageUrl;
      for (var i = 0; i < menuData.length; i++) {
        var item = menuData[i];
        if (pageUrl) return pageUrl;
        if (item.children.length === 0) {
          if (route === item.routeUrl) {
            if (item.pageUrl && item.pageUrl.length > 0) {
              return item.pageUrl;
            } else {
              return '/src/html/menuRedirect.html';
            }
          }
        } else {
          pageUrl = this.routeRedirect(route, item.children)
        }
      }
      return pageUrl;
    },
    // sessionRoute: function (routeUrl) {
    //   sessionStorage.setItem('routeUrl', routeUrl);
    // }
  },

})

/* 前端路由模块 */
var routerObj = {
  router: null,
  init: function () {
    var that = this;
    that.router = Router({
      '/index': {
        on: function () {
          // vm.loadRelativePage("/src/html/index.html");
          vm.loadRelativePage('#/index');
          if (tjSwitch == 1) {
            tjSdk.track('点击首页');
          }
        },
        after: function () {
          vm.$data.initRouteName = 'index';
          // // vm.sessionRoute('index');
        }
      },
      '/event': {
        on: function () {
          // vm.loadRelativePage("/src/html/event.html");
          vm.loadRelativePage("#/event");
          if (tjSwitch == 1) {
            tjSdk.track('点击事件管理');
          }
        },
        after: function () {
          vm.$data.initRouteName = 'event';
          // vm.sessionRoute('event');
        }
      },
      '/task': {
        on: function () {
          // vm.loadRelativePage("/src/html/task.html");
          vm.loadRelativePage("#/task");
          if (tjSwitch == 1) {
            tjSdk.track('点击任务管理');
          }
        },
        after: function () {
          vm.$data.initRouteName = 'task';
          // // vm.sessionRoute('task');
        }
      },
      '/maintenance': {
        on: function () {
          // vm.loadRelativePage("/src/html/maintenance.html");
          vm.loadRelativePage("#/maintenance");
          if (tjSwitch == 1) {
            tjSdk.track('点击维修维护');
          }
        },
        after: function () {
          vm.$data.initRouteName = 'maintenance';
          // // vm.sessionRoute('maintenance');
        }
      },
      '/track': {
        on: function () {
          // vm.loadRelativePage("/src/html/track.html");
          vm.loadRelativePage('#/track');
          if (tjSwitch == 1) {
            tjSdk.track('点击巡线记录');
          }
        },
        after: function () {
          vm.$data.initRouteName = 'track';
          // // vm.sessionRoute('track');
        }
      },
      '/securityPlan': {
        on: function () {
          // vm.loadRelativePage("/src/html/securityPlan.html");
          vm.loadRelativePage("#/securityPlan");
          if (tjSwitch == 1) {
            tjSdk.track('计划管理');
          }
        },
        after: function () {
          vm.$data.initRouteName = 'securityPlan';
          // // vm.sessionRoute('securityPlan');
        }
      },
      '/securityRecord': {
        on: function () {
          // vm.loadRelativePage("/src/html/securityRecord.html");
          vm.loadRelativePage("#/securityRecord");
          if (tjSwitch == 1) {
            tjSdk.track('入户安检记录');
          }
        },
        after: function () {
          vm.$data.initRouteName = 'securityRecord';
          // // vm.sessionRoute('securityRecord');
        }
      },
      '/userList': {
        on: function () {
          // vm.loadRelativePage("/src/html/userList.html");
          vm.loadRelativePage("#/userList");
          if (tjSwitch == 1) {
            tjSdk.track('用户台账');
          }
        },
        after: function () {
          vm.$data.initRouteName = 'userList';
          // // vm.sessionRoute('userList');
        }
      },
      '/nodecollect': {
        on: function () {
          // vm.loadRelativePage("/src/html/userArea.html");
          vm.loadRelativePage("#/nodecollect");
          if (tjSwitch == 1) {
            tjSdk.track('必经点采集');
          }
        },
        after: function () {
          vm.$data.initRouteName = 'nodecollect';
          // // vm.sessionRoute('userArea');
        }
      },
      '/collectKey': {
        on: function () {
          vm.loadRelativePage("#/collectKey");
          if (tjSwitch == 1) {
            tjSdk.track('关键点采集');
          }
        },
        after: function () {
          vm.$data.initRouteName = 'collectKey';
        }
      },
      '/keyplan': {
        on: function () {
          vm.loadRelativePage("#/keyplan");
          if (tjSwitch == 1) {
            tjSdk.track('关键点采集');
          }
        },
        after: function () {
          vm.$data.initRouteName = 'keyplan';
        }
      },
      '/taskNode': {
        on: function () {
          // vm.loadRelativePage("/src/html/userArea.html");
          vm.loadRelativePage("#/taskNode");
          if (tjSwitch == 1) {
            tjSdk.track('必经点任务');
          }
        },
        after: function () {
          vm.$data.initRouteName = 'taskNode';
          // // vm.sessionRoute('userArea');
        }
      },
      '/allot': {
        on: function () {
          // vm.loadRelativePage("/src/html/userArea.html");
          vm.loadRelativePage("#/allot");
          if (tjSwitch == 1) {
            tjSdk.track('必经点分配');
          }
        },
        after: function () {
          vm.$data.initRouteName = 'allot';
          // // vm.sessionRoute('userArea');
        }
      },
      '/userArea': {
        on: function () {
          // vm.loadRelativePage("/src/html/userArea.html");
          vm.loadRelativePage("#/userArea");
          if (tjSwitch == 1) {
            tjSdk.track('片区管理');
          }
        },
        after: function () {
          vm.$data.initRouteName = 'userArea';
          // // vm.sessionRoute('userArea');
        }
      },
      '/facilityList': {
        on: function () {
          // vm.loadRelativePage("/src/html/facilityList.html");
          vm.loadRelativePage("#/facilityList");
          if (tjSwitch == 1) {
            tjSdk.track('设施台账');
          }
        },
        after: function () {
          vm.$data.initRouteName = 'facilityList';
          // // vm.sessionRoute('facilityList');
        }
      },
      '/facilityInspect': {
        on: function () {
          // vm.loadRelativePage("/src/html/facilityInspect.html");
          vm.loadRelativePage("#/facilityInspect");
          if (tjSwitch == 1) {
            tjSdk.track('设施检查');
          }
        },
        after: function () {
          vm.$data.initRouteName = 'facilityInspect';
          // // vm.sessionRoute('facilityInspect');
        }
      },
      '/map': {
        on: function () {
          // vm.loadRelativePage("/src/html/map.html");
          vm.loadRelativePage("#/map");
          if (tjSwitch == 1) {
            tjSdk.track('点击一张图');
          }
        },
        after: function () {
          vm.$data.initRouteName = 'map';
          // // vm.sessionRoute('map');
        }
      },
      '/equipment': {
        on: function () {
          // vm.loadRelativePage("/src/html/none.html");
          vm.loadRelativePage("#/equipment");
          if (tjSwitch == 1) {
            tjSdk.track('点击设备管理');
          }
        },
        after: function () {
          vm.$data.initRouteName = 'equipment';
          // // vm.sessionRoute('equipment');
        }
      },
      '/statistics': {
        on: function () {
          // vm.loadRelativePage("/src/html/none.html");
          vm.loadRelativePage("#/statistics");
          if (tjSwitch == 1) {
            tjSdk.track('点击统计分析');
          }
        },
        after: function () {
          vm.$data.initRouteName = 'statistics';
          // // vm.sessionRoute('statistics');
        }
      },
      '/organization': {
        on: function () {
          // vm.loadRelativePage("/src/html/management.html");
          vm.loadRelativePage("#/organization");
          if (tjSwitch == 1) {
            tjSdk.track('点击组织结构管理');
          }
        },
        after: function () {
          vm.$data.initRouteName = 'organization';
          // // vm.sessionRoute('organization');
        }
      },
      '/removemanager': {
        on: function () {
          // vm.loadRelativePage("/src/html/removemanager.html");
          vm.loadRelativePage("#/removemanager");
          if (tjSwitch == 1) {
            tjSdk.track('点击系统管理员移交');
          }
        },
        after: function () {
          vm.$data.initRouteName = 'removemanager';
          // // vm.sessionRoute('removemanager');
        }
      },
      '/certification': {
        on: function () {
          // vm.loadRelativePage("/src/html/certificationEnterprised.html");
          vm.loadRelativePage("#/certification");
          if (tjSwitch == 1) {
            tjSdk.track('点击企业认证');
          }
        },
        after: function () {
          vm.$data.initRouteName = 'certification';
          // // vm.sessionRoute('certification');
        }
      },
      '/managementuser': {
        on: function () {
          // vm.loadRelativePage("/src/html/peoplemanager.html");
          vm.loadRelativePage("#/managementuser");
          if (tjSwitch == 1) {
            tjSdk.track('点击人员管理');
          }
        },
        after: function () {
          vm.$data.initRouteName = 'managementuser';
          // // vm.sessionRoute('managementuser');
        }
      },
      '/news': {
        on: function () {
          vm.loadRelativePage("/src/html/none.html");
          // vm.loadRelativePage("#/news");
          if (tjSwitch == 1) {
            tjSdk.track('点击消息中心');
          }
        },
        after: function () {
          vm.$data.initRouteName = 'news';
          // // vm.sessionRoute('news');
        }
      },
      '/personal': {
        on: function () {
          vm.loadRelativePage("/src/html/personal.html");
          // vm.loadRelativePage("#/personal");
          if (tjSwitch == 1) {
            tjSdk.track('点击个人资料');
          }
        },
        after: function () {
          vm.$data.initRouteName = 'personal';
          // // vm.sessionRoute('personal');
        }
      },
      '/updatepass': {
        on: function () {
          vm.loadRelativePage("/src/html/forgetPassword.html");
          // vm.loadRelativePage("#/updatepass");
          if (tjSwitch == 1) {
            tjSdk.track('点击修改密码');
          }
        },
        after: function () {
          vm.$data.initRouteName = 'updatepass';
          // // vm.sessionRoute('updatepass');
        }
      },
      '/setLogin': {
        on: function () {
          vm.loadRelativePage("/src/html/setLogin.html");
          // vm.loadRelativePage("#/setLogin");
          if (tjSwitch == 1) {
            tjSdk.track('点击登陆设置');
          }
        },
        after: function () {
          vm.$data.initRouteName = 'setLogin';
          // // vm.sessionRoute('setLogin');
        }
      },
      '/help': {
        on: function () {
          vm.loadRelativePage("/src/html/help.html");
          // vm.loadRelativePage("#/help");
          if (tjSwitch == 1) {
            tjSdk.track('点击帮助中心');
          }
        },
        after: function () {
          vm.$data.initRouteName = 'help';
          // // vm.sessionRoute('help');
        }
      },
      '/securityPlan': {
        on: function () {
          // vm.loadRelativePage("/src/html/securityPlan.html");
          vm.loadRelativePage("#/securityPlan");
          if (tjSwitch == 1) {
            tjSdk.track('点击计划管理');
          }
        },
        after: function () {
          vm.$data.initRouteName = 'securityPlan';
          // // vm.sessionRoute('securityPlan');
        }
      },
      '/securityRecord': {
        on: function () {
          // vm.loadRelativePage("/src/html/securityRecord.html");
          vm.loadRelativePage("#/securityRecord");
          if (tjSwitch == 1) {
            tjSdk.track('点击入户安检记录');
          }
        },
        after: function () {
          vm.$data.initRouteName = 'securityRecord';
          // // vm.sessionRoute('securityRecord');
        }
      },
      '/customModule': {
        on: function () {
          // vm.loadRelativePage("/src/html/customTemplates.html");
          vm.loadRelativePage("#/customModule");
          if (tjSwitch == 1) {
            tjSdk.track('点击事件类型自定义');
          }
        },
        after: function () {
          vm.$data.initRouteName = 'customModule';
          // // vm.sessionRoute('customModule');
        }
      },
      '/pipeline': {
        on: function () {
          // vm.loadRelativePage("/src/html/pipeline_map.html");
          vm.loadRelativePage("#/pipeline");

        },
        after: function () {
          vm.$data.initRouteName = 'pipeline';
          // // vm.sessionRoute('pipeline');
        }
      },
      '/': function () {
        return;
        // vm.loadRelativePage("/src/html/pipeline_map.html");

      },
      // 匹配任意字符
      // '/[\s\S]*': function () {
      //     if()
      //     vm.loadRelativePage("/demoHtml/html/confirm.html");
      // },
    });
    that.router.init('/index');
  },
};