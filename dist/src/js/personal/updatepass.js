function checknewpass(){newpass=$(".pw1").val().trim();var s=/^[\dA-z]{6,12}$/;return""==newpass||null==newpass?($(".pw1Msg").text("密码不能为空"),!1):s.test(newpass)?($(".pw1Msg").text(""),!0):($(".pw1Msg").text("密码格式错误"),!1)}function checkaginpass(){return newpass=$(".pw1").val().trim(),aginpass=$(".pw2").val().trim(),""==aginpass||null==aginpass?($(".pw2Msg").text("请再次输入密码"),!1):aginpass!=newpass?($(".pw2Msg").text("两次输入密码不一致"),!1):($(".pw2Msg").text(""),!0)}$(function(){});var oldpass=null,newpass=null,aginpass=null;$(".pw").blur(function(){null!=(oldpass=$(".pw").val().trim())&&""!=oldpass&&$(".pwMsg").text("")}),$(".pw1").blur(function(){checknewpass()}),$(".pw2").blur(function(){checkaginpass()}),$(".btn").click(function(){if(oldpass=$(".pw").val().trim(),newpass=$(".pw1").val().trim(),aginpass=$(".pw2").val().trim(),null==oldpass||""==oldpass)return void $(".pwMsg").text("请输入原密码");if(null==newpass||""==newpass)return void $(".pw1Msg").text("请输入新密码");if(checknewpass()){if(null==aginpass||""==aginpass)return void $(".pw2Msg").text("请输入确认密码");if(checkaginpass()){var s=lsObj.getLocalStorage("token"),n={oldPassword:MD5(oldpass),newPassword:MD5(newpass)};$.ajax({type:"POST",url:"/cloudlink-core-framework/user/updatePassword?token="+s,contentType:"application/json",data:JSON.stringify(n),dataType:"json",success:function(s){1==s.success?xxwsWindowObj.xxwsAlert("密码修改成功，并即将返回登录页面，请重新登录",function(){lsObj.clearAll(),top.location.href="../../login.html"}):"原密码不正确"==s.msg?xxwsWindowObj.xxwsAlert("原密码输入错误",function(){$(".pw").val(""),$(".pw1").val(""),$(".pw2").val("")}):xxwsWindowObj.xxwsAlert("密码修改失败")}})}}});