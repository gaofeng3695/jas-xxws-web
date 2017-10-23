function dateChangeForSearch(){var e=$("#datetimeStart").val(),t=$("#datetimeEnd").val();""!=e&&""!==t?$("#diyDateBtn").addClass("active"):$("#diyDateBtn").removeClass("active")}var inspectRecordObj={_recordId:null,init:function(){var e=this;e.getTable(),historyDetailsObj.$historyDetailsFrame.on("shown.bs.modal",function(t){document.getElementById("historyDetailsFrameT").scrollTop=0,historyDetailsObj.geiHistoryDetails(e._recordId)})},getTable:function(){var e=this;$("#tableInspect").bootstrapTable({url:"/cloudlink-inspection-event/facilityRecord/getPageList?token="+lsObj.getLocalStorage("token"),method:"post",toolbar:"#toolbar",toolbarAlign:"left",cache:!1,showHeader:!0,showRefresh:!0,pagination:!0,striped:!0,sidePagination:"server",pageNumber:1,pageSize:10,pageList:[10,20,50],search:!1,searchOnEnterKey:!1,queryParamsType:"",queryParams:function(e){return searchObj.defaultObj.pageSize=e.pageSize,searchObj.defaultObj.pageNum=e.pageNumber,searchObj.defaultObj},onLoadSuccess:function(e){e.success},onDblClickRow:function(t){return e._recordId=t.objectId,historyDetailsObj.$historyDetailsFrame.modal(),historyDetailsObj.clearHistoryDetails(),!1},columns:[{field:"state",checkbox:!0,align:"center",visible:!0,sortable:!1,width:"4%"},{field:"facilityCheckTime",title:"检查时间",align:"center",visible:!0,sortable:!1,width:"18%",editable:!0},{field:"facilityName",title:"设施名称",align:"center",visible:!0,sortable:!1,width:"12%",editable:!0},{field:"facilityTypeName",title:"设施类型",align:"center",visible:!0,sortable:!1,width:"9%",editable:!0},{field:"isLeakageName",title:"漏气状态",align:"center",visible:!0,sortable:!1,width:"9%",cellStyle:function(e,t,a){return 0==t.isLeakage?{css:{color:"#333"}}:{css:{color:"#ef1010"}}},formatter:function(e,t,a){return 1==t.isLeakage?"漏气":"未漏气"}},{field:"facilityCheckResultName",title:"检查结果",align:"center",visible:!0,sortable:!1,width:"9%",editable:!0,cellStyle:function(e,t,a){return 0==t.facilityCheckResult?{css:{color:"#333"}}:{css:{color:"#ef1010"}}}},{field:"createUserName",title:"检查人员",align:"center",visible:!0,sortable:!1,width:"9%"},{field:"address",title:"详细地址",align:"center",visible:!0,sortable:!1,width:"20%",editable:!0},{field:"operate",title:"操作",align:"center",events:e.tableEvent(),width:"10%",formatter:e.tableOperation}]})},tableOperation:function(e,t,a){var i=null;return i=1==JSON.parse(lsObj.getLocalStorage("userBo")).isSysadmin?"delete":t.createUserId==JSON.parse(lsObj.getLocalStorage("userBo")).objectId?"delete":"delete_end",['<a class="look" data-toggle="modal" href="javascript:void(0)" title="查看">',"<i></i>","</a>",'<a class="'+i+'" href="javascript:void(0)" title="删除">',"<i></i>","</a>"].join("")},tableEvent:function(){var e=this;return{"click .look":function(t,a,i,r){return e._recordId=i.objectId,historyDetailsObj.$historyDetailsFrame.modal(),historyDetailsObj.clearHistoryDetails(),!1},"click .delete":function(e,t,a,i){var r={tip:"您是否删除该设施检查记录？",name_title:"提示",name_cancel:"取消",name_confirm:"确定",isCancelBtnShow:!0,callBack:function(){historyDetailsObj.deleteHistory(a.objectId)}};return xxwsWindowObj.xxwsAlert(r),!1}}}},searchObj={$items:$(".top .item"),$searchInput:$("#searchInput"),$startDate:$("#datetimeStart"),$endDate:$("#datetimeEnd"),defaultObj:{facilityCheckResult:"",isLeakage:"",facilityTypeCode:"",facilityId:"",startDate:"",endDate:"",keyword:"",pageNum:1,pageSize:10},querryObj:{facilityCheckResult:"",isLeakage:"",facilityTypeCode:"",facilityId:"",startDate:"",endDate:"",keyword:"",pageNum:1,pageSize:10},activeObj:{facilityCheckResult:"",isLeakage:"",facilityTypeCode:"",date:"all"},init:function(){this.renderActive(),this.bindEvent(),this.bindDateDiyEvent()},renderActive:function(e){var t=this;e||(e=t.activeObj);for(var a in e){var i=t.$items.parent("[data-class="+a+"]");i.find(".item").removeClass("active"),i.find('.item[data-value="'+e[a]+'"]').addClass("active"),"date"===a&&("diy"===e[a]?$("#item_diy").addClass("active"):$("#item_diy").removeClass("active"))}},bindEvent:function(){var e=this;e.$items.click(function(){var t=$(this).parent().attr("data-class"),a=$(this).attr("data-value");"date"===t?e.setDate(a):e.querryObj[t]=a;var i={};i[t]=a,e.renderActive(i),e.refreshTable()}),$("#gf_Btn").click(function(){var t=$(this).parent().find("input").val().trim();e.querryObj.keyword=t,e.refreshTable()}),e.$searchInput.keypress(function(t){t&&13===t.keyCode&&e.refreshTable()}),$("#search_more").click(function(){$(this).hasClass("active")?($(this).removeClass("active"),$(".more_item_wrapper").slideUp()):($(this).addClass("active"),$(".more_item_wrapper").slideDown())}),$("#gf_reset_Btn").click(function(){$.extend(e.querryObj,e.defaultObj),e.$startDate.val(""),e.$endDate.val(""),e.$searchInput.val(""),$("#diyDateBtn").removeClass("active"),e.renderActive(),e.refreshTable()}),$("#diyDateBtn").on("click",function(){var t=e.$startDate.val(),a=e.$endDate.val();return t?a?(e.querryObj.startDate=t,e.querryObj.endDate=a,e.renderActive({date:"diy"}),void e.refreshTable()):void xxwsWindowObj.xxwsAlert("请选择结束时间"):void xxwsWindowObj.xxwsAlert("请选择起始时间")})},setDate:function(e){var t=this;switch(e){case"day":var a=(new Date).Format("yyyy-MM-dd");t.querryObj.startDate=a,t.querryObj.endDate=a;break;case"week":var a=new Date;t.querryObj.startDate=a.getWeekStartDate().Format("yyyy-MM-dd"),t.querryObj.endDate=a.getWeekEndDate().Format("yyyy-MM-dd");break;case"month":var a=new Date;t.querryObj.startDate=a.getMonthStartDate().Format("yyyy-MM-dd"),t.querryObj.endDate=a.getMonthEndDate().Format("yyyy-MM-dd");break;default:t.querryObj.startDate="",t.querryObj.endDate=""}},refreshTable:function(){var e=this;e.querryObj.keyword=e.$searchInput.val().trim(),e.$searchInput.val(e.querryObj.keyword),e.querryObj.pageNum="1",$("#tableInspect").bootstrapTable("removeAll"),$("#tableInspect").bootstrapTable("refreshOptions",{pageNumber:+e.querryObj.pageNum,pageSize:+e.querryObj.pageSize,queryParams:function(t){return e.querryObj.pageSize=t.pageSize,e.querryObj.pageNum=t.pageNumber,e.querryObj}})},bindDateDiyEvent:function(){$("#datetimeStart").datetimepicker({format:"yyyy-mm-dd",minView:"month",language:"zh-CN",autoclose:!0}).on("click",function(){$("#datetimeStart").datetimepicker("setEndDate",$("#datetimeEnd").val())}),$("#datetimeEnd").datetimepicker({format:"yyyy-mm-dd",minView:"month",language:"zh-CN",autoclose:!0}).on("click",function(){$("#datetimeEnd").datetimepicker("setStartDate",$("#datetimeStart").val())})}},exportFileObj={$exportAll:$("#export_all"),$exportChoice:$("#export_choice"),expoerObj:{facilityCheckResult:"",isLeakage:"",facilityTypeCode:"",facilityId:"",startDate:"",endDate:"",keyword:"",pageNum:1,pageSize:10,idList:[]},init:function(){var e=this;this.$exportAll.click(function(){e.expoerObj.idList=[],e.expoerCondition()}),this.$exportChoice.click(function(){var t=$("#tableInspect").bootstrapTable("getSelections");if(e.expoerObj.idList=[],0==t.length)return xxwsWindowObj.xxwsAlert("请选择你需要导出的设施检查记录！"),!1;for(var a=0;a<t.length;a++)e.expoerObj.idList.push(t[a].objectId);e.expoerCondition()})},expoerCondition:function(){$.extend(this.expoerObj,searchObj.querryObj),this.expoerData(this.expoerObj)},expoerData:function(e){var t={url:"/cloudlink-inspection-event/facilityRecord/exportWord?token="+lsObj.getLocalStorage("token"),data:e,method:"post"};this.downLoadFile(t)},downLoadFile:function(e){var t=$.extend(!0,{method:"post"},e),a=$('<iframe id="down-file-iframe" />'),i=$('<form target="down-file-iframe" method="'+t.method+'" />');i.attr("action",t.url);for(var r in t.data)i.append('<input type="hidden" name="'+r+'" value="'+t.data[r]+'" />');a.append(i),$(document.body).append(a),i[0].submit(),a.remove()}};$(function(){inspectRecordObj.init(),searchObj.init(),exportFileObj.init()});