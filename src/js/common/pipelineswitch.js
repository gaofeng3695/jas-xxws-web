/**
 * 管网显示相关操作
 * pipelinebtnObj.init(divBox); 入参 divBox : 百度地图外面的元素对象
 */
(function(window, $) {
    var pipelinebtnObj = {
        box: null,
        $btn: null,
        init: function($divBox) {
            if (!$divBox) {
                return;
            }
            this.box = $divBox;
            this.creatDom();
        },
        creatDom: function() {
            var _this = this;
            this.$btn = $('<span class="active"></span>');
            var a = $('<div class="pipelineDiv"></div>');
            var b = $('<div class="pipelineBtn">管网</div>');
            this.box.append(a);
            a.append(b);
            b.append(this.$btn);
            this.$btn.click(function() {
                if ($(this).hasClass("active")) {
                    _this._lineClose();
                } else {
                    _this._lineOpen();
                }
            });
        },
        _lineOpen: function() {
            pipeLineObj.drawLines();
            this.$btn.addClass("active");
        },
        _lineClose: function() {
            pipeLineObj.removeLines();
            this.$btn.removeClass("active");
        }
    };
    window.pipelinebtnObj = pipelinebtnObj;
})(window, $);