$(function() {});
var oldpass = null;
var newpass = null;
var aginpass = null;
// 原密码验证
$('.pw').blur(function() {
    oldpass = $('.pw').val().trim();
    if (oldpass != null && oldpass != "") {
        $('.pwMsg').text('');
    }
    // 调用接口获得原密码， 与输入框里的值作对比， 一致进行下一步， 不一致提示原密码输入不正确。
});
//新密码验证
$('.pw1').blur(function() {
    checknewpass();
});
//确认密码验证
$('.pw2').blur(function() {
    checkaginpass();
});

$('.btn').click(function() {
    oldpass = $('.pw').val().trim();
    newpass = $('.pw1').val().trim();
    aginpass = $('.pw2').val().trim();
    if (oldpass == null || oldpass == "") {
        $('.pwMsg').text('请输入原密码');
        return;
    }
    if (newpass == null || newpass == "") {
        $('.pw1Msg').text('请输入新密码');
        return;
    } else if (!checknewpass()) {
        return;
    } else if (aginpass == null || aginpass == "") {
        $('.pw2Msg').text('请输入确认密码');
        return;
    } else if (!checkaginpass()) {
        return;
    } else {
        /*调用接口进行密码的修改*/
        var token = lsObj.getLocalStorage('token');
        var _data = {
            "oldPassword": MD5(oldpass),
            "newPassword": MD5(newpass)
        };
        $.ajax({
            type: "POST",
            url: "/cloudlink-core-framework/user/updatePassword?token=" + token,
            contentType: "application/json",
            data: JSON.stringify(_data),
            dataType: "json",
            success: function(data) {
                if (data.success == 1) {
                    xxwsWindowObj.xxwsAlert("密码修改成功，并即将返回登录页面，请重新登录", function() {
                        lsObj.clearAll();
                        top.location.href = '../../login.html';
                    });
                } else if (data.msg == "原密码不正确") {
                    xxwsWindowObj.xxwsAlert("原密码输入错误", function() {
                        $(".pw").val("");
                        $(".pw1").val("");
                        $(".pw2").val("");
                    });
                } else {
                    xxwsWindowObj.xxwsAlert("密码修改失败");
                }
            },

        });
    }

});

function checknewpass() {
    newpass = $('.pw1').val().trim();
    var pwReg = /^[\dA-z]{6,12}$/;
    if (newpass == '' || newpass == null) {
        $('.pw1Msg').text('密码不能为空');
        return false;
    } else if (!pwReg.test(newpass)) {
        $('.pw1Msg').text('密码格式错误');
        return false;
    } else {
        $('.pw1Msg').text('');
        return true;
    }
}

function checkaginpass() {
    newpass = $('.pw1').val().trim();
    aginpass = $('.pw2').val().trim();
    if (aginpass == "" || aginpass == null) {
        $('.pw2Msg').text('请再次输入密码');
        return false;
    } else if (aginpass != newpass) {
        $('.pw2Msg').text('两次输入密码不一致');
        return false;
    } else {
        $('.pw2Msg').text('');
        return true;
    }
}