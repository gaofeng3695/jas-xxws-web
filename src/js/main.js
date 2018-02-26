$(document).ready(function () {
    menuListListener();
    initPersonal(); //首次登录进来，进行初始化个人的基本信息
    // load();
    routerObj.init()
});

var menuListListener = function () {
    $(".nav.navbar-right.top-nav>li").on("click", function () {
        var menuid = $(this).attr("menuid");
        switch (menuid) {
            /*case 'help':
                lsObj.clearAll();
                location.hash = '#/help';
                break;*/
            case 'signOut':
                lsObj.clearAll();
                location.href = 'login.html';
                break;
        }
    });
}
var loadRelativePage = function (route) {
    $.ajax({
        type: "post",
        // url: "/cloudlink-core-framework/menu/getTree?token=" + lsObj.getLocalStorage("token"),
        url: "/cloudlink-core-framework/commonData/payMenu/getTreeData?token=" + lsObj.getLocalStorage("token"),
        contentType: "application/json",
        data: JSON.stringify({ "clientType": 'web' }),
        dataType: "json",
        success: function (res) {
            if (res && res.success === 1) {
                var menuData = res.rows;
                loadRelativeIframe(route, menuData);
            } else {
                xxwsWindowObj.xxwsAlert("服务异常，请稍候重试");
            }
        }
    });
}
var loadRelativeIframe = function (route, menuData) {
    var pageUrl;
    if (route.indexOf("#") === -1) {
        // 用户的个人中心
        pageUrl = route;
    } else {
        pageUrl = routeRedirect(route, menuData) || '';
    }
    document.getElementById("page-wrapper").src = pageUrl;
    if (pageUrl == '/src/html/menuRedirect.html' || '') {
        $("#confirmModal").modal('show');
        $('#confirmModal').on('hide.bs.modal', function () {
            var preventUrl = sessionStorage.getItem('routeUrl');
            var href = location.href;
            window.location.href = href.replace(/#[\s\S]+/, "#/" + preventUrl);
        })
    } else {
        var $domArr = $('.side-nav li a');
        $domArr.removeClass('active');
        for (var i = 0; i < $domArr.length; i++) {
            var _this = $domArr[i];
            if (_this.hash === location.hash) {
                $(_this).addClass('active');
                return;
            }
        }
    }


}

var routeRedirect = function (route, arr) {
    var pageUrl;
    for (var i = 0; i < arr.length; i++) {
        var item = arr[i];
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
            pageUrl = routeRedirect(route, item.children)
        }
    }
    return pageUrl;
}

/*进行个人信息初始化 */
var initPersonal = function () {
    var userBo = JSON.parse(lsObj.getLocalStorage("userBo"));
    $(".userName").text(userBo.userName);
    $(".userEnterprise").text(userBo.enterpriseName);

    if (userBo.profilePhoto != null && userBo.profilePhoto != "") {
        $(".person-img").attr('src', "/cloudlink-core-file/file/getImageBySize?fileId=" + userBo.profilePhoto + "&viewModel=fill&width=500&hight=500");
    };
    //判断是否认证
    if (userBo.authenticateStatus == 1) {
        $(".authentication").attr('src', "/src/images/main/authentication.png");
    } else {
        $(".authentication").attr('src', "/src/images/main/authenticationNo.png");
    };

}
/* 前端路由模块 */
var routerObj = {
    router: null,
    init: function () {
        var that = this;
        that.router = Router({
            '/index': {
                on: function () {
                    // loadRelativePage("/src/html/index.html");
                    loadRelativePage('#/index');
                    if (zhugeSwitch == 1) {
                        zhuge.track('点击首页');
                    }
                },
                after: function () {
                    sessionRoute('index');
                }
            },
            '/event': {
                on: function () {
                    // loadRelativePage("/src/html/event.html");
                    loadRelativePage("#/event");
                    if (zhugeSwitch == 1) {
                        zhuge.track('点击事件管理');
                    }
                },
                after: function () {
                    sessionRoute('event');
                }
            },
            '/task': {
                on: function () {
                    // loadRelativePage("/src/html/task.html");
                    loadRelativePage("#/task");
                    if (zhugeSwitch == 1) {
                        zhuge.track('点击任务管理');
                    }
                },
                after: function () {
                    sessionRoute('task');
                }
            },
            '/maintenance': {
                on: function () {
                    // loadRelativePage("/src/html/maintenance.html");
                    loadRelativePage("#/maintenance");
                    if (zhugeSwitch == 1) {
                        zhuge.track('点击维修维护');
                    }
                },
                after: function () {
                    sessionRoute('maintenance');
                }
            },
            '/track': {
                on: function () {
                    // loadRelativePage("/src/html/track.html");
                    loadRelativePage('#/track');
                    if (zhugeSwitch == 1) {
                        zhuge.track('点击巡线记录');
                    }
                },
                after: function () {
                    sessionRoute('track');
                }
            },
            '/securityPlan': {
                on: function () {
                    // loadRelativePage("/src/html/securityPlan.html");
                    loadRelativePage("#/securityPlan");
                    if (zhugeSwitch == 1) {
                        zhuge.track('计划管理');
                    }
                },
                after: function () {
                    sessionRoute('securityPlan');
                }
            },
            '/securityRecord': {
                on: function () {
                    // loadRelativePage("/src/html/securityRecord.html");
                    loadRelativePage("#/securityRecord");
                    if (zhugeSwitch == 1) {
                        zhuge.track('入户安检记录');
                    }
                },
                after: function () {
                    sessionRoute('securityRecord');
                }
            },
            '/userList': {
                on: function () {
                    // loadRelativePage("/src/html/userList.html");
                    loadRelativePage("#/userList");
                    if (zhugeSwitch == 1) {
                        zhuge.track('用户台账');
                    }
                },
                after: function () {
                    sessionRoute('userList');
                }
            },
            '/userArea': {
                on: function () {
                    // loadRelativePage("/src/html/userArea.html");
                    loadRelativePage("#/userArea");
                    if (zhugeSwitch == 1) {
                        zhuge.track('片区管理');
                    }
                },
                after: function () {
                    sessionRoute('userArea');
                }
            },
            '/facilityList': {
                on: function () {
                    // loadRelativePage("/src/html/facilityList.html");
                    loadRelativePage("#/facilityList");
                    if (zhugeSwitch == 1) {
                        zhuge.track('设施台账');
                    }
                },
                after: function () {
                    sessionRoute('facilityList');
                }
            },
            '/facilityInspect': {
                on: function () {
                    // loadRelativePage("/src/html/facilityInspect.html");
                    loadRelativePage("#/facilityInspect");
                    if (zhugeSwitch == 1) {
                        zhuge.track('设施检查');
                    }
                },
                after: function () {
                    sessionRoute('facilityInspect');
                }
            },
            '/map': {
                on: function () {
                    // loadRelativePage("/src/html/map.html");
                    loadRelativePage("#/map");
                    if (zhugeSwitch == 1) {
                        zhuge.track('点击一张图');
                    }
                },
                after: function () {
                    sessionRoute('map');
                }
            },
            '/equipment': {
                on: function () {
                    // loadRelativePage("/src/html/none.html");
                    loadRelativePage("#/equipment");
                    if (zhugeSwitch == 1) {
                        zhuge.track('点击设备管理');
                    }
                },
                after: function () {
                    sessionRoute('equipment');
                }
            },
            '/statistics': {
                on: function () {
                    // loadRelativePage("/src/html/none.html");
                    loadRelativePage("#/statistics");
                    if (zhugeSwitch == 1) {
                        zhuge.track('点击统计分析');
                    }
                },
                after: function () {
                    sessionRoute('statistics');
                }
            },
            '/organization': {
                on: function () {
                    // loadRelativePage("/src/html/management.html");
                    loadRelativePage("#/organization");
                    if (zhugeSwitch == 1) {
                        zhuge.track('点击组织结构管理');
                    }
                },
                after: function () {
                    sessionRoute('organization');
                }
            },
            '/removemanager': {
                on: function () {
                    // loadRelativePage("/src/html/removemanager.html");
                    loadRelativePage("#/removemanager");
                    if (zhugeSwitch == 1) {
                        zhuge.track('点击系统管理员移交');
                    }
                },
                after: function () {
                    sessionRoute('removemanager');
                }
            },
            '/certification': {
                on: function () {
                    // loadRelativePage("/src/html/certificationEnterprised.html");
                    loadRelativePage("#/certification");
                    if (zhugeSwitch == 1) {
                        zhuge.track('点击企业认证');
                    }
                },
                after: function () {
                    sessionRoute('certification');
                }
            },
            '/managementuser': {
                on: function () {
                    // loadRelativePage("/src/html/peoplemanager.html");
                    loadRelativePage("#/managementuser");
                    if (zhugeSwitch == 1) {
                        zhuge.track('点击人员管理');
                    }
                },
                after: function () {
                    sessionRoute('managementuser');
                }
            },
            '/news': {
                on: function () {
                    loadRelativePage("/src/html/none.html");
                    // loadRelativePage("#/news");
                    if (zhugeSwitch == 1) {
                        zhuge.track('点击消息中心');
                    }
                },
                after: function () {
                    sessionRoute('news');
                }
            },
            '/personal': {
                on: function () {
                    loadRelativePage("/src/html/personal.html");
                    // loadRelativePage("#/personal");
                    if (zhugeSwitch == 1) {
                        zhuge.track('点击个人资料');
                    }
                },
                after: function () {
                    sessionRoute('personal');
                }
            },
            '/updatepass':{
                on: function () {
                    loadRelativePage("/src/html/forgetPassword.html");
                    // loadRelativePage("#/updatepass");
                    if (zhugeSwitch == 1) {
                        zhuge.track('点击修改密码');
                    }
                },
                after: function () {
                    sessionRoute('updatepass');
                }
            }, 
            '/setLogin': {
                on:  function () {
                    loadRelativePage("/src/html/setLogin.html");
                    // loadRelativePage("#/setLogin");
                    if (zhugeSwitch == 1) {
                        zhuge.track('点击登陆设置');
                    }
                },
                after: function () {
                    sessionRoute('setLogin');
                }
            },
            '/help': {
                on:  function () {
                    loadRelativePage("/src/html/help.html");
                    // loadRelativePage("#/help");
                    if (zhugeSwitch == 1) {
                        zhuge.track('点击帮助中心');
                    }
                },
                after: function () {
                    sessionRoute('help');
                }
            },
            '/securityPlan': {
                on: function () {
                    // loadRelativePage("/src/html/securityPlan.html");
                    loadRelativePage("#/securityPlan");
                    if (zhugeSwitch == 1) {
                        zhuge.track('点击计划管理');
                    }
                },
                after: function () {
                    sessionRoute('securityPlan');
                }
            },
            '/securityRecord': {
                on: function () {
                    // loadRelativePage("/src/html/securityRecord.html");
                    loadRelativePage("#/securityRecord");
                    if (zhugeSwitch == 1) {
                        zhuge.track('点击入户安检记录');
                    }
                },
                after: function () {
                    sessionRoute('securityRecord');
                }
            },
            '/customModule': {
                on: function () {
                    // loadRelativePage("/src/html/customTemplates.html");
                    loadRelativePage("#/customModule");
                    if (zhugeSwitch == 1) {
                        zhuge.track('点击事件类型自定义');
                    }
                },
                after: function () {
                    sessionRoute('customModule');
                }
            },
            '/pipeline':{
                on: function () {
                    // loadRelativePage("/src/html/pipeline_map.html");
                    loadRelativePage("#/pipeline");
    
                },
                after: function () {
                    sessionRoute('pipeline');
                }
            }, 
            '/': function () {
                return;
                // loadRelativePage("/src/html/pipeline_map.html");

            },
            // 匹配任意字符
            // '/[\s\S]*': function () {
            //     if()
            //     loadRelativePage("/demoHtml/html/confirm.html");
            // },
        });
        that.router.init('/index');
    },
};

var sessionRoute = function (routeUrl) {
    sessionStorage.setItem('routeUrl', routeUrl);
}

function load () {
    var userBo = JSON.parse(lsObj.getLocalStorage("userBo"));
    /*用户台账功能菜单的显隐藏*/
    if (userBo.isSysadmin == 1) {
        var html = '<li><a href="#/userList"><i class="fa fa-fw "></i>用户台账</a></li>';
        $("#security").append(html);
    }

    /*用户企业管理模块的显隐*/
    if (userBo.isSysadmin == 1) {
        // var html1 = '<li class="moduleManagement"> <a href="javascript:void(0)" data-toggle="collapse" data-target="#customType"><i class="fa fa-fw fa-cogs"></i> 企业自定义<i class="fa fa-fw fa-caret-down"></i></a>' +
        //     '<ul id="customType" class="collapse"><li><a href="#/customModule"><i class="fa fa-fw "></i>事件类型自定义</a> </li></ul></li>';
        // $(".side-nav").append(html1);

        var html2 = '<li class="enterprise-management"> <a href="javascript:void(0)" data-toggle="collapse" data-target="#mangement">'
        '<i class="fa fa-fw fa-briefcase"></i> 企业管理<i class="fa fa-fw fa-caret-down"></i></a>' +
            '<ul id="mangement" class="collapse"><li><a href="#/organization"><i class="fa fa-fw "></i>组织机构管理</a></li>' +
            '<li><a href="#/managementuser"><i class="fa fa-fw "></i>人员管理</a></li>' +
            '<li><a href="#/customModule"><i class="fa fa-fw "></i>事件类型自定义</a></li>' +
            '<li><a href="#/certification"><i class="fa fa-fw "></i>企业信息</a></li>' +
            '</li><li><a href="#/removemanager"><i class="fa fa-fw "></i>系统管理员移交</a> </li></ul></li>';
        $(".side-nav").append(html2);
    }
}