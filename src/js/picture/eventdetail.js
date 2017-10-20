var eventcount = 0; //事件点击次数
var Mapobj = null;
var eventId = null; //事件ID
var taskId = null;
var currenteventid = null;
var event_data = null; //创建全局变量，进行事件数据的集合
$(function() {
    Mapobj = new BMap.Map("container"); //创建百度地图实例
    Mapobj.centerAndZoom(new BMap.Point(116.404, 39.915), 5); // 初始化地图,设置中心点坐标和地图级别
    Mapobj.enableScrollWheelZoom(true); //开启鼠标滚轮缩放
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
    Mapobj.addControl(bottom_left_ScaleControl);
    Mapobj.addControl(bottom_right_navigation);
    Mapobj.addControl(new BMap.MapTypeControl());
});


function load_event(eventId) {
    $.ajax({
        type: 'GET',
        url: "/cloudlink-inspection-event/eventInfo/get?token="+lsObj.getLocalStorage('token')+"&eventId=" + eventId,
        contentType: "application/json",
        dataType: "json",
        success: function(data, status) {
            var msg = data.rows;
            var images = msg[0].pic;
            $(".eventpic_list").html(''); //初始化的时候，将图片进行清空
            $(".event_code").text(msg[0].eventCode);
            $(".event_type").text(msg[0].fullTypeName); //事件类型
            $(".report_man").text(msg[0].inspectorName); //上报人
            $(".event_address").text(msg[0].address); //详细位置
            $(".event_description").text(msg[0].description); //事件描述
            $(".occurrenceTime").text(msg[0].occurrenceTime); //事件时间
            var pic_scr = "";
            if (images.length > 0) {
                for (var i = 0; i < images.length; i++) {
                    pic_scr += '<img class="show_pic" src="/cloudlink-core-file/file/getImageBySize?fileId=' + images[i] + '&viewModel=fill&width=104&hight=78" id="imagesPic' + i + '" onmouseover="bigger(e)" onmouseout="smaller(e)" alt=""/>';
                }
            } else {
                $(".pic_des").html("无");
            }
            $(".eventpic_list").append(pic_scr);

            if (msg[0].audio.length == 0) {
                $(".event_audio").html("无");
            } else {
                var audioMain = '<button  class="audioPlay" onclick="playAmrAudio(\'' + msg[0].audio[0] + '\',this)"></button>';
                $(".event_audio").html(audioMain);
            }
            //打开地图中心点
            var lon = msg[0].bdLon;
            var lat = msg[0].bdLat;
            setcenter(lon, lat); //查看详情的时候，进行中心点的设置
        }
    });
}


//进行详情展示
function view_detail() {
    $("#details").modal(); //打开详情模态框
    setTimeout(function() {
        load_event(currenteventid);
        load_task(currenteventid);
    }, 1000);
}
//加载任务
function load_task(eventId) {
    $.ajax({
        type: 'GET',
        url: "/cloudlink-inspection-task/dispose/getPageListByEventId?bizId=" + eventId + "&token=" + lsObj.getLocalStorage('token'),
        contentType: "application/json",
        dataType: "json",
        success: function(data, status) {
            var msgAll = data.rows[0].disposeList;
            $(".dispose_content").html("");
            var txt = '';
            var tempArry = [];
            var temp = "";
            for (var i = 0; i < msgAll.length; i++) {
                if (temp != msgAll[i].modifyday) {
                    tempArry.push(msgAll[i].modifyday);
                    temp = msgAll[i].modifyday;
                }
            }
            for (var j = 0; j < tempArry.length; j++) {
                txt = '<div class="dispose_date" id="day_' + j + '">' +
                    '<div class="dispose_day">' +
                    '<div class="day_dian"></div>' +
                    '<div class="day_time">' + tempArry[j] + '</div>' +
                    '</div></div>';
                $(".dispose_content").append(txt);
                for (var x = 0; x < msgAll.length; x++) {
                    var txtChild = '';
                    if (msgAll[x].modifyday == tempArry[j]) {
                        var recevieUser = msgAll[x].recevieUserName;
                        //判断接收人
                        if (recevieUser == null || recevieUser == '') {
                            recevieUser = '无';
                        }
                        txtChild = '<div class="dispose_main">' +
                            '<div class="dispose_main_l">' +
                            '<span class="dispose_time">' + msgAll[x].modifytime + '</span>' +
                            '</div>' +
                            '<div class="dispose_main_r">' +
                            '<div class="dispose_info">' +
                            '<span class="modifyUserName">' + msgAll[x].modifyUserName + '</span>&nbsp&nbsp' +
                            '<span class="disposeValue">' + msgAll[x].disposeValue + '</span>' +
                            '</div>' +
                            '<div class="dispose_info">' +
                            '<span class="info_l text-right">信息描述：</span>' +
                            '<div class="info_r">' + msgAll[x].content + '</div>' +
                            '</div>' +
                            '<div class="dispose_info">' +
                            '<span class="info_l text-right">语音描述：</span>' +
                            '<div class="info_r task_audio_' + x + '"></div>' +
                            '</div>' +
                            '<div class="dispose_info">' +
                            '<span class="info_l text-right">接收人：</span>' +
                            '<div class="info_r">' + recevieUser + '</div>' +
                            '</div>' +
                            '<div class="dispose_info">' +
                            '<span class="info_l text-right">照片：</span>' +
                            '<div class="info_r taskImg_' + x + '"></div>' +
                            '</div></div></div>';
                        $("#day_" + j).append(txtChild);
                        //添加录音文件
                        if (msgAll[x].audio.length == 0) {
                            $(".task_audio_" + x).html("无");
                        } else {
                            var audioMain = '<button  class="audioPlay" onclick="playAmrAudio(\'' + msgAll[x].audio[0] + '\',this)"></button>';
                            $(".task_audio_" + x).html(audioMain);
                        }
                        var picAll = msgAll[x].pic;
                        var pic_scr = "";
                        for (var n = 0; n < picAll.length; n++) {
                            pic_scr += '<div class="task_pic_list">' +
                                '<img  src="/cloudlink-core-file/file/getImageBySize?fileId=' + picAll[n] + '&viewModel=fill&width=104&hight=78" id="taskImagesPic' + n + '" onclick="previewPicture(this)" alt=""/>' +
                                '</div>';
                        }
                        $(".taskImg_" + x).append(pic_scr);
                    }
                }
            }
        }
    })
}

//设置地图的中心
function setcenter(lon, lat) {
    var detailsMap = new BMap.Map("details_address_map");
    var _this = this;
    detailsMap.clearOverlays();
    var point = new BMap.Point(lon, lat);
    var myIcon = new BMap.Icon("/src/images/event/personal.png", new BMap.Size(130, 130));
    var marker = new BMap.Marker(point, {
        icon: myIcon
    });

    detailsMap.addOverlay(marker);
    detailsMap.centerAndZoom(point, 15);
    // mapObj.iconHide(); //隐藏百度图标
}


function addClickHandler(ids, marker) {
    marker.addEventListener("click", function(e) {
        $(".event_list").css("display", "block");
        load_event(ids.eventid);
        currenteventid = ids.eventid;
    });
}


/*人员信息 */

//点击巡检记录箭头方向的切换
$("#collapseOne").on('shown.bs.collapse', function() {
    $(".glyphicon1").removeClass('glyphicon-menu-down');
    $(".glyphicon1").addClass('glyphicon-menu-up');

});
$('#collapseOne').on('hidden.bs.collapse', function() {
    $(".glyphicon1").removeClass('glyphicon-menu-up');
    $(".glyphicon1").addClass('glyphicon-menu-down');
});
//点击事件记录箭头方向的切换
$("#collapseTwo").on('shown.bs.collapse', function() {
    $(".glyphicon2").removeClass('glyphicon-menu-down');
    $(".glyphicon2").addClass('glyphicon-menu-up');

});
$('#collapseTwo').on('hidden.bs.collapse', function() {
    $(".glyphicon2").removeClass('glyphicon-menu-up');
    $(".glyphicon2").addClass('glyphicon-menu-down');
});
//点击X隐藏信息块
$('.closeInformation').click(function() {
    $(".panel-group").css({
        display: "none"
    });
});
//巡检记录日历控件
$("#datetimeStart").datetimepicker({
    format: 'yyyy-mm-dd',
    minView: 'month',
    language: 'zh-CN',
    autoclose: true,
    startDate: new Date()
}).on("click", function() {
    $("#datetimeStart").datetimepicker("setEndDate", $("#datetimeEnd").val())
});
$("#datetimeEnd").datetimepicker({
    format: 'yyyy-mm-dd',
    minView: 'month',
    language: 'zh-CN',
    autoclose: true,
    startDate: new Date()
}).on("click", function() {
    $("#datetimeEnd").datetimepicker("setStartDate", $("#datetimeStart").val())
});
//事件记录日历控件
$("#timeStart").datetimepicker({
    format: 'yyyy-mm-dd',
    minView: 'month',
    language: 'zh-CN',
    autoclose: true,
    startDate: new Date()
}).on("click", function() {
    $("#timeStart").datetimepicker("setEndDate", $("#timeEnd").val())
});
$("#timeEnd").datetimepicker({
    format: 'yyyy-mm-dd',
    minView: 'month',
    language: 'zh-CN',
    autoclose: true,
    startDate: new Date()
}).on("click", function() {
    $("#timeEnd").datetimepicker("setStartDate", $("#timeStart").val())
});
//人员图片切换
var peopleImg = false;
var peopleChange = $('.renyuan .changeImg');
$(peopleChange).click(function() {
    if (peopleImg) {
        $(peopleChange).attr('src', '/src/images/map/open.png');
        // show_peoplepoint();
        peopleImg = false;
    } else {
        $(peopleChange).attr('src', '/src/images/map/close.png');
        $("#accordion").css("display", "none");
        peopleImg = true;
    }
});
//事件图片切换
var eventImg = false;
var eventChange = $('.shijian .changeImg');
$(eventChange).click(function() {
    if (eventImg) {
        $(eventChange).attr('src', '/src/images/map/open.png');
        show_point();
        eventImg = false;
    } else {
        $(eventChange).attr('src', '/src/images/map/close.png')
        Mapobj.clearOverlays();
        $(".event_list").css("display", "none");
        eventImg = true;
    }
});
//在地图上面展示目前处理中的所有事件
function show_point() {
    var _data = {
        "status": "20",
        "type": "",
        "startDate": "2016-10-01",
        "endDate": new Date().Format('yyyy-MM-dd'),
        "keyword": "",
        "userIds": JSON.parse(lsObj.getLocalStorage('userBo')).objectId,
        "pageNum": 1,
        "pageSize": 10000
    }
    $.ajax({
        type: 'POST',
        url: "/cloudlink-inspection-event/eventInfo/web/v1/getPageList?token=" + lsObj.getLocalStorage('token'),
        data: JSON.stringify(_data),
        contentType: "application/json",
        dataType: "json",
        success: function(data, status) {
            event_data = data.rows;
            $(".inhand").text(event_data.length); //目前没有处理的所有事件
            var _obj = Enumerable.From(event_data).Where(function(x) {
                return x.disposeTime.split(" ")[0] == new Date().Format('yyyy-MM-dd')
            }).Select(function(x) {
                return x
            }).ToArray();
            $(".newevent").text(_obj.length); //今日新增事件
            $(".Allevent").html("");
            if (event_data.length > 0) {
                var html = "<ul>";
                for (var i = 0; i < event_data.length; i++) {
                    html += '<li class=""><div class="line01"> <span class="type">' + event_data[i].fullTypeName +
                        '</span><span class="name">' + event_data[i].inspectorName + '</span><span class="date">' + event_data[i].disposeTime +
                        '</span></div><div class="loca_desc">' + event_data[i].address + '</div> </li>';
                    /*所有事件列表的展示*/
                    eventListAndbiaozhu(event_data[i]);
                }
                html += "</ul>";
                $(".Allevent").append(html);
            }
        }
    });

}

function quite() {
    var search = $("#search").val().trim();
    var _obj = Enumerable.From(event_data).Where(function(x) {
        return x.fullTypeName.indexOf(search) >= 0
    }).Select(function(x) {
        return x
    }).ToArray();
    Mapobj.clearOverlays(); //清除
    if (_obj.length > 0) {
        $(".Allevent").html("");
        var html = "<ul>";
        for (var i = 0; i < _obj.length; i++) {
            html += '<li class=""><div class="line01"> <span class="type">' + _obj[i].fullTypeName +
                '</span><span class="name">' + _obj[i].inspectorName + '</span><span class="date">' + _obj[i].disposeTime +
                '</span></div><div class="loca_desc">' + _obj[i].address + '</div> </li>';
            /*所有事件列表的展示*/
            eventListAndbiaozhu(_obj[i]);
        }
        html += "</ul>";
        $(".Allevent").append(html);
    }
}

function eventListAndbiaozhu(data) {
    var myIcons = "";
    if (data.parentTypeId == 1) {
        myIcons = new BMap.Icon("/src/images/event/con1.png", new BMap.Size(29, 42));
    } else if (data.parentTypeId == 2) {
        myIcons = new BMap.Icon("/src/images/event/dis1.png", new BMap.Size(29, 42));
    } else if (data.parentTypeId == 3) {
        myIcons = new BMap.Icon("/src/images/event/pip1.png", new BMap.Size(29, 42));
    }
    var eventId = data.objectId;
    var point = new BMap.Point(data.bdLon, data.bdLat);
    var marKer = new BMap.Marker(point, {
        icon: myIcons
    });
    Mapobj.addOverlay(marKer);
    var ids = {
        "tsakid": data.inspectorId,
        "eventid": data.objectId
    }
    addClickHandler(ids, marKer);
}

function show_peoplepoint() {
    var point = null; //点集进行组合
    var marKer = null; //图像标注
    var myIcons = new BMap.Icon("/src/images/map/online.png", new BMap.Size(20, 20));
    var ids = null;
    var _data = {}
    $.ajax({
        type: 'GET',
        url: "/cloudlink-inspection-event/inspectionRecord/getOnline?token=" + lsObj.getLocalStorage('token'),
        data: _data,
        contentType: "application/json",
        dataType: "json",
        success: function(data, status) {
            // var result = data.rows;
            // if (result.length > 1) {
            //     for (var i = 0; i < result.length; i++) {
            //         eventId = result[i].objectI;
            //         point = new BMap.Point(result[i].bd_lon, result[i].bd_lat);
            //         marKer = new BMap.Marker(point, {
            //             icon: myIcons
            //         });
            //         Mapobj.addOverlay(marKer);
            //         ids = {
            //             "peopleid": result[i].inspectorId
            //         }
            //         addClickHandler(ids, marKer);
            //     }
            // }
        }
    });
}