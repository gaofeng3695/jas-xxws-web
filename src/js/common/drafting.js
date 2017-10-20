var Sys = (function(ua) {
    var s = {};
    s.IE = ua.match(/msie ([\d.]+)/) ? true : false;
    s.Firefox = ua.match(/firefox\/([\d.]+)/) ? true : false;
    s.Chrome = ua.match(/chrome\/([\d.]+)/) ? true : false;
    // s.IE6 = (s.IE && ([/MSIE (\d)\.0/i.exec(navigator.userAgent)][0][1] == 6)) ? true : false;
    // s.IE7 = (s.IE && ([/MSIE (\d)\.0/i.exec(navigator.userAgent)][0][1] == 7)) ? true : false;
    // s.IE8 = (s.IE && ([/MSIE (\d)\.0/i.exec(navigator.userAgent)][0][1] == 8)) ? true : false;
    // console.log(s)
    return s;
})(navigator.userAgent.toLowerCase()); /*判断是哪一种浏览器,火狐,谷歌,ie*/
// var aa = function(id) {
//     return document.getElementById(id);
// }; /*获取元素,模仿jQuery*/
var Css = function(e, o) { /*更改对象的top,left,width,height来控制对象的大小*/
    for (var i in o)
        e.style[i] = o[i];
};
var Extend = function(destination, source) { /*拷贝对象的属性*/
    for (var property in source) {
        destination[property] = source[property];
    }
};
/*直接调用方法*/
var Bind = function(object, fun) {
    var args = Array.prototype.slice.call(arguments).slice(2);
    return function() {
        return fun.apply(object, args);
    }
};
/*直接调用方法,并将事件的类型传入作为第一个参数*/
var BindAsEventListener = function(object, fun) {
    var args = Array.prototype.slice.call(arguments).slice(2);
    return function(event) {
        return fun.apply(object, [event || window.event].concat(args));
    }
};
/*获取当前元素的属性*/
var CurrentStyle = function(element) {
    return element.currentStyle || document.defaultView.getComputedStyle(element, null);
};
/*事件监听,执行对应的函数*/
function addListener(element, e, fn) {
    element.addEventListener ? element.addEventListener(e, fn, false) : element.attachEvent("on" + e, fn);
};
/*事件的移除*/
function removeListener(element, e, fn) {
    element.removeEventListener ? element.removeEventListener(e, fn, false) : element.detachEvent("on" + e, fn)
};
/*创建一个新的可以拖拽的,变换大小的对象*/
var Class = function(properties) {
    var _class = function() {
        return (arguments[0] !== null && this.initialize && typeof(this.initialize) == 'function') ? this.initialize.apply(this, arguments) : this;
    };
    _class.prototype = properties;
    return _class;
};
var Resize = new Class({
    initialize: function(obj) {
        // console.log(obj)
        this.obj = obj;
        this.resizeelm = null;
        this.fun = null; //记录触发什么事件的索引
        this.original = []; //记录开始状态的数组
        this.width = null;
        this.height = null;
        this.fR = BindAsEventListener(this, this.resize); /*拖拽去更改div的大小*/
        this.fS = Bind(this, this.stop); /*停止移除监听的事件*/
    },
    set: function(elm, direction) {
        if (!elm) return;
        this.resizeelm = elm;
        // console.log(this.resizeelm)
        /*点击事件的监听,调用start函数去初始化数据,监听mousemove和mouseup,这两个事件,当mouseover的时候,去更改div的大小,当mouseup,去清除之前监听的两个事件*/
        addListener(this.resizeelm, 'mousedown', BindAsEventListener(this, this.start, this[direction]));
        return this;
    },
    start: function(e, fun) {
        // debugger;
        this.fun = fun;
        this.original = [parseInt(CurrentStyle(this.obj).width), parseInt(CurrentStyle(this.obj).height), parseInt(CurrentStyle(this.obj).left), parseInt(CurrentStyle(this.obj).top)];
        console.log({
            width: this.original[0],
            height: this.original[1],
            left: this.original[2],
            top: this.original[3]
        });
        this.width = (this.original[2] || 0) + this.original[0];
        this.height = (this.original[3] || 0) + this.original[1];
        addListener(document, "mousemove", this.fR);
        addListener(document, 'mouseup', this.fS);
    },
    resize: function(e) {
        this.fun(e);
        /*失去焦点的时候,调用this.stop去清除监听事件*/
        Sys.IE ? (this.resizeelm.onlosecapture = function() {
            console.log(1)
            this.fS();
        }) : (this.resizeelm.onblur = function() {
            console.log(2)
            this.fS();
        })
    },
    stop: function() {
        removeListener(document, "mousemove", this.fR);
        removeListener(document, "mousemove", this.fS);
        //window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty(); /**清除选中的内容*/
    },
    up: function(e) {
        this.height > e.clientY ? Css(this.obj, {
            top: e.clientY + "px",
            height: this.height - e.clientY + "px"
        }) : this.turnDown(e);
    },
    down: function(e) {
        e.clientY > this.original[3] ? Css(this.obj, {
            top: this.original[3] + 'px',
            height: e.clientY - this.original[3] + 'px'
        }) : this.turnUp(e);
    },
    left: function(e) {
        e.clientX < this.width ? Css(this.obj, {
            left: e.clientX + 'px',
            width: this.width - e.clientX + "px"
        }) : this.turnRight(e);
    },
    right: function(e) {
        e.clientX > this.original[2] ? Css(this.obj, {
            left: this.original[2] + 'px',
            width: e.clientX - this.original[2] + "px"
        }) : this.turnLeft(e);
    },
    leftUp: function(e) {
        this.up(e);
        this.left(e);
    },
    leftDown: function(e) {
        this.left(e);
        this.down(e);
    },
    rightUp: function(e) {
        this.up(e);
        this.right(e);
    },
    rightDown: function(e) {
        this.right(e);
        this.down(e);
    },
    turnDown: function(e) {
        Css(this.obj, {
            top: this.height + 'px',
            height: e.clientY - this.height + 'px'
        });
    },
    turnUp: function(e) {
        Css(this.obj, {
            // top: e.clientY + 'px',
            top: 0 + 'px',
            height: this.original[3] - e.clientY + 'px'
        });
    },
    turnRight: function(e) {
        Css(this.obj, {
            left: this.width + 'px',
            width: e.clientX - this.width + 'px'
        });
    },
    turnLeft: function(e) {
        Css(this.obj, {
            left: e.clientX + 'px',
            width: this.original[2] - e.clientX + 'px'
        });
    }
});

function drafting(mainId, pointId) {
    new Resize(document.getElementById(mainId)).set(document.getElementById(pointId), 'down');
}

// window.onload = function() {
//     new Resize($('ss')).set($('rUp'), 'up').set($('rDown'), 'down').set($('rLeft'), 'left').set($('rRight'), 'right').set($('rLeftUp'), 'leftUp').set($('rLeftDown'), 'leftDown').set($('rRightDown'), 'rightDown').set($('rRightUp'), 'rightUp');
// }