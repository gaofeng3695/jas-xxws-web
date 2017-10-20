(function (global, $, lsObj) {
    var forbid = function () {
        top.location.href = "/login.html";
    };
    var requestIfAdmin = function () {
        var _userBo = JSON.parse(lsObj.getLocalStorage('userBo'));
        if (!_userBo) {
            forbid();
        }
        $.ajax({
            type: "POST",
            url: "/cloudlink-core-framework/login/joinEnterprise",
            contentType: "application/json",
            data: JSON.stringify({
                userId: _userBo.objectId,
                enterpriseId: _userBo.enterpriseId
            }),
            async: false,
            cache: false,
            dataType: "json",
            success: function (data) {
                // alert(JSON.stringify(data));
                if (data.success == 1) {
                    var row = data.rows;
                    if (row[0].isSysadmin == 1) {
                        return;
                    }
                }
                forbid();
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                forbid();
                console.log(XMLHttpRequest);
                console.log(textStatus);
                console.log(errorThrown);
            }
        });
    };
    requestIfAdmin();
})(this, this.jQuery, lsObj);
