(function () {
    /*
     * 对Date的扩展，将 Date 转化为指定格式的String
     * 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
     * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
     * 例子：
     * (new Date()).Format("yyyy-MM-dd HH:mm:ss.S") ==> 2006-07-02 08:09:04.423
     * (new Date()).Format("yyyy-M-d H:m:s.S")      ==> 2006-7-2 8:9:4.18
     * (new Date()).Format("yyyyMMddHHmmssS")      ==> 20060702080904423
     */
    Date.prototype.Format = function (fmt) {
        var o = {
            "M+": this.getMonth() + 1, //月份
            "d+": this.getDate(), //日
            "H+": this.getHours(), //小时
            "m+": this.getMinutes(), //分
            "s+": this.getSeconds(), //秒
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度
            "S": this.getMilliseconds() //毫秒
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    };
    /*
     ** 获取本周开始日期
     */
    Date.prototype.getWeekStartDate = function () {
        var date = this;
        var day = date.getDay();
        day = day === 0 ? 7 : day;
        date.setDate(date.getDate() - (day - 1));
        return date;
    }

    /*
     ** 获取本周结束日期
     */
    Date.prototype.getWeekEndDate = function () {
        var date = this;
        var day = date.getDay();
        day = day === 0 ? 7 : day;
        date.setDate(date.getDate() + (7 - day));
        return date;
    }

    /*
     ** 获取本月开始日期
     */
    Date.prototype.getMonthStartDate = function () {
        var date = this;
        date.setDate(1);
        return date;
    }

    /*
     ** 获取本月结束日期
     */
    Date.prototype.getMonthEndDate = function () {
        var date = this;
        var Month = date.getMonth();
        date.setMonth(Month + 1);
        date.setDate(1);
        date.setDate(0);
        return date;
    }

    /*
     ** 获取星期几，返回字符串汉字‘一’
     */
    Date.prototype.getChinaDay = function () {
        var arr = ['日', '一', '二', '三', '四', '五', '六'];
        var date = this;
        return arr[this.getDay()];
    }

})();

var commonObj = (function () {
    var DownLoadFile = function (options) {
        /*===================下载文件
        * options:{
        * url:'',  //下载地址
        * data:{name:value}, //要发送的数据
        * method:'post'
        * }
        */
        var config = $.extend(true, {
            method: 'post'
        }, options);
        var $iframe = $('<iframe id="down-file-iframe" />');
        var $form = $('<form target="down-file-iframe" method="' + config.method + '" />');
        $form.attr('action', config.url);
        for (var key in config.data) {
            $form.append('<input type="hidden" name="' + key + '" value="' + config.data[key] + '" />');
        }
        $iframe.append($form);
        $(document.body).append($iframe);
        $form[0].submit();
        $iframe.remove();
    };
    return {
        downloadFile : DownLoadFile
    }
})();