/**
 * 管网显示相关操作
 * pipelinebtnObj.init(divBox); 入参 divBox : 百度地图外面的元素对象
 * isPrivaliage:初始化之前判断该版本是否存在管网地图权限。传入参数为百度地图外的元素对象和地图初始化对象
 */
(function(window, $) {
    var pipelinebtnObj = {
        box: null,
        $btn: null,
        isPrivaliage: function($divBox, mapObj) { //判断是否存管网权限
            var that = this;
            $.ajax({
                type: 'GET',
                url: "/cloudlink-core-framework/menu/checkAccess?token=" + lsObj.getLocalStorage('token'),
                contentType: "application/json",
                data: { "appId": "0c753fdd-5f54-4b24-bf50-491ea5eb1a84", "menuCode": "pipeline" },
                dataType: "json",
                success: function(data, state) {
                    if (data.success == 1) {
                        if (data.rows[0].access) {
                            that.init($divBox, mapObj);
                        }

                    }
                }
            });
        },
        init: function($divBox, mapObj) {
            if (!$divBox) {
                return;
            }
            pipeLineObj.init(mapObj);
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