$(function() {
    detailsObj.init(); //初始化-事件详情
});


//查看事件详情
var detailsObj = {
    _eventId: "",
    $detailsMap: new BMap.Map("details_address_map"),
    init: function() {
        var _this = this;
        // debugger;
        this.$detailsMap.centerAndZoom(new BMap.Point(116.404, 39.915), 5); // 初始化地图,设置中心点坐标和地图级别
        this.$detailsMap.enableScrollWheelZoom(true); //开启鼠标滚轮缩放
        //声明-比例尺控件（左下角）
        var bottom_left_ScaleControl = new BMap.ScaleControl({
            anchor: BMAP_ANCHOR_BOTTOM_LEFT
        });
        //声明-平移和缩放按钮控件（右下角）
        var bottom_right_navigation = new BMap.NavigationControl({
            anchor: BMAP_ANCHOR_BOTTOM_RIGHT,
            type: BMAP_NAVIGATION_CONTROL_SMALL
        });
        //地图加载控件
        this.$detailsMap.addControl(bottom_left_ScaleControl);
        this.$detailsMap.addControl(bottom_right_navigation);
        this.$detailsMap.addControl(new BMap.MapTypeControl());

        //详情里面打开历史检查
        $(".getHistory").click(function() {
            repairObj.openHistoryFrame(_this._eventId);
        });
    },
    setCenterZoom: function(msg) { //设置中心点
        var _this = this;
        var lon = msg[0].bdLon;
        var lat = msg[0].bdLat;
        this.$detailsMap.clearOverlays();
        var point = new BMap.Point(lon, lat);
        var myIcon = null;
        if (msg[0].status == 20) {
            if (msg[0].eventIconName) {
                myIcon = new BMap.Icon("/src/images/common/process/" + msg[0].eventIconName, new BMap.Size(29, 42));
            } else {
                myIcon = new BMap.Icon("/src/images/common/process/D01.png", new BMap.Size(29, 42));
            }
        } else {
            if (msg[0].eventIconName) {
                myIcon = new BMap.Icon("/src/images/common/finish/" + msg[0].eventIconName, new BMap.Size(29, 42));
            } else {
                myIcon = new BMap.Icon("/src/images/common/finish/D01.png", new BMap.Size(29, 42));
            }

        }
        var marker = new BMap.Marker(point, {
            icon: myIcon
        });
        this.$detailsMap.addOverlay(marker);
        this.$detailsMap.centerAndZoom(point, 15);
    },
    loadEventDetails: function(eventId) { //加载事件详情
        var _this = this;
        $.ajax({
            type: 'GET',
            url: "/cloudlink-inspection-event/eventInfo/get?token=" + lsObj.getLocalStorage('token') + "&eventId=" + eventId,
            contentType: "application/json",
            dataType: "json",
            success: function(data, status) {
                var msg = data.rows;
                _this._eventId = msg[0].objectId;
                var images = msg[0].pic;
                $(".event_pic ul").html("");
                $(".eventCode").text(msg[0].eventCode);
                $(".occurrenceTime").text(msg[0].occurrenceTime);
                $(".fullTypeName").text(msg[0].fullTypeName ? msg[0].fullTypeName : "");
                $(".inspectorName").text(msg[0].inspectorName);
                $(".address").text(msg[0].address);
                $(".description").text(msg[0].description);
                var pic_scr = "";
                if (images.length > 0) {
                    for (var i = 0; i < images.length; i++) {
                        pic_scr += '<li class="event_pic_list">' +
                            '<img  src="/cloudlink-core-file/file/getImageBySize?fileId=' + images[i] + '&viewModel=fill&width=104&hight=78" data-original="/cloudlink-core-file/file/downLoad?fileId=' + images[i] + '" id="imagesPic' + i + '" onclick="previewPicture(this)" alt=""/>' +
                            '</li>';
                    }
                } else {
                    pic_scr = "<span>无</span>";
                }

                $(".event_pic ul").append(pic_scr);

                if (msg[0].audio.length == 0) {
                    $(".event_audio").html("无");
                } else {
                    var audioMain = '<button  class="audioPlay" onclick="playAmrAudio(\'' + msg[0].audio[0] + '\',this)"></button>';
                    $(".event_audio").html(audioMain);
                }
                //打开地图中心点
                _this.setCenterZoom(msg);
            }
        });
    }
};
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