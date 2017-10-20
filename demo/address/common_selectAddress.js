/**
 * 地区选择插件，依赖jQuery
 * 使用方法：
 *  var oAddress = setAddress({
        defalutId : '150525100000', // 选填，镇编码，可以不传，或传空，传入错误编码会使select无选择
        dataUrl : '/demo/address/city.json', //必填， json包地址
        provinceSelector : '#provinceSelector', //必填， 省选择器
        citySelector : '#citySelector', //必填， 市选择器
        countySelector : '#countySelector', //必填， 县选择器
        townSelector : '#townSelector', //必填， 镇选择器
    }); 运行此方法生成一个地区选择实例对象，支持多对象创建
 * 获取结果：
 *  oAddress.result = {
        provinceCode : '',
        cityCode : '',
        countyCode : '',
        townCode : obj.defalutId,
        provinceName : '',
        cityName : '',
        countyName : '',
        townName : '',
        address : ''
 * }
 *
 *
 **/


(function(window,$){

    var a = function(obj){
        return new Address(obj);
    };

    function Address(_obj){
        var defalutObj  ={
            dataUrl : '/demo/address/city.json',
            defalutId : '',
            provinceSelector : '',
            citySelector : '',
            countySelector : '',
            townSelector : '',
        };

        var obj = $.extend(defalutObj,_obj,true);
        this.defalutId = obj.defalutId;

        this.result = {
            provinceCode : '',
            cityCode : '',
            countyCode : '',
            townCode : obj.defalutId,
            provinceName : '',
            cityName : '',
            countyName : '',
            townName : '',
            address : ''
        };
        this.initElems(obj);
        this.requestData(obj.dataUrl);
    }
    Address.prototype = {
        constructor : Address,
        initElems : function(obj){
            this.provinceDom = $(obj.provinceSelector);
            this.cityDom = $(obj.citySelector);
            this.countyDom = $(obj.countySelector);
            this.townDom = $(obj.townSelector);
        },
        requestData : function(url){
            var that = this;
            if(Address.data){
                that.render(that.defalutId);
                this.bindEvent();
            }else{
                $.ajax({
                    type: 'GET',
                    url: url,
                    dataType: 'json',
                    success: function(data) {
                        //console.log(data)
                        Address.data = data;
                        //console.log(that.defalutId)
                        that.render(that.defalutId);
                        that.bindEvent();
                    },
                    error:function(res){
                        alert('请求数据出错，请检查网络');
                    }
                });
            }
        },
        bindEvent : function(){
            var that = this;
            this.provinceDom.on('change',function(){
                that.setValueAndupdateResult('province',this.value);
                that.cityDom.val('0').trigger('change');
                that.renderSelect('city',this.value);
            });
            this.cityDom.on('change',function(){
                that.setValueAndupdateResult('city',this.value);
                that.countyDom.val('0').trigger('change');
                that.renderSelect('county',this.value)
            });
            this.countyDom.on('change',function(){
                that.setValueAndupdateResult('county',this.value);
                that.townDom.val('0').trigger('change');
                that.renderSelect('town',this.value)
            });
            this.townDom.on('change',function(){
                that.setValueAndupdateResult('town',this.value);
            });
        },
        render : function(sDefalutId){
            this.initDefaultAddress(sDefalutId);
        },
        renderSelect : function(sType,sParentId,sSelfId){
            var aData = Address.data[sType].filter(function(item,index){
                return (item.parentId === '0' || item.parentId === sParentId);
            });
            var aHtml = ['<option value="0">请选择</option>'];
            aData.forEach(function(item,index){
                aHtml.push('<option value="' + item.code + '">' + item.name + '</option>');
            });
            if( aHtml.length === 1 ){
                this[sType + 'Dom'].attr('disabled','disabled');
            }else{
                this[sType + 'Dom'].attr('disabled',false);
            }
            this[sType + 'Dom'].html(aHtml.join('')).val('0');

            this.setValueAndupdateResult(sType,sSelfId);
        },
        setValueAndupdateResult : function(sType,sId){
            var dom = this[sType+'Dom'];
            dom.val(sId || '0');
            this.result[sType+'Code']= +sId || '';
            this.result[sType+'Name']= +sId ? dom.find('option:selected').text() : '';
            this.result.address = this.result.provinceName + this.result.cityName +this.result.countyName +this.result.townName;
            //console.log(this.result)
        },
        initDefaultAddress : function(sDefalutId){
            //console.log(sDefalutId);
            var provinceId = sDefalutId?sDefalutId.substring(0, 2) + '0000000000' : '0';
            var cityId = sDefalutId?sDefalutId.substring(0, 4) + '00000000' : '0';
            var countyId = sDefalutId?sDefalutId.substring(0, 6) + '000000' : '0';
            this.renderSelect('province','0',provinceId);
            this.renderSelect('city',provinceId,cityId);
            this.renderSelect('county',cityId,countyId);
            this.renderSelect('town',countyId,sDefalutId);
        }
    }
    window.setAddress = a;
})(window,jQuery);