//在一个ul列表中查看大图，大图路径存放在一个属性data-original中,运用在jquery中
var viewPicObj = (function() {

    var view = $('<div class="viewWindow"></div>');
    var imgMain = $('<div class="viewMain"></div>');
    var img = $('<img src="" alt="">');
    var closed = $('<div class="viewClose"><i>&times;</i></div>');
    var prev = $('<div class="viewLeft">&lt;</div>');
    var next = $('<div class="viewRight">&gt;</div>');

    var index = null;
    var totalLeng = null;
    var src = null;
    var container = null;
    var viewH = null;
    var viewW = null;
    var flag = null;
    var srcLoad = '/src/images/common/loading.gif';

    $("body").on("click", ".viewClose", function() {　　　　
        closeView();
    });
    $("body").on("click", ".viewLeft", function() {　　　　
        prevView();
    });
    $("body").on("click", ".viewRight", function() {　　　　
        nextView();
    });

    //打开视图窗口
    var openView = function() {
        flag = true;
        index = 0;
        $("body").addClass("viewer-open");
        $("body").append(view);
        view.append(imgMain);
        imgMain.append(img);
        view.append(closed);
        view.append(prev);
        view.append(next);
        prev.show();
        next.show();
        viewH = view.height();
        viewW = view.width();
        img.css({
            "width": '56px',
            "height": '56px',
            "margin-top": "-28px",
            "margin-left": "-28px"
        });
    };
    //关闭视图窗口
    var closeView = function() {
        $("body").removeClass("viewer-open");
        view.remove();
    };
    //查看上一张
    var prevView = function() {
        if (flag == true) {
            flag = false;
            img.css({
                "width": '56px',
                "height": '56px',
                "margin-top": "-28px",
                "margin-left": "-28px"
            });
            next.show();
            if (index == 1) {
                prev.hide();
            }
            src = container.find("li").eq(index - 1).find("img").attr("data-original");
            img.attr("src", srcLoad);
            imgLocation(src);
            index--;
        }
    };
    //查看下一张
    var nextView = function() {
        if (flag == true) {
            flag = false;
            img.css({
                "width": '56px',
                "height": '56px',
                "margin-top": "-28px",
                "margin-left": "-28px"
            });
            prev.show();
            if (index == (totalLeng - 2)) {
                next.hide();
            }
            src = container.find("li").eq(index + 1).find("img").attr("data-original");
            img.attr("src", srcLoad);
            imgLocation(src);
            index++;
        }
    };
    //计算图片的宽高，来确定它显示的位置
    var imgLocation = function(src) {

        getImageWidth(src, function(w, h) {
            flag = true;
            img.attr("src", src);
            img.height(h);
            img.width(w);
            if (h > viewH) {
                img.height(viewH);
                img.width('auto');
                h = viewH;
                w = img.width();
            }
            if (w > viewW) {
                img.width(viewW);
                img.height('auto');
                w = viewW;
                h = img.height();
            }
            img.css({
                "margin-top": -h / 2 + "px",
                "margin-left": -w / 2 + "px"
            });

        });

        // img.load(function() {
        //     flag = true;
        //     var height = img.height();
        //     var width = img.width();
        //     console.log(height);
        //     if (height > viewH) {
        //         img.height(viewH);
        //         height = viewH;
        //         width = img.width();
        //     }
        //     if (width > viewW) {
        //         img.width(viewW);
        //         width = viewW;
        //         height = img.height();
        //     }
        //     img.css({
        //         "margin-top": -height / 2 + "px",
        //         "margin-left": -width / 2 + "px"
        //     });
        // });
    };

    function getImageWidth(url, callback) {
        var img = new Image();
        img.src = url;

        // 如果图片被缓存，则直接返回缓存数据
        if (img.complete) {
            callback(img.width, img.height);
        } else {
            // 完全加载完毕的事件
            img.onload = function() {
                callback(img.width, img.height);
            }
        }

    }

    //查看图片
    var viewPic = function(e) {
        openView();
        index = $(e).closest("li").index();
        container = $(e).closest("ul");
        totalLeng = container.find("li").length;

        src = $(e).attr("data-original");

        img.attr("src", srcLoad);

        if (index == 0) {
            prev.hide();
        }
        if (index == (totalLeng - 1)) {
            next.hide();
        }
        flag = false;
        imgLocation(src);
    };
    return {
        viewPic: viewPic,
    }
})();