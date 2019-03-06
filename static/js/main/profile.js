var parentWin = window.parent;
var userInfo;
$(function () {
    renderForm();
    $('#submit').on("click",function () {
        var account = $('#account').val().trim();
        var password1 = $('#password').val().trim();
        var password2 = $('#password2').val().trim();
        //var email = $('#email').val().trim();
        if(!account){
            tipTip($('#account').parent().find("span"),"请填写账号!");
            return
        }
        if(!password1){
            tipTip($('#password').parent().find("span"),"请填写密码!");
            return
        }
        if(!password2){
            tipTip($('#password2').parent().find("span"),"请确认密码!");
            return
        }
        if(password1!==password2){
            tipTip($('#password').parent().find("span"),"请确认两次密码一致!");
            return
        }
        /*if(password1==="********"){
            password1 = userInfo.Password;
        }
        if(!email){
            tipTip($('#email').parent().find("span"),"邮箱地址不能为空!");
            return
        }
        if(!checkEmail(email)){
            tipTip($('#email').parent().find("span"),"邮箱地址格式不正确!");
            return
        }*/

        $.ajax({
            url:"/main/user/update",
            type:"POST",
            data:{
                id:userInfo.Id,
                account:account,
                password:password1,
                created:new Date(new Date(userInfo.Created)).getTime(),
                _xsrf:$('#token').val()
            },
            beforeSend:function () {
                $('#loading').fadeIn(200);
            },
            success:function (r) {
                if(r.code===1){
                    renderForm();
                    parentWin.swalInfo("系统提示",r.msg,"success");
                }else{
                    parentWin.swalInfo("系统提示",r.msg,"error");
                }
            },
            complete:function () {
                $('#loading').fadeOut(200);
            }
        });

    });
    $('#operate4mail').on("click",function () {
        var txt = $(this).html();
        if(txt==="验证邮箱"){
            $.post("/main/user/validate4mail",{_xsrf:$('#token').val(),email:$('#email').val().trim()},function (r) {
                if(r.code==1){
                    swal({
                        title: "<h3>请输入邮箱验证码</h3>",
                        text: "<input style='text-align: center' maxlength='6' placeholder='6位验证码' type='text' id='code'>",
                        html:true,
                        showCancelButton: true,
                        closeOnConfirm: true,
                        confirmButtonColor: "#6397ff",
                        confirmButtonText: "提交",
                        cancelButtonText: "取消",
                        animation: "slide-from-top",
                        type: "prompt",
                        inputPlaceholder:"6位验证码"
                    }, function(){
                        var code_ = $('#code').val().trim();
                        if(!code_){
                            parentWin.swalInfo("系统提示","验证码不能为空!","error");
                        }
                        $.post("/main/user/mail4confirm",{_xsrf:$('#token').val(),code:code_},function (r) {
                            if(r.code==1){
                                parentWin.swalInfo("系统提示",r.msg,"success");
                                renderForm();
                            }else{
                                parentWin.swalInfo("系统提示",r.msg,"error");
                            }
                        });
                    });
                }else{
                    parentWin.swalInfo("系统提示",r.msg,"error");
                }
            });

        }else{
            $('#emailModal').modal("show");
        }
    });
    $('#editCodeBtn').on('click',function () {
        var email = $('#editEmail').val().trim();
        if(!email){
            $('#modalTip').html('<p class="text-danger">您未填写邮箱地址!</p>');
            return
        }
        $('#editCodeBtn').prop("disabled","disabled");
        var num = 60;
        var str;
        var timer = setInterval(function () {
            if(num===1){
                window.clearInterval(timer);
                $('#editCodeBtn').prop("disabled",false);
                $('#editCodeBtn').html("获取验证码");
                return
            }
            num--;
            str = num;
            if(num<10){
                str = "0"+num;
            }
            $('#editCodeBtn').html("剩余: "+str+" s");
        },800);
        $.post("/main/user/validate4mail",{_xsrf:$('#token').val(),email:email},function (r) {
            if(r.code===1){
                $('#modalTip').html('<p class="text-success">'+r.msg+'</p>');
            }else{
                window.clearInterval(timer);
                $('#editCodeBtn').prop("disabled",false);
                $('#editCodeBtn').html("获取验证码");
                $('#modalTip').html('<p class="text-danger">'+r.msg+'</p>');
            }
        });
    });
    $('#editSubmit').on('click',function () {
        $.post("/main/user/mail4confirm",{_xsrf:$('#token').val(),code:$('#editCode').val().trim(),changeMail:$('#editEmail').val().trim(),type:"edit"},function (r) {
            if(r.code==1){
                $('#editEmail').val("");
                $('#editCode').val("");
                $('#emailModal').modal("hide");
                parentWin.swalInfo("系统提示",r.msg,"success");
                renderForm();
            }else{
                parentWin.swalInfo("系统提示",r.msg,"error");
            }
        });
    });
});
function renderForm() {
    $.post("/main/user/listOne",{_xsrf:$('#token').val()},function (r) {
        userInfo = r.data;
        $('#id').val(userInfo.Id);
        var account = userInfo.Account;
        if(account){
            $('#account').val(account);
            $('#account').attr("disabled","disabled");
        }
        var password = userInfo.Password;
        if(password){
            $('#password').val("********");
            $('#password2').val("********");
        }
        $('#name').val(userInfo.Name);
        var gender = userInfo.Gender;
        if(gender==="男"){
            $('#radio1').prop("checked",true);
            $('#radio2').prop("checked",false);
        }else{
            $('#radio2').prop("checked",true);
            $('#radio1').prop("checked",false);
        }
        $('#birthday').val(userInfo.Birthday);
        $('#phone').val(userInfo.Phone);
        var actived = userInfo.Actived;
        $('#email').val(userInfo.Email);
        if(actived===0&&userInfo.Email){
            var dom = $('#email').parent().find("span");
            $(dom).html("邮箱地址未验证,该地址将用于找回密码");
            $(dom).addClass("text-danger");
        }else if(actived===1&&userInfo.Email){
            var dom = $('#email').parent().find("span");
            $(dom).html("邮箱地址将用于找回密码");
            $('#email').attr("disabled","disabled");
            var dom2 = $('#email').parent().find("button");
            $(dom2).html("更换邮箱");
        }else{
            var dom = $('#email').parent().find("span");
            $(dom).html("邮箱地址将用于找回密码");
            var dom2 = $('#email').parent().find("button");
            $(dom2).remove();
        }
    });
}
function tipTip(dom,str) {
    parentWin.swalInfo("系统提示",str,"error");
}