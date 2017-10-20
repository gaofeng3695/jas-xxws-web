var numIndex = null;
var uuid = "";
var nImgHasBeenSendSuccess = 0;

function initBindSytleChange() {
    $('.center').click(function() {
        // console.log('事件是否触发');
        var index = $(this).index();
        $('.center').css({
            borderBottom: '1px solid #ececec',
            color: '#000'
        });
        $('.center .i').css({
            display: 'none'
        });
        $(this).css({
            borderBottom: '1px solid #67BDF6',
            color: '#67BDF6'
        });
        var height = $(this).height();
        $(this).find('.i').css({
            display: 'block'
        });
        $(this).find('.i:eq(0)').css({
            top: height + 'px'
        });
        $(this).find('.i:eq(1)').css({
            top: height - 1 + 'px'
        });
        $('.kuai>div').css({
            display: 'none'
        });
        $('.kuai>div').eq(index).css({
            display: 'block'
        });
    });
}

// 意见反馈输入字数限制
function lookNum(e) {
    var len = $(e).val().trim().length;
    if (len > 200) {
        $(e).val($(e).val().substring(0, 199));
        $(e).next("span").show().text("*最多200字")
    } else {
        $(e).next("span").hide();
    }
}
/*获取参数*/
function GetQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
}
/*初始化页面*/
$(function() {
    numIndex = GetQueryString("num");
    if (numIndex != null) {
        selectIndex(numIndex);
    };
    /*上传图片*/
    $(".addImg").click(function() {
        var imgNum = $(".feedback_img_list").find(".feedback_images").length;
        if (imgNum <= 2) {
            $(".upload_picture").trigger("click");
        } else {
            alert("最多上传三张图片");
        }
    });
    // tab切换
    window.onresize = function() {
        var height = $('.center').height();
        $('.center').find('.i:eq(0)').css({
            top: height + 'px'
        });
        $('.center').find('.i:eq(1)').css({
            top: height - 1 + 'px'
        });
    }

    initBindSytleChange();


});
/*删除图片*/
function closeImg(e) {;
    $(e).closest(".feedback_images").remove();
    for (var i = 0; i < $(".feedback_img_file").find("input[name='file']").length; i++) {
        if ($(".feedback_img_file").find("input").eq(i).attr("data-value") == $(e).attr("data-key")) {
            $(".feedback_img_file").find("input").eq(i).remove();
        }
    }

}
/*判断建议图片提交*/
function onSubmit() {
    uuid = creatuuid();
    var textArea = $(".feedback_area").find("textarea").val().trim();
    var contactWay = $(".feedback_way").find("input").val().trim();
    if (textArea.length < 10) {
        $(".feedback_area").find("span").show().text("*不到10个字哦，再写点吧");
        return false;
    } else {
        var imgNum = $(".feedback_img_list").find(".feedback_images").length;
        if (imgNum > 0) {
            for (var i = 0; i < $('.feedback_img_list .feedback_images').length; i++) {
                var picid = $('.feedback_img_file').find('input').eq(i).attr('id');
                $.ajaxFileUpload({
                    url: "/cloudlink-core-file/attachment/web/v1/save?businessId=" + uuid + "&bizType=pic_suggestions&token=" + lsObj.getLocalStorage("token"),
                    /*这是处理文件上传的servlet*/
                    secureuri: false,
                    fileElementId: picid, //上传input的id
                    dataType: "json",
                    type: "POST",
                    async: false,
                    success: function(data, status) {
                        console.log(data);
                        var statu = data.success;
                        if (statu == 1) {
                            nImgHasBeenSendSuccess++;
                            if (nImgHasBeenSendSuccess == $('.feedback_img_list .feedback_images').length) {
                                postAdvise(textArea, contactWay, uuid);
                            }
                        } else {
                            xxwsWindowObj.xxwsAlert("服务异常，请稍候重试");
                        }
                    },
                    error: function(data) {
                        console.log(data)
                    }
                });

            }
        } else {
            postAdvise(textArea, contactWay, uuid);
        }
        //建议的提交
        console.log({
            'description': textArea, //填写的建议
            'feedbackType': "pic", //建议类型
            'contact': contactWay, //联系方式
            'objectId': uuid //插入的主键id
        });

    }
}

function postAdvise(textArea, contactWay, uuid) {
    $.ajax({ /*http://192.168.50.235:9901*/
        url: "/cloudlink-core-framework/feedback/addAdvice",
        type: "POST",
        contentType: "application/json",
        async: false,
        data: JSON.stringify({
            'description': textArea, //填写的建议
            'feedbackType': "pic", //建议类型
            'contact': contactWay, //联系方式
            'objectId': uuid //插入的主键id
        }),
        success: function(data) {
            if (data.success == 1) {
                $(".feedback_main").hide();
                $(".feedback_success").show();
            } else {
                xxwsWindowObj.xxwsAlert("服务异常，请稍候重试");
            }
        }
    });
}
//uuid
function creatuuid() {
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {

        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = "-";
    var uuid = s.join("");
    return uuid;
}

$(".return").click(function() {
    parent.location.href = '../../main.html';
});

$("#close").click(function() {
    $('.suspensionFrame').css({ display: "none" })
})