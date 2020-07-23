$(function(){
  var ul = document.querySelector(".items");
  var binUl = document.querySelector(".bin ul");
  
  
  var data;
  var whichUser;
  if(localStorage.getItem("users")) {
    data = JSON.parse(localStorage.getItem("users"));
  }else{
    //data = [{user:"Konsoue",pwd:123456,lis:[],rubbish:[]}];
    data = [];
    localStorage.setItem("users",JSON.stringify(data));
  }


  //封装拖拽功能的函数
  function dragElement(element) {
    $(element).mousedown(function(e){
        var downevent = e || window.event;
        //console.log(parseInt($(this).offset().left));
        var x = downevent.clientX - parseInt($(this).offset().left);
        var y = downevent.clientY - parseInt($(this).offset().top);
        var xend,yend;
        $(this).on("mousemove",function(e){
            var moveevent = e || window.event;
            xend = moveevent.clientX - x;
            yend = moveevent.clientY - y;
            $(this).offset({
                left:xend,
                top:yend
            });
        });
        $(this).mouseup(function(e){
            $(this).off("mousemove");
        });
    })
  }
  //loginBox的拖拽
  dragElement(".loginBox");
  dragElement(".warn");

  $(".top").siblings().mousedown(function(e){
    var event = e || window.event;
    event.stopPropagation();
  })

  //注册与登录切换
  $("#toRegis").click(function(){
      $(".login").hide();
      $(".register").show();
  })
  $("#return").click(function(){
      $(".login").show();
      $(".register").hide();
  })
/* 
 *注册的模块
*/
  //注册用户名写法
  $("#Name").keyup(function(e){
      event.stopPropagation();
      var reg = /^[\w\W]{1,16}$/;
      if(!reg.test($(this).val())){
          $("#nameRegis").text("请控制用户名在1~16个字符之间").css("color","red");
      }else{
          $("#nameRegis").text("");
      }
  });
  //注册用户密码写法
  $("#Pwd").keyup(function(){
      var reg = /^[\w]{1,10}$/;
      if(!reg.test($(this).val())){
          $("#pwdRegis").text("密码只能是数字和字母的组合，数量不超过10个").css("color","red");
      }else{
        $("#pwdRegis").text("");
      }
  })
  //点击按钮进行注册
  $("#register").click(function(){
      if(!$("#Name").val().trim()){
          $("#nameRegis").text("用户名不能为空").css("color","red");
      }else{
          var check = data.every(function(current){
              return current.user != $("#Name").val().trim();
          });
          if(!check){
              $("#nameRegis").text("该用户已存在").css("color","red");
          }else{
            data.push({
                user:$("#Name").val().trim(),
                pwd:$("#Pwd").val().trim(),
                lis:[],
                rubbish:[]
            });
            $(".issue").text("注册成功(●ˇ∀ˇ●)").show();
            var time = setTimeout(function(){
                $(".issue").hide();
                $("#Name").val("");
                $("#Pwd").val("");
                $(".userMess").text("");
                $(".login").show();
                $(".register").hide();
                clearTimeout(time);
            },1500);
            localStorage.setItem("users",JSON.stringify(data));
          }
      }
  })

/* 
 *登录的模块
*/
  $("#loginIn").click(function(){
     var name = $("#userName").val();
     var pwd = $("#userPwd").val();
     var num = -1;
     data.every(function(current,index){
        if(current.user == name){
            num = index;
            console.log(num);
        }
        return current.user != name;
     })

     if(num == -1){
        $(".issue").text("该用户不存在哟").show();
        var time = setTimeout(function(){
            $(".issue").hide();
            $("#userPwd").val("");
            clearTimeout(time);
        },1500);
        
     }else{
         if(data[num].pwd == pwd){
            
            $(".issue").text("登录成功").show();
            var time = setTimeout(function(){
                $(".issue").hide();
                $("#userName").val("");
                $("#userPwd").val("");
                $(".userMess").text("");
                loginSuccess(data[num].user,num);
                clearTimeout(time);
            },1500);
         }else{
            $("#pwdLogin").text("用户名或密码错误").css("color","red");
         }
     }

  })
  //成功登录后的显示和修改
  function loginSuccess(userName,num){
      $(".loginBox").hide();
      $(".main,.rubbish").fadeIn();
      $("#user").text(userName);
      whichUser = num;
      addDate();
      sessionStorage.setItem("nowUser",userName);
      //决定下次是否自动登录
      if($("#autoLogin").prop("checked")){
        localStorage.setItem("nowUser",userName);
        $("#autoLogin").prop("checked",false);
      }
  }

  /* 退出登录 */
  $("#loginOut").click(function(){
      sessionStorage.setItem("nowUser","");
      localStorage.setItem("nowUser","");
      $(".items li").remove();
      $(".bin ul li").remove();
      toggleAllNot();
      $(".main,.rubbish").hide();
      $(".loginBox").fadeIn();
  })

  //自动登录
  function loginAutoOrnot(){
      var userName = localStorage.getItem("nowUser");
      var num;
      if(userName){
        $(".loginBox").hide();
        data.every(function(current,index){
        if(current.user == userName) {
            num = index;
        }
        return current.user != userName;
        })
        whichUser = num;
        addDate();
        sessionStorage.setItem("nowUser",userName);
      }else{
          //登陆前隐藏todo内容
          $(".main,.rubbish").hide();
      }
  }
  loginAutoOrnot();
  //右侧边栏的显示隐藏
  $(".turn").click(function(){
      $(".rubbish").toggleClass("clc");
  });

  //注销用户
  $("#destroyID").click(function(){
     $(".banner").fadeIn();
  })
  $("#sure").click(function(){
     var one = data.splice(whichUser,1);
     console.log(one);
     localStorage.setItem("users",JSON.stringify(data));
     $("#loginOut").click();
     $(".banner").fadeOut();
  })
  $("#no").click(function(){
    $(".banner").fadeOut();
  })
/* 
 *todo输入框的所有功能
 *添加
 *删除
 *修改
 *分类
*/
  
  //封装数数的函数
  function countLi(){
    var len1 = $(".items li").length;
    var len2 = $(".items .complete").length;
    var word = len1-len2 > 1?len1-len2 + " items left":len1-len2 + " item left";
    $(".message .count").text(word);
    len2 > 0?$(".message .clear").show():$(".message .clear").hide();
    if(!len1){
        $("#selectAll").hide();
        $(".message").hide();
    }else{
        $("#selectAll").show();
        $(".message").show();
    }
  }
  //打开页面，把data的数据添加到页面中
  function addDate(){
      //todo的下拉列表
      //console.log(data[whichUser].lis.length);
      for(var i = 0,len = data[whichUser].lis.length;i < len;i++) {
          var status = data[whichUser].lis[i].status?"complete":"";
          var li = `
            <li class="${status}">
                <div class="pick">
                    <label for=""><input type="checkbox" name="" id=""></label>    
                </div>
                <div class="word">
                    <p class="getIt"></p>
                    <span class="up">↑</span>
                    <span class="delete">×</span>
                </div>
            </li>`;
        ul.insertAdjacentHTML("beforeend",li);
        $(".items .getIt").text(data[whichUser].lis[i].item).removeClass("getIt");
      }
      countLi();
      toggleAllNot();
      //回收站的li
      for(var i = 0,len = data[whichUser].rubbish.length;i < len;i++) {
        var li = `
            <li>
                <p><input type="checkbox" name="" id=""></p>
                <p class="getIt"></p>
            </li>
            `;
        binUl.insertAdjacentHTML("beforeend",li);
        $(".bin .getIt").text(data[whichUser].rubbish[i].item).removeClass("getIt");
      }
  }
  
   //更新一下localStorage的li状态
   function updateLiStatus(){ 
        $(".items").children("li").each(function(index,element){
        data[whichUser].lis[index].status = $(element).prop("class") == "complete"?true:false;
        });
        //放到localStorage里面
        localStorage.setItem("users",JSON.stringify(data));
    }
  
  //因为删除complete，而更新localStorage
  function updateDate(){
    for(var i = 0,len = data[whichUser].lis.length;i < len ;i++) {   
        if(!data[whichUser].lis[i]) break;
        if(data[whichUser].lis[i].status){
            //添加到回收站里
            var li = `
                    <li>
                        <p><input type="checkbox" name="" id=""></p>
                        <p class="getIt"></p>
                     </li>
                 `;
            binUl.insertAdjacentHTML("beforeend",li);
            $(".bin .getIt").text(data[whichUser].lis[i].item).removeClass();
            //改data数据
            data[whichUser].rubbish.push(data[whichUser].lis[i]);
            data[whichUser].lis.splice(i,1);
            i--;
        }
    }
    localStorage.setItem("users",JSON.stringify(data));
  }
  //检查下拉列表点的是不是全选了
  function toggleAllNot(){
     var len1 = $(".items").children("li").length;
     var len2 = $(".items").children(".complete").length;
     if(len1 == len2 && len1) {
        $("#toggle-all").prop("checked",true);
     }else{
        $("#toggle-all").prop("checked",false);
     }
  }
  
  //li的显示和隐藏
  function liShow(){
    var id = $(".nav .select").prop("id");
    if(id == "Active") {
        $(".items li").show();
        $(".items .complete").hide();
    }else if(id == "Completed") {
        $(".items li").hide();
        $(".items .complete").show();
    }else {
        $(".items li").show();
    }
  }

  //添加li
  $("#todo").on("keyup",function(e){
    var event = e || window.event;
    var word = $(this).val();
    if(event.keyCode == 13 && word.trim()){
        var li = `
            <li class="">
                <div class="pick">
                    <label for=""><input type="checkbox" name="" id=""></label>    
                </div>
                <div class="word">
                    <p class="getIt"></p>
                    <span class="up">↑</span>
                    <span class="delete">×</span>
                </div>
            </li>`;
        //放入data里面
        data[whichUser].lis[$(".items li").length] = {item:word,status:false};
        //放到localStorage里面
        localStorage.setItem("users",JSON.stringify(data));
        //插入li标签
        ul.insertAdjacentHTML("beforeend",li);
        $(".items .getIt").text(word).removeClass("getIt");
        $(this).val("");
        $("#toggle-all").prop("checked",false);
        countLi();
      }
  });
  //选中下拉列表的li
  $(".items").on("click",".pick",function(){
      $(this).parent().toggleClass("complete");
      toggleAllNot();
      countLi();
      liShow();
      updateLiStatus();
  });
  //点击 x 删除下拉列表的li
  $(".items").on("click",".delete",function(){
      //删data的li
      var num,word;
      var that = this;
      $(this).parents(".items").children("li").each(function(index,current){
         if($(current).find("p").text() == $(that).parents("li").find("p").text()) {
            word = $(that).parents("li").find("p").text();
            num = index;
         }
      });
      //放到回收站
      var li = `
            <li>
                <p><input type="checkbox" name="" id=""></p>
                <p class="getIt"></p>
            </li>
            `;
      binUl.insertAdjacentHTML("beforeend",li);
      $(".bin .getIt").text(word).removeClass("getIt");
      //更新data
      var two = data[whichUser].lis.splice(num,1)[0];
      //放data的rubbish
      data[whichUser].rubbish.push(two);
      //放到localStorage里面
      localStorage.setItem("users",JSON.stringify(data));
      //删li
      $(this).parents("li").remove();
      if(!$(".items li").length) {
        $("#toggle-all").prop("checked",false);
      }
      countLi();
      toggleAllNot();
  });


  //点击todo全选按钮
  $("#toggle-all").click(function(){
      if($(this).prop("checked")){
          $(".items li").addClass("complete");
      }else{
          $(".items li").removeClass("complete");
      }
      updateLiStatus();
      countLi();
      liShow();
  });

  //点击nav的按钮
  $(".nav li").click(function(){
        $(this).addClass("select").siblings().removeClass("select");
        liShow();
  });

  //点击Clear Completed删除
  $(".message .clear").click(function(){
    updateDate();
    $(".items .complete").remove();
    countLi();
    toggleAllNot();
  });

  //双击修改li的内容
  $(".items").on("dblclick",".word p",function(){
      $(this).parents("li").append('<input type="text" name="" id="temporary">');
      //自动获焦
      document.querySelector("#temporary").focus();
      var oldtext = $(this).text();
      var that = this;
      var num;
      $(".items .word p").each(function(index,current){
            if($(current).text() == oldtext){
                num = index;
            }
      });
      //兄弟隐藏
      $("#temporary").val(oldtext).siblings().hide();
      //失焦后
      $("#temporary").blur(function(){
          if(!$(this).val().trim()){
            var one = data[whichUser].lis.splice(num,1)[0];
            data[whichUser].rubbish.push(one);
            var li = `
                <li>
                    <p><input type="checkbox" name="" id=""></p>
                    <p>${oldtext}</p>
                </li>
                `;
            binUl.insertAdjacentHTML("beforeend",li);
            $(this).parent().remove();
          }else{
            data[whichUser].lis[num].item = $(this).val();
            $(that).text(""+$(this).val());
            $(this).siblings().show();
            $(this).remove();
          }
          localStorage.setItem("users",JSON.stringify(data));
          countLi();
      })
  })

  //置顶功能
  $(".items").on("click",".up",function(){
      var temp = $(this).parents("li").remove();
      var word = temp.find(".word p").text();
      var num;
      $(".items").prepend(temp);
      data[whichUser].lis.every(function(current,index){
          if(current.item == word){
            num = index;
          }
          return current.item != word;
      });
      var one = data[whichUser].lis.splice(num,1)[0];
      data[whichUser].lis.unshift(one);
      localStorage.setItem("users",JSON.stringify(data));
  })


/* 
 *右边侧边栏rubbish的功能
 *恢复数据
 *彻底删除
*/
  //数一数选中多少个
  function operateAllNot() {
      var count = 0;
      $(".bin ul input").each(function(){
        if(!this.checked) {
            count++;
        }
      })
      var selectNum = count;
      var checked = selectNum > 0?false:true;
      $(".bin .first input").prop("checked",checked);
  } 
  //每个li的选择，判断一波
  $(".bin ul").on("click","li input",function(){
      operateAllNot();
  });
  //全选
  $(".bin .first input").click(function(){
      if(!$(this).prop("checked")){
        $(".bin ul input").prop("checked",false);
        $(this).prop("checked",false);
      }else{
        $(".bin ul input").prop("checked",true);
        $(this).prop("checked",true);
      }
  })
  //彻底删除数据
  $("#destroy").click(function(){
     var len = $(".bin ul input").length;
     for(var i = 0;i < len && data[whichUser].rubbish[i];i++){
         if($(".bin ul input").eq(i).prop("checked")) {
             data[whichUser].rubbish.splice(i,1);
             $(".bin ul li").eq(i).remove();
             i--;
         }
     }
     localStorage.setItem("users",JSON.stringify(data));
     if(!$(".bin ul li").length){
        $(".bin .first input").prop("checked",false);
     }
  })
  //恢复数据
  $("#restore").click(function(){
    var len = $(".bin ul input").length;
    for(var i = 0;i < len && data[whichUser].rubbish[i];i++){
        if($(".bin ul input").eq(i).prop("checked")) {
           
            var one = data[whichUser].rubbish.splice(i,1)[0];
            data[whichUser].lis.push(one);
            var status = one.status?"complete":"";
            var li = `
            <li class="${status}">
                <div class="pick">
                    <label for=""><input type="checkbox" name="" id=""></label>    
                </div>
                <div class="word">
                    <p class="getIt"></p>
                    <span class="up">↑</span>
                    <span class="delete">×</span>
                </div>
            </li>
                `;
            ul.insertAdjacentHTML("beforeend",li);
            $(".items .getIt").text(one.item).removeClass("getIt");
            $(".bin ul li").eq(i).remove();
            i--;
        }
    }
    localStorage.setItem("users",JSON.stringify(data));
    if(!$(".bin ul li").length){
        $(".bin .first input").prop("checked",false);
     }
     countLi();
     liShow();
     toggleAllNot();
  })
})