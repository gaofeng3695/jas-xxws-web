/**
 * 维修工单详情
 * repairObj.openDetailsFrame(id, type, boolean) 打开维修工单详情
 * id：工单id，type：维修的类型，boolean：是否是维修编辑 true维修编辑
 * 维修历史检查
 * repairObj.openHistoryFrame(id) 打开维修历史检查记录
 * id：根据id查找历史维修工单
 */

var User = Vue.extend({
    props: ["myMsgdetails", "modifybtn", "openperson"],
    template: '<div><div class="frameList">' +
        '<div class="frameListHalf">' +
        '<div class="frameListLeft">维修来源</div>' +
        '<div class="frameListRight">' +
        '<p>{{myMsgdetails.originTypeName}}</p>' +
        '</div>' +
        '</div>' +
        '<div class="frameListHalf">' +
        '<div class="frameListLeft">创建人</div>' +
        '<div class="frameListRight">' +
        '<p>{{createUserName}}</p>' +
        '</div></div></div>' +
        '<div class="frameList">' +
        '<div class="frameListHalf">' +
        '<div class="frameListLeft">用户名称</div>' +
        '<div class="frameListRight">' +
        '<p>{{maintenanceName}}</p>' +
        '</div>' +
        '</div>' +
        '<div class="frameListHalf">' +
        '<div class="frameListLeft">联系方式</div>' +
        '<div class="frameListRight">' +
        '<p>{{contactPhone}}</p>' +
        '</div></div></div>' +
        '<div class="frameList">' +
        '<div class="frameListLeft">用户地址</div>' +
        '<div class="frameListRight">' +
        '<p>{{address}}</p>' +
        '</div></div>' +
        '<div class="frameList">' +
        '<div class="frameListLeft">维修人</div>' +
        '<div class="frameListRight">' +
        '<p class="repairModify"><em @click="openperson" v-show="modifybtn" title="修改人员"></em><span>{{relationshipPersonNames}}</span></p>' +
        '</div></div>' +
        '<div class="frameList">' +
        '<div class="frameListHalf">' +
        '<div class="frameListLeft">维修期限</div>' +
        '<div class="frameListRight">' +
        '<p>{{remediationTime}}</p>' +
        '</div>' +
        '</div>' +
        '<div class="frameListHalf">' +
        '<div class="frameListLeft">维修时间</div>' +
        '<div class="frameListRight">' +
        '<p>{{maintenanceRecordTime}}</p>' +
        '</div></div></div>' +
        '<div class="frameList">' +
        '<div class="frameListLeft">维修状态</div>' +
        '<div class="frameListRight">' +
        '<p>{{statusName}}</p>' +
        '</div></div>' +
        '<div class="frameList">' +
        '<div class="frameListLeft">维修原因</div>' +
        '<div class="frameListRight">' +
        '<p>{{reason}}</p>' +
        '</div></div><child-component v-if="orderShow" v-bind:my-orderdeta="myMsgdetails"></child-component></div>',
    data: function() {
        return this.myMsgdetails;
    },
    computed: {
        statusName: function() {
            if (this.status == 1) {
                return "待维修";
            } else if (this.status == 2) {
                return "已完成";
            } else {
                return "---";
            }
        },
        orderShow: function() {
            if (this.workRecordId == "" || this.workRecordId == null || this.workRecordId == undefined) {
                return false;
            } else {
                return true;
            }
        },
    }
});
var Facility = Vue.extend({
    props: ["myMsgdetails", "modifybtn", "openperson"],
    template: '<div><div class="frameList">' +
        '<div class="frameListHalf">' +
        '<div class="frameListLeft">维修来源</div>' +
        '<div class="frameListRight">' +
        '<p>{{originTypeName}}</p>' +
        '</div>' +
        '</div>' +
        '<div class="frameListHalf">' +
        '<div class="frameListLeft">创建人</div>' +
        '<div class="frameListRight">' +
        '<p>{{createUserName}}</p>' +
        '</div></div></div>' +
        '<div class="frameList">' +
        '<div class="frameListHalf">' +
        '<div class="frameListLeft">设施名称</div>' +
        '<div class="frameListRight">' +
        '<p>{{maintenanceName}}</p>' +
        '</div>' +
        '</div>' +
        '<div class="frameListHalf">' +
        '<div class="frameListLeft">设施类型</div>' +
        '<div class="frameListRight">' +
        '<p>{{typeName}}</p>' +
        '</div></div></div>' +
        '<div class="frameList">' +
        '<div class="frameListLeft">设施位置</div>' +
        '<div class="frameListRight">' +
        '<p>{{address}}</p>' +
        '</div></div>' +
        '<div class="frameList">' +
        '<div class="frameListLeft">维修人</div>' +
        '<div class="frameListRight">' +
        '<p class="repairModify"><em @click="openperson" v-show="modifybtn" title="修改人员"></em><span>{{relationshipPersonNames}}</span></p>' +
        '</div></div>' +
        '<div class="frameList">' +
        '<div class="frameListHalf">' +
        '<div class="frameListLeft">维修期限</div>' +
        '<div class="frameListRight">' +
        '<p>{{remediationTime}}</p>' +
        '</div>' +
        '</div>' +
        '<div class="frameListHalf">' +
        '<div class="frameListLeft">维修时间</div>' +
        '<div class="frameListRight">' +
        '<p>{{maintenanceRecordTime}}</p>' +
        '</div></div></div>' +
        '<div class="frameList">' +
        '<div class="frameListLeft">维修状态</div>' +
        '<div class="frameListRight">' +
        '<p>{{statusName}}</p>' +
        '</div></div>' +
        '<div class="frameList">' +
        '<div class="frameListLeft">维修原因</div>' +
        '<div class="frameListRight">' +
        '<p>{{reason}}</p>' +
        '</div></div><child-component v-if="orderShow" v-bind:my-orderdeta="myMsgdetails"></child-component></div>',
    data: function() {
        return this.myMsgdetails;
    },
    computed: {
        statusName: function() {
            if (this.status == 1) {
                return "待维修";
            } else if (this.status == 2) {
                return "已完成";
            } else {
                return "---";
            }
        },
        orderShow: function() {
            if (this.workRecordId == "" || this.workRecordId == null || this.workRecordId == undefined) {
                return false;
            } else {
                return true;
            }
        }
    }
});
var Events = Vue.extend({
    props: ["myMsgdetails", "modifybtn", "openperson"],
    template: '<div><div class="frameList">' +
        '<div class="frameListHalf">' +
        '<div class="frameListLeft">维修来源</div>' +
        '<div class="frameListRight">' +
        '<p>{{originTypeName}}</p>' +
        '</div>' +
        '</div>' +
        '<div class="frameListHalf">' +
        '<div class="frameListLeft">创建人</div>' +
        '<div class="frameListRight">' +
        '<p>{{createUserName}}</p>' +
        '</div></div></div>' +
        '<div class="frameList">' +
        '<div class="frameListHalf">' +
        '<div class="frameListLeft">事件编号</div>' +
        '<div class="frameListRight">' +
        '<p>{{maintenanceName}}</p>' +
        '</div>' +
        '</div>' +
        '<div class="frameListHalf">' +
        '<div class="frameListLeft">事件类型</div>' +
        '<div class="frameListRight">' +
        '<p>{{typeName}}</p>' +
        '</div></div></div>' +
        '<div class="frameList">' +
        '<div class="frameListLeft">事件地点</div>' +
        '<div class="frameListRight">' +
        '<p>{{address}}</p>' +
        '</div></div>' +
        '<div class="frameList">' +
        '<div class="frameListLeft">维修人</div>' +
        '<div class="frameListRight">' +
        '<p class="repairModify"><em @click="openperson" v-show="modifybtn" title="修改人员"></em><span>{{relationshipPersonNames}}</span></p>' +
        '</div></div>' +
        '<div class="frameList">' +
        '<div class="frameListHalf">' +
        '<div class="frameListLeft">维修期限</div>' +
        '<div class="frameListRight">' +
        '<p>{{remediationTime}}</p>' +
        '</div>' +
        '</div>' +
        '<div class="frameListHalf">' +
        '<div class="frameListLeft">维修时间</div>' +
        '<div class="frameListRight">' +
        '<p>{{maintenanceRecordTime}}</p>' +
        '</div></div></div>' +
        '<div class="frameList">' +
        '<div class="frameListLeft">维修状态</div>' +
        '<div class="frameListRight">' +
        '<p>{{statusName}}</p>' +
        '</div></div>' +
        '<div class="frameList">' +
        '<div class="frameListLeft">维修原因</div>' +
        '<div class="frameListRight">' +
        '<p>{{reason}}</p>' +
        '</div></div><child-component v-if="orderShow" v-bind:my-orderdeta="myMsgdetails"></child-component></div>',
    data: function() {
        return this.myMsgdetails;
    },
    computed: {
        statusName: function() {
            if (this.status == 1) {
                return "待维修";
            } else if (this.status == 2) {
                return "已完成";
            } else {
                return "---";
            }
        },
        orderShow: function() {
            if (this.workRecordId == "" || this.workRecordId == null || this.workRecordId == undefined) {
                return false;
            } else {
                return true;
            }
        }
    }
});
var Other = Vue.extend({
    props: ["myMsgdetails", "modifybtn", "openperson"],
    template: '<div><div class="frameList">' +
        '<div class="frameListHalf">' +
        '<div class="frameListLeft">维修来源</div>' +
        '<div class="frameListRight">' +
        '<p>{{originTypeName}}</p>' +
        '</div>' +
        '</div>' +
        '<div class="frameListHalf">' +
        '<div class="frameListLeft">创建人</div>' +
        '<div class="frameListRight">' +
        '<p>{{createUserName}}</p>' +
        '</div></div></div>' +
        '<div class="frameList">' +
        '<div class="frameListHalf">' +
        '<div class="frameListLeft">联系人</div>' +
        '<div class="frameListRight">' +
        '<p>{{maintenanceName}}</p>' +
        '</div>' +
        '</div>' +
        '<div class="frameListHalf">' +
        '<div class="frameListLeft">联系方式</div>' +
        '<div class="frameListRight">' +
        '<p>{{contactPhone}}</p>' +
        '</div></div></div>' +
        '<div class="frameList">' +
        '<div class="frameListLeft">地址</div>' +
        '<div class="frameListRight">' +
        '<p>{{address}}</p>' +
        '</div></div>' +
        '<div class="frameList">' +
        '<div class="frameListLeft">维修人</div>' +
        '<div class="frameListRight">' +
        '<p class="repairModify"><em @click="openperson" v-show="modifybtn" title="修改人员"></em><span>{{relationshipPersonNames}}</span></p>' +
        '</div></div>' +
        '<div class="frameList">' +
        '<div class="frameListHalf">' +
        '<div class="frameListLeft">维修期限</div>' +
        '<div class="frameListRight">' +
        '<p>{{remediationTime}}</p>' +
        '</div>' +
        '</div>' +
        '<div class="frameListHalf">' +
        '<div class="frameListLeft">维修时间</div>' +
        '<div class="frameListRight">' +
        '<p>{{maintenanceRecordTime}}</p>' +
        '</div></div></div>' +
        '<div class="frameList">' +
        '<div class="frameListLeft">维修状态</div>' +
        '<div class="frameListRight">' +
        '<p>{{statusName}}</p>' +
        '</div></div>' +
        '<div class="frameList">' +
        '<div class="frameListLeft">维修原因</div>' +
        '<div class="frameListRight">' +
        '<p>{{reason}}</p>' +
        '</div></div><child-component v-if="orderShow" v-bind:my-orderdeta="myMsgdetails"></child-component></div>',
    data: function() {
        return this.myMsgdetails;
    },
    computed: {
        statusName: function() {
            if (this.status == 1) {
                return "待维修";
            } else if (this.status == 2) {
                return "已完成";
            } else {
                return "---";
            }
        },
        orderShow: function() {
            if (this.workRecordId == "" || this.workRecordId == null || this.workRecordId == undefined) {
                return false;
            } else {
                return true;
            }
        }
    }
});

//工单详情
var childComponent = Vue.extend({
    props: ["myOrderdeta"],
    template: '<div><div class="frameDetailsTitle">维修费用</div>' +
        '<child-list v-for="team in workRecordCostArr(workRecordCost)" v-bind:names="team.name" v-bind:prices="team.price" v-bind:amounts="team.amount"></child-list>' +
        '<div class="frameList">' +
        '<div class="frameListLeft">总计</div>' +
        '<div class="frameListRight">' +
        '<p>{{totalCost | pliceNumber}} （<span v-text="captialTotalCost"></span>）人民币</p>' +
        '</div></div>' +
        '<div class="frameList">' +
        '<div class="frameListLeft">维修内容</div>' +
        '<div class="frameListRight">' +
        '<p>{{content}}</p>' +
        '</div></div>' +
        '<div class="frameList">' +
        '<div class="frameListLeft">照片</div>' +
        '<div class="frameListRight">' +
        '<ul>' +
        '<span v-if="picShow">无</span>' +
        '<li class="event_pic_list" v-for="value in pic">' +
        '<img :src="imgSrc(value)" :data-original="imgOriginalSrc(value)" @click="previewPicture($event)" alt=""/>' +
        '</li>' +
        '</ul>' +
        '</div></div>' +
        '<div class="frameList" v-if="operationShow">' +
        '<div class="frameListLeft">用户签字</div>' +
        '<div class="frameListRight">' +
        '<ul>' +
        '<li class="event_pic_list" v-for="value in signature">' +
        '<img :src="imgSrc(value)" :data-original="imgOriginalSrc(value)" @click="previewPicture($event)" alt=""/>' +
        '</li>' +
        '</ul>' +
        '</div></div>' +
        '<div class="frameList" v-if="operationShow">' +
        '<div class="frameListLeft">用户满意度</div>' +
        '<div class="frameListRight satisfaction" v-html="starHtml">' +
        '</div></div></div>',
    data: function() {
        return this.myOrderdeta;
    },
    computed: {
        starHtml: function() {
            switch (this.satisfaction) {
                case '1':
                    var starTxt = '<ul>' +
                        '<li><img src="/src/images/security/star.png" width="20" alt=""></li>' +
                        '</ul>' +
                        '<span>非常不满</span>';
                    return starTxt;
                case '2':
                    var starTxt = '<ul>' +
                        '<li><img src="/src/images/security/star.png" width="20" alt=""></li>' +
                        '<li><img src="/src/images/security/star.png" width="20" alt=""></li>' +
                        '</ul>' +
                        '<span>不满意</span>';
                    return starTxt;
                case '3':
                    var starTxt = '<ul>' +
                        '<li><img src="/src/images/security/star.png" width="20" alt=""></li>' +
                        '<li><img src="/src/images/security/star.png" width="20" alt=""></li>' +
                        '<li><img src="/src/images/security/star.png" width="20" alt=""></li>' +
                        '</ul>' +
                        '<span>一般</span>';
                    return starTxt;
                case '4':
                    var starTxt = '<ul>' +
                        '<li><img src="/src/images/security/star.png" width="20" alt=""></li>' +
                        '<li><img src="/src/images/security/star.png" width="20" alt=""></li>' +
                        '<li><img src="/src/images/security/star.png" width="20" alt=""></li>' +
                        '<li><img src="/src/images/security/star.png" width="20" alt=""></li>' +
                        '</ul>' +
                        '<span>满意</span>';
                    return starTxt;
                case '5':
                    var starTxt = '<ul>' +
                        '<li><img src="/src/images/security/star.png" width="20" alt=""></li>' +
                        '<li><img src="/src/images/security/star.png" width="20" alt=""></li>' +
                        '<li><img src="/src/images/security/star.png" width="20" alt=""></li>' +
                        '<li><img src="/src/images/security/star.png" width="20" alt=""></li>' +
                        '<li><img src="/src/images/security/star.png" width="20" alt=""></li>' +
                        '</ul>' +
                        '<span>非常满意</span>';
                    return starTxt;
                default:
                    var starTxt = '<p> </p>';
                    return starTxt;
            }
        },
        picShow: function() {
            if (this.pic.length > 0) {
                return false;
            } else {
                return true;
            }
        },
        operationShow: function() {
            if (this.originTypeCode == "MO_01") {
                return true;
            } else {
                return false;
            }
        },
    },
    filters: {
        pliceNumber: function(value, thousand, decimal) {
            thousand = thousand || ",";
            decimal = decimal || ".";
            var negative = value < 0 ? "-" : "",
                i = parseInt(value = Math.abs(+value || 0).toFixed(2), 10) + "",
                j = (j = i.length) > 3 ? j % 3 : 0;
            return negative + (j ? i.substr(0, j) + thousand : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousand) + (2 ? decimal + Math.abs(value - i).toFixed(2).slice(2) : "");
        }
    },
    methods: {
        workRecordCostArr: function(arr) {
            if (arr.length > 0) {
                return arr;
            } else {
                var obj = {
                    name: "",
                    prices: "",
                    amount: ""
                }
                return arr.push(obj);
            }
        },
        imgSrc: function(e) {
            var src = '/cloudlink-core-file/file/getImageBySize?fileId=' + e + '&viewModel=fill&width=104&hight=78';
            return src;
        },
        previewPicture: function(e) {
            viewPicObj.viewPic(e.currentTarget);
        },
        imgOriginalSrc: function(e) {
            var src = '/cloudlink-core-file/file/downLoad?fileId=' + e;
            return src;
        }
    }
});

//维修费用列表
var childList = Vue.extend({
    props: ['names', 'prices', 'amounts'],
    template: '<div class="priceList"><div class="frameList">' +
        '<div class="frameListThird">' +
        '<div class="frameListLeft">名称</div>' +
        '<div class="frameListRight">' +
        '<p>{{names}}</p>' +
        '</div>' +
        '</div>' +
        '<div class="frameListThird">' +
        '<div class="frameListLeft">单价</div>' +
        '<div class="frameListRight">' +
        '<p>{{prices|pliceNumber}}</p>' +
        '</div>' +
        '</div>' +
        '<div class="frameListThird">' +
        '<div class="frameListLeft">数量</div>' +
        '<div class="frameListRight">' +
        '<p>{{amounts}}</p>' +
        '</div></div></div></div>',
    filters: {
        pliceNumber: function(value, thousand, decimal) {
            if (value == "" || value == null || value == undefined) {
                return "";
            } else {
                thousand = thousand || ",";
                decimal = decimal || ".";
                var negative = value < 0 ? "-" : "",
                    i = parseInt(value = Math.abs(+value || 0).toFixed(2), 10) + "",
                    j = (j = i.length) > 3 ? j % 3 : 0;
                return negative + (j ? i.substr(0, j) + thousand : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousand) + (2 ? decimal + Math.abs(value - i).toFixed(2).slice(2) : "");
            }
        }
    },
});

Vue.component("child-component", childComponent);
Vue.component("child-list", childList);


//维修任务轴

var Axis = {
    props: ["myMsgaxis"],
    template: '<div><div class="axisDay" v-for="teamarr in dateArr" v-bind:dateName="teamarr.id">\
                    <div class="axisDayTitle">{{dateChange(teamarr.id)}}</div>\
                    <div class="axisTime">\
                        <div class="axisTimeList" v-for="team in timeArr(teamarr.id)">\
                            <span>{{team.opTime}}</span>\
                            <p>{{team.createUserName}}<i>{{team.operateTypeName}}</i>{{team.operateContent}}</p>\
                        </div>\
                    </div>\
                </div></div>',
    data: function() {
        return this.myMsgaxis;
    },
    computed: {
        dateArr: function() {
            var arr = this.operateList;
            var arrN = [];
            var tep = "";
            for (var i = 0; i < arr.length; i++) {
                if (tep != arr[i].opDate) {
                    tep = arr[i].opDate;
                    var obj = {
                        id: tep
                    }
                    arrN.push(obj);
                }
            }
            return arrN;
        },
    },
    methods: {
        timeArr: function(dateId) {
            var arr = this.operateList;
            var arrN = [];
            for (var i = 0; i < arr.length; i++) {
                if (arr[i].opDate == dateId) {
                    arrN.push(arr[i]);
                }
            }
            return arrN;
        },
        dateChange: function(date) {
            var dateNum = "";
            var dateT = new Date().Format('yyyy-MM-dd');
            if (date == dateT) {
                dateNum = "今天（" + date + "）";
            } else if (date == this.GetDateStr(-1)) {
                dateNum = "昨天（" + date + "）";
            } else {
                dateNum = date
            }
            return dateNum;
        },
        GetDateStr: function(AddDayCount) {
            var dd = new Date();
            dd.setDate(dd.getDate() + AddDayCount); //获取AddDayCount天后的日期 
            var y = dd.getFullYear();
            var m = dd.getMonth() + 1; //获取当前月份的日期 
            var d = dd.getDate();
            if (m < 10) {
                m = "0" + m;
            }
            if (d < 10) {
                d = "0" + d;
            }
            return y + "-" + m + "-" + d;
        }
    },
};

Vue.component("axis-html", Axis);

var detailsV = new Vue({
    el: '#repairDetails',
    data: {
        which_to_show: "user",
        maintenanceCode: "---",
        detailsShow: true,
        axisShow: false,
        modifyShow: false,
        frameName: "",
        dataAxis: {
            "maintenanceCode": "---", //维修任务号
            "reason": "---", //维修原因
            "operateList": [{ //操作记录列表
                "operateTypeCode": "---", //操作类型编码
                "operateTypeName": "---", //操作类型名称
                "operateContent": "---", //操作内容
                "createUserId": "---", //操作人ID
                "createUserName": "---", //操作人名称
                "createTime": "---", //操作时间
                "opDate": "---",
                "opTime": "---",
            }]
        },
        dataBasics: {
            address: "---",
            buzId: "---",
            captialTotalCost: "---",
            contactPhone: "---",
            content: "---",
            createTime: "---",
            createUserId: "---",
            createUserName: "---",
            enterpriseId: "---",
            maintenanceCode: "---",
            maintenanceName: "---",
            maintenanceRecordTime: "---",
            objectId: "---",
            orgId: "---",
            originTypeCode: "---",
            originTypeName: "---",
            pic: [],
            reason: "---",
            relationshipPersonIds: "",
            relationshipPersonNames: "---",
            relationshipPersons: [],
            remediationTime: "---",
            satisfaction: "---",
            signature: [],
            status: "---",
            totalCost: "---",
            typeCode: "---",
            typeName: "---",
            workRecordCost: [],
            workRecordId: "",
        },
    },
    components: {
        user: User,
        facility: Facility,
        event: Events,
        other: Other,
    },
    methods: {
        tabChange: function(e) { //tab切换
            if (e == "details") {
                this.detailsShow = true;
                this.axisShow = false;
            } else {
                this.detailsShow = false;
                this.axisShow = true;
            }
        },
        witchName: function(boolean) { //判断是详情还是修改
            if (boolean) {
                this.frameName = "维修记录编辑";
                this.modifyShow = true;
            } else {
                this.frameName = "维修详情";
                this.modifyShow = false;
            }
        },
        getRepairDetails: function(id) { //获取维修详情
            var _this = this;
            var params = {
                objectId: id
            }
            repairObj._selectedPersons = [];
            $.ajax({
                type: 'GET',
                url: "/cloudlink-inspection-event/commonData/maintenanceWork/get?token=" + lsObj.getLocalStorage('token'),
                data: params,
                contentType: "application/json",
                dataType: "json",
                success: function(data, status) {
                    if (data.success == 1) {
                        _this.maintenanceCode = data.rows[0].maintenanceCode;
                        $.extend(detailsV.dataBasics, data.rows[0], true);
                        _this.ergodicPersons(data.rows[0].relationshipPersons);
                    } else {
                        xxwsWindowObj.xxwsAlert('获取数据失败！');
                    }
                }
            });
        },
        getRepairAxis: function(id) { //获取维修任务轴
            var _this = this;
            var params = {
                objectId: id
            }
            $.ajax({
                type: 'POST',
                url: "/cloudlink-inspection-event/commonData/maintenanceOperate/getList?token=" + lsObj.getLocalStorage('token'),
                data: JSON.stringify(params),
                contentType: "application/json",
                dataType: "json",
                success: function(data, status) {
                    if (data.success == 1) {
                        Vue.set(detailsV.dataAxis, 'operateList', data.rows[0].operateList);
                    } else {
                        xxwsWindowObj.xxwsAlert('获取数据失败！');
                    }
                }
            });
        },
        ergodicPersons: function(arr) { //遍历获取维修人
            for (var i = 0; i < arr.length; i++) {
                var obj = {
                    relationshipPersonId: arr[i].relationshipPersonId,
                    relationshipPersonName: arr[i].relationshipPersonName
                }
                repairObj._selectedPersons.push(obj);
            }
        },
        openPerson: function() { //修改打开人员选择
            userTable._selectPeople = repairObj._selectedPersons;
            createmaintenance.chooserepairer(true);
        },
        getSelectPerson: function(arr, str) {
            repairObj._selectedPersons = [];
            for (var i = 0; i < arr.length; i++) {
                repairObj._selectedPersons.push(arr[i]);
            }
            this.dataBasics.relationshipPersonNames = str;
        },
        modifySave: function() { //修改完成后保存
            var _this = this;
            var defaultOptions = {
                tip: '是否保存你所修改的维修工单？',
                name_title: '提示',
                name_cancel: '取消',
                name_confirm: '确定',
                isCancelBtnShow: true,
                callBack: function() {
                    _this.modifyDataSave();
                }
            };
            xxwsWindowObj.xxwsAlert(defaultOptions);
        },
        modifyDataSave: function() {
            var _this = this;
            if (repairObj._selectedPersons.length == 0) {
                xxwsWindowObj.xxwsAlert('请选择维修人员');
            } else {
                var params = {
                    objectId: _this.dataBasics.objectId,
                    relationshipPerson: repairObj._selectedPersons
                }
                $.ajax({
                    type: 'POST',
                    url: "/cloudlink-inspection-event/maintenanceWork/updateMaintenancePersonnel?token=" + lsObj.getLocalStorage('token'),
                    data: JSON.stringify(params),
                    contentType: "application/json",
                    dataType: "json",
                    success: function(data, status) {
                        if (data.success == 1) {
                            var defaultOptions = {
                                tip: '修改维修工单成功',
                                name_title: '提示',
                                name_cancel: '取消',
                                name_confirm: '确定',
                                isCancelBtnShow: false,
                                callBack: function() {
                                    repairObj.$repairDetails.modal('hide');
                                    window.location.reload();
                                }
                            };
                            xxwsWindowObj.xxwsAlert(defaultOptions);
                        } else {
                            if (data.code == "XE05001") {
                                xxwsWindowObj.xxwsAlert('维修工单已结束，维修人员不能修改');
                            } else {
                                xxwsWindowObj.xxwsAlert('维修人员修改失败！');
                            }
                        }
                    }
                });
            }
        }
    }
});


var repairObj = {
    $repairDetails: $("#repairDetails"),
    $repairHistory: $("#repairHistory"),
    _repairId: null,
    _historySeachKey: "",
    _historySeachId: "",
    _isModify: null,
    _selectedPersons: [],
    detailsInitial: {
        address: "---",
        buzId: "---",
        captialTotalCost: "---",
        contactPhone: "---",
        content: "---",
        createTime: "---",
        createUserId: "---",
        createUserName: "---",
        enterpriseId: "---",
        maintenanceCode: "---",
        maintenanceName: "---",
        maintenanceRecordTime: "---",
        objectId: "---",
        orgId: "---",
        originTypeCode: "---",
        originTypeName: "---",
        pic: [],
        reason: "---",
        relationshipPersonIds: "",
        relationshipPersonNames: "---",
        relationshipPersons: [],
        remediationTime: "---",
        satisfaction: "---",
        signature: [],
        status: "---",
        totalCost: "---",
        typeCode: "---",
        typeName: "---",
        workRecordCost: [],
        workRecordId: "",
    },
    axisInitial: [{ //操作记录列表
        "operateTypeCode": "---", //操作类型编码
        "operateTypeName": "---", //操作类型名称
        "operateContent": "---", //操作内容
        "createUserId": "---", //操作人ID
        "createUserName": "---", //操作人名称
        "createTime": "---", //操作时间
        "opDate": "---",
        "opTime": "---",
    }],
    init: function() {
        var _this = this;
        //维修详情模态框加载完执行
        _this.$repairDetails.on('shown.bs.modal', function(e) {
            detailsV.getRepairDetails(_this._repairId);
            detailsV.getRepairAxis(_this._repairId);
        });
        //历史维修记录搜索点击事件
        $(".historySeachBtn").click(function() {
            _this._historySeachKey = $(".historySeachMain input").val().trim();
            _this.getHistoryTable();
        });

        if (_this.$repairHistory) {
            _this.historyTable();
        }
    },
    openDetailsFrame: function(id, type, boolean) { //打开维修详情 初始化数据为空
        if (type == "MO_01") {
            detailsV.which_to_show = "user";
        } else if (type == "MO_02") {
            detailsV.which_to_show = "facility";
        } else if (type == "MO_03") {
            detailsV.which_to_show = "event";
        } else {
            detailsV.which_to_show = "other";
        }
        this._repairId = id;
        this._isModify = boolean;
        //初始化数据
        detailsV.maintenanceCode = "---";
        $.extend(detailsV.dataBasics, this.detailsInitial, true);
        Vue.set(detailsV.dataAxis, 'operateList', this.axisInitial);
        detailsV.witchName(boolean);
        detailsV.tabChange('details');

        this.$repairDetails.modal();
    },
    openHistoryFrame: function(id) { //打开维修历史记录
        this.$repairHistory.modal();
        this._historySeachKey = "";
        this._historySeachId = id;
        $(".historySeachMain input").val("");
        this.getHistoryTable();
    },
    historyTable: function() { //table 数据
        var _this = this;
        var param = {
            "keyword": "",
            "buzId": "",
            "pageNum": 1, //第几页
            "pageSize": 10 //每页记录数 默认10条
        };
        $('#repairTableHistory').bootstrapTable({
            url: "/cloudlink-inspection-event/commonData/maintenanceWorkHistory/getPageList?token=" + lsObj.getLocalStorage('token'), //请求数据url
            method: 'post',
            cache: false, //是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
            showHeader: true,
            pagination: true, //分页
            striped: true,
            sidePagination: 'server', //分页方式：client客户端分页，server服务端分页（*）
            pageNumber: 1,
            pageSize: 10,
            pageList: [10, 20, 50], //分页步进值
            search: false, //显示搜索框
            searchOnEnterKey: false,
            queryParamsType: '', //默认值为 'limit' ,在默认情况下 传给服务端的参数为：offset,limit,sort
            // 设置为 ''  在这种情况下传给服务器的参数为：pageSize,pageNumber
            queryParams: function(params) {
                param.pageSize = params.pageNumber;
                param.pageNum = params.pageSize;
                return param;
            },
            onLoadSuccess: function(data) {
                if (data.success == 1) {}
            },
            onDblClickRow: function(row) {
                _this.openDetailsFrame(row.objectId, row.originTypeCode);
                return false;
            },
            //表格的列
            columns: [{
                field: 'maintenanceCode', //域值
                title: '维修编号', //内容
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '17%',
                editable: true,
            }, {
                field: 'maintenanceRecordTime', //域值
                title: '维修时间',
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '17%',
                editable: true,
            }, {
                field: 'originTypeName', //域值
                title: '维修来源', //内容
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '10%',
                editable: true,
            }, {
                field: 'relationshipPersonNames', //域值
                title: '维修人', //内容
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '20%',
                editable: true,
            }, {
                field: 'reason', //域值
                title: '维修原因', //内容
                align: 'center',
                visible: true, //false表示不显示
                sortable: false, //启用排序
                width: '31%',
                editable: true,
            }, {
                field: 'operate',
                title: '操作',
                align: 'center',
                events: _this.historyTableEvent(),
                width: '5%',
                formatter: _this.historyTableOperation,
            }],
        });
    },
    getHistoryTable: function() { //请求tabel数据
        var _this = this;
        var param = {
            "keyword": _this._historySeachKey,
            "buzId": _this._historySeachId,
            "pageNum": 1, //第几页
            "pageSize": 10 //每页记录数 默认10条
        };
        $('#repairTableHistory').bootstrapTable('refreshOptions', {
            queryParams: function(params) {
                param.pageNum = params.pageNumber;
                param.pageSize = params.pageSize;
                return param;
            }
        });
    },
    historyTableOperation: function(value, row, index) { //历史检查操作按钮
        return [
            '<a class="look" href="javascript:void(0)" title="查看">',
            '<i></i>',
            '</a>',
        ].join('');
    },
    historyTableEvent: function() { //历史检查按钮相关的事件
        var _this = this;
        return {
            //查看功能
            'click .look': function(e, value, row, index) {
                _this.openDetailsFrame(row.objectId, row.originTypeCode);
                return false;
            }
        }
    },
}
$(function() {
    repairObj.init();
});