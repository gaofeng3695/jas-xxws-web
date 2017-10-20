$(function() {
    relaodEnterprise(); /*根据用户ID获取当前用户的所有企业*/
});
/*单选框选择*/
$("body").on("click", ".radio", function() {
    $(".radio").removeClass("on_check");
    $(this).addClass("on_check");
    $(this).find("input[type='radio']").prop("checked", true);
});
/*根据用户ID获取当前用户的所有企业*/
function relaodEnterprise() {
    var defaultHtml = ""; //默认企业;
    var loginnow = ""; //当前登录企业；
    var allHtml = ""; //所有企业
    var userBo = JSON.parse(lsObj.getLocalStorage("userBo"));
    var status = '0,1';
    var _data = {
        "userId": userBo.objectId,
        "status": status
    }
    $.ajax({
        type: "GET",
        url: "/cloudlink-core-framework/enterprise/getByUserId?token=" + lsObj.getLocalStorage('token'),
        contentType: "application/json",
        data: _data,
        dataType: "json",
        success: function(data) {
            if (data.success == 1) {
                var dataList = data.rows;
                for (var i = 0; i < dataList.length; i++) {
                    if (dataList[i].objectId == userBo.enterpriseId) {
                        loginnow = '<div class="row"><div class = "col-md-2" ></div> ' +
                            '<div class = "col-md-8"><div class = "radio on_check"><label>' +
                            '<input type = "radio"  name = "optionEnterprise"   id = "loginnowId" value = "' + dataList[i].objectId + '" checked >' +
                            '<span>' + dataList[i].enterpriseName + '（默认登录）</span> </label > </div></div > <div class = "col-md-2" ></div></div > ';
                    } else {
                        if (dataList[i].status == "0") {
                            allHtml += '<div class="row"><div class = "col-md-2" ></div> ' +
                                '<div class = "col-md-8"><div class = "radio"><label>' +
                                '<input type = "radio"  name = "optionEnterprise"   id = "nojoin' + i + '" value = "' + dataList[i].objectId + '"  >' +
                                '<span>' + dataList[i].enterpriseName + '（ 受邀企业)</span> </label > </div></div > <div class = "col-md-2" ></div></div > ';
                        } else if (dataList[i].status == "1") {
                            allHtml += '<div class="row"><div class = "col-md-2" ></div> ' +
                                '<div class = "col-md-8"><div class = "radio"><label>' +
                                '<input type = "radio"  name = "optionEnterprise"   id = "join' + i + '" value = "' + dataList[i].objectId + '"  >' +
                                '<span>' + dataList[i].enterpriseName + '</span> </label > </div></div > <div class = "col-md-2" ></div></div > ';
                        }

                    }
                }
                $(".allenterprised").append(loginnow + allHtml);
            }
        }
    });
}
/*选中之后 确认设置默认企业 */
$(".setdefault button").click(function() {
    var nojoin = '';
    var enterpriseId = "";
    enterpriseId = $("input[name='optionEnterprise']:checked").val();
    nojoin = $("input[name='optionEnterprise']:checked").attr("id");
    var userBo = JSON.parse(lsObj.getLocalStorage("userBo"));
    if (nojoin == 'loginnowId') {
        xxwsWindowObj.xxwsAlert("当前企业已经登录");
    } else if (enterpriseId == null || enterpriseId == "") {
        xxwsWindowObj.xxwsAlert("请选择一个默认企业后，才可登录成功");
    } else if (nojoin != "") {
        //当前需要设置为默认企业并且该企业未加入
        $.ajax({
            type: "POST",
            url: "/cloudlink-core-framework/user/setDefaultEnterpriseAndJoin?token=" + lsObj.getLocalStorage('token'),
            contentType: "application/json",
            data: JSON.stringify({ "userId": userBo.objectId, "enterpriseId": enterpriseId }),
            dataType: "json",
            success: function(data) {
                if (data.success == 1) {
                    //设置成默认企业之后，需要重新调用获取默认企业ID，然后进行加入该企业
                    getDefaultEnterpriseId(userBo.objectId);
                } else {
                    xxwsWindowObj.xxwsAlert("服务异常，请稍候重试");
                }
            }
        });
    } else {
        $.ajax({
            type: "POST",
            url: "/cloudlink-core-framework/user/setDefaultEnterprise?token=" + lsObj.getLocalStorage('token'),
            contentType: "application/json",
            data: JSON.stringify({ "userId": userBo.objectId, "enterpriseId": enterpriseId }),
            dataType: "json",
            success: function(data) {
                if (data.success == 1) {
                    getDefaultEnterpriseId(userBo.objectId);
                } else {
                    xxwsWindowObj.xxwsAlert("默认企业设置失败，请重新登录进行设置");
                }
            }
        });
    }
});
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
                //当前用户存在默认企业Id
                if (data.rows.length > 0) {
                    var _enterpriseId = data.rows[0].enterpriseId;
                    joinDefaultEnterprise(_enterpriseId);
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
            var success = data.success;
            if (success == 1) {
                var row = data.rows;
                var token = data.token;
                lsObj.setLocalStorage('token', token);
                lsObj.setLocalStorage('userBo', JSON.stringify(row[0]));
                lsObj.setLocalStorage('timeOut', new Date().getTime() + (23 * 60 * 60 * 1000));
                parent.location.href = '../../main.html';
            } else {
                switch (data.code) {
                    case "400":
                        $('.hidkuai2 span').text('服务异常');
                        break;
                    case "401":
                        $('.hidkuai2 span').text('参数异常');
                        break;
                    case "E01":
                        $('.hidkuai2 span').text('您的账户已被该企业冻结');
                        break;
                    case "E02":
                        $('.hidkuai2 span').text('您的账户已被该企业移除');
                        break;
                    case "E03":
                        $('.hidkuai2 span').text('该企业不存在');
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
/*退出将退出到登录页面，进行缓存清除*/
$(".return button").click(function() {
    parent.location.href = '../../main.html';
});