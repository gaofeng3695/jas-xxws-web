$(document).ready(function() {
    menuListListener();
    initPersonal(); //首次登录进来，进行初始化个人的基本信息
    load();
    authenticationstatus();
    routerObj.init()
});

var menuListListener = function() {
    $(".nav.navbar-right.top-nav>li").on("click", function() {
        var menuid = $(this).attr("menuid");
        switch (menuid) {
            /*case 'help':
                lsObj.clearAll();
                location.hash = '#/help';
                break;*/
            case 'signOut':
                lsObj.clearAll();
                tjSdk.exit();
                location.href = 'login.html';
                break;
        }
    });
}

var loadRelativePage = function(_url) {
        document.getElementById("page-wrapper").src = _url;
        var $domArr = $('.side-nav li a');
        $domArr.removeClass('active');
        for (var i = 0; i < $domArr.length; i++) {
            var _this = $domArr[i];
            if (_this.hash === location.hash) {
                //console.log($(_this))
                $(_this).addClass('active');
                return;
            }
        }
    }
    /*进行个人信息初始化 */
var initPersonal = function() {
    var userBo = JSON.parse(lsObj.getLocalStorage("userBo"));
    $(".userName").text(userBo.userName);
    $(".userEnterprise").text(userBo.enterpriseName);

    if (userBo.profilePhoto != null && userBo.profilePhoto != "") {
        $(".person-img").attr('src', "/cloudlink-core-file/file/getImageBySize?fileId=" + userBo.profilePhoto + "&viewModel=fill&width=500&hight=500");
    };
};
var authenticationstatus = function() { //获取当前企业的认证状态 0未认证；-1驳回状态；1通过认证；2等待认证
    var that = this;
    var userBo = JSON.parse(lsObj.getLocalStorage("userBo"));
    console.log(userBo);
    var _data = {
        "enterpriseId": userBo.enterpriseId
    }
    $.ajax({
        type: 'post',
        url: '/cloudlink-core-framework/commonData/enterpriseApp/getPageList?token=' + lsObj.getLocalStorage("token"),
        contentType: "application/json",
        data: JSON.stringify(_data),
        success: function(data) {
            if (data.success == 1) {
                if ("")
                //判断是否认证
                    if (data.rows[0].authenticateStatus == 0) { //未认证
                    $(".authentication").attr('src', "/src/images/common/noalready.png");
                } else if (data.rows[0].authenticateStatus == 1) { //通过认证
                    $(".authentication").attr('src', "/src/images/common/already.png");
                } else if (data.rows[0].authenticateStatus == -1) { //驳回状态
                    $(".authentication").attr('src', "/src/images/common/noalready.png");
                } else if (data.rows[0].authenticateStatus == 2) { //等待认证
                    $(".authentication").attr('src', "/src/images/common/noalready.png");
                }
                //判断是否收费
                if (data.rows[0].payStatus == 1) {
                    $(".status").append("<span class='payStatus' style='color:#08db8e;padding-left:10px;'>免费</span>");
                } else if (data.rows[0].payStatus == 2) {
                    $(".status").append("<span class='payStatus' style='color:#59b5fc;padding-left:10px;'>试用</span>");
                } else {
                    $(".status").append("<span class='payStatus' style='color:#fcad3e;padding-left:10px;'>收费</span>");
                }
            }
        }
    });
};
/* 前端路由模块 */
var routerObj = {
    router: null,
    init: function() {
        var that = this;
        that.router = Router({
            '/index': function() {
                loadRelativePage("/src/html/index.html");
                if (tjSwitch == 1) {
                    tjSdk.track('点击首页');
                }
            },
            '/event': function() {
                loadRelativePage("/src/html/event.html");
                if (tjSwitch == 1) {
                    tjSdk.track('点击事件管理');
                }
            },
            '/task': function() {
                loadRelativePage("/src/html/task.html");
                if (tjSwitch == 1) {
                    tjSdk.track('点击任务管理');
                }
            },
            '/maintenance': function() {
                loadRelativePage("/src/html/maintenance.html");
                if (tjSwitch == 1) {
                    tjSdk.track('点击维修维护');
                }
            },
            '/track': function() {
                loadRelativePage("/src/html/track.html");
                if (tjSwitch == 1) {
                    tjSdk.track('点击巡线记录');
                }
            },
            '/securityPlan': function() {
                loadRelativePage("/src/html/securityPlan.html");
                if (tjSwitch == 1) {
                    tjSdk.track('计划管理');
                }
            },
            '/securityRecord': function() {
                loadRelativePage("/src/html/securityRecord.html");
                if (tjSwitch == 1) {
                    tjSdk.track('入户安检记录');
                }
            },
            '/userList': function() {
                loadRelativePage("/src/html/userList.html");
                if (tjSwitch == 1) {
                    tjSdk.track('用户台账');
                }
            },
            '/userArea': function() {
                loadRelativePage("/src/html/userArea.html");
                if (tjSwitch == 1) {
                    tjSdk.track('片区管理');
                }
            },
            '/facilityList': function() {
                loadRelativePage("/src/html/facilityList.html");
                if (tjSwitch == 1) {
                    tjSdk.track('设施台账');
                }
            },
            '/facilityInspect': function() {
                loadRelativePage("/src/html/facilityInspect.html");
                if (tjSwitch == 1) {
                    tjSdk.track('设施检查');
                }
            },
            '/map': function() {
                loadRelativePage("/src/html/map.html");
                if (tjSwitch == 1) {
                    tjSdk.track('点击一张图');
                }
            },
            '/equipment': function() {
                loadRelativePage("/src/html/none.html");
                if (tjSwitch == 1) {
                    tjSdk.track('点击设备管理');
                }
            },
            '/statistics': function() {
                loadRelativePage("/src/html/none.html");
                if (tjSwitch == 1) {
                    tjSdk.track('点击统计分析');
                }
            },
            '/organization': function() {
                loadRelativePage("/src/html/management.html");
                if (tjSwitch == 1) {
                    tjSdk.track('点击组织结构管理');
                }
            },
            '/removemanager': function() {
                loadRelativePage("/src/html/removemanager.html");
                if (tjSwitch == 1) {
                    tjSdk.track('点击系统管理员移交');
                }
            },
            '/certification': function() {
                loadRelativePage("/src/html/certificationEnterprised.html");
                if (tjSwitch == 1) {
                    tjSdk.track('点击企业认证');
                }
            },
            '/managementuser': function() {
                loadRelativePage("/src/html/peoplemanager.html");
                if (tjSwitch == 1) {
                    tjSdk.track('点击人员管理');
                }
            },
            '/news': function() {
                loadRelativePage("/src/html/none.html");
                if (tjSwitch == 1) {
                    tjSdk.track('点击消息中心');
                }
            },
            '/personal': function() {
                loadRelativePage("/src/html/personal.html");
                if (tjSwitch == 1) {
                    tjSdk.track('点击个人资料');
                }
            },
            '/updatepass': function() {
                loadRelativePage("/src/html/forgetPassword.html");
                if (tjSwitch == 1) {
                    tjSdk.track('点击修改密码');
                }
            },
            '/setLogin': function() {
                loadRelativePage("/src/html/setLogin.html");
                if (tjSwitch == 1) {
                    tjSdk.track('点击登陆设置');
                }
            },
            '/help': function() {
                loadRelativePage("/src/html/help.html");
                if (tjSwitch == 1) {
                    tjSdk.track('点击帮助中心');
                }
            },
            '/securityPlan': function() {
                loadRelativePage("/src/html/securityPlan.html");
                if (tjSwitch == 1) {
                    tjSdk.track('点击计划管理');
                }
            },
            '/securityRecord': function() {
                loadRelativePage("/src/html/securityRecord.html");
                if (tjSwitch == 1) {
                    tjSdk.track('点击入户安检记录');
                }
            },
            '/customModule': function() {
                loadRelativePage("/src/html/customTemplates.html");
                if (tjSwitch == 1) {
                    tjSdk.track('点击事件类型自定义');
                }
            },
            '/pipeline': function() {
                loadRelativePage("/src/html/pipeline_map.html");

            }
        });
        that.router.init('/index');
    },
};

function load() {
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

        var html2 = '<li class="enterprise-management"> <a href="javascript:void(0)" data-toggle="collapse" data-target="#mangement"><i class="fa fa-fw fa-briefcase"></i> 企业管理<i class="fa fa-fw fa-caret-down"></i></a>' +
            '<ul id="mangement" class="collapse"><li><a href="#/organization"><i class="fa fa-fw "></i>组织机构管理</a></li>' +
            '<li><a href="#/managementuser"><i class="fa fa-fw "></i>人员管理</a></li>' +
            '<li><a href="#/customModule"><i class="fa fa-fw "></i>事件类型自定义</a></li>' +
            '<li><a href="#/certification"><i class="fa fa-fw "></i>企业信息</a></li>' +
            '</li><li><a href="#/removemanager"><i class="fa fa-fw "></i>系统管理员移交</a> </li></ul></li>';
        $(".side-nav").append(html2);
    }
}