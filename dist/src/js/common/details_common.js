function previewPicture(e){viewPicObj.viewPic(e)}function playAmrAudio(e,t){if(window.ActiveXObject||"ActiveXObject"in window)return xxwsWindowObj.xxwsAlert("IE浏览器暂不支持录音文件的播放，建议使用Chrome、Firefox等浏览器！"),!0;$.ajax({type:"GET",url:"/cloudlink-core-file/file/getUrlByFileId?fileId="+e,contentType:"application/json",dataType:"json",success:function(e,i){var n=e.rows[0].fileUrl.replace(/^.*?\:\/\/[^\/]+/,"");fetchBlob("/audio"+n,function(e){playAmrBlob(e)}),$(t).attr("class","audioPlayIn"),setTimeout(function(){$(t).attr("class","audioPlay")},1e4)}})}$(function(){detailsObj.init()});var detailsObj={_eventId:"",$detailsMap:new BMap.Map("details_address_map"),init:function(){var e=this;this.$detailsMap.centerAndZoom(new BMap.Point(116.404,39.915),5),this.$detailsMap.enableScrollWheelZoom(!0);var t=new BMap.ScaleControl({anchor:BMAP_ANCHOR_BOTTOM_LEFT}),i=new BMap.NavigationControl({anchor:BMAP_ANCHOR_BOTTOM_RIGHT,type:BMAP_NAVIGATION_CONTROL_SMALL});this.$detailsMap.addControl(t),this.$detailsMap.addControl(i),this.$detailsMap.addControl(new BMap.MapTypeControl),$(".getHistory").click(function(){repairObj.openHistoryFrame(e._eventId)})},setCenterZoom:function(e){var t=e[0].bdLon,i=e[0].bdLat;this.$detailsMap.clearOverlays();var n=new BMap.Point(t,i),a=null;a=20==e[0].status?e[0].eventIconName?new BMap.Icon("/src/images/common/process/"+e[0].eventIconName,new BMap.Size(29,42)):new BMap.Icon("/src/images/common/process/D01.png",new BMap.Size(29,42)):e[0].eventIconName?new BMap.Icon("/src/images/common/finish/"+e[0].eventIconName,new BMap.Size(29,42)):new BMap.Icon("/src/images/common/finish/D01.png",new BMap.Size(29,42));var o=new BMap.Marker(n,{icon:a});this.$detailsMap.addOverlay(o),this.$detailsMap.centerAndZoom(n,15)},loadEventDetails:function(e){var t=this;$.ajax({type:"GET",url:"/cloudlink-inspection-event/eventInfo/get?token="+lsObj.getLocalStorage("token")+"&eventId="+e,contentType:"application/json",dataType:"json",success:function(e,i){var n=e.rows;t._eventId=n[0].objectId;var a=n[0].pic;$(".event_pic ul").html(""),$(".eventCode").text(n[0].eventCode),$(".occurrenceTime").text(n[0].occurrenceTime),$(".fullTypeName").text(n[0].fullTypeName?n[0].fullTypeName:""),$(".inspectorName").text(n[0].inspectorName),$(".address").text(n[0].address),$(".description").text(n[0].description);var o="";if(a.length>0)for(var l=0;l<a.length;l++)o+='<li class="event_pic_list"><img  src="/cloudlink-core-file/file/getImageBySize?fileId='+a[l]+'&viewModel=fill&width=104&hight=78" data-original="/cloudlink-core-file/file/downLoad?fileId='+a[l]+'" id="imagesPic'+l+'" onclick="previewPicture(this)" alt=""/></li>';else o="<span>无</span>";if($(".event_pic ul").append(o),0==n[0].audio.length)$(".event_audio").html("无");else{var c='<button  class="audioPlay" onclick="playAmrAudio(\''+n[0].audio[0]+"',this)\"></button>";$(".event_audio").html(c)}t.setCenterZoom(n)}})}};