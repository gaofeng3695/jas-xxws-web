   $(function() {
       /*进行初始化看该用户是否存在企业 */
       IsExistEnterprised();
   });
   /*单选框选择*/
   $("body").on("click", ".radio", function() {
       $(".radio").removeClass("on_check");
       $(this).addClass("on_check");
       $(this).find("input[type='radio']").prop("checked", true);
   });

   function IsExistEnterprised() {
       var userBo = JSON.parse(lsObj.getLocalStorage("userBo"));
       var removeEnterprised = ""; //被移除的企业名称
       var joinEnterprised = ""; //已经加入的企业
       var forzenENterprised = ""; //冻结企业
       var nojoinEnterprised = ""; //受邀企业
       $(".userName").text(userBo.userName);
       var _data = {
           "userId": userBo.objectId
       }
       $.ajax({
           type: "GET",
           url: "/cloudlink-core-framework/enterprise/getByUserId?token=" + lsObj.getLocalStorage('token'),
           contentType: "application/json",
           data: _data,
           dataType: "json",
           success: function(data) {
               if (data.success == 1) {
                   console.log(JSON.stringify(data));
                   var dataList = data.rows;
                   for (var i = 0; i < dataList.length; i++) {
                       /*被原企业移除，目前没有任何企业，需要重新创建才可以登录成功 
                       根据获取到的status  设定不同状态 目前：未加入企业  0 已加入的是1 冻结-1 移除 -2 退出改企业为-3 默认企业  其余的都是退出企业*/
                       if (dataList[i].status == -3 || dataList[i].status == -2) {
                           removeEnterprised += '' + dataList[i].enterpriseName + '，'; //被移除的企业名称
                       } else if (dataList[i].status == -1) {
                           forzenENterprised += '<div class="radio"><input type = "radio"  name = "optionEnterprise"   id = "foren' + i + '" value = "' + dataList[i].objectId + '" class ="fl wh20 radiobox " disabled><label for="foren"' + i + ' class="forzen" >' + dataList[i].enterpriseName + '（被冻结）</label></div>';;
                       } else if (dataList[i].status == 1) {
                           joinEnterprised += '<div class="radio "><input type = "radio" name = "optionEnterprise"   id = "join' + i + '" value = "' + dataList[i].objectId + '" class ="fl wh20 radiobox"><label for="join"' + i + '  >' + dataList[i].enterpriseName + '</label></div>';
                       } else if (dataList[i].status == 0) {
                           nojoinEnterprised += '<div class="radio"><input type = "radio"  name = "optionEnterprise"   id = "nojoin' + i + '" value = "' + dataList[i].objectId + '" class ="fl wh20 radiobox"><label for="nojoin"' + i + '>' + dataList[i].enterpriseName + '（受邀请）</label></div>';
                       }
                   }
                   if (removeEnterprised != "") {
                       var remove = '<b><p>您已被<span>【' + removeEnterprised.substring(0, removeEnterprised.lastIndexOf("，")) + '】等公司移除</span></p></b>';
                       $(".deleteEnterprised").append(remove);
                   } else {
                       $(".deleteEnterprised").css('display', 'none');
                   }
                   if (joinEnterprised == "" && nojoinEnterprised == "" && forzenENterprised == "") {
                       $(".bottom1").css('display', 'block');
                       $(".bottom2").css('display', 'none');
                   } else if (joinEnterprised == "" && nojoinEnterprised == "") {
                       //    $(".IsCreate p").text("请创建一个新企业");
                       $(".allEnterprised").append(forzenENterprised);
                       $(".bottom1").css('display', 'block');
                       $(".bottom2").css('display', 'none');
                   } else {
                       $(".allEnterprised").append(joinEnterprised + nojoinEnterprised + forzenENterprised);
                       $(".bottom2").css('display', 'block');
                       $(".bottom1").css('display', 'none');
                   }

               }
           },

       });
   }
   /*创建新企业 */
   $(".createNewEnterprised").click(function() {
       $(".bottom1").css('display', 'none');
       $(".bottom2").css('display', 'none');
       $(".bottom3").css('display', 'block');
   });
   /*确认创建新企业 */
   $(".quiteCreate").click(function() {
       var enterpriseName = $(".companyName").val().trim();
       var enterpriseScale = $(".companyScale").val();
       var roleIds = $(".companyRole").val();
       if (!checkEnterprised()) {
           return;
       } else if (!checkenterpriseScale()) {
           return;
       } else if (!checkCompanyRole()) {
           return;
       }
       $.ajax({
           type: "POST",
           url: "/cloudlink-core-framework/enterprise/isExist",
           contentType: "application/json",
           data: JSON.stringify({
               "enterpriseName": enterpriseName
           }),
           dataType: "json",
           success: function(data) {
               if (data.success == 1) {
                   if (data.rows[0].isExist == 1) {
                       xxwsWindowObj.xxwsAlert("您好，该企业已注册！");
                       $(".companyName").focus();
                   } else {
                       createNewEnterprise();
                   }
               }
           }
       });
   });
   /*已经注册用户进行新公司的创建 */
   function createNewEnterprise() {
       var enterpriseName = $(".companyName").val().trim();
       var enterpriseScale = $(".companyScale").val();
       var roleIds = $(".companyRole").val();
       var _data = {
           "userId": JSON.parse(lsObj.getLocalStorage("userBo")).objectId,
           "roleIds": roleIds,
           "enterpriseName": enterpriseName,
           "enterpriseScale": enterpriseScale
       }
       $.ajax({
           type: "POST",
           url: "/cloudlink-core-framework/login/registEnterpriseAndLogin",
           contentType: "application/json",
           data: JSON.stringify(_data),
           dataType: "json",
           success: function(data) {
               if (data.success == 1) {
                   lsObj.setLocalStorage('userBo', JSON.stringify(data.rows[0]));
                   lsObj.setLocalStorage('token', data.token);
                   setDefaultEnterprise(); //创建成功后，将该企业设置为默认企业，并且登录进去
               } else {
                   xxwsWindowObj.xxwsAlert("企业创建失败");
               }
           }
       });
   }
   /*选中一个公司之后，将其设置为默认企业，点击确定之后，进行登录*/
   $(".setDefaultAndLogin").click(function() {
       var nojoin = '';
       var enterpriseId = "";
       enterpriseId = $("input[name='optionEnterprise']:checked").val();
       nojoin = $("input[name='optionEnterprise']:checked").attr("id");
       var userBo = JSON.parse(lsObj.getLocalStorage("userBo"));
       if (enterpriseId == null || enterpriseId == "") {
           xxwsWindowObj.xxwsAlert("请选择一个默认企业后，才可登录成功");
       } else if (nojoin != "") {
           //当前需要设置为默认企业并且该企业未加入
           $.ajax({
               type: "POST",
               url: "/cloudlink-core-framework/user/setDefaultEnterpriseAndJoin?token=" + lsObj.getLocalStorage('token'),
               contentType: "application/json",
               data: JSON.stringify({ "userId": userBo.objectId, "enterpriseId": enterpriseId }),
               dataType: "json",
               success: function(data) {
                   if (data.success == 1) {
                       //设置成默认企业之后，需要重新调用获取默认企业ID，然后进行加入该企业
                       getDefaultEnterpriseId(userBo.objectId);
                   } else {
                       xxwsWindowObj.xxwsAlert("默认企业设置失败，请重新登录进行设置");
                   }
               }
           });
       } else {
           $.ajax({
               type: "POST",
               url: "/cloudlink-core-framework/user/setDefaultEnterprise?token=" + lsObj.getLocalStorage('token'),
               contentType: "application/json",
               data: JSON.stringify({ "userId": userBo.objectId, "enterpriseId": enterpriseId }),
               dataType: "json",
               success: function(data) {
                   if (data.success == 1) {
                       getDefaultEnterpriseId(userBo.objectId);
                   } else {
                       xxwsWindowObj.xxwsAlert("默认企业设置失败，请重新登录进行设置");
                   }
               }
           });
       }
   });
   //获取当前用户的默认企业Id
   function getDefaultEnterpriseId(_userId) {
       $.ajax({
           type: "POST",
           url: "/cloudlink-core-framework/login/getDefaultEnterpriseId",
           contentType: "application/json",
           data: JSON.stringify({
               userId: _userId
           }),
           dataType: "json",
           success: function(data) {
               var success = data.success;
               if (success == 1) {
                   //当前用户存在默认企业Id
                   if (data.rows.length > 0) {
                       var _enterpriseId = data.rows[0].enterpriseId;
                       joinDefaultEnterprise(_enterpriseId);
                   }
               }
           },
           error: function(XMLHttpRequest, textStatus, errorThrown) {
               console.log(XMLHttpRequest);
               console.log(textStatus);
               console.log(errorThrown);
           }
       });
   }

   //加入企业
   function joinDefaultEnterprise(_enterpriseId) {
       var _userBo = JSON.parse(lsObj.getLocalStorage('userBo'));
       $.ajax({
           type: "POST",
           url: "/cloudlink-core-framework/login/joinEnterprise",
           contentType: "application/json",
           data: JSON.stringify({
               userId: _userBo.objectId,
               enterpriseId: _enterpriseId
           }),
           dataType: "json",
           success: function(data) {
               var success = data.success;
               if (success == 1) {
                   var row = data.rows;
                   var token = data.token;
                   lsObj.setLocalStorage('token', token);
                   lsObj.setLocalStorage('userBo', JSON.stringify(row[0]));
                   lsObj.setLocalStorage('timeOut', new Date().getTime() + (23 * 60 * 60 * 1000));
                   location.href = '../../main.html';
               } else {
                   switch (data.code) {
                       case "400":
                           $('.hidkuai2 span').text('服务异常');
                           break;
                       case "401":
                           $('.hidkuai2 span').text('参数异常');
                           break;
                       case "E01":
                           $('.hidkuai2 span').text('您的账户已被该企业冻结');
                           break;
                       case "E02":
                           $('.hidkuai2 span').text('您的账户已被该企业移除');
                           break;
                       case "E03":
                           $('.hidkuai2 span').text('该企业不存在');
                           break;
                       default:
                           break;
                   }
               }
           },
           error: function(XMLHttpRequest, textStatus, errorThrown) {
               console.log(XMLHttpRequest);
               console.log(textStatus);
               console.log(errorThrown);
           }
       });
   }
   /*退出将退出到登录页面，进行缓存清除*/
   $(".quitToLogin").click(function() {
       lsObj.clearAll();
       location.href = '../../login.html';
   });
   /*进行新企业的创建，创建成功后，将其设置为默认企业，并且登录到主页面*/
   function setDefaultEnterprise() {
       var userBo = JSON.parse(lsObj.getLocalStorage("userBo"));
       $.ajax({
           type: "POST",
           url: "/cloudlink-core-framework/user/setDefaultEnterprise?token=" + lsObj.getLocalStorage("token"),
           contentType: "application/json",
           data: JSON.stringify({
               "userId": userBo.objectId,
               "enterpriseId": userBo.enterpriseId
           }),
           dataType: "json",
           success: function(data) {
               if (data.success == 1) {
                   $(".bottom1").css('display', 'none');
                   $(".bottom2").css('display', 'none');
                   $(".bottom3").css('display', 'none');
                   $(".bottom4").css('display', 'block');
                   jumpto();
               }
           }
       });

   }
   /*企业规模的验证 */
   $(".companyTs").blur(function() {
       checkenterpriseScale();
   });

   function checkenterpriseScale() {
       var enterpriseScale = $(".companyScale").val();
       if (enterpriseScale === '0') {
           $(".companyTs").css('display', 'block');
           $("#companyTs").text("请选择企业规模");
           return false;
       } else {
           $(".companyTs").css('display', 'none');
           $("#companyTs").text("");
           return true;
       }
   }
   /*用户角色的验证 */
   $(".companyRole").blur(function() {
       checkCompanyRole();
   });

   function checkCompanyRole() {
       var roleIds = $(".companyRole").val();
       if (roleIds === '请选择') {
           $(".roleTs").css('display', 'block');
           $("#roleTs").text("请选择角色");
           return false;
       } else {
           $(".roleTs").css('display', 'none');
           $("#roleTs").text("");
           return true;
       }
   }
   /*企业名称输入框的验证 */
   $(".companyName").blur(function() {
       checkEnterprised();
   });

   function checkEnterprised() {
       var enterpriseName = $(".companyName").val().trim();
       if (enterpriseName.length === 0) {
           $(".companyMsg").css('display', 'block');
           $("#companyMsg").text("请输入企业名称");
           return false;
       } else if (/[^(A-Za-z_\-\u4e00-\u9fa5)]/.test(enterpriseName) === true) {
           $(".companyMsg").css('display', 'block');
           $("#companyMsg").text("企业名称只能由汉字、字母、下划线组成");
           return false;
       } else if (enterpriseName.length < 2) {
           $(".companyMsg").css('display', 'block');
           $("#companyMsg").text("您输入的企业名称过短");
           return false;
       } else if (enterpriseName.length > 30) {
           $(".companyMsg").css('display', 'block');
           $("#companyMsg").text("您输入的企业名称过长");
           return false;
       } else {
           $("#companyMsg").text("");
           $(".companyMsg").css('display', 'none');
           return true;
       }
   }
   // 自动跳转页面
   function jumpto() {
       var a = 5;
       var t = setInterval(function() {
           a--;
           if (a < 1) {
               clearInterval(t);
               top.location.href = '../../main.html';
           }
           $('.jumpTo').text(a);
       }, 1000)
   }
   $(".createFinish").click(function() {
       top.location.href = '../../main.html';
   });