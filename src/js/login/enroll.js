  var d = false, //短信验证码
      e = false, //手机号
      h = false, //邮箱
      g = false, //确认密码
      b = false, //企业名称
      f = false, //图片验证码、密码
      c = false;
  $(".btn1").click(function() {
      var mobileNum = $('.phone').val().trim();
      if (mobileNum == '' || mobileNum == null) {
          $('.phoneMeg').css({
              display: 'block'
          });
          $('.phoneMeg span').text('手机号码不能为空');
          e = false;
          return;
      }
      var val = $('.imgCode').val();
      if (val == '' || val == null) {
          $('.imgMeg').css({
              display: 'block'
          });
          $('.imgMeg span').text('图片验证码不能为空');
          f = false;
          return;
      }
      $('.phone').blur();
      if (!e) {
          return;
      }
      $('.imgCode').blur();
      if (!f) {
          return;
      }
      var SMScodeval = $('.SMScode').val();
      if (SMScodeval == "" || SMScodeval == null) {
          $('.SMScodeMsg').css({
              display: 'block'
          });
          $('.SMScodeMsg span').text('短信验证码不能为空');
          d = false;
          return;
      }
      $('.SMScode').blur();
      if (!d) {
          return;
      }
      if (!c) {
          $('.SMScodeMsg span').text('请先获取验证码');
          $('.SMScodeMsg').css({
              display: 'block'
          });
          return;
      } else {
          $('.SMScodeMsg').css({
              display: 'none'
          })
      }
      // 短信验证码校验接口调用开始
      var _data = {
          "sendNum": mobileNum,
          "sendMode": 1,
          "verifyCode": SMScodeval
      };
      $.ajax({
          type: "GET",
          url: "/cloudlink-core-framework/login/checkVerifyCode",
          contentType: "application/json",
          data: _data,
          dataType: "json",
          success: function(data, status) {
              var success = data.success;
              if (success == 1) {
                  $('.top img').attr('src', '/src/images/enrollImg/2.png')
                  $('.bottom1,.bottom3,.bottom4,.Notes').css({
                      display: "none"
                  })
                  $('.bottom2').css({
                      display: "block"
                  })
                  e = false;
                  d = false;
                  g = false;
                  f = false;
                  if (zhugeSwitch == 1) {
                      zhuge.track('注册填写手机信息完成');
                  }
              } else {
                  $('.SMScodeMsg').css({
                      display: 'block'
                  });
                  $('.SMScodeMsg span').text('手机号或验证码错误');
                  return;
              }
          }
      });
      // 短信验证码校验接口调用结束
  });
  $('.btn2').click(function() {
      var userName = $('.userName').val().trim();
      var password1 = $('.password1').val().trim();
      var password2 = $('.password2').val().trim();
      if (userName == '' || userName == null) {
          $('.nameMsg').css({
              display: 'block'
          });
          $('.nameMsg span').text('姓名不能为空');
          e = false;
          return;
      } else if (password1 == '' || password1 == null) {
          $('.pswMsg1').css({
              display: 'block'
          });
          $('.pswMsg1 span').text('密码不能为空');
          f = false;
          return
      } else if (password2 == '' || password2 == null) {
          $('.pswMsg2').css({
              display: 'block'
          });
          $('.pswMsg2 span').text('请再次输入密码');
          g = false;
          return
      }
      $('.userName').blur();
      if (!e) {
          return;
      }
      $('.password1').blur();
      if (!f) {
          return;
      }
      $('.password2').blur();
      if (!g) {
          return;
      }
      $('.email').blur();
      if (!h) {
          return;
      }
      $('.top img').attr('src', 'src/images/enrollImg/3.png')
      $('.bottom1,.bottom2,.bottom4').css({
          display: "none"
      })
      $('.bottom3,.Notes').css({
          display: "block"
      })
      e = false;
      f = false;
      g = false;
      h = false;
      if (zhugeSwitch == 1) {
          zhuge.track('注册信息完善完成');
      }
  });
  $('.btn3').click(function() {
      var mobileNum = $('.phone').val().trim();
      var userName = $('.userName').val().trim();
      var password = MD5($('.password1').val().trim());
      var enterpriseName = $('.companyName').val().trim();
      if (enterpriseName == "" || enterpriseName == null) {
          $('.companyMsg').css({
              display: 'block'
          });
          $('.companyMsg span').text('企业名称不能为空');
          b = false;
          return;
      }
      $('.companyName').blur();
      //   console.log(b);
      if (!b) {
          return;
      }
      var Scale = $('.companyScale').val();
      if (Scale == 0) {
          $('.companyTs').css({
              display: 'block'
          })
          $('.companyTs span').text('请选择公司规模');
          return;
      } else {
          $('.companyTs').css({
              display: 'none'
          })
      }
      var Role = $('.companyRole').val();
      if (Role == '请选择') {
          $('.roleTs').css({
              display: 'block'
          })
          $('.roleTs span').text('请选择角色');
          return;
      } else {
          $('.roleTs').css({
              display: 'none'
          })
      }
      // 注册接口调用开始
      var _data = {
          "mobileNum": mobileNum,
          "userName": userName,
          "password": password,
          "enterpriseName": enterpriseName,
          "enterpriseScale": Scale,
          "roleIds": Role
      };
      //var _userBo = JSON.parse(lsObj.getLocalStorage('userBo'));
      $.ajax({
          url: "/cloudlink-core-framework/login/registAndLogin",
          type: "POST",
          contentType: "application/json",
          data: JSON.stringify(_data),
          dataType: "json",
          success: function(data) {
              var success = data.success;
              //   console.log(success)
              if (success == 1) {
                  console.log(data)
                  var row = data.rows;
                  var token = data.token;
                  lsObj.setLocalStorage('token', token);
                  lsObj.setLocalStorage('userBo', JSON.stringify(row[0]));
                  lsObj.setLocalStorage('timeOut', new Date().getTime() + (23 * 60 * 60 * 1000));
                  if (zhugeSwitch == 1) {
                      zhugeIdentify(row[0]);
                      zhuge.track('注册完成并登陆成功');
                  }
              } else {
                  xxwsWindowObj.xxwsAlert("注册失败");
                  if (zhugeSwitch == 1) {
                      zhuge.track('注册失败');
                  }
                  // xxwsWindowObj.xxwsAlert("注册失败");
              }

          }
      });
      //点击注册 成功后调用自动跳转页面函数
      $('.top img').attr('src', 'src/images/enrollImg/4.png')
      $('.bottom1,.bottom2,.bottom3,.Notes').css({
          display: "none"
      })
      $('.bottom4').css({
          display: "block"
      })
      jumpto();
      // 注册接口调用结束
  });
  $('.btn4').click(function() {
      location.href = "main.html";
  });
  //手机号验证
  $('.phone').blur(function() {
      var val = $(this).val().trim();
      var phoneReg = /^1\d{10}$/;
      if (val == '' || val == null) {
          // $('.phoneMeg').css({
          //     display: 'block'
          // });
          // $('.phoneMeg span').text('手机号码不能为空');
          e = false;
          return;
      } else if (!phoneReg.test(val)) {
          $('.phoneMeg').css({
              display: 'block'
          });
          $('.phoneMeg span').text('手机号码填写错误');
          e = false;
          return false;
      } else {
          $('.phoneMeg').css({
              display: 'none'
          });
          // 手机号是否注册过接口调用开始
          var _data = {
              "registNum": val
          };
          $.ajax({
              url: "/cloudlink-core-framework/login/isExist",
              type: "GET",
              contentType: "application/json",
              data: _data,
              dataType: "json",
              success: function(data, status) {
                  //   console.log("ddd")
                  var res = data.rows.isExist;
                  if (res == 1) {
                      //   console.log('cuowu')
                      $('.phoneMeg').css({
                          display: 'block'
                      });
                      $('.phoneMeg span').text('手机号码已注册');
                      e = false;
                  } else {
                      $('.phoneMeg').css({
                          display: 'none'
                      });
                      e = true;
                  }
              },
              error: function() {
                  //   console.log("ccc")
              }
          });
          // 手机号是否注册过接口调用结束
      }
  });
  //图片验证码
  var imgStr = '';
  code();

  function code() {
      var az = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'z', 'x', 'c', 'v', 'b', 'n', 'm', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Z', 'X', 'C', 'V', 'B', 'N', 'M'];
      var dom1 = parseInt(Math.random() * 10000 % 62);
      var dom2 = parseInt(Math.random() * 10000 % 62);
      var dom3 = parseInt(Math.random() * 10000 % 62);
      var dom4 = parseInt(Math.random() * 10000 % 62);

      imgStr = az[dom1] + az[dom2] + az[dom3] + az[dom4];
      $('.code i').text(imgStr);
  };
  //刷新验证码
  $('.code').click(function() {
      code();
  });

  //图片验证
  $('.imgCode').blur(function() {
      var val = $(this).val().trim();
      var imgReg = new RegExp("^" + imgStr + "$", "gi");
      console.log(imgReg)
      if (val == '' || val == null) {
          f = false;
          return;
      } else if (!imgReg.test(val)) {
          $('.imgMeg').css({
              display: 'block'
          });
          $('.imgMeg span').text('图片验证码填写错误');
          f = false;
          return;
      } else {
          $('.imgMeg').css({
              display: 'none'
          });
          if (!g) {
              $('.styles').css({
                  background: '#49CB86'
              })
          }
          f = true;
      }
  });
  //短信验证码验证
  $('.SMScode').blur(function() {
      var val = $(this).val().trim();
      if (val == "" || val == null) {
          d = false;
          return;
      } else {
          d = true;
          $('.SMScodeMsg').css({
              display: 'none'
          });
      }
  });
  //点击获取短信验证码事件
  $('.styles').click(function() {
      var mobileNum = $('.phone').val().trim();
      if (mobileNum == '' || mobileNum == null) {
          $('.phoneMeg').css({
              display: 'block'
          });
          $('.phoneMeg span').text('手机号码不能为空');
          return;
      }
      $('.phone').blur();
      var val = $('.imgCode').val();
      if (val == '' || val == null) {
          $('.imgMeg').css({
              display: 'block'
          });
          $('.imgMeg span').text('图片验证码不能为空');
          return;
      }
      $('.imgCode').blur();
      console.log("aaaaaaaaa")
      if (!f || g || !e) {
          return;
      }
      times();
      $('.styles').text('60秒后再次获取');
      $('.styles').css({
          background: '#ccc'
      });
      f = false;
      //ajax发送手机号，接受验证码
      var number = $('.phone').val();
      var _data = {
          "sendNum": number,
          "sendMode": 1,
          "useMode": 3
      }
      $.ajax({
          url: "/cloudlink-core-framework/login/getVerifyCode",
          type: "GET",
          contentType: "application/json",
          dataType: "json",
          data: _data,
          success: function(data) {}
      });
  });
  //点击获取短信验证码倒计时事件
  function times() {
      var a = 60;
      g = true;
      c = true;
      var t = setInterval(function() {
          a--;
          $('.styles').text(a + '秒后再次获取');
          if (a < 1) {
              $('.styles').text('重新获取');
              $('.styles').css({
                  background: '#49CB86'
              })
              clearInterval(t);
              f = true;
              g = false;
          }
      }, 1000)
  };
  //姓名验证
  $('.userName').blur(function() {
      var val = $('.userName').val().trim();
      var nameReg = /^[\u4E00-\u9FA5A-Za-z0-9]{2,15}$/;
      //   console.log(nameReg.test(val));
      if (val == "" || val == null) {
          // $('.nameMsg').css({
          //     display: 'block'
          // });
          // $('.nameMsg span').text('姓名不能为空');
          e = false;
          return;
      } else if (!nameReg.test(val)) {
          $('.nameMsg').css({
              display: 'block'
          });
          $('.nameMsg span').text('姓名格式不正确');
          e = false;
          return;
      } else {
          e = true;
          $('.nameMsg').css({
              display: 'none'
          });
      }
  });
  //密码验证
  $('.password1').blur(function() {
      var val = $(this).val().trim();
      var pwReg = /^[\dA-z]{6,12}$/;
      if (pwReg.test(val)) {
          f = true;
          $('.pswMsg1').css({
              display: 'none'
          });
      } else {
          $('.pswMsg1').css({
              display: 'block'
          });
          $('.pswMsg1 span').text('密码为6-12位');
          f = false;
          return;
      }
  })

  //确认密码验证
  $('.password2').blur(function() {
      var val1 = $('.password1').val().trim();
      var val2 = $(this).val().trim();
      if (val2 == "" || val2 == null) {
          // $('.pswMsg2').css({
          //     display: 'block'
          // });
          // $('.pswMsg2 span').text('请再次输入密码');
          g = false;
          return
      } else if (val1 != val2) {
          $('.pswMsg2').css({
              display: 'block'
          });
          $('.pswMsg2 span').text('两次输入密码不一致');
          g = false;
          return
      } else {
          g = true;
          $('.pswMsg2').css({
              display: 'none'
          });
      }
  });
  //邮箱验证             
  $('.email').blur(function() {
      var val = $(this).val().trim();
      var emailReg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/;
      if (val == '' || val == null) {
          h = true;
          $('.emailMsg').css({
              display: 'none'
          });
      } else if (!emailReg.test(val)) {
          $('.emailMsg').css({
              display: 'block'
          });
          $('.emailMsg span').text('请输入正确邮箱格式');
          h = false;
          return;
      } else {
          h = true;
          $('.emailMsg').css({
              display: 'none'
          });
      }
  });
  // 企业名称验证
  $('.companyName').blur(function() {
      var val = $('.companyName').val().trim();
      var companyNameReg = /[\u4e00-\u9fa5a-zA-Z]+$/;
      if (val == "" || val == null) {
          // $('.companyMsg').css({
          //     display: 'block'
          // });
          // $('.companyMsg span').text('企业名称不能为空');
          b = false;
          return;
      } else if (!companyNameReg.test(val)) {
          $('.companyMsg').css({
              display: 'block'
          });
          $('.companyMsg span').text('企业名称格式错误');
          b = false;
          return;
      } else {

          $('.companyMsg').css({
              display: 'none'
          });
          // 验证企业名称是否存在接口调用开始
          var _data = {
              "enterpriseName": val
          };
          $.ajax({
              url: "/cloudlink-core-framework/enterprise/isExist",
              type: "POST",
              contentType: "application/json",
              data: JSON.stringify(_data),
              dataType: "json",
              success: function(data, status) {
                  console.log(data)
                  var res = data.rows[0].isExist;
                  console.log(res)
                  if (res == 1) {
                      $('.companyMsg').css({
                          display: 'block'
                      });
                      $('.companyMsg span').text('企业名称已注册');
                      b = false;
                  } else {
                      $('.companyMsg').css({
                          display: 'none'
                      });
                      b = true;
                  }
              }
          });
          // 验证企业名称是否存在接口调用结束
      }
  });
  // 自动跳转页面
  function jumpto() {
      var a = 5;
      var t = setInterval(function() {
          a--;
          if (a < 1) {
              clearInterval(t);
              location.href = 'main.html';
          }
          $('.jumpTo').text(a);
      }, 1000)
  };


  function zhugeIdentify(_userBo) {
      zhuge.identify(_userBo.objectId, {
          name: _userBo.userName,
          gender: _userBo.sex,
          age: _userBo.age,
          email: _userBo.email,
          qq: _userBo.qq,
          weixin: _userBo.wechat,
          'mobile': _userBo.mobileNum,
          '企业名称': _userBo.enterpriseName == null ? "" : _userBo.enterpriseName,
          '部门名称': _userBo.orgName == null ? "" : _userBo.orgName
      });
  }