$(function() {
    enterprisedObj.init();
});
/*删除图片*/
function closebusinessImg(e) {
    $(e).closest(".business_enterprise_images").remove();
    for (var i = 0; i < $(".business_img_file").find("input[name='file']").length; i++) {
        if ($(".business_img_file").find("input").eq(i).attr("data-value") == $(e).attr("data-key")) {
            $(".business_img_file").find("input").eq(i).remove();
        }
    }

}
/*删除图片*/
function closeIndefityImg(e) {
    $(e).closest(".identify_enterprise_images").remove();
    for (var i = 0; i < $(".identify_img_file").find("input[name='file']").length; i++) {
        if ($(".identify_img_file").find("input").eq(i).attr("data-value") == $(e).attr("data-key")) {
            $(".identify_img_file").find("input").eq(i).remove();
        }
    }

}
/*删除图片*/
function closeRoseImg(e) {
    $(e).closest(".rose_enterprise_images").remove();
    for (var i = 0; i < $(".rose_img_file").find("input[name='file']").length; i++) {
        if ($(".rose_img_file").find("input").eq(i).attr("data-value") == $(e).attr("data-key")) {
            $(".rose_img_file").find("input").eq(i).remove();
        }
    }

}
var enterprisedObj = {
    $submitApplay: $(".submitApplay"), //提交申请，打开信息填写界面
    $authentication: $(".authentication"), //进入认证信息页面
    $returnPage: $(".returnPage"), //返回企业信息展示页面
    $returnInformPage: $(".returnInformPage"), //返回认证告知页面
    $submitInformation: $("#submitInformation"),
    $addBusinessImg: $(".addBusinessImg"), //点击选择营业执照
    $addidentifyImg: $(".addidentifyImg"), //上传法人身份证
    $addroseImg: $(".addroseImg"), //上传企业人员花名册
    $flag: true, //用于将按钮进行锁死操作。
    imgIndex: 0,
    userBo: JSON.parse(lsObj.getLocalStorage("userBo")),
    init: function() {
        this.authenticationstatus();
        this.bindEvent();
    },
    bindEvent: function() {
        var that = this;
        that.$authentication.click(function() { //认证第一步
            $(".enterpriseBasicInfo").hide();
            $(".certification_main").show();
        });
        that.$submitApplay.click(function() { //认证第二步
            $(".certification_main").hide();
            $(".enterpriseInformation").show();
            $("#enterpriseName").val(that.userBo.enterpriseName);
        });
        that.$returnPage.click(function() { //认证第二步 里面的 返回
            $(".certification_main").hide();
            $(".enterpriseBasicInfo").show();
        });
        that.$submitInformation.click(function() { //认证第三步
            if (that.$flag) {
                if (that.verify()) {
                    that.$flag = false;
                    that.subBusinessmitImg();
                }
            }
        });
        that.$returnInformPage.click(function() { //认证第三步 里面的 返回
            $(".enterpriseInformation").hide();
            $(".certification_main").show();
        });
        /*上传营业执照进行验证*/
        that.$addBusinessImg.click(function() {
            var imgNum = $(".business_img_list").find(".business_enterprise_images").length;
            if (imgNum <= 2) {
                $(".upload_business_picture").trigger("click");
            } else {
                xxwsWindowObj.xxwsAlert("最多上传三张图片");
            }
        });
        /**上传法人身份证进行验证 */
        that.$addidentifyImg.click(function() {
            var imgNum = $(".identify_img_list").find(".identify_enterprise_images").length;
            if (imgNum <= 1) {
                $(".upload_identify_picture").trigger("click");
            } else {
                xxwsWindowObj.xxwsAlert("最多上传两张图片");
            }
        });
        /*上传企业人员花名册 */
        that.$addroseImg.click(function() {
            var imgNum = $(".rose_img_list").find('.rose_enterprise_images').length;
            if (imgNum <= 5) {
                $(".upload_rose_picture").trigger("click");
            } else {
                xxwsWindowObj.xxwsAlert("最多上传6张图片");
            }
        });
    },
    authenticationstatus: function() { //获取当前企业的认证状态 0未认证；-1驳回状态；1通过认证；2等待认证
        var that = this;
        var _data = {
            "enterpriseId": that.userBo.enterpriseId
        }
        $.ajax({
            type: 'post',
            url: '/cloudlink-core-framework/commonData/enterpriseApp/getPageList?token=' + lsObj.getLocalStorage("token"),
            contentType: "application/json",
            data: JSON.stringify(_data),
            success: function(data) {
                if (data.success == 1) {
                    $(".enterpriseBasicInfo .enterpriseName").text(data.rows[0].enterpriseName);
                    // if (data.rows[0].enterpriseScale == 1) {
                    //     $(".enterpriseBasicInfo  .enterpriseScale").text("50人以下");
                    // } else if (data.rows[0].enterpriseScale == 2) {
                    //     $(".enterpriseBasicInfo  .enterpriseScale").text("50-100人");
                    // } else if (data.rows[0].enterpriseScale == 3) {
                    //     $(".enterpriseBasicInfo  .enterpriseScale").text("100-200人");
                    // } else if (data.rows[0].enterpriseScale == 4) {
                    //     $(".enterpriseBasicInfo .enterpriseScale").text("200-500人");
                    // } else {
                    //     $(".enterpriseBasicInfo .enterpriseScale").text("500人以上");
                    // }
                    var limitUseCount = data.rows[0].upperLimitUserCount;
                    var versionName = data.rows[0].versionName;
                    if (data.rows[0].payStatus == 1) {
                        $(".enterpriseBasicInfo .payStatus").text("（免费）");
                    } else if (data.rows[0].payStatus == 2) {
                        $(".enterpriseBasicInfo .payStatus").text("（试用）");
                    }
                    $(".enterpriseBasicInfo .useVersion").text(versionName);
                    var html1 = '<span class="curentCount">' +
                        data.rows[0].currentUserCount +
                        '</span> / <span>' + limitUseCount + '</span>';
                    $(".enterpriseBasicInfo  .enterpriseScale").html(html1);
                    if (data.rows[0].currentUserCount > data.rows[0].upperLimitUserCount) {
                        $('.enterpriseScale').children().eq(0).addClass('red');
                    } else {
                        $('.enterpriseScale').children().eq(0).removeClass('red');
                    }


                    $(".enterpriseBasicInfo .enterpriseCreateTime").text(data.rows[0].enterpriseRegisterTime);
                    console.log(data.rows[0].payStatus);
                    console.log(data.rows[0].versionName);
                    if (data.rows[0].expireTime == null || (data.rows[0].payStatus == 1 && data.rows[0].versionName == "免费版")) {
                        $(".enterpriseBasicInfo .expireTime").text("无");
                    } else {
                        $(".enterpriseBasicInfo .expireTime").text(data.rows[0].expireTime);

                    }
                    if (data.rows[0].authenticateStatus == 0) { //未认证
                        $(".resultImg").css({ "background": "url(/src/images/common/noalready.png) no-repeat" });
                        $(".informResult").hide();
                        $(".authentication").show();
                    } else if (data.rows[0].authenticateStatus == 1) { //通过认证
                        $(".resultImg").css({ "background": "url(/src/images/common/already.png) no-repeat" });
                        $(".informResult").hide();
                        $(".authentication").hide();
                    } else if (data.rows[0].authenticateStatus == -1) { //驳回状态
                        $(".resultImg").css({ "background": "url(/src/images/common/noalready.png) no-repeat" });
                        $(".informResult").show();
                        $(".authentication").show();
                        $(".authentication span").text("重新认证");
                        that.searchIdea(); //如果是驳回状态需要二次提交，
                    } else if (data.rows[0].authenticateStatus == 2) { //等待认证
                        $(".resultImg").css({ "background": "url(/src/images/common/noalready.png) no-repeat" });
                        $(".authentication").hide();
                        $(".informResult").show();
                        $(".informResult span").text("认证审核已提交成功，正在审核中...");
                    }
                } else {
                    $(".enterpriseBasicInfo").hide();
                    xxwsWindowObj.xxwsAlert("企业不存在");
                }
            }
        });
    },
    verify: function() {
        var that = this;
        if (!that.checkEnterprised()) {
            return false;
        } else if (!that.checkEnterpriseCode()) {
            return;
        } else if (!that.checkBusinessImg()) {
            return false;
        } else {
            return true;
        }
    }, //企业认证所需要的信息进行必填判断
    subBusinessmitImg: function() { //进行图片的上传
        var that = this;
        var imgLength = $(".business_img_list").find(".business_enterprise_images").length;
        if (imgLength == that.imgIndex) {
            that.imgIndex = 0;
            that.submitIdentify();
        } else {
            var picid = $('.business_img_file').find('input').eq(that.imgIndex).attr('id');
            this.subBusinessmitImgSycn(picid);
        }
    },
    subBusinessmitImgSycn: function(_picid) {
        var that = this;
        $.ajaxFileUpload({
            url: "/cloudlink-core-file/attachment/web/v1/save?businessId=" + that.userBo.enterpriseId + "&bizType=pic_business&token=" + lsObj.getLocalStorage("token"),
            /*这是处理文件上传的servlet*/
            secureuri: false,
            fileElementId: _picid, //上传input的id
            dataType: "json",
            type: "POST",
            async: false,
            success: function(data, status) {
                var statu = data.success;
                if (statu == 1) {
                    that.imgIndex = that.imgIndex + 1;
                    that.subBusinessmitImg();
                } else {
                    xxwsWindowObj.xxwsAlert("当前网络不稳定", function() {
                        that.imgIndex = 0;
                        that.again();
                    });
                }
            }
        });
    },
    submitIdentify: function() {
        var that = this;
        var num = $(".identify_img_list").find(".identify_enterprise_images").length;
        if (num == 0 || num == that.imgIndex) {
            that.imgIndex = 0;
            that.submitRose();
        } else {
            var picid = $('.identify_img_file').find('input').eq(that.imgIndex).attr('id');
            that.submitIdentifySycn(picid);
        }
    },
    submitIdentifySycn: function(_picid) {
        var that = this;
        $.ajaxFileUpload({
            url: "/cloudlink-core-file/attachment/web/v1/save?businessId=" + that.userBo.enterpriseId + "&bizType=pic_identity&token=" + lsObj.getLocalStorage("token"),
            /*这是处理文件上传的servlet*/
            secureuri: false,
            fileElementId: _picid, //上传input的id
            dataType: "json",
            type: "POST",
            async: false,
            success: function(data, status) {
                var statu = data.success;
                if (statu == 1) {
                    that.imgIndex = that.imgIndex + 1;
                    that.submitIdentify();
                } else {
                    xxwsWindowObj.xxwsAlert("当前网络不稳定", function() {
                        that.imgIndex = 0;
                        that.again();
                    });
                }
            }
        });
    },
    submitRose: function() {
        var that = this;
        var num = $(".rose_img_list").find(".rose_enterprise_images").length;
        if (num == 0 || num == that.imgIndex) {
            that.fillInformation();
        } else {
            var picid = $('.rose_img_file').find('input').eq(that.imgIndex).attr('id');
            that.submitRoseSycn(picid);
        }
    },
    submitRoseSycn: function(_picid) {
        var that = this;
        $.ajaxFileUpload({
            url: "/cloudlink-core-file/attachment/web/v1/save?businessId=" + that.userBo.enterpriseId + "&bizType=pic_roster&token=" + lsObj.getLocalStorage("token"),
            /*这是处理文件上传的servlet*/
            secureuri: false,
            fileElementId: _picid, //上传input的id
            dataType: "json",
            type: "POST",
            async: false,
            success: function(data, status) {
                var statu = data.success;
                if (statu == 1) {
                    that.imgIndex = that.imgIndex + 1;
                    that.submitRose();
                } else {
                    xxwsWindowObj.xxwsAlert("当前网络不稳定", function() {
                        that.imgIndex = 0;
                        that.again();
                    });
                }
            }
        });
    },
    fillInformation: function() { //进行企业信息的填写
        var that = this;
        var enterpriseName = $("#enterpriseName").val().trim();
        var enterpriseCode = $("#enterpriseCode").val().trim();
        $.ajax({
            type: 'POST',
            url: '/cloudlink-core-framework/enterprise/authenticate?token=' + lsObj.getLocalStorage("token"),
            contentType: "application/json",
            data: JSON.stringify({ "objectId": that.userBo.enterpriseId, "enterpriseName": enterpriseName, "registerNum": enterpriseCode }),
            dataType: "json",
            success: function(data) {
                if (data.success == 1) {
                    var defaultOptions = {
                        tip: '申请成功',
                        name_title: '提示',
                        name_confirm: '确定',
                        callBack: function() {
                            $(".enterpriseInformation").hide();
                            $(".authentication").hide();
                            $(".enterpriseBasicInfo").show();
                            $(".informResult").show();
                            $(".informResult span").text("认证审核已提交成功，正在审核中...");
                        }
                    };
                    xxwsWindowObj.xxwsAlert(defaultOptions);
                } else if (data.code == "402") {
                    xxwsWindowObj.xxwsAlert("您好，该公司名称已被占用，请联系客服。", function() {
                        that.imgIndex = 0;
                        that.deleteImgByEnterpriseId(); //处于当前页面，可以再次进行提交数据
                    });

                } else {
                    xxwsWindowObj.xxwsAlert("当前网络不稳定", function() {
                        that.imgIndex = 0;
                        that.deleteImgByEnterpriseId(); //处于当前页面，可以再次进行提交数据

                    });
                }

            }
        });
    },
    deleteImgByEnterpriseId: function() { //二次上传的时候，进行以前上传的文件先进行删除
        var that = this;
        var bizArray = ["pic_business", "pic_identity", "pic_roster"];
        var enterArray = [that.userBo.enterpriseId];
        $.ajax({
            type: 'POST',
            contentType: "application/json",
            url: '/cloudlink-core-file/attachment/delBizAndFileByBizIdsAndBizAttrs?token=' + lsObj.getLocalStorage("token"),
            data: JSON.stringify({ "bizTypes": bizArray, "bizIds": enterArray }),
            dataType: "json",
            success: function(data) {
                if (data.success == 1) {
                    that.again();
                    $(".enterpriseBasicInfo").hide();
                    $(".enterpriseInformation").show();
                    $("#enterpriseName").val(that.userBo.enterpriseName);
                } else {
                    xxwsWindowObj.xxwsAlert("当前网络不稳定", function() {
                        that.again();
                    });
                }
            }
        });
    },
    viewEnterpriseInformation: function() { //查看企业信息  暂留功能
        var that = this;
        $.ajax({
            type: "GET",
            dataType: "json",
            url: '/cloudlink-core-framework/enterprise/getById?token=' + lsObj.getLocalStorage("token"),
            data: { "objectId": that.userBo.enterpriseId },
            success: function(data) {
                if (data.success == 1) {
                    $("#enterpriseNames").val(data.rows[0].enterpriseName);
                    $("#enterpriseCodes").val(data.rows[0].registerNum);
                    that.viewBusinessImg();
                }
            }
        });
    },
    viewBusinessImg: function() {
        var that = this;
        $.ajax({
            type: "GET",
            dataType: "json",
            url: '/cloudlink-core-file/attachment/getFileIdListByBizIdAndBizAttr?token=' + lsObj.getLocalStorage("token"),
            data: { "businessId": that.userBo.enterpriseId, "bizType": 'pic_business' },
            success: function(data) {
                // alert(JSON.stringify(data));
                if (data.success == 1) {
                    var imagesL = "";
                    for (var i = 0; i < data.rows.length; i++) {
                        var path = "/cloudlink-core-file/file/getImageBySize?fileId=" + data.rows[i].fileId + "&viewModel=fill&width=120&hight=82";
                        imagesL += '<li><img src="' + path + ' " data-original="/cloudlink-core-file/file/downLoad?fileId=' + data.rows[i].fileId + '" id="imagesBusiness' + i + '" onclick="previewPicture(this)" alt=""/></li>';

                    }
                    $(".business_list").append(imagesL);
                    that.viewIdentifyImg();
                }
            }
        });
    },
    viewIdentifyImg: function() {
        var that = this;
        $.ajax({
            type: "GET",
            dataType: "json",
            url: '/cloudlink-core-file/attachment/getFileIdListByBizIdAndBizAttr?token=' + lsObj.getLocalStorage("token"),
            data: { "businessId": that.userBo.enterpriseId, "bizType": 'pic_identity' },
            success: function(data) {
                if (data.success == 1) {
                    var imagesL = "";
                    //  图片的预览功能
                    if (data.rows.length == 0) {
                        $(".identifyImg").css('display', 'none');
                    } else {
                        for (var i = 0; i < data.rows.length; i++) {
                            var path = "/cloudlink-core-file/file/getImageBySize?fileId=" + data.rows[i].fileId + "&viewModel=fill&width=120&hight=82";
                            imagesL += '<li><img src="' + path + '" data-original="/cloudlink-core-file/file/downLoad?fileId=' + data.rows[i].fileId + '" id="imagesIdentify' + i + '" onclick="previewPicture(this)" alt=""/><li>';

                        }
                        $(".identify_list").append(imagesL);
                    }

                }
            }
        });
    },
    checkEnterprised: function() {
        var enterpriseName = $("#enterpriseName").val().trim();
        if (enterpriseName.length === 0) {
            $(".enterprisenote").text("请输入企业名称");
            return false;
        } else if (/[^(A-Za-z_\-\u4e00-\u9fa5)]/.test(enterpriseName) === true) {
            $(".enterprisenote").text("企业名称只能由汉字、字母、下划线组成");
            return false;
        } else if (enterpriseName.length < 2) {
            $(".enterprisenote").text("您输入的企业名称过短");
            return false;
        } else if (enterpriseName.length > 30) {
            $(".enterprisenote").text("您输入的企业名称过长");
            return false;
        } else {
            $(".enterprisenote").text("");
            return true;
        }
    },
    checkEnterpriseCode: function() {
        var enterpriseCode = $("#enterpriseCode").val().trim();
        if (enterpriseCode == "" || enterpriseCode == "请填写社会统一信用代码（必填）") {
            $(".noteCode").text("请输入社会统一信用代码");
            return false;
        } else {
            $(".noteCode").text("");
            return true;
        }
    },
    checkBusinessImg: function() {
        if ($(".business_img_list").find(".business_enterprise_images").length == 0) {
            $(".businessnote").text("请至少上传一张营业执照");
            return false;
        } else {
            $(".businessnote").text("");
            return true;
        }

    },
    searchIdea: function() { //获取驳回意见
        $.ajax({
            type: 'get',
            dataType: "json",
            url: '/cloudlink-core-framework/enterprise/getAuthApproveContent?token=' + lsObj.getLocalStorage("token"),
            data: { "enterpriseId": this.userBo.enterpriseId },
            success: function(data) {
                if (data.success == 1) {
                    if (data.rows[0].approveContent != "" && data.rows[0].approveContent != null) {
                        $(".informResult span").text("审核未通过，未通过原因：【" + data.rows[0].approveContent + "】");
                    } else {
                        $(".informResult span").text("无驳回意见");
                        $(".authentication").text("重新认证");
                    }
                } else {
                    $(".authentication").text("重新认证");
                    $(".informResult span").text("无驳回意见");
                }
            }
        });
    },
    again: function() {
        this.$flag = true;
    }
}
$("#enterpriseName").blur(function() {
    enterprisedObj.checkEnterprised();
});
$("#enterpriseCode").blur(function() {
    enterprisedObj.checkEnterpriseCode();
});
//查看大图
function previewPicture(e) {
    viewPicObj.viewPic(e);
};