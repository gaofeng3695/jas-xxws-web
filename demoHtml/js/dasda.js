$(function() {
    aaaa.init();
    $(".creatSubmit").click(function() {
        var aa = frameObj.verification();
        console.log(frameObj.verification());
        if (aa == true) {
            var bb = fromObj.getForm($("#addFormFrame form"));
            console.log(bb)
        }
    })
});
var aaaa = {
    init: function() {
        var _this = this;
        var aa = {
            "newlyBuild": {
                name: "新建dsada",
                function: _this.adccc,
            },
            "exportAll": {
                name: "导出全部",
                function: _this.dsa,
            },
            "deleteSelect": {
                name: "删除所选",
                function: _this.dsada,
            }
        };
        tableObj.addTableTopBtn(aa); //表单上面的按钮初始化

        var form = [
            [{
                title: "手机号",
                name: "tel",
                type: "text",
                leng: 11,
                notEmpty: true,
                placeholder: "",
                validation: {
                    regex: /^((1\d{10})|(([0-9]{3,4}-)?[0-9]{7,8}))$/,
                }
            }, {
                title: "年龄",
                name: "age",
                type: "text",
                leng: 6,
                notEmpty: true,
                placeholder: "请输入姓名",
                validation: {
                    type: "number",
                    between: {
                        min: 0,
                        max: 10000,
                    }
                }
            }],
            [{
                title: "名dsdsa称",
                name: "dada",
                type: "text",
                leng: 18,
                notEmpty: true,
                placeholder: ""
            }, {
                title: "adadads",
                name: "age",
                type: "select",
                notEmpty: true,
                content: [{
                        name: "aaa",
                        value: 112
                    },
                    {
                        name: "bbb",
                        value: 113,
                        selected: true
                    },
                    {
                        name: "ccc",
                        value: 114
                    }
                ]
            }],
            [{
                title: "地址",
                name: "adress",
                type: "text",
                leng: 18,
                // notEmpty: true,
                // placeholder: "请输入地址",
                readonly: true,
                callBack: aaaa.dsada
            }],
            [{
                title: "地d址",
                name: "adreddddss",
                type: "input",
                leng: 18,
                // notEmpty: true,
                // placeholder: "请输入地址",
                readonly: true,
                htmlPart: '<a>dasda</a>'
            }],
            [{
                title: "地址",
                name: "dsadsa",
                type: 'textarea',
                leng: 18,
                notEmpty: false,
                placeholder: "请输入地址",
                callBack: aaaa.dsa
            }]
        ];
        frameObj.formAdditional(form); //初始化新增表格

        var tableArr = [{
            field: 'state', //域值
            checkbox: true, //复选框
            align: 'center',
            visible: true, //false表示不显示
            sortable: false, //启用排序
            width: '4%',
        }, {
            field: 'userFileName', //域值
            title: '用户名称', //内容
            align: 'center',
            visible: true, //false表示不显示
            sortable: false, //启用排序
            width: '10%',
            editable: true,
        }, {
            field: 'userFileCode', //域值
            title: '用户编号', //内容
            align: 'center',
            visible: true, //false表示不显示
            sortable: false, //启用排序
            width: '10%',
            editable: true,
        }, {
            field: 'enterhomeUserTypeName', //域值
            title: '用户类型', //内容
            align: 'center',
            visible: true, //false表示不显示
            sortable: false, //启用排序
            width: '8%',
            editable: true,
        }, {
            field: 'userStatusName', //域值
            title: '用户状态', //内容
            align: 'center',
            visible: true, //false表示不显示
            sortable: false, //启用排序
            width: '8%',
        }, {
            field: 'regionName', //域值
            title: '所属片区', //内容
            align: 'center',
            visible: true, //false表示不显示
            sortable: false, //启用排序
            width: '15%',
            editable: true,
        }, {
            field: 'residential', //域值
            title: '小区/院/村', //内容
            align: 'center',
            visible: true, //false表示不显示
            sortable: false, //启用排序
            width: '10%',
        }, {
            field: 'address', //域值
            title: '详细地址', //内容
            align: 'center',
            visible: true, //false表示不显示
            sortable: false, //启用排序
            width: '25%',
            editable: true,
        }, {
            field: 'operate',
            title: '操作',
            align: 'center',
            events: _this.tableEvent(),
            width: '10%',
            formatter: _this.tableOperation,
        }];
        tableObj.getTable(tableArr, "/cloudlink-inspection-event/commonData/userArchive/getPageList");
        // tableObj.formAdditional(form);  //初始化详情表格
    },
    adccc: function() {
        $("#addFormFrame").modal();
    },
    dsa: function() {
        console.log("sad");
    },
    dsada: function() {
        console.log("dsdddsadasa");
    },
    tableOperation: function(value, row, index) {
        var modifyClass = 'modify';
        return [
            '<a class="look" href="javascript:void(0)" title="查看">',
            '<i></i>',
            '</a>',
            '<a class="' + modifyClass + '" href="javascript:void(0)" title="修改">',
            '<i></i>',
            '</a>',
            // '<a class="' + deleteClass + '" href="javascript:void(0)" title="删除">',
            // '<i></i>',
            // '</a>',
        ].join('');
    },
    tableEvent: function() {
        return {
            //查看功能
            'click .look': function(e, value, row, index) {
                // farmeObj._userId = row.objectId;
                // farmeObj.detailsReset();
                // farmeObj.$usreDetailsFrame.modal(); //打开详情模态框
                return false;
            },
        }
    },
}