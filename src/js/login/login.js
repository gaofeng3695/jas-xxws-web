var Obj = {
    nameImg: "url(src/images/loginImg/nameImg.png)",
    nameImg1: "url(src/images/loginImg/nameImg1.png)",
    passwordImg: "url(src/images/loginImg/password1.png)",
    passwordImg1: "url(src/images/loginImg/password.png)",
    focus: function(obj, imgSrc) {
        obj.css({
            background: "#ECF7FF",
            border: "1px solid #5EB6F9"
        });
        obj.find('input').css("background", "#ECF7FF");
        obj.find('.common').css("border-left", "1px solid #5EB6F9");
        obj.find('.bg').css("background-image", imgSrc);
    },
    blur: function(obj, imgSrc) {
        obj.css({
            background: "#fff",
            border: "1px solid #bbb"
        });
        obj.find('input').css("background", "#fff");
        obj.find('.common').css("border-left", "1px solid #bbb");
        obj.find('.bg').css("background-image", imgSrc);
    }
}
$(".name input").focus(function() {
    Obj.focus($(".name"), Obj.nameImg);
}).blur(function() {
    Obj.blur($(".name"), Obj.nameImg1);
});
$(".password input").focus(function() {
    Obj.focus($(".password"), Obj.passwordImg);
}).blur(function() {
    Obj.blur($(".password"), Obj.passwordImg1);
})
var passwordVal = null;
var nameVal = null;
//确认登录
$('.btn').click(function() {
    nameVal = $(".name input").val().trim();
    passwordVal = MD5($(".password input").val().trim());
    var phoneReg = /^1\d{10}$/;
    if (nameVal == "" || nameVal == null) {
        $('.hidkuai1 span').text('手机号码不能为空');
        $(".password input").val('')
        return;
    } else if (!phoneReg.test(nameVal)) {
        $('.hidkuai1 span').text('您输入的手机号码不正确');
        return;
    } else if (passwordVal == '' || passwordVal == null) {
        $('.hidkuai1 span').text('');
        $('.hidkuai2 span').text('密码不能为空');
        return;
    } else {
        $('.hidkuai1 span').text('');
        $('.hidkuai2 span').text('');
        accountNumber();
    }
});
// 验证手机号是否注册接口开始
function accountNumber() {
    var _data = {
        "registNum": nameVal
    };
    $.ajax({
        type: "GET",
        url: "/cloudlink-core-framework/login/isExist",
        contentType: "application/json",
        data: _data,
        dataType: "json",
        success: function(data, status) {
            var res = data.rows.isExist;
            if (res == 0) {
                $('.hidkuai1 span').text('账号未注册');
                if (zhugeSwitch == 1) {
                    zhuge.track('登陆失败', {
                        '手机号': nameVal,
                        '原因': '账号未注册'
                    });
                }
                return false;
            } else {
                requestData();
                return true;

            }
        }
    });
}
//验证手机号和密码
function requestData() {
    var _data = {
        "loginNum": nameVal,
        "password": passwordVal
    };
    $.ajax({
        type: "POST",
        url: "/cloudlink-core-framework/login/loginByPassword",
        contentType: "application/json",
        data: JSON.stringify(_data),
        dataType: "json",
        success: function(data) {
            var success = data.success;
            if (success == 1) {
                var row = data.rows;
                var token = data.token;
                lsObj.setLocalStorage('token', token);
                lsObj.setLocalStorage('userBo', JSON.stringify(row[0]));
                lsObj.setLocalStorage('timeOut', new Date().getTime() + (23 * 60 * 60 * 1000));
                getDefaultEnterpriseId(row[0].objectId);
            } else {
                if (data.code == "U01") {
                    $('.hidkuai2 span').text('用户名和密码不一致');
                    if (zhugeSwitch == 1) {
                        zhuge.track('登陆失败', {
                            '手机号': nameVal,
                            '原因': '用户名和密码不一致'
                        });
                    }
                    return;
                }
                if (data.code == "U02") {
                    $('.hidkuai2 span').text('该用户未注册');
                    if (zhugeSwitch == 1) {
                        zhuge.track('登陆失败', {
                            '手机号': nameVal,
                            '原因': '该用户未注册'
                        });
                    }
                    return;
                }
                if (data.code == "U03") {
                    $('.hidkuai2 span').text('该用户已注册');
                    return;
                }
                if (data.code == "U04") {
                    $('.hidkuai2 span').text('该账户已冻结');
                    return;
                }
                if (data.code == "400") {
                    $('.hidkuai2 span').text('代码异常');
                    return;
                }
                if (data.code == "401") {
                    $('.hidkuai2 span').text('参数异常');
                    return;
                }
            }

        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            console.log(XMLHttpRequest);
            console.log(textStatus);
            console.log(errorThrown);
        }
    });
}

//获取当前用户的默认企业Id
function getDefaultEnterpriseId(_userId) {
    $.ajax({
        type: "POST",
        url: "/cloudlink-core-framework/login/getDefaultEnterpriseId",
        contentType: "application/json",
        data: JSON.stringify({
            userId: _userId
        }),
        dataType: "json",
        success: function(data) {
            var success = data.success;
            if (success == 1) {
                // alert(JSON.stringify(data));
                //当前用户存在默认企业Id
                if (data.rows.length > 0) {
                    var _enterpriseId = data.rows[0].enterpriseId;
                    joinDefaultEnterprise(_enterpriseId);
                } else {
                    //当前用户不存在默认企业Id
                    location.href = 'src/html/loginSet.html';
                    $('.hidkuai2 span').text('当前用户未设置默认登录企业');
                }
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            console.log(XMLHttpRequest);
            console.log(textStatus);
            console.log(errorThrown);
        }
    });
}

//加入企业
function joinDefaultEnterprise(_enterpriseId) {
    var _userBo = JSON.parse(lsObj.getLocalStorage('userBo'));
    $.ajax({
        type: "POST",
        url: "/cloudlink-core-framework/login/joinEnterprise",
        contentType: "application/json",
        data: JSON.stringify({
            userId: _userBo.objectId,
            enterpriseId: _enterpriseId
        }),
        dataType: "json",
        success: function(data) {
            // alert(JSON.stringify(data));
            var success = data.success;
            if (success == 1) {
                var row = data.rows;
                var token = data.token;
                lsObj.setLocalStorage('token', token);
                lsObj.setLocalStorage('userBo', JSON.stringify(row[0]));
                lsObj.setLocalStorage('timeOut', new Date().getTime() + (23 * 60 * 60 * 1000));
                if (zhugeSwitch == 1) {
                    zhugeIdentify(row[0]);
                    zhuge.track('登陆成功');
                }
                location.href = 'main.html';
            } else {
                switch (data.code) {
                    case "400":
                        $('.hidkuai2 span').text('服务异常');
                        if (zhugeSwitch == 1) {
                            zhuge.track('登陆失败', {
                                '手机号': _userBo.mobileNum,
                                '原因': '服务异常'
                            });
                        }
                        break;
                    case "401":
                        $('.hidkuai2 span').text('参数异常');
                        if (zhugeSwitch == 1) {
                            zhuge.track('登陆失败', {
                                '手机号': _userBo.mobileNum,
                                '原因': '参数异常'
                            });
                        }
                        break;
                    case "E01":
                        $('.hidkuai2 span').text('您的账户已被该企业冻结');
                        if (zhugeSwitch == 1) {
                            zhuge.track('登陆失败', {
                                '手机号': _userBo.mobileNum,
                                '原因': '您的账户已被该企业冻结'
                            });
                        }
                        break;
                    case "E02":
                        $('.hidkuai2 span').text('您的账户已被该企业移除');
                        if (zhugeSwitch == 1) {
                            zhuge.track('登陆失败', {
                                '手机号': _userBo.mobileNum,
                                '原因': '您的账户已被该企业移除'
                            });
                        }
                        break;
                    case "E03":
                        $('.hidkuai2 span').text('该企业不存在');
                        if (zhugeSwitch == 1) {
                            zhuge.track('登陆失败', {
                                '手机号': _userBo.mobileNum,
                                '原因': '该企业不存在'
                            });
                        }
                        break;
                    default:
                        break;
                }
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            console.log(XMLHttpRequest);
            console.log(textStatus);
            console.log(errorThrown);
        }
    });
}


function zhugeIdentify(_userBo) {
    zhuge.identify(_userBo.objectId, {
        name: _userBo.userName,
        gender: _userBo.sex,
        age: _userBo.age,
        email: _userBo.email,
        qq: _userBo.qq,
        weixin: _userBo.wechat,
        'mobile': _userBo.mobileNum,
        '企业名称': _userBo.enterpriseName == null ? "" : _userBo.enterpriseName,
        '部门名称': _userBo.orgName == null ? "" : _userBo.orgName
    });
}