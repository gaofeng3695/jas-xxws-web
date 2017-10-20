/**
 * 
 */
var param_token = "";
var param_eventId = "";

var detailsObj = {
    init: function() {
        var _this = this;
        _this.getEventDetail();
        _this.getTaskDetail();
    },
    getEventDetail: function() {
        var _this = this;
        var w = $(".event_pic").width();
        // console.log(w + 30);
        $.ajax({
            type: 'GET',
            url: "/cloudlink-inspection-event/eventInfo/get?token=" + param_token + "&eventId=" + param_eventId,
            contentType: "application/json",
            dataType: "json",
            success: function(data, status) {
                if (data.success != 1) {
                    $("#div_event").hide();
                    $("#div_noevent").show();
                    return;
                }

                var msg = data.rows;
                var images = msg[0].pic;

                $(".occurrenceTimeT").text(msg[0].occurrenceTime);
                $(".fullTypeNameT").text(msg[0].fullTypeName);
                $(".eventCodeT").text(msg[0].eventCode);
                $(".inspectorNameT").text(msg[0].inspectorName);
                $(".addressT").text(msg[0].address);
                $(".descriptionT").text(msg[0].description);

                var pic_scr = "";
                $(".event_pic ul").html("");
                if (images.length > 0) {
                    $(".picMun").text(images.length);
                    for (var i = 0; i < images.length; i++) {
                        pic_scr += '<li class="col-xs-12 col-sm-12 col-md-12 item">' +
                            '<img  src="/cloudlink-core-file/file/getImageBySize?fileId=' + images[i] + '&viewModel=mfit&width=' + (w + 30) + '&hight=110" data-original="/cloudlink-core-file/file/downLoad?fileId=' + images[i] + '" id="imagesPic' + i + '" alt=""/>' +
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
                (function() {
                    var node_pics = document.getElementsByClassName('item');
                    var big_pic_urls = [];
                    var leng = node_pics.length;
                    Array.prototype.forEach.call(node_pics, function(node, index) {
                        var src = node.firstChild.getAttribute("data-original");
                        big_pic_urls.push(src);
                        //监听点击事件
                        new util.toucher(node).on('singleTap', function() {
                            new swiper(big_pic_urls, index, leng);
                        });
                        //偷偷加载图片
                        new Image().src = big_pic_urls[index];
                    });
                })();
            }
        });
    },
    getTaskDetail: function() {
        var _this = this;
        $.ajax({
            type: 'GET',
            url: "/cloudlink-inspection-task/dispose/getPageListByEventId?token=" + param_token + "&bizId=" + param_eventId,
            contentType: "application/json",
            dataType: "json",
            success: function(data, status) {
                if (data.success != 1) {
                    $("#div_event").hide();
                    $("#div_noevent").show();
                    return;
                }
                var _data = data.rows[0].disposeList;
                console.log(_data);
                if (_data.length > 0) {
                    var tempArry = [];
                    var temp = "";
                    for (var i = 0; i < _data.length; i++) {
                        if (temp != _data[i].modifyday) {
                            tempArry.push(_data[i].modifyday);
                            temp = _data[i].modifyday;
                        }
                    }
                    for (var j = 0; j < tempArry.length; j++) {
                        option = '<div class="task_day">' +
                            '<h3 class="">' + tempArry[j] + '</h3>' +
                            '<ul class="day' + j + '">' +
                            '</ul>' +
                            '</div>';
                        $(".taskMain").append(option);
                        var queryResult = Enumerable.From(_data)
                            .Where(function(x) { return x.modifyday == tempArry[j] })
                            .ToArray()
                            .forEach(function(x) {
                                var optionChild = '';
                                optionChild += '<li class="disposal_list" onclick="open_disposal_details(this)">' +
                                    '<input type="hidden" name="objectId" value="' + x.objectId + '"/>' +
                                    '<input type="hidden" name="typeCode" value="' + x.typeCode + '"/>' +
                                    '<span class="time">' + x.modifytime + '</span>' +
                                    '<div class="task_con">' +
                                    '<div class="task_title">' +
                                    '<span class="title_l">' + x.disposeValue + '</span>' +
                                    '<span class="title_r">' + x.modifyUserName + '</span>' +
                                    '</div>' +
                                    '<div class="task_text">' + x.content + '</div>' +
                                    '</div>' +
                                    '</li>';
                                $(".day" + j).append(optionChild);
                            });
                    }
                }
            }
        });
    }
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
};



$(function() {
    param_token = GetQueryString("a");
    param_eventId = GetQueryString("b");
    detailsObj.init();
    var myTouch = util.toucher(document.getElementById('details_nav'));
    myTouch.on('swipeLeft', function(e) {
        console.log("左");
        $('#taskBtn').tab('show');
    }).on('swipeRight', function(e) {
        console.log("右");
        $('#eventBtn').tab('show');
    });
});


function GetQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
}