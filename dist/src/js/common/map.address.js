var addressMapObj={$addressMap:new BMap.Map("address_map"),$frame:$("#addressMapFrame"),$searchText:$(".search_address"),$searchBtn:$(".search_botton"),$addressText:$("input[name=map_address]"),_geocoder:new BMap.Geocoder,_frameName:null,addressObj:{name:null,lng:null,lat:null,gpsLon:null,gpsLat:null},init:function(){var a=this;a.$addressMap.centerAndZoom(new BMap.Point(116.404,39.915),9),a.$addressMap.enableScrollWheelZoom(!0),this.$addressMap.addEventListener("click",function(e){var s=e.point.lng,r=e.point.lat;a.addressObj.lng=s,a.addressObj.lat=r,a.removePoint(),a.addPoint(s,r,!0)}),this.$searchBtn.click(function(){new BMap.LocalSearch(a.$addressMap,{renderOptions:{map:a.$addressMap}}).search(a.$searchText.val().trim())})},drawPoint:function(a,e){var s=this;if(s.$searchText.val(""),s._frameName=a,s.removePoint(),null==e.name)return s.$addressText.val(""),void s.$addressMap.centerAndZoom(new BMap.Point(116.404,39.915),9);s.addressObj.lng=e.lng,s.addressObj.lat=e.lat,s.addressObj.gpsLon=e.gpsLon,s.addressObj.gpsLat=e.gpsLat,s.addPoint(e.lng,e.lat),s.$addressText.val(e.name)},getPoint:function(){var a=this;if(""==a.$addressText.val().trim())return xxwsWindowObj.xxwsAlert("请选择详细位置！"),!1;if(a.$addressText.val().trim().length>50)return xxwsWindowObj.xxwsAlert("详细位置名称过长！"),!1;var e=coordtransform.bd09togcj02(a.addressObj.lng,a.addressObj.lat),s=coordtransform.gcj02towgs84(e[0],e[1]);a.addressObj.gpsLon=s[0],a.addressObj.gpsLat=s[1],a.addressObj.name=a.$addressText.val().trim();var r={key:a._frameName,value:a.addressObj};return a.$frame.modal("hide"),r},addPoint:function(a,e,s){var r=this,d=new BMap.Point(a,e),n=new BMap.Marker(d);if(r.$addressMap.addOverlay(n),1==s)return void r._geocoder.getLocation(d,function(a){a&&r.$addressText.val(a.address)});r.$addressMap.setCenter(d)},removePoint:function(){this.$addressMap.clearOverlays()}};$(function(){addressMapObj.init()});