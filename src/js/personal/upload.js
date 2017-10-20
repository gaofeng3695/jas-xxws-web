var i = 0;

window.URL = window.URL || window.webkitURL;

var fileElem = document.getElementById("fileElem"),
    path = null,
    fileList = document.getElementById("fileList");

function handleFiles(obj) {
    var filextension = obj.value.substring(obj.value.lastIndexOf("."), obj.value.length);
    filextension = filextension.toLowerCase();
    if ((filextension != '.jpg') && (filextension != '.gif') && (filextension != '.jpeg') && (filextension != '.png') && (filextension != '.bmp')) {
        alert("对不起，系统仅支持标准格式的照片，请您调整格式后重新上传，谢谢 !");
        obj.focus();
    } else {
        var files = obj.files,
            img = new Image();
        // alert(window.URL)
        if (window.URL) {
            //File API
            //alert(files[0].name + "," + files[0].size + " bytes");
            path = window.URL.createObjectURL(files[0]); //创建一个object URL，并不是你的本地路径
            img.onload = function(e) {
                window.URL.revokeObjectURL(this.src); //图片加载后，释放object URL
            };


        } else if (window.FileReader) {
            //opera不支持createObjectURL/revokeObjectURL方法。我们用FileReader对象来处理
            var reader = new FileReader();
            reader.readAsDataURL(files[0]);
            reader.onload = function(e) {
                //alert(files[0].name + "," + e.total + " bytes");
                path = this.result;
            }

        } else {
            //ie      
            obj.select();
            obj.blur();
            var nfile = document.selection.createRange().text;
            document.selection.empty();
            path = nfile;
            img.onload = function() {

            };
            //fileList.style.filter="progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod='image',src='"+nfile+"')";
        }
        var imagesL =
            '<img src="' + path + '" alt=""/>' +
            '<input type="file" style="display:none" id="hid" name="file" value=' + obj.value + '/>';
        document.getElementById("view_persoanl").innerHTML = ''; //上传照片之前进行页面内容删除
        $(".view_persoanl").append(imagesL);
        $(".persoanl_add").css('display', 'none');
        $("#Imgnote").text("");
        document.getElementById('hid').files = files;
        // document.getElementById("userImg").src = path;
    }
}