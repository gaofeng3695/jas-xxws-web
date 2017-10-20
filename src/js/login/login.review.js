/*
- 自执行函数，严格模式
- 函数语义化
- 统一管理选择器
- 统一管理事件
- 抽离工具类
- 生命周期
*/

(function(global, $, doc, lsObj, zhugeSwitch, zhuge) {
    'use strict';
    var loginClass = function() {
        this.passwordVal = null;
        this.nameVal = null;
        this.eventsMap = {
            'focus .name input': 'nameFocus',
            'blur .name input': 'nameBlur',
            'focus .password input': 'pswdFocus',
            'blur .password input': 'pswdBlur',
            'click .btn': 'login',
            'keydown input': 'keydownLogin',
        };
        this.initializeElements();
        this.initialization();
    };
    loginClass.Eles = {
        name: '.name',
        password: '.password',
        nameInput: '.name input',
        passwordInput: '.password input',
        nTip: '.hidkuai1 span',
        pTip: '.hidkuai2 span'
    };
    var utils = {
        zhugeTrackForFailed: function(tel, sRsn) {
            //console.log(sRsn)
            if (zhugeSwitch == 1) {
                zhuge.track('登陆失败', {
                    '手机号': tel,
                    '原因': sRsn
                });
            }
        },
        zhugeTrackForSuccess: function(_userBo) {
            //console.log(_userBo)
            if (zhugeSwitch == 1) {
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
                zhuge.track('登陆成功');
            }
        }
    };
    var styleObj = {
        nameImg: "url(src/images/loginImg/nameImg.png)",
        nameImg1: "url(src/images/loginImg/nameImg1.png)",
        passwordImg: "url(src/images/loginImg/password1.png)",
        passwordImg1: "url(src/images/loginImg/password.png)",
        setActiveStyle: function(obj, imgSrc) {
            obj.css({
                background: "#ECF7FF",
                border: "1px solid #5EB6F9"
            });
            obj.find('input').css("background", "#ECF7FF");
            obj.find('.common').css("border-left", "1px solid #5EB6F9");
            obj.find('.bg').css("background-image", imgSrc);
        },
        setInitStyle: function(obj, imgSrc) {
            obj.css({
                background: "#fff",
                border: "1px solid #bbb"
            });
            obj.find('input').css("background", "#fff");
            obj.find('.common').css("border-left", "1px solid #bbb");
            obj.find('.bg').css("background-image", imgSrc);
        }
    };
    loginClass.prototype = {
        constructor: loginClass,
        _flag: true,
        initialization: function() {
            this.bindEvent();
        },
        initializeElements: function() {
            var eles = loginClass.Eles;
            for (var name in eles) {
                if (eles.hasOwnProperty(name)) {
                    this[name] = $(eles[name]);
                }
            }
        },
        bindEvent: function() {
            this.initializeOrdinaryEvent(this.eventsMap);
        },
        unbindEvent: function() {
            this.uninitializeOrdinaryEvent(this.eventsMap);
        },
        initializeOrdinaryEvent: function(maps) {
            this._scanEventsMap(maps, true);
        },
        uninitializeOrdinaryEvent: function(maps) {
            this._scanEventsMap(maps);
        },
        _scanEventsMap: function(maps, isOn) {
            var delegateEventSplitter = /^(\S+)\s*(.*)$/;
            var type = isOn ? 'on' : 'off';
            for (var keys in maps) {
                if (maps.hasOwnProperty(keys)) {
                    if (typeof maps[keys] === 'string') {
                        maps[keys] = this[maps[keys]].bind(this);
                    }
                    var matchs = keys.match(delegateEventSplitter);
                    $('body')[type](matchs[1], matchs[2], maps[keys]);
                }
            }
        },
        destroy: function() {
            this.unbindEvent();
        },
        nameFocus: function(e) {
            styleObj.setActiveStyle(this.name, styleObj.nameImg);
        },
        nameBlur: function(e) {
            styleObj.setInitStyle(this.name, styleObj.nameImg1);
        },
        pswdFocus: function(e) {
            styleObj.setActiveStyle(this.password, styleObj.passwordImg);
        },
        pswdBlur: function(e) {
            styleObj.setInitStyle(this.password, styleObj.passwordImg1);
        },
        keydownLogin: function(e) {
            if (e.which === 13) {
                this.login();
            }
        },
        login: function(e) {
            var p = this.passwordInput;
            var n = this.nameInput;
            var pt = this.pTip;
            var nt = this.nTip;
            this.nameVal = n.val().trim();
            this.passwordVal = MD5(p.val().trim());
            var nameVal = this.nameVal;
            var passwordVal = this.nameVal;
            var phoneReg = /^1\d{10}$/;
            if (nameVal == "" || nameVal == null) {
                nt.text('手机号码不能为空');
                p.val('')
            } else if (!phoneReg.test(nameVal)) {
                nt.text('您输入的手机号码不正确');
            } else if (passwordVal == '' || passwordVal == null) {
                nt.text('');
                pt.text('密码不能为空');
            } else {
                nt.text('');
                pt.text('');
                this._requestIfTelregisted();
            }
        },
        _requestIfTelregisted: function() { // 验证手机号是否注册接口
            var _data = {
                "registNum": this.nameVal
            };
            var nt = this.nTip;
            var that = this;
            if (that._flag == true) {
                that._flag = false;
                $('.btn').html('登录中...').css('background', '#999');
                $.ajax({
                    type: "GET",
                    url: "/cloudlink-core-framework/login/isExist",
                    contentType: "application/json",
                    data: _data,
                    dataType: "json",
                    success: function(data, status) {
                        var res = data.rows.isExist;
                        if (res == 0) {
                            nt.text('账号未注册');
                            utils.zhugeTrackForFailed(that.nameVal, '账号未注册');
                            that.again();
                            return false;
                        } else {
                            that._requestData();
                            return true;
                        }
                    },
                    error: function() {
                        that.again();
                        return false;
                    }
                });
            }
        },
        _requestData: function() { //验证手机号和密码
            var that = this;
            var pt = this.pTip;
            var _data = {
                "loginNum": this.nameVal,
                "password": this.passwordVal
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
                        that._getDefaultEnterpriseId(row[0].objectId);
                        //that.again();
                    } else {
                        if (data.code == "U01") {
                            pt.text('用户名和密码不一致');
                            utils.zhugeTrackForFailed(that.nameVal, '用户名和密码不一致');
                            that.again();
                            return;
                        }
                        if (data.code == "U02") {
                            pt.text('该用户未注册');
                            utils.zhugeTrackForFailed(that.nameVal, '该用户未注册');
                            that.again();
                            return;
                        }
                        if (data.code == "U03") {
                            pt.text('该用户已注册');
                            that.again();
                            return;
                        }
                        if (data.code == "U04") {
                            pt.text('该账户已冻结');
                            that.again();
                            return;
                        }
                        if (data.code == "400") {
                            pt.text('代码异常');
                            that.again();
                            return;
                        }
                        if (data.code == "401") {
                            pt.text('参数异常');
                            that.again();
                            return;
                        }
                    }
                },
                error: function(XMLHttpRequest, textStatus, errorThrown) {
                    console.log(XMLHttpRequest);
                    console.log(textStatus);
                    console.log(errorThrown);
                    that.again();
                }
            });
        },
        //获取当前用户的默认企业Id
        _getDefaultEnterpriseId: function(_userId) {
            var that = this;
            var pt = this.pTip;
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
                            that._joinDefaultEnterprise(_enterpriseId);
                        } else {
                            that.again();
                            pt.text('当前用户未设置默认登录企业');
                            //当前用户不存在默认企业Id
                            location.href = '/src/html/loginSet.html';
                        }
                    } else {
                        that.again();
                    }
                },
                error: function(XMLHttpRequest, textStatus, errorThrown) {
                    console.log(XMLHttpRequest);
                    console.log(textStatus);
                    console.log(errorThrown);
                    that.again();
                }
            });
        },
        //加入企业
        _joinDefaultEnterprise: function(_enterpriseId) {
            var that = this;
            var pt = this.pTip;
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
                        that.again();
                        var row = data.rows;
                        var token = data.token;
                        lsObj.setLocalStorage('token', token);
                        lsObj.setLocalStorage('userBo', JSON.stringify(row[0]));
                        lsObj.setLocalStorage('timeOut', new Date().getTime() + (23 * 60 * 60 * 1000));
                        utils.zhugeTrackForSuccess(row[0]);
                        location.href = 'main.html';
                    } else {
                        that.again();
                        switch (data.code) {
                            case "400":
                                pt.text('服务异常');
                                utils.zhugeTrackForFailed(_userBo.mobileNum, '服务异常');
                                break;
                            case "401":
                                pt.text('参数异常');
                                utils.zhugeTrackForFailed(_userBo.mobileNum, '参数异常');
                                break;
                            case "E01":
                                pt.text('您的账户已被该企业冻结');
                                utils.zhugeTrackForFailed(_userBo.mobileNum, '您的账户已被该企业冻结');
                                break;
                            case "E02":
                                pt.text('您的账户已被该企业移除');
                                utils.zhugeTrackForFailed(_userBo.mobileNum, '您的账户已被该企业移除');
                                break;
                            case "E03":
                                pt.text('该企业不存在');
                                utils.zhugeTrackForFailed(_userBo.mobileNum, '该企业不存在');
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
                    that.again();
                }
            });
        },
        again: function() {
            this._flag = true;
            $('.btn').html('登&nbsp;&nbsp;录').css('background', '#5EB6F9');
        }
    };
    $(function() {
        global.loginObj = new loginClass();
        //new loginClass();
    });
})(this, this.jQuery, document, lsObj, zhugeSwitch, zhuge);
//点击打开版本信息模态框
$('#versionInformation span').click(function() {
    $("#versionmodal").modal()
})