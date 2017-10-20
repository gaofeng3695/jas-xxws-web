(function() {

    var createSearhTemplate = function(obj) {
        if (!obj) {
            alert('请传入参数！')
        }
        return new Search(obj);
    };

    var index = 0;

    function Search(obj) {
        this.eventsMap = {
            'click .search_more': 'e_toogleMore',
            'click .item': 'e_clickItem',
            'click .gf_reset_Btn': 'e_resetAndSearch',
            'click .search_Btn': 'e_searchByKeyword',
            'keypress .searchInput': 'e_searchByKeywordOnKeypress',
        };
        index++;
        this.init(obj);
    }

    Search.prototype = {
        constructor: Search,
        defaultParams: {
            wrapper: '',
            //isDatePicker : true,
            itemArr: [],
            queryObj: null,
            cbRender: null, //选填，选项变更时会触发回调
            callback: function(dom) {
                //console.log(dom)
            }
        },
        init: function(obj) {
            var that = this;
            this.params = $.extend({}, this.defaultParams, obj, true);
            this.wrapper = $(this.params.wrapper);
            this.queryObj = this.params.queryObj;
            this.defaultQuerryObj = $.extend({}, this.queryObj, true);
            this.callback = function() { //设置属性变更的回调
                that.queryObj.keyword = that.wrapper.find('.searchInput').val();
                that.params.callback(that.queryObj);
            };
            this.class = 'search_index_' + index; //为新生成的搜索wrapper添加类

            var s = this.template(); //生成模板
            this.render(s); //渲染
            this.bindEvent(); //绑定事件

            this.renderActive(this.queryObj); //渲染高亮
            // this.callback(); //执行回调
        },
        renderActive: function(obj) { //被选中的样式
            var that = this;
            for (var key in obj) {
                var $parent = that.wrapper.find('.item').parent('[data-class=' + key + ']');
                $parent.not('.item2_id').find('.item').removeClass('active');
                var $targetNode = $parent.find('.item[data-value="' + obj[key] + '"]');
                $targetNode.addClass('active').siblings().removeClass('active');

                if ($targetNode.parent().hasClass('item2_id')) { //如果当前item拥有父集
                    $targetNode.parent().show().siblings().hide(); //显示当前item的所在组，隐藏它的同级组
                    //$targetNode.parent().slideDown().siblings().slideUp(); //显示当前item的所在组，隐藏它的同级组
                    var _obj = {};
                    _obj[key] = $targetNode.parent().attr('data-father');
                    that.renderActive(_obj); //渲染当前item的父集item高亮
                } else if ($targetNode.find('i').length === 0) {
                    //如果当前item没有子集，那么隐藏所有子集
                    $parent.filter('.item2_id').hide();
                }

                if (key === 'date') {
                    if (obj[key] === 'diy') {
                        $('#item_diy').addClass('active');
                    } else {
                        $('#item_diy').removeClass('active');
                    }
                }

            }
            that.params.cbRender && that.params.cbRender();

        },

        bindEvent: function() {
            this.initializeOrdinaryEvent(this.eventsMap);
            if (this.isDatePicker) {
                this.bindDateDiyEvent();
            }
        },
        bindDateDiyEvent: function() {
            var that = this;
            var $startInput = this.wrapper.find(".datetimeStart");
            var $endInput = this.wrapper.find(".datetimeEnd");
            var $diyDateBtn = this.wrapper.find(".diyDateBtn");

            var dateChangeForSearch = function() {
                var startDate = $startInput.val();
                var endDate = $endInput.val();
                if (startDate && endDate) {
                    $diyDateBtn.addClass("active");
                } else {
                    $diyDateBtn.removeClass("active");
                }
            }

            $startInput.datetimepicker({
                format: 'yyyy-mm-dd',
                minView: 'month',
                language: 'zh-CN',
                autoclose: true,
                // startDate: new Date()
            }).on("change", function() {
                dateChangeForSearch();
            }).on("click", function() {
                $startInput.datetimepicker("setEndDate", $endInput.val());
            });
            $endInput.datetimepicker({
                format: 'yyyy-mm-dd',
                minView: 'month',
                language: 'zh-CN',
                autoclose: true,
                // startDate: new Date()
            }).on("change", function() {
                dateChangeForSearch();
            }).on("click", function() {
                $endInput.datetimepicker("setStartDate", $startInput.val());
            });

            $diyDateBtn.on('click', function() {
                var s = $startInput.val();
                var e = $endInput.val();
                if (!s) {
                    window.xxwsWindowObj ? xxwsWindowObj.xxwsAlert('请选择开始时间') : alert('请选择开始时间');
                    return;
                }
                if (!e) {
                    window.xxwsWindowObj ? xxwsWindowObj.xxwsAlert('请选择结束时间') : alert('请选择结束时间');
                    return;
                }
                that.queryObj.startDate = s;
                that.queryObj.endDate = e;
                that.queryObj.date = 'diy';
                that.renderActive({
                    'date': 'diy'
                });
                that.callback(that.queryObj);
                //that.refreshTable();
            });
        },

        render: function(s) {
            this.wrapper.prepend(s);
        },
        template: function() { //生成模板
            var sAllItemLine = '';

            var that = this;
            this.params.itemArr.forEach(function(item) {
                sAllItemLine += that.createItemLine(item);
            });
            return [
                '<div class="container-fluid search_item_wrapper ' + this.class + '">',
                '<div class="top">',
                '<div class="row search_title">',
                this.createTopLeftTemplate(this.params.topItem),
                this.topRightTemplate(),
                '</div>',
                '<div class="more_item_wrapper">', //更多选项begin
                '<div class="sub_wrapper">',
                '<b class="up_triangle"><i></i></b>', //小三角
                '<div class="son_wrapper">',
                sAllItemLine,
                '</div>',
                '</div>',
                '</div>', //更多选项end
                '</div>',
                '</div>'
            ].join('');
        },
        createItemLine: function(obj) { //生成高级搜索中的某一分类
            if (typeof obj === 'object') {
                var oTile = obj.title;
                var aItem = obj.items;
                var createItems = function(obj) {
                    var oTile = obj.title;
                    var aItem = obj.items;
                    var s = '';
                    var s2 = '';
                    if (typeof aItem === 'string') {
                        s2 += aItem;
                    } else {
                        aItem.forEach(function(item, index) {

                            if (typeof item === 'string') {
                                //console.log(item)
                                s += item;
                            }
                            if (typeof item === 'object') {
                                if (!item.children) {
                                    s += '<span class="item" data-value="' + item.value + '">' + item.name + '</span>';
                                } else {
                                    s += '<span class="item"  data-subvalue="' + item.subValue + '" data-value="' + item.value + '">' + item.name + '<i class="glyphicon glyphicon-menu-down"></i></span>';
                                    var sChild = '<div class="item2_id" data-father="' + item.value + '" data-class="' + oTile.value + '">' + '<b> ( </b>';
                                    item.children.forEach(function(item2) {

                                        sChild += '<span class="item" data-value="' + item2.value + '">' + item2.name + '</span>';
                                    });
                                    sChild += '<b> ) </b>' + '</div>';
                                    s2 += sChild;
                                }
                            }

                        });
                    }
                    return {
                        item1: s,
                        item2: s2
                    }
                };
                var oitems = createItems(obj);
                //console.log(oitems.item2)
                return [
                    '<div class="line">',
                    '<div class="title">' + oTile.name + '</div>',
                    '<div class="item_box">',
                    '<div class="item1" data-class="' + oTile.value + '">',
                    oitems.item1,
                    '</div>',
                    oitems.item2 ? ('<div class="item2">' + oitems.item2 + '</div>') : '',
                    '</div>',
                    '</div>',
                ].join('');
            }
            if (obj === 'date') {
                this.isDatePicker = true;
                return this.dateLineTemplate();
            }
        },
        topRightTemplate: function() { //生成右上部分，包含关键词搜索、重置等
            return [
                '<div class="col-lg-6 col-xs-12 right_wrapper">',
                '<div class="search_btn_right">',
                '<div class="search_reset gf_reset_Btn" id="">重置</div>',
                '<div class="more search_more" id="">高级搜索</div>',
                '</div>',
                '<div class="search_wrapper">',
                '<div class="input_wrapper">',
                '<input class="searchInput"  type="text" placeholder="输入关键字搜索">',
                '</div>',
                '<span class="mybtn search_Btn" id="">确定</span>',
                '</div>',
                '</div>',
            ].join('');
        },
        createTopLeftTemplate: function(obj) { //生成坐上部分，快速搜索条件
            var s = '<div class="col-lg-6 col-xs-12 btn_wrapper">';
            var nLines = obj.widthRate.length;

            for (var i = 0; i < nLines; i++) {
                s += this._createTopItems(obj.data[i], obj.widthRate[i]);
            }
            s += '</div>';
            return s;
        },
        _createTopItems: function(param, width) { //生成快速搜索条件中的某一类别
            var s = '';
            if (typeof param === 'object') {
                s += '<div class="col-xs-' + width + '" data-class="' + param.title.value + '">';
                var length = Math.floor(12 / param.items.length);
                length = length < 1 ? 1 : length;
                length = length > 4 ? 4 : length;
                s += param.items.map(function(item, index) {
                    return '<div class="item col-xs-' + length + '" data-value="' + item.value + '">' + item.name + '</div>';
                }).join('');
                s += '</div>';
                return s;
            }
            if (param === 'date') {
                return [
                    '<div class="col-xs-' + width + '" data-class="date">',
                    '<div class="item col-xs-4" data-value="all">不限</div>',
                    '<div class="item col-xs-4" data-value="day">今天</div>',
                    '<div class="item col-xs-4" data-value="week">本周</div>',
                    '</div>',
                ].join('');
            }
            return '<div class="col-xs-' + width + '">' + param + '</div>';
        },
        dateLineTemplate: function() { //高级搜索中时间类别的html模板
            return [
                '<div class="line">',
                '<div class="title">时间</div>',
                '<div class="item_box">',
                '<div class="item1" data-class="date">',
                '<span class="item" data-value="all">不限</span>',
                '<span class="item" data-value="day">今日</span>',
                '<span class="item" data-value="week">本周</span>',
                '<span class="item" data-value="month">本月</span>',
                this._DIYDateTemplate(),
                '</div>',
                '</div>',
                '</div>',
            ].join('');
        },
        _DIYDateTemplate: function() { //时间类别中自定义时间的模板

            return [
                '<span class="date">',
                '<span id="item_diy" class="diy">自定义：</span>',
                '<input size="16" type="text"   placeholder="选择起始时间" readonly class="form_datetime datetimeStart">',
                '<span>&nbsp;&nbsp;至&nbsp;&nbsp;</span>',
                '<input size="16" type="text"   placeholder="选择结束时间" readonly class="form_datetime datetimeEnd">',
                '<span class="itemBtn diyDateBtn"  data-value="diy">确定</span>',
                '</span>',
            ].join('');
        },

        initializeOrdinaryEvent: function(maps) { //初始化普通事件
            this._scanEventsMap(maps, true);
        },
        _scanEventsMap: function(maps, isOn) { //扫描时间map
            var delegateEventSplitter = /^(\S+)\s*(.*)$/;
            var type = isOn ? 'on' : 'off';
            for (var keys in maps) {
                if (maps.hasOwnProperty(keys)) {
                    if (typeof maps[keys] === 'string') {
                        maps[keys] = this[maps[keys]].bind(this);
                    }
                    var matchs = keys.match(delegateEventSplitter);
                    this.wrapper[type](matchs[1], matchs[2], maps[keys]);
                }
            }
        },
        e_searchByKeywordOnKeypress: function(e) {
            if (e && e.keyCode === 13) { // enter 键
                //that.querryObj.keyword = that.$searchInput.val();
                this.e_searchByKeyword();
            }
        },
        e_searchByKeyword: function() {
            /* 搜索关键词 */
            //this.queryObj.keyword = this.wrapper.find('.searchInput').val();
            this.callback();
        },
        e_resetAndSearch: function(e) {
            var that = this;
            /* 清空搜索条件 */
            //请求数据还原到初始话
            $.extend(that.queryObj, that.defaultQuerryObj);

            that.wrapper.find('.datetimeStart').val("");
            that.wrapper.find('.datetimeEnd').val("");
            that.wrapper.find('.diyDateBtn').removeClass("active");
            that.wrapper.find('.searchInput').val('');

            that.renderActive(that.queryObj);

            this.callback(this.queryObj);
        },
        e_toogleMore: function(e) {
            /* 显示高级搜索 */
            var node = e.currentTarget;
            if ($(node).hasClass('active')) {
                $(node).removeClass('active');
                this.wrapper.find('.more_item_wrapper').slideUp();
            } else {
                $(node).addClass('active');
                this.wrapper.find('.more_item_wrapper').slideDown();
            }


        },
        e_clickItem: function(e) {
            // console.log(that.$searchInput.val().trim())
            var node = e.currentTarget;
            var key = $(node).parent().attr("data-class");
            var value = $(node).attr('data-subvalue') || $(node).attr("data-value");

            if (key === 'date') {
                this.setDate(value);
            }
            this.queryObj[key] = value;


            var obj = {};
            obj[key] = value;
            this.renderActive(obj);
            this.callback();

        },
        setDate: function(value) {
            var that = this;
            switch (value) {
                case 'day':
                    var date = new Date().Format('yyyy-MM-dd');
                    that.queryObj.startDate = date;
                    that.queryObj.endDate = date;
                    //that.queryObj.date = 'day';
                    break;
                case 'week':
                    var date = new Date();
                    that.queryObj.startDate = date.getWeekStartDate().Format('yyyy-MM-dd');
                    that.queryObj.endDate = date.getWeekEndDate().Format('yyyy-MM-dd');
                    break;
                case 'month':
                    var date = new Date();
                    that.queryObj.startDate = date.getMonthStartDate().Format('yyyy-MM-dd');
                    that.queryObj.endDate = date.getMonthEndDate().Format('yyyy-MM-dd');
                    break;
                default:
                    that.queryObj.startDate = '';
                    that.queryObj.endDate = '';
            }
        },
    };

    window.createSearhTemplate = createSearhTemplate;

    (function utils() {
        /*
         * 对Date的扩展，将 Date 转化为指定格式的String
         * 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
         * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
         * 例子：
         * (new Date()).Format("yyyy-MM-dd HH:mm:ss.S") ==> 2006-07-02 08:09:04.423
         * (new Date()).Format("yyyy-M-d H:m:s.S")      ==> 2006-7-2 8:9:4.18
         * (new Date()).Format("yyyyMMddHHmmssS")      ==> 20060702080904423
         */
        Date.prototype.Format = function(fmt) {
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
        Date.prototype.getWeekStartDate = function() {
            var date = this;
            var day = date.getDay();
            day = day === 0 ? 7 : day;
            date.setDate(date.getDate() - (day - 1));
            return date;
        }

        /*
         ** 获取本周结束日期
         */
        Date.prototype.getWeekEndDate = function() {
            var date = this;
            var day = date.getDay();
            day = day === 0 ? 7 : day;
            date.setDate(date.getDate() + (7 - day));
            return date;
        }

        /*
         ** 获取本月开始日期
         */
        Date.prototype.getMonthStartDate = function() {
            var date = this;
            date.setDate(1);
            return date;
        }

        /*
         ** 获取本月结束日期
         */
        Date.prototype.getMonthEndDate = function() {
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
        Date.prototype.getChinaDay = function() {
            var arr = ['日', '一', '二', '三', '四', '五', '六'];
            var date = this;
            return arr[this.getDay()];
        }

    })();
})();