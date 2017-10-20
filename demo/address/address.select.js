/**
 * 
 */
var addressObj = (function() {
    var province = $(".addressProvince");
    var city = $(".addressCity");
    var county = $(".addressCounty");
    var town = $(".addressTown");
    var provinceText = '';
    var cityText = '';
    var countyText = '';
    var townText = '';
    var dataAll = null;
    $.ajax({
        type: 'GET',
        url: '/src/js/user/city.json',
        dataType: 'json',
        success: function(data) {
            console.log(data)
            dataAll = data;
            setAdress("310101018000");
        }
    });
    var setAdress = function(code) {
        // province = $("#" + id).find(".addressProvince");
        // city = $("#" + id).find(".addressCity");
        // county = $("#" + id).find(".addressCounty");
        // town = $("#" + id).find(".addressTown");
        province.html('<option value="">请选择</option>');
        city.html('');
        county.html('');
        town.html('');
        var a = dataAll.province;
        var b = dataAll.city;
        var c = dataAll.county;
        var d = dataAll.town;
        var bArr = [],
            cArr = [],
            dArr = [];
        if (code) {
            var aCode = code.substring(0, 2) + '0000000000';
            var bCode = code.substring(0, 4) + '00000000';
            var cCode = code.substring(0, 6) + '000000';
            for (var i = 0; i < a.length; i++) {
                provinceText = '<option value="' + a[i].code + '">' + a[i].name + '</option>';
                province.append(provinceText);
            }
            province.val(aCode);
            for (var i = 0; i < b.length; i++) {
                if (b[i].parentId == aCode) {
                    bArr.push(b[i]);
                }
            }
            for (var i = 0; i < bArr.length; i++) {
                cityText = '<option value="' + bArr[i].code + '">' + bArr[i].name + '</option>';
                city.append(cityText);
            }
            city.val(bCode);
            for (var i = 0; i < c.length; i++) {
                if (c[i].parentId == bCode) {
                    cArr.push(c[i]);
                }
            }
            for (var i = 0; i < cArr.length; i++) {
                countyText = '<option value="' + cArr[i].code + '">' + cArr[i].name + '</option>';
                county.append(countyText);
            }
            county.val(cCode);
            for (var i = 0; i < d.length; i++) {
                if (d[i].parentId == cCode) {
                    dArr.push(d[i]);
                }
            }
            for (var i = 0; i < dArr.length; i++) {
                townText = '<option value="' + dArr[i].code + '">' + dArr[i].name + '</option>';
                town.append(townText);
            }
            town.val(code);
        } else {
            city.html('<option value="">请选择</option>');
            county.html('<option value="">请选择</option>');
            town.html('<option value="">请选择</option>');
            for (var i = 0; i < a.length; i++) {
                provinceText = '<option value="' + a[i].code + '">' + a[i].name + '</option>';
                province.append(provinceText);
            }
        }
    };
    //省的改变
    province.change(function() {
        var id = $(this).val();
        var bArr = [],
            cArr = [],
            dArr = [];
        city.html("");
        county.html("");
        town.html("");
        if (id == '' || id == null) {
            city.html('<option value="">请选择</option>');
            county.html('<option value="">请选择</option>');
            town.html('<option value="">请选择</option>');
            return;
        }
        for (var i = 0; i < dataAll.city.length; i++) {
            if (dataAll.city[i].parentId == id) {
                bArr.push(dataAll.city[i]);
            }
        }
        for (var i = 0; i < bArr.length; i++) {
            cityText = '<option value="' + bArr[i].code + '">' + bArr[i].name + '</option>';
            city.append(cityText);
        }
        for (var i = 0; i < dataAll.county.length; i++) {
            if (dataAll.county[i].parentId == bArr[0].code) {
                cArr.push(dataAll.county[i]);
            }
        }
        for (var i = 0; i < cArr.length; i++) {
            countyText = '<option value="' + cArr[i].code + '">' + cArr[i].name + '</option>';
            county.append(countyText);
        }
        for (var i = 0; i < dataAll.town.length; i++) {
            if (dataAll.town[i].parentId == cArr[0].code) {
                dArr.push(dataAll.town[i]);
            }
        }
        for (var i = 0; i < dArr.length; i++) {
            townText = '<option value="' + dArr[i].code + '">' + dArr[i].name + '</option>';
            town.append(townText);
        }
    });
    //市的改变
    city.change(function() {
        var id = $(this).val();
        var cArr = [],
            dArr = [];
        county.html("");
        town.html("");
        for (var i = 0; i < dataAll.county.length; i++) {
            if (dataAll.county[i].parentId == id) {
                cArr.push(dataAll.county[i]);
            }
        }
        for (var i = 0; i < cArr.length; i++) {
            countyText = '<option value="' + cArr[i].code + '">' + cArr[i].name + '</option>';
            county.append(countyText);
        }
        for (var i = 0; i < dataAll.town.length; i++) {
            if (dataAll.town[i].parentId == cArr[0].code) {
                dArr.push(dataAll.town[i]);
            }
        }
        for (var i = 0; i < dArr.length; i++) {
            townText = '<option value="' + dArr[i].code + '">' + dArr[i].name + '</option>';
            town.append(townText);
        }
    });
    //区/镇改变
    county.change(function() {
        var id = $(this).val();
        var dArr = [];
        town.html("");
        for (var i = 0; i < dataAll.town.length; i++) {
            if (dataAll.town[i].parentId == id) {
                dArr.push(dataAll.town[i]);
            }
        }
        for (var i = 0; i < dArr.length; i++) {
            townText = '<option value="' + dArr[i].code + '">' + dArr[i].name + '</option>';
            town.append(townText);
        }
    });
    return {
        setAdress: setAdress,
    }
})();