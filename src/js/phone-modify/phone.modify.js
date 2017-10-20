/**
 * 修改手机号
 */
var phoneObj = {
    $back: $('.back'),
    $one: $(".stepOneBtn"),
    $two: $(".stepTwoBtn"),
    $three: $(".stepThreeBtn"),
    _flag: true,
    _code: null,
    _messageFlag: true,
    init: function() {
        var _this = this;
        _this.code();
        //取消修改，返回个人页面
        _this.$back.click(function() {
            var defaultOptions = {
                tip: '您是否确定取消修改手机号？',
                name_title: '提示',
                name_cancel: '取消',
                name_confirm: '确定',
                isCancelBtnShow: true,
                callBack: function() {
                    window.history.back();
                }
            };
            xxwsWindowObj.xxwsAlert(defaultOptions);
        });
        //第一步提交
        _this.$one.click(function() {
            if (_this._flag == true) {
                _this.verificationPassword();
            }
        });
        //第二步提交
        _this.$two.click(function() {
            if (_this._flag == true) {
                _this.verificationForm();
            }
        });
        //第三步，退出
        _this.$three.click(function() {
            _this.signOut();
        });

        //刷新图片验证码
        $(".suspension_pic").click(function() {
            _this.code();
        });
        //获取短信验证码
        $(".suspension_message").click(function() {
            if (_this._messageFlag == true) {
                _this.message();
            }
        });
    },
    verificationPassword: function() { //验证密码
        var _this = this;
        var password = $("input[name='password']").val().trim();
        if (password == '') {
            $(".passwordT").text("请输入密码").show();
            return;
        } else {
            $(".passwordT").text("").hide();
            _this._flag = false;
            var param = {
                userId: JSON.parse(lsObj.getLocalStorage('userBo')).objectId, //用户objectId
                mobileNum: JSON.parse(lsObj.getLocalStorage('userBo')).mobileNum, //旧手机号
                password: password, //登录密码（明文密码）
            }
            $.ajax({
                type: "GET",
                url: "/cloudlink-core-framework/user/checkPassword?token=" + lsObj.getLocalStorage('token'),
                contentType: "application/json",
                data: param,
                dataType: "json",
                success: function(data) {
                    if (data.success == 1) {
                        if (data.rows[0].booleanResult == true) {
                            $(".modifyTitle").find("span").attr("class", "step2");
                            $(".stepOne").hide();
                            $(".stepTwo").show();
                        } else {
                            $(".passwordT").text("密码错误").show();
                        }
                        _this.again();
                    } else {
                        if (data.code == "PU03013") {
                            xxwsWindowObj.xxwsAlert('登录超时，请重新登录！');
                        }
                        _this.again();
                    }
                }
            });
        }
    },
    code: function() { //图片验证码
        var az = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'z', 'x', 'c', 'v', 'b', 'n', 'm', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Z', 'X', 'C', 'V', 'B', 'N', 'M'];
        var dom2 = parseInt(Math.random() * 10000 % 62);
        var dom3 = parseInt(Math.random() * 10000 % 62);
        var dom4 = parseInt(Math.random() * 10000 % 62);
        var dom1 = parseInt(Math.random() * 10000 % 62);
        this._code = az[dom1] + az[dom2] + az[dom3] + az[dom4];
        $('.suspension_pic i').text(this._code);
    },
    message: function() { //短信验证码
        var _this = this;
        var tel = _this.verificationTel();
        if (tel != false) {
            _this._messageFlag = false;
            var time = 60;
            $(".suspension_message").text("60秒后再次获取").addClass("messageAgain");
            var t = setInterval(function() {
                time--;
                $(".suspension_message").text(time + "秒后再次获取").addClass("messageAgain");
                if (time < 1) {
                    clearInterval(t);
                    $(".suspension_message").text("重新获取").removeClass("messageAgain");
                    _this._messageFlag = true;
                }
            }, 1000);
            var param = {
                "sendNum": tel,
                "sendMode": 1,
                "useMode": 3
            }
            $.ajax({
                url: "/cloudlink-core-framework/login/getVerifyCode?token=" + lsObj.getLocalStorage('token'),
                type: "GET",
                contentType: "application/json",
                dataType: "json",
                data: param,
                success: function(data) {}
            });
        }
    },
    verificationTel: function() { //验证手机号
        $(".picCodeT").text("").hide();
        $(".messageCodeT").text("").hide();
        var tel = $("input[name='tel']").val().trim();
        var phoneReg = /^1\d{10}$/;
        if (tel == '') {
            $(".telT").text("请输入手机号").show();
            return false;
        } else if (!phoneReg.test(tel)) {
            $(".telT").text("手机号码错误").show();
            return false;
        } else {
            $(".telT").text("").hide();
            return tel;
        }
    },
    verificationForm: function() { //第二步验证
        var _this = this;
        var tel = _this.verificationTel();
        var picCode = $("input[name='picCode']").val().trim();
        var imgReg = new RegExp("^" + _this._code + "$", "gi");
        var messageCode = $("input[name='messageCode']").val().trim();
        if (tel == false) {
            return;
        } else if (picCode == '') {
            $(".messageCodeT").text("").hide();
            $(".picCodeT").text("请输入图片验证").show();
            return;
        } else if (imgReg.test(picCode) == false) {
            $(".messageCodeT").text("").hide();
            $(".picCodeT").text("图片验证错误").show();
            return;
        } else if (messageCode == '') {
            $(".picCodeT").text("").hide();
            $(".messageCodeT").text("请输入短信验证").show();
            return;
        } else {
            $(".picCodeT").text("").hide();
            $(".messageCodeT").text("").hide();
            _this._flag = false;
            var param = {
                sendNum: tel,
                sendMode: 1,
                verifyCode: messageCode
            };
            $.ajax({
                url: "/cloudlink-core-framework/login/checkVerifyCode?token=" + lsObj.getLocalStorage('token'),
                type: "GET",
                contentType: "application/json",
                dataType: "json",
                data: param,
                success: function(data) {
                    if (data.success == 1) {
                        _this.updatePhone(tel);
                    } else {
                        $(".messageCodeT").text("验证失败").show();
                        _this.again();
                        return;
                    }
                }
            });
        }
    },
    updatePhone: function(tel) { //修改手机号
        var _this = this;
        var param = {
            objectId: JSON.parse(lsObj.getLocalStorage('userBo')).objectId, //用户objectId
            mobileNum: tel
        }
        $.ajax({
            url: "/cloudlink-core-framework/user/update?token=" + lsObj.getLocalStorage('token'),
            type: "POST",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify(param),
            success: function(data) {
                if (data.success == 1) {
                    $(".modifyTitle").find("span").attr("class", "step3");
                    $(".stepTwo").hide();
                    $(".stepThree").show();
                    var time = 5;
                    $(".backTime").text(time);
                    var t = setInterval(function() {
                        time--;
                        $(".backTime").text(time);
                        if (time < 1) {
                            clearInterval(t);
                            _this.signOut();
                        }
                    }, 1000);
                } else {
                    if (data.msg == '该手机号码已经注册过') {
                        xxwsWindowObj.xxwsAlert('新手机号已经被注册，无法修改');
                    } else {
                        xxwsWindowObj.xxwsAlert('修改手机号失败');
                    }
                }
                _this.again();
            }
        });
    },
    signOut: function() { //退出重新登录
        lsObj.clearAll();
        top.location.href = '../../login.html';
    },
    again: function() {
        this._flag = true;
    }
};
$(function() {
    phoneObj.init();
});