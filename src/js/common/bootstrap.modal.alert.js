/*
 ** 自定义模态框 created by GF on 2017.02.28
 ** 依赖Jquery 和 bootstrap.js
 ** 使用方法 ： var tip = new ModalTip('IDname');
 ** 显示 ： tip.showTip(s, fn);
 */
// function ModalTip(sIdName) {
//     if (!sIdName) {
//         alert('请输入自定义模态框ID名');
//         return;
//     }
//     this.id = sIdName;
//     this.$html = null;
//     this.$modal = null;
//     this.renderModal();
// }
// ModalTip.prototype.renderModal = function () {
//     var that = this;
//     var sHtml = [
//         '<div class="modal fade  bs-example-modal-sm" id="' + that.id + '" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">',
//         '<div class="modal-dialog modal-sm" role="document">',
//         '<div class="modal-content">',
//         '<div class="modal-header" style="padding:6px 15px;">',
//         '<h4 class="modal-title" id="myModalLabel">',
//         '提示',
//         '</h4>',
//         '</div>',
//         '<div class="modal-body">',
//         '<div class="modal_tip" style="min-height : 60px">',
//         '</div>',
//         '</div>',
//         '<div class="modal-footer" style="padding:6px 15px;">',
//         '<button type="button" class="btn btn-primary btn_close" data-dismiss="modal">',
//         '知道了',
//         '</button>',
//         '</div>',
//         '</div>',
//         '</div>',
//         '</div>'
//     ].join('');
//     that.$html = $(sHtml);

//     $(document.body).append(that.$html);
//     that.$modal = $('#' + that.id);
// };
// ModalTip.prototype.showTip = function (s, fn) {
//     var that = this;
//     s = s ? s : '';
//     that.$modal.find('.modal_tip').html(s);
//     that.$modal.modal({
//         backdrop: 'static',
//         keyboard: false
//     });
//     that.$modal.find('.btn_close')[0].onclick = function () {
//         if (typeof fn === 'function') {
//             fn();
//         }
//     }
// };

/*
 *自定义模态框 created by GF on 2017.02.28
 *依赖Jquery 和 bootstrap.js
 *基于GF的版本 Alex重新进行了单例模式的封装 modify by Alex on 2017.03.01
 */
var xxwsWindowObj = (function() {　　　　
    var defaultOptions = {
        tip: '请输入提示',
        name_title: '提示',
        name_cancel: '取消',
        name_confirm: '确定',
        isCancelBtnShow: false,
        callBack: null
    };
    var id = 'xxws_alert_';
    var index = 0;
    var $modalAlert = null;
    var formatParams = function(arguments) {
        /*
         ** 参数三种方式
         ** 1. 参数为对象，覆盖默认参数，后将其导出
         ** 2. 单个参数入参，整理成对象，覆盖默认参数，后将其导出
         ** 3. 其他情况，直接导出默认参数
         */
        if (arguments.length > 0) {
            if ($.isPlainObject(arguments[0])) {
                return $.extend(true, {}, defaultOptions, arguments[0]);
            } else if (Object.prototype.toString.call(arguments[0]) === '[object String]') {
                var paramObj = {
                    tip: arguments[0]
                }
                if (Object.prototype.toString.call(arguments[1]) === '[object Function]') {
                    paramObj.callBack = arguments[1];
                }
                if (Object.prototype.toString.call(arguments[2]) === '[object Boolean]') {
                    paramObj.isCancelBtnShow = arguments[2];
                }
                return $.extend(true, {}, defaultOptions, paramObj);
            }
        }
        return $.extend(true, {}, defaultOptions);
    };
    var renderAlert = function(obj) {
        var sHtml = [
            '<div class="modal fade  bs-example-modal-sm" id="' + id + (++index) + '" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">',
            '<div class="modal-dialog modal-sm" role="document">',
            '<div class="modal-content">',
            '<div class="modal-header" style="padding:6px 15px;">',
            '<h4 class="name_title modal-title" id="myModalLabel">',
            obj.name_title,
            '</h4>',
            '</div>',
            '<div class="modal-body">',
            '<div class=" tip modal_tip" style="min-height : 60px">',
            obj.tip,
            '</div>',
            '</div>',
            '<div class="modal-footer" style="padding:6px 15px;">',
            '<button type="button" class="name_confirm btn btn-primary btn_confirm" data-dismiss="modal">',
            obj.name_confirm,
            '</button>',
            '<button type="button" class="isCancelBtnShow name_cancel btn btn-default btn_close" data-dismiss="modal" style="display:none;margin-left: 12px">',
            obj.name_cancel,
            '</button>',
            '</div>',
            '</div>',
            '</div>',
            '</div>'
        ].join('');
        this.$html = $(sHtml);
        $(document.body).append(this.$html);
        $modalAlert = $('#' + id + index);
        if (obj.isCancelBtnShow === true) {
            $modalAlert.find('.name_cancel').css('display', 'inline-block');
        }
        // $modalAlert.on('hidden.bs.modal', function(e) {
        //     if (typeof obj.callBack === 'function') {
        //         return obj.callBack();
        //     }
        // });
        $modalAlert.find('.btn_confirm')[0].onclick = function() {
            $modalAlert.on('hidden.bs.modal', function(e) {
                if (typeof obj.callBack === 'function') {
                    return obj.callBack();
                }
            });
            // if (typeof obj.callBack === 'function') {
            //     return obj.callBack();
            // }
        }
    };
    var xxwsAlert = function() {
        /*if($modalAlert){
            $modalAlert.remove();
        }*/
        var obj = formatParams(arguments);
        renderAlert(obj);
        $modalAlert.modal({
            backdrop: 'static',
            keyboard: false
        });
    }
    return {
        xxwsAlert: xxwsAlert
    };
})();