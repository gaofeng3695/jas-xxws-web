/*
 *历史检查详情模态框
 */
var historyDetailsObj = {
    $historyDetailsFrame: $("#historyDetailsFrame"), //检查详情模态框
    $historyAddressMap: new BMap.Map("historyAddressMap"),
    $deleteBtn: $(".deleteHistory"),
    $exportBtn: $(".exportHistory"),
    _recordId: null,
    init: function() {
        var _this = this;
        _this.$historyAddressMap.centerAndZoom(new BMap.Point(116.404, 39.915), 15); // 初始化地图,设置中心点坐标和地图级别
        _this.$historyAddressMap.enableScrollWheelZoom(true); //开启鼠标滚轮缩放
        //删除
        _this.$deleteBtn.click(function() {
            var defaultOptions = {
                tip: '您是否删除该设施检查记录？',
                name_title: '提示',
                name_cancel: '取消',
                name_confirm: '确定',
                isCancelBtnShow: true,
                callBack: function() {
                    _this.deleteHistory(_this._recordId);
                }
            };
            xxwsWindowObj.xxwsAlert(defaultOptions);
        });
        //导出
        _this.$exportBtn.click(function() {
            _this.exportHistory(_this._recordId);
        });
    },
    clearHistoryDetails: function() { //情况数据
        var _this = this;
        $(".facilityCheckTimeH").text("---");
        $(".createUserNameH").text("---");
        $(".facilityTypeNameH").text("---");
        $(".facilityNameH").text("---");
        $(".addressH").text("---");

        $(".isLeakageNameH").text("---");
        $(".combustibleGasConcentrationH").text("---");
        $(".isFacilityWorkNameH").text("---");
        $(".facilityWorkDescH").text("---");
        $(".facilityCheckResultNameH").text("---");

        $(".additionalBox").html('');

        $(".historyAudio").html("<span>无</span>");
        $(".historyImg").html("<span>无</span>");
        $(".remarkH").text("---");
        _this.$historyAddressMap.clearOverlays(); //清除所以的点
        _this.$deleteBtn.hide();
    },
    boxMain: function(data) { //判断类型不同内容不同
        var box = '';
        switch (data.facilityTypeCode) {
            case 'FT_01':
                box = '<div class="planList">' +
                    '<div class="planListHalf">' +
                    '<div class="planListLeft">进口压力(kPa)</div>' +
                    '<div class="planListRight">' +
                    '<p class="pressureInH">' + data.pressureIn + '</p>' +
                    '</div>' +
                    '</div>' +
                    '<div class="planListHalf">' +
                    '<div class="planListLeft">出口压力(kPa)</div>' +
                    '<div class="planListRight">' +
                    '<p class="pressureOutH">' + data.pressureOut + '</p>' +
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '<div class="planList">' +
                    '<div class="planListLeft">压力是否正常</div>' +
                    '<div class="planListRight textarea_text">' +
                    '<p class="pressureSituationNameH">' + data.pressureSituationName + '</p>' +
                    '</div>' +
                    '</div>';
                break;
            case 'FT_04':
                box = '<div class="planList">' +
                    '<div class="planListHalf">' +
                    '<div class="planListLeft">井内有无积水</div>' +
                    '<div class="planListRight">' +
                    '<p class="isSeeperNameH">' + data.isSeeperName + '</p>' +
                    '</div>' +
                    '</div>' +
                    '<div class="planListHalf">' +
                    '<div class="planListLeft">井盖是否损坏</div>' +
                    '<div class="planListRight">' +
                    '<p class="isWellCoverDamageNameH">' + data.isWellCoverDamageName + '</p>' +
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '<div class="planList">' +
                    '<div class="planListLeft">有无占压</div>' +
                    '<div class="planListRight textarea_text">' +
                    '<p class="isOccupyNameH">' + data.isOccupyName + '</p>' +
                    '</div>' +
                    '</div>';
                break;
            case 'FT_10':
                box = '<div class="planList">' +
                    '<div class="planListHalf">' +
                    '<div class="planListLeft">压力是否正常</div>' +
                    '<div class="planListRight">' +
                    '<p class="pressureSituationNameH">' + data.pressureSituationName + '</p>' +
                    '</div>' +
                    '</div>' +
                    '<div class="planListHalf">' +
                    '<div class="planListLeft">流量计读数(m<sup>3</sup>)</div>' +
                    '<div class="planListRight">' +
                    '<p class="flowmeterDataH">' + data.flowmeterData + '</p>' +
                    '</div>' +
                    '</div>' +
                    '</div>';
                break;
            default:
                box = '';
        }
        return box;
    },
    setCenterZoom: function(data) { //设置中心点
        var point = new BMap.Point(data.facilityBdLon, data.facilityBdLat);
        var marker = new BMap.Marker(point); // 创建标注
        this.$historyAddressMap.addOverlay(marker); // 将标注添加到地图中
        this.$historyAddressMap.setCenter(point);
    },
    geiHistoryDetails: function(id) { //获取详情
        var _this = this;
        var param = {
            objectId: id
        }
        $.ajax({
            type: "GET",
            url: "/cloudlink-inspection-event/facilityRecord/get?token=" + lsObj.getLocalStorage('token'),
            contentType: "application/json",
            data: param,
            dataType: "json",
            success: function(data) {
                if (data.success == 1) {
                    _this._recordId = data.rows[0].objectId;

                    $(".facilityCheckTimeH").text(data.rows[0].facilityCheckTime);
                    $(".createUserNameH").text(data.rows[0].createUserName);
                    $(".facilityTypeNameH").text(data.rows[0].facilityTypeName);
                    $(".facilityNameH").text(data.rows[0].facilityName);
                    $(".addressH").text(data.rows[0].address);

                    $(".isLeakageNameH").text(data.rows[0].isLeakageName);
                    $(".combustibleGasConcentrationH").text(data.rows[0].combustibleGasConcentration);
                    $(".isFacilityWorkNameH").text(data.rows[0].isFacilityWorkName);
                    $(".facilityWorkDescH").text(data.rows[0].facilityWorkDesc);
                    $(".facilityCheckResultNameH").text(data.rows[0].facilityCheckResultName);

                    var txt = _this.boxMain(data.rows[0]);
                    $(".additionalBox").html(txt);
                    _this.setCenterZoom(data.rows[0]);
                    // $(".historyAudio").html("<span>无</span>");
                    // $(".historyImg").html("<span>无</span>");
                    $(".remarkH").text(data.rows[0].remark);

                    var txtReImg = "";
                    if (data.rows[0].pic.length > 0) {
                        for (var i = 0; i < data.rows[0].pic.length; i++) {
                            txtReImg += '<li class="event_pic_list">' +
                                '<img  src="/cloudlink-core-file/file/getImageBySize?fileId=' + data.rows[0].pic[i] + '&viewModel=fill&width=104&hight=78" data-original="/cloudlink-core-file/file/downLoad?fileId=' + data.rows[0].pic[i] + '" onclick="previewPicture(this)" alt=""/>' +
                                '</li>';
                        }
                        $(".historyImg").html(txtReImg);
                    }
                    if (data.rows[0].audio.length > 0) {
                        var audioMain = '<button  class="audioPlay" onclick="playAmrAudio(\'' + data.rows[0].audio[0] + '\',this)"></button>';
                        $(".historyAudio").html(audioMain);
                    }
                    //判断底部的按钮
                    var userId = JSON.parse(lsObj.getLocalStorage('userBo')).objectId;
                    if (JSON.parse(lsObj.getLocalStorage('userBo')).isSysadmin == 1) {
                        _this.$deleteBtn.show();
                    } else {
                        if (data.rows[0].createUserId == userId) {
                            _this.$deleteBtn.show();
                        } else {
                            _this.$deleteBtn.hide();
                        }
                    }

                } else {
                    xxwsWindowObj.xxwsAlert('获取设施检查记录详情失败');
                }
            },
            error: function() {
                xxwsWindowObj.xxwsAlert('获取设施检查记录详情失败');
            }
        });
    },
    deleteHistory: function(id) { //删除检查记录
        var recordObj = {
            objectId: id
        };
        $.ajax({
            type: 'POST',
            url: "/cloudlink-inspection-event/facilityRecord/delete?token=" + lsObj.getLocalStorage('token'),
            contentType: "application/json",
            data: JSON.stringify(recordObj),
            dataType: "json",
            success: function(data, status) {
                if (data.success == 1) {
                    var defaultOptions = {
                        tip: '设施检查记录删除成功！',
                        name_title: '提示',
                        name_cancel: '取消',
                        name_confirm: '确定',
                        isCancelBtnShow: false,
                        callBack: function() {
                            window.location.reload();
                        }
                    };
                    xxwsWindowObj.xxwsAlert(defaultOptions);
                } else {
                    if (data.code == 410) {
                        xxwsWindowObj.xxwsAlert("您没有删除设施检查记录的权限！");
                    }
                    xxwsWindowObj.xxwsAlert("设施检查记录删除失败！");
                }
            }
        });
    },
    exportHistory: function(id) { //根据id导出数据
        var _this = this;
        var expoerParam = {
            "facilityCheckResult": "",
            "isLeakage": "",
            "facilityTypeCode": "",
            "facilityId": "",
            "startDate": "", //开始日期
            "endDate": "", //结束日期
            "keywordWeb": "", //高级搜索关键词
            "pageNum": 1, //第几页
            "pageSize": 10, //每页记录数
            "idList": []
        };
        expoerParam.idList.push(id);
        _this.expoerData(expoerParam);
    },
    expoerData: function(date) {
        var options = {
            "url": '/cloudlink-inspection-event/facilityRecord/exportWord?token=' + lsObj.getLocalStorage('token'),
            "data": date,
            "method": 'post'
        }
        this.downLoadFile(options);
    },
    downLoadFile: function(options) {
        var config = $.extend(true, {
            method: 'post'
        }, options);
        var $iframe = $('<iframe id="down-file-iframe" />');
        var $form = $('<form target="down-file-iframe" method="' + config.method + '" />');
        $form.attr('action', config.url);
        for (var key in config.data) {
            $form.append('<input type="hidden" name="' + key + '" value="' + config.data[key] + '" />');
        }
        $iframe.append($form);
        $(document.body).append($iframe);
        $form[0].submit();
        $iframe.remove();
    },
};

$(function() {
    historyDetailsObj.init();
});

//查看大图
function previewPicture(e) {
    viewPicObj.viewPic(e);
};

//录音文件的播放
function playAmrAudio(_fileId, e) {
    if (!!window.ActiveXObject || "ActiveXObject" in window) {
        xxwsWindowObj.xxwsAlert("IE浏览器暂不支持录音文件的播放，建议使用Chrome、Firefox等浏览器！");
        return true;
    } else {
        $.ajax({
            type: 'GET',
            url: "/cloudlink-core-file/file/getUrlByFileId?fileId=" + _fileId,
            contentType: "application/json",
            dataType: "json",
            success: function(data, status) {
                var relativePath = data.rows[0].fileUrl.replace(/^.*?\:\/\/[^\/]+/, "");
                fetchBlob('/audio' + relativePath, function(blob) {
                    playAmrBlob(blob);
                });

                $(e).attr("class", "audioPlayIn");
                setTimeout(function() {
                    $(e).attr("class", "audioPlay");
                }, 10000);
            }
        });
    }
}