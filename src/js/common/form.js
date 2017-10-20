/**
 * fromObj.getForm($('id'));传元素对象id，获取元素内的表单值，返回对象obj
 * fromObj.setForm($('id'),obj);传元素对象id以及数据对象{key：value,key：value}，给表单赋值
 * fromObj.setDetails($('id'),obj);传元素对象id以及数据对象{key：value,key：value}，给详情赋值
 * fromObj.getImg(); 获取删除的图片数组
 */

var fromObj = (function() {
    var imgIds = [];
    $("body").on("click", ".deleteModifyPic", function() {
        deleteImg(this);
    });
    var getForm = function(e) {
        var $box = e;
        var obj = {};
        var inputs = $box.find('input[type=text]');
        var hiddens = $box.find('input[type=hidden]');
        var radios = $box.find('input[type=radio]');
        var checkboxs = $box.find('input[type=checkbox]');
        var selects = $box.find('select');
        var textareas = $box.find('textarea');
        //input文本框
        if (inputs.length > 0) {
            for (var i = 0; i < inputs.length; i++) {
                var key = inputs.eq(i).attr("name");
                var value = inputs.eq(i).val().trim();
                obj[key] = value;
            }
        }
        if (hiddens.length > 0) {
            for (var i = 0; i < hiddens.length; i++) {
                var key = hiddens.eq(i).attr("name");
                var value = hiddens.eq(i).val().trim();
                obj[key] = value;
            }
        }
        //单选框获取值
        if (radios.length > 0) {
            var arr = [];
            var name = '';
            for (var i = 0; i < radios.length; i++) {
                var key = radios.eq(i).attr("name");
                if (key != name) {
                    name = key;
                    arr.push(key);
                }
            }
            for (var j = 0; j < arr.length; j++) {
                obj[arr[j]] = $box.find('input[name=' + arr[j] + ']:checked').val();
            }
        }
        //复选框获取值
        if (checkboxs.length > 0) {
            var arr = [];
            var name = '';
            for (var i = 0; i < checkboxs.length; i++) {
                var key = checkboxs.eq(i).attr("name");
                if (key != name) {
                    name = key;
                    arr.push(key);
                }
            }
            for (var j = 0; j < arr.length; j++) {
                var checkedNum = $box.find('input[name=' + arr[j] + ']:checked');
                var valueT = [];
                if (checkedNum.length > 0) {
                    for (var l = 0; l < checkedNum.length; l++) {
                        valueT.push(checkedNum.eq(l).val());
                    }
                } else {
                    valueT = []
                }
                obj[arr[j]] = valueT;
            }
        }
        //下拉选获取值
        if (selects.length > 0) {
            for (var i = 0; i < selects.length; i++) {
                var key = selects.eq(i).attr("name");
                var value = selects.eq(i).val();
                if (value == "请选择") {
                    value = "";
                }
                if (key == null || key == '' || key == undefined) {} else {
                    obj[key] = value;
                }
            }
        }
        //文本输入框获取值
        if (textareas.length > 0) {
            for (var i = 0; i < textareas.length; i++) {
                var key = textareas.eq(i).attr("name");
                var value = textareas.eq(i).val().trim();
                obj[key] = value;
            }
        }
        return obj;
    };

    var setForm = function(e, data) { //给表单赋值
        imgIds = [];
        var $box = $("#" + e);
        for (key in data) {
            if (data[key] == null || data[key] == undefined) {
                var type = $box.find('[name="' + key + '"]').attr("data-type");
                if (type == 'String') {
                    data[key] = '';
                } else if (type == 'Number') {
                    data[key] = 0;
                }
            }
            $box.find('input[type=text][name="' + key + '"]').val(data[key]);
            $box.find('input[type=radio][name="' + key + '"][value="' + data[key] + '"]').prop("checked", true);
            $box.find('input[type=checkbox][name="' + key + '"]').val(data[key]);
            $box.find('textarea[name="' + key + '"]').val(data[key]);
            $box.find('select[name="' + key + '"]').val(data[key]);
        }
        if (data.pic) {
            if (data.pic.length > 0) {
                var txtReImg = '';
                for (var i = 0; i < data.pic.length; i++) {
                    txtReImg += '<div class="imgList">' +
                        '<img src="/cloudlink-core-file/file/getImageBySize?fileId=' + data.pic[i] + '&viewModel=fill&width=104&hight=78" alt="">' +
                        '<span class="deleteModifyPic" data-key="' + data.pic[i] + '">XX</span></div>';
                }
                $box.find(".pic").html(txtReImg);
            }
        }
    };
    var setDetails = function(e, data) { //给表单赋值
        imgIds = [];
        var $box = $("#" + e);
        for (key in data) {
            if (data[key] == null || data[key] == undefined) {
                var type = $box.find('[data-name="' + key + '"]').attr("data-type");
                if (type == 'String') {
                    data[key] = '';
                } else if (type == 'Number') {
                    data[key] = 0;
                }
            } else {

                var company = $box.find('[data-name="' + key + '"]').attr("data-company");
                if (company != undefined && data[key] !== "") {
                    data[key] = data[key] + '（' + company + '）';
                }
            }
            // var company = $box.find('[data-name="' + key + '"]').attr("data-company");
            // if (data[key] !== '' && data[key] !== 0) {
            //     var company = $box.find('[data-name="' + key + '"]').attr("data-company");
            //     if (company) {
            //         data[key] = data[key] + '(' + company + ')';
            //     }
            // } else {
            //     data[key] = "";
            // }
            $box.find('[data-name="' + key + '"]').text(data[key]);
        }
        if (data.pic) {
            if (data.pic.length > 0) {
                var txtReImg = '';
                for (var i = 0; i < data.pic.length; i++) {
                    txtReImg += '<div class="imgList">' +
                        '<img src="/cloudlink-core-file/file/getImageBySize?fileId=' + data.pic[i] + '&viewModel=fill&width=104&hight=78" alt="">' +
                        '<span class="deleteModifyPic" data-key="' + data.pic[i] + '">XX</span></div>';
                }
                $box.find(".pic").html(txtReImg);
            }
        }
    };
    var getImg = function() { //获取删除的图片
        return imgIds;
    };
    var deleteImg = function(e) {
        var id = $(e).attr("data-key");
        imgIds.push(id);
        $(e).closest(".imgList").remove();
    };
    return {
        getForm: getForm,
        setForm: setForm,
        getImg: getImg,
        setDetails: setDetails
    };
})();