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
                //alert(nfile + "," + img.fileSize + " bytes");
            };
            //fileList.style.filter="progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod='image',src='"+nfile+"')";
        }
        i++;
        // console.log(obj.value)
        var imagesL = '<div class="feedback_images">' +
            '<img src="' + path + '" alt=""/>' +
            '<span onclick="closeImg(this);" data-key="' + i + '"></span>' +
            // '<input type="file" style="display:none" id="hid' + i + '" name="file" value=' + obj.value + ' />' +
            '</div>';
        $(".feedback_img_list").append(imagesL);
        var file = {
            "data-value": i,
            "id": "load_file_" + i,
            "name": "file"
        }
        $(".feedback_img_file").find("input").attr("class", "");
        $(".feedback_img_file").find("input").last().attr(file);
        $(".feedback_img_file").append('<input type="file" onchange="handleFiles(this);" class="upload_file" />');

        // document.getElementById('hid' + i).files = files;
        //console.log(document.getElementById('hid'+i).files)

    }
}