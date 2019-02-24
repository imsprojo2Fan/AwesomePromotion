var workItem,skillItem,eduItem;
var resume = {};
var key;
$(function () {
    key = window.location.href;
    //隐藏验证登录输入框
    $('fieldset').hide();

    $('.slide').slider({
        formatter: function (value) {
            return '当前值:' + value;
        }
    }).on('slide', function (slideEvt) {
        //当滚动时触发
        //console.info(slideEvt);
        //获取当前滚动的值，可能有重复
        // console.info(slideEvt.value);
    }).on('change', function (e) {
        //当值发生改变的时候触发
        //console.info(e);
        //获取旧值和新值
        //console.info(e.value.oldValue + '--' + e.value.newValue);
    });

    $('#qrcodeBtn').on('click',function () {
        share();
    });

    $('#design').on("click",function () {//右下角设计按钮
        if(localData){
            renderForm();
        }
        $('#mainWrap').hide(200);
        $('#submitTip').hide(200);
        $('#myModal').modal("show");
    });
    $('#modalClose').on("click",function () {//模态框关闭按钮
        $('#myModal').modal("hide");
        $('#mainWrap').show(200);
        if(localStorage.getItem(key)){
            $("#submitTip").show();
            $('#scroll-top').remove();
            $('#design').css("bottom","15px");
        }
    });
    $('#prev').on("click",function () {
        var curPage = $('#curPage').html();
        $('#prev').show();//显示上一页按钮
        $('#preview').hide();//隐藏保存预览按钮
        $('#next').show();//显示下一页按钮
        $('#page'+curPage).hide(200);//隐藏当前页
        curPage--;
        if(curPage==1){
            $('#prev').hide();//隐藏上一页按钮
        }
        if(curPage<3){
            $('#pageTitle').html("基础信息");
        }else if(curPage==3){
            $('#pageTitle').html("工作/实习经历");
        }else if(curPage==4){
            $('#pageTitle').html("专业技能");
        }else{
            $('#pageTitle').html("教育背景");
        }
        $('#page'+curPage).show(200);//显示上一页
        $('#curPage').html(curPage);//设置当前页
    });
    $('#next').on("click",function () {
        var curPage = $('#curPage').html();
        //curPage = parseInt(curPage);

        if(curPage==1){
            var name = $('#name').val()|| '';
            var objective = $('#objective').val()|| '';
            var phone = $('#phone').val()|| '';
            var email = $('#email').val()|| '';
            if(!name){
                tipTip("姓名是必填项喔.");
                return;
            }
            if(!objective){
                tipTip("您貌似忘记填写求职意向了.");
                return;
            }
            if(!phone){
                tipTip("留下手机号能让HR更容易找到你呢!");
                return;
            }
            if(!checkPhone(phone)){
                tipTip("手机号格式不正确!");
                return
            }
            if(!email){
                tipTip("邮箱地址有时其实也挺需要的.");
                return;
            }
            if(!checkEmail(email)){
                tipTip("邮箱地址格式有误!");
                return;
            }
        }
        if(curPage==2){
            var introduce = $('#introduce').val()|| '';
            if(!introduce){
                tipTip("自我评价能让别人更容易的了解你呢!");
                return;
            }
        }
        if(curPage==3){
            var works = [];
            $("#workWrap").find(".workItem").each(function () {
                var workItem = {};
                workItem.start = $(this).find(".start").val();
                workItem.end = $(this).find(".end").val();
                var companyName = $(this).find(".companyName").val()|| '';
                workItem.company = companyName;
                var position = $(this).find(".position").val()|| '';
                workItem.position = position;
                workItem.description = $(this).find("textarea").val()|| ''.replace(/\n/g,'<br/>');
                if(companyName&&position){
                    works.push(workItem);
                }
            });
            if(works.length===0){
                tipTip("您似乎没有填写工作经历.");
                return;
            }
        }

        $('#prev').show();//显示上一页按钮

        $('#page'+curPage).hide(200);//隐藏当前页
        curPage++;
        if(curPage==5){
            $('#preview').show();//显示保存预览按钮
            $('#next').hide();//隐藏下一页按钮
        }
        if(curPage<3){
            $('#pageTitle').html("基础信息");
        }else if(curPage==3){
            $('#pageTitle').html("工作/实习经历");
        }else if(curPage==4){
            $('#pageTitle').html("专业技能");
        }else{
            $('#pageTitle').html("教育背景");
        }

        $('#page'+curPage).show(200);//显示下一页
        $('#curPage').html(curPage);//设置当前页


    });

    //新增工作经历
    $('#save4work').on("click",function (){
        //验证是否有未填项
        var isBreak = false;
        $('.workItem').each(function () {
            var obj = $(this).find(".companyName");
            var obj2 = $(this).find(".position");
            var val = $(obj).val()|| '';
            var val2 = $(obj2).val()|| '';
            if(!val||!val2){
                tipTip("您需先填完一些必要信息才能新增当前项");
                isBreak = true;
            }
        });

        if(isBreak){
            return;
        }

        var workArr = $('.workItem');
        workItem = $(workArr[0]).clone();
        $(workItem).find("input").val("");//清空已填内容
        $(workItem).find("input[type='month']").val("2018-01");
        $(workItem).find("textarea").val("");//清空已填内容
        $('#workWrap').append(workItem);
        $('.del4work').each(function (index) {//显示删除按钮
            if(index!=0){
                $(this).show();
                $(this).find("button").on("click",function () {//删除按钮绑定事件
                    $(this).parent().parent().remove();//移除当前dom
                });
            }
        });
    });
    //新增技能
    $('#save4skill').on("click",function () {
        var isBreak = false;
        //验证是否有未填项
        $('.skillItem').each(function () {
            var obj = $(this).find(".skillName");
            if(!$(obj).val()|| ''){
                tipTip("您需先填完一些必要信息才能新增当前项");
                isBreak = true;
            }
        });
        if(isBreak){
            return;
        }
        var item = $('.skillItem')[0];
        skillItem = $(item).clone();
        $(skillItem).find("input").val("");//清空已填内容
        $('#skillWrap').append(skillItem);
        $(skillItem).find('.slide').slider({//渲染slider
            formatter: function (value) {
                return '当前值:' + value;
            },
            max:100,
            value:75
        });
        $(skillItem).find("#ex1Slider")[0].remove();
        $('.del4skill').each(function (index) {//显示删除按钮
            if(index!=0){
                $(this).show();
                $(this).find("button").on("click",function () {//删除按钮绑定事件
                    $(this).parent().parent().remove();//移除当前dom
                });
            }
        });
    });
    //新增教育背景
    $('#save4edu').on("click",function () {
        var isBreak = false;
        //验证是否有未填项
        $('.eduItem').each(function () {
            var obj = $(this).find(".school");
            if(!$(obj).val()|| ''){
                tipTip("您需先填完一些必要信息才能新增当前项");
                isBreak = true;
            }
        });
        if(isBreak){
            return;
        }
        var item = $('.eduItem')[0];
        eduItem = $(item).clone();
        $(eduItem).find("input").val("");//清空已填内容
        $(eduItem).find("input[type='month']").val("2018-01");
        $(eduItem).find("textarea").val("");//清空已填内容

        $('#eduWrap').append(eduItem);
        $('.del4edu').each(function (index) {//显示删除按钮
            if(index!=0){
                $(this).show();
                $(this).find("button").on("click",function () {//删除按钮绑定事件
                    $(this).parent().parent().remove();//移除当前dom
                });
            }
        });
    });
    //完成预览
    $('#preview').on('click',function () {
        dataCollect();
    });
    //提交数据
    $('#sendMessage').on('click',function () {
        var url = window.location.href;
        if(url.indexOf("share")<1){
            swal("即刻提示","模板状态[与我联系]功能不可用喔","error");
            return
        }else{
            var company = $('#contact-company').val()|| '';
            var name = $('#contact-name').val()|| '';
            var email = $('#contact-email').val()|| '';
            var message = $('#contact-message').val()|| '';
            if(!company||!email||!message){
                swal("即刻提示","您似乎忘了填写一些必要的信息!","error");
                return
            }
            var sid = GetQueryString("v");
            $.post("/resume/send2mail",{_xsrf:$('#token').val(),sid:sid,company:company,name:name,email:email,message:message},function (r) {
                if(r.code==1){
                    swal("即刻提示",r.msg,"success");
                    $('#contact-company').val("");
                    $('#contact-name').val("");
                    $('#contact-email').val("");
                    $('#contact-message').val("");
                }else{
                    swal("即刻提示",r.msg,"error");
                }
            });
        }
    });

});
function tipTip(str) {
    $('#tip').html("<p>即刻提示:<span class='red'>"+str+"</span></p>");
    setTimeout(function () {
        $('#tip').html("");
    },5000);
}
function dataCollect() {
    $('#tip').html("");
    var theme = $('#theme4pick').val();
    var name = $('#name').val()|| '';
    var objective = $('#objective').val()|| '';
    var gender = $('input:radio:checked').val();
    var birthday = $('#birthday').val();
    var phone = $('#phone').val()|| '';
    var email = $('#email').val()|| '';
    var home = $('#province').val()+"-"+$('#city').val();
    var address = $('#address').val()|| '';
    var hobby = $('#hobby').val()|| '';
    var honor = $('#honor').val()|| '';
    var introduce = $('#introduce').val()|| '';
    var works = [];
    $("#workWrap").find(".workItem").each(function () {
        var workItem = {};
        workItem.start = $(this).find(".start").val();
        workItem.end = $(this).find(".end").val();
        var companyName = $(this).find(".companyName").val()|| '';
        workItem.company = companyName;
        var position = $(this).find(".position").val()|| '';
        workItem.position = position;
        workItem.description = $(this).find("textarea").val()|| ''.replace(/\n/g,'<br/>');
        if(companyName&&position){
            works.push(workItem);
        }
    });
    var skills = [];
    $("#skillWrap").find(".skillItem").each(function () {
        var skillItem = {};
        skillItem.name = $(this).find(".skillName").val()|| '';
        skillItem.num = $(this).find(".slide").val();
        if($(this).find(".skillName").val()|| ''){
            skills.push(skillItem);
        }
    });
    var edus = [];
    $("#eduWrap").find(".eduItem").each(function () {
        var eduItem = {};
        eduItem.start = $(this).find(".start").val();
        eduItem.end = $(this).find(".end").val();
        eduItem.school = $(this).find(".school").val()|| '';
        eduItem.description = $(this).find("textarea").val()|| ''.replace(/\n/g,'<br/>');
        if($(this).find(".school").val()|| ''){
            edus.push(eduItem);
        }
    });
    /*if(!name){
        tipTip("姓名是认识一个人的第一步喔.");
        return;
    }
    if(!objective){
        tipTip("您貌似忘记填写求职意向了.");
        return;
    }
    if(!phone){
        tipTip("留下手机号能让HR更容易找到你喔!");
        return;
    }
    if(!checkPhone(phone)){
        tipTip("手机号格式不正确!");
        return
    }
    if(!email){
        tipTip("邮箱地址有时其实也挺需要的.");
        return;
    }
    if(!checkEmail(email)){
        tipTip("邮箱地址格式有误!");
        return;
    }
    if(!introduce){
        tipTip("自我评价能让别人更容易的了解你呢!");
        return;
    }
    if(works.length===0){
        tipTip("您似乎没有填写工作经历.");
        return;
    }*/
    if(edus.length===0){
        tipTip("您似乎忘了填写教育背景.");
        return;
    }
    resume.Name = name;
    resume.Objective = objective;
    resume.Gender = gender;
    resume.Birthday = birthday;
    resume.Phone = phone;
    resume.Email = email;
    resume.Home = home;
    resume.Province = $('#province').val();
    resume.City = $('#city').val();
    resume.Address = address;
    resume.Hobby = hobby;
    resume.Honor = honor;
    resume.Introduce = introduce;
    resume.Works = works.reverse();
    resume.Skills = skills;
    resume.Educations = edus.reverse();

    localStorage.setItem(key,JSON.stringify(resume));
    localStorage.setItem("theme",$('#theme4pick').val());
    renderHtml();
    $('#modalClose').click();

}
function renderForm() {
    $('#name').val(resume.Name);
    $('#objective').val(resume.Objective);
    var gender = resume.Gender;
    if(gender==="男"){
        $('#radio1').prop("checked",true);
        $('#radio2').prop("checked",false);
    }else{
        $('#radio2').prop("checked",true);
        $('#radio1').prop("checked",false);
    }
    $('#birthday').val(resume.Birthday);
    $('#phone').val(resume.Phone);
    $('#email').val(resume.Email);
    //渲染省市区
    $("#distpicker").distpicker({
        province:resume.Province ,
        city: resume.City,
        district: ""
    });
    $('#address').val(resume.Address);
    $('#hobby').val(resume.Hobby);
    $('#honor').val(resume.Honor);
    $('#introduce').val(resume.Introduce);
    var works = resume.Works;
    $('#workWrap').html("");
    for(var i=0;i<works.length;i++){
        var obj = works[i];
        var start = obj.start;
        var end = obj.end;
        var company = obj.company;
        var position = obj.position;
        var id = i+"work";
        var description = obj.description.replace(/<br\/>/g, "\n");
        $('#workWrap').append('<div class="workItem" style="margin-top: 5px;padding: 5px;border:0.5px solid #eee;">\n' +
            '                                <div class="del4work" style="width: 100%;text-align: right;margin-top: -5px;display:none"><button style="margin-right:0px;" class="btn btn-danger btn-xs" title="删除当前项"><i class="fa fa-trash-o" aria-hidden="true"></i></button></div>\n' +
            '                                <div class="form-group alertPickDate">\n' +
            '                                    <label class="col-sm-3 control-label form-label">起止时间<span class="red"></span></label>\n' +
            '                                    <div class="col-sm-8" style="border: 0px solid red;">\n' +
            '                                        <input type="month" style="display: inline-block;width: 48%;" value="'+start+'" class="form-control start">\n' +
            '                                        <input type="month" style="display: inline-block;width: 50%;" value="'+end+'" class="form-control end">\n' +
            '                                    </div>\n' +
            '                                </div>\n' +
            '                                <div class="form-group">\n' +
            '                                    <label class="col-sm-3 control-label form-label">公司名称</label>\n' +
            '                                    <div class="col-sm-8">\n' +
            '                                        <input type="text" class="form-control companyName" value="'+company+'" maxlength="60"   placeholder="公司名称">\n' +
            '                                        <span class="help-block"></span>\n' +
            '                                    </div>\n' +
            '                                </div>\n' +
            '                                <div class="form-group">\n' +
            '                                    <label class="col-sm-3 control-label form-label">职位名称</label>\n' +
            '                                    <div class="col-sm-8">\n' +
            '                                        <input type="text" class="form-control position" maxlength="60" value="'+position+'"   placeholder="职位名称">\n' +
            '                                        <span class="help-block"></span>\n' +
            '                                    </div>\n' +
            '                                </div>\n' +
            '                                <div class="form-group">\n' +
            '                                    <label class="col-sm-3 control-label form-label">工作描述<span class="red"></span></label>\n' +
            '                                    <div class="col-sm-8">\n' +
            '                                        <textarea class="form-control" id="'+id+'" placeholder="工作描述" style="min-height: 120px;resize: vertical"></textarea>\n' +
            '                                        <span class="help-block"></span>\n' +
            '                                    </div>\n' +
            '                                </div>\n' +
            '                            </div>');
        //设置textarea
        $('#'+id).val(description);
    }
    $('.del4work').each(function (index) {//显示删除按钮
        if(index!=0){
            $(this).show();
            $(this).find("button").on("click",function () {//删除按钮绑定事件
                $(this).parent().parent().remove();//移除当前dom
            });
        }
    });

    var skills = resume.Skills;
    $('#skillWrap').html("");
    for(var i=0;i<skills.length;i++){
        var obj = skills[i];
        var skillName = obj.name;
        var num = obj.num;
        $('#skillWrap').append('<div class="skillItem" style="margin-top: 5px;padding-top: 5px;border: 0.5px solid #eee">\n' +
            '                                <div class="del4skill" style="width: 100%;text-align: right;margin-top: -5px;display:none"><button style="margin-right:0px;" class="btn btn-danger btn-xs" title="删除当前项"><i class="fa fa-trash-o" aria-hidden="true"></i></button></div>\n' +
            '                                <div class="form-group">\n' +
            '                                    <label class="col-sm-3 control-label form-label">技能名称</label>\n' +
            '                                    <div class="col-sm-8">\n' +
            '                                        <input type="text" class="form-control skillName" value="'+skillName+'" maxlength="60" placeholder="技能名称">\n' +
            '                                        <span class="help-block"></span>\n' +
            '                                    </div>\n' +
            '                                </div>\n' +
            '                                <div class="form-group">\n' +
            '                                    <label class="col-sm-3 control-label form-label">熟练度<span class="red"></span></label>\n' +
            '                                    <div class="col-sm-8">\n' +
            '                                        <input id="skill'+i+'"  class="slide" data-slider-id=\'ex1Slider\' type="text" data-slider-min="0" data-slider-max="100" data-slider-step="1" data-slider-value="'+num+'"/>\n' +
            '                                    </div>\n' +
            '                                </div>\n' +
            '                            </div>');
        $('#skill'+i).slider({//渲染slider
            formatter: function (value) {
                return '当前值:' + value;
            },
            max:100,
            value:num
        });
        //$(skillItem).find("#ex1Slider")[0].remove();
    }
    $('.del4skill').each(function (index) {//显示删除按钮
        if(index!=0){
            $(this).show();
            $(this).find("button").on("click",function () {//删除按钮绑定事件
                $(this).parent().parent().remove();//移除当前dom
            });
        }
    });

    var edus = resume.Educations;
    $('#eduWrap').html("");
    for(var i=0;i<edus.length;i++){
        var obj = edus[i];
        var start = obj.start;
        var end = obj.end;
        var school = obj.school;
        var id = i+"edu";
        var description = obj.description.replace(/<br\/>/g, "\n");
        $('#eduWrap').append('<div class="eduItem" style="margin-top: 5px;padding-top: 5px;border: 0.5px solid #eee;">\n' +
            '                                <div class="del4edu" style="width: 100%;text-align: right;margin-top: -5px;display:none"><button style="margin-right:0px;" class="btn btn-danger btn-xs" title="删除当前项"><i class="fa fa-trash-o" aria-hidden="true"></i></button></div>\n' +
            '                                <div class="form-group alertPickDate">\n' +
            '                                    <label class="col-sm-3 control-label form-label">起止时间<span class="red"></span></label>\n' +
            '                                    <div class="col-sm-8" style="border: 0px solid red;">\n' +
            '                                        <input type="month" style="display: inline-block;width: 48%;" value="'+start+'" class="form-control start">\n' +
            '                                        <input type="month" style="display: inline-block;width: 50%;" value="'+end+'" class="form-control end">\n' +
            '                                    </div>\n' +
            '                                </div>\n' +
            '\n' +
            '                                <div class="form-group">\n' +
            '                                    <label class="col-sm-3 control-label form-label">学校/机构名称</label>\n' +
            '                                    <div class="col-sm-8">\n' +
            '                                        <input type="text" class="form-control school" value="'+school+'" maxlength="60" placeholder="学校/机构名称">\n' +
            '                                        <span class="help-block"></span>\n' +
            '                                    </div>\n' +
            '                                </div>\n' +
            '\n' +
            '                                <div class="form-group">\n' +
            '                                    <label class="col-sm-3 control-label form-label">教育信息<span class="red"></span></label>\n' +
            '                                    <div class="col-sm-8">\n' +
            '                                        <textarea class="form-control" placeholder="教育信息" id="'+id+'" style="min-height: 120px;resize: vertical"></textarea>\n' +
            '                                        <span class="help-block"></span>\n' +
            '                                    </div>\n' +
            '                                </div>\n' +
            '                            </div>');
        //设置textarea
        $('#'+id).val(description);
    }
    $('.del4edu').each(function (index) {//显示删除按钮
        if(index!=0){
            $(this).show();
            $(this).find("button").on("click",function () {//删除按钮绑定事件
                $(this).parent().parent().remove();//移除当前dom
            });
        }
    });

}
function submit() {

    console.log(resume);

    if($('#submit').html()==="前往登录"){
        $.post("/validate",{type:"loginByUid",_xsrf:$('#token').val()},function (r) {
            if(r.code==1){
                window.open("/main","_self");
            }else{
                setTimeout(function(){swal("即刻提示",r.msg, "error"); },100);
            }
        });

        return;
    }

    swal({
            title: "<h3>是否已有账号?</h3>",
            text: "如果无账号将由系统生成临时账号,请尽快更改账号信息!",
            type: "warning",
            html:true,
            showCancelButton: true,
            confirmButtonColor: "#6397ff",
            confirmButtonText: "是",
            cancelButtonText: "否",
            closeOnConfirm: false
        },
        function(isConfirm){
            if(isConfirm){
                swal({
                    title: "<h3>请输入登录信息</h3>",
                    text: "<input placeholder='账号/邮箱/手机号' type='text' id='account'>"+"<input placeholder='登录密码' type='password' id='password'>",
                    html:true,
                    showCancelButton: true,
                    closeOnConfirm: true,
                    confirmButtonColor: "#6397ff",
                    confirmButtonText: "提交",
                    cancelButtonText: "取消",
                    animation: "slide-from-top",
                    type: "prompt",
                    inputPlaceholder:"账号信息"
                }, function(){
                    var account = $('#account').val()|| '';
                    var password = $('#password').val()|| '';
                    $.post("/validate",{type:"validate4made",_xsrf:$('#token').val(),account:account,password:password,rid:GetQueryString("v"),theme:localStorage.getItem("theme")},function (r) {
                        if(r.code===1){
                            window.location.href = "/main";
                            clearLocalData();
                        }else if(r.code===2){
                            setTimeout(function(){swal(r.msg, "登录系统点击我的制作即可查看简历", "error"); },100);
                            $('#footerTip').html("登录系统点击左侧我的制作即可查看最新简历");
                            $('#submit').html("前往登录");
                            $('#submitTip').css("height","188px");
                            $('.color-picker-wrap').remove();//移除颜色选择
                            $('#design').remove();//移除设计按钮
                            clearLocalData();
                        }else if(r.code===3){
                            $.ajax({
                                url : "/resume/submit",
                                type : "POST",
                                data : {
                                    theme:localStorage.getItem("theme"),
                                    uid:r.data,
                                    rid:GetQueryString("v"),
                                    name:resume.Name,
                                    objective:resume.Objective,
                                    gender:resume.Gender,
                                    birthday:resume.Birthday,
                                    phone:resume.Phone,
                                    email:resume.Email,
                                    province:resume.Province,
                                    city:resume.City,
                                    address:resume.Address,
                                    hobby:resume.Hobby,
                                    honor:resume.Honor,
                                    introduce:resume.Introduce,
                                    works:JSON.stringify(resume.Works),
                                    skills:JSON.stringify(resume.Skills),
                                    educations:JSON.stringify(resume.Educations),
                                    _xsrf:$('#token').val()
                                },
                                dataType : "json",
                                cache : false,
                                beforeSend:function(){
                                    $('#loading').fadeIn(200);
                                    $('#scroll-top').click();
                                },
                                success : function(r) {
                                    if (r.code == 1) {
                                        swal({
                                            title:"提交成功!",
                                            text:'登录系统点击我的制作即可查看简历',
                                            html:true,
                                            type:"success"
                                        });
                                        $('#footerTip').html("登录系统点击左侧我的制作即可查看最新简历");
                                        $('#submit').html("前往登录");
                                        $('#submitTip').css("height","188px");
                                        $('.color-picker-wrap').remove();//移除颜色选择
                                        $('#design').remove();//移除设计按钮
                                        clearLocalData();
                                    } else {
                                        swal(r.msg,' ',"error");
                                    }
                                },
                                complete:function () {
                                    $('#loading').fadeOut(200);
                                }
                            });
                        }else{
                            setTimeout(function(){swal("错误提示",r.msg,"error"); },100);

                        }
                    })

                });
            }else{
                $.ajax({
                    url : "/resume/submit",
                    type : "POST",
                    data : {
                        theme:localStorage.getItem("theme"),
                        rid:GetQueryString("v"),
                        name:resume.Name,
                        objective:resume.Objective,
                        gender:resume.Gender,
                        birthday:resume.Birthday,
                        phone:resume.Phone,
                        email:resume.Email,
                        province:resume.Province,
                        city:resume.City,
                        address:resume.Address,
                        hobby:resume.Hobby,
                        honor:resume.Honor,
                        introduce:resume.Introduce,
                        works:JSON.stringify(resume.Works),
                        skills:JSON.stringify(resume.Skills),
                        educations:JSON.stringify(resume.Educations),
                        _xsrf:$('#token').val()
                    },
                    dataType : "json",
                    cache : false,
                    beforeSend:function(){
                        $('#loading').fadeIn(200);
                        $('#scroll-top').click();
                    },
                    success : function(r) {
                        if (r.code == 1) {
                            swal({
                                title:"提交成功!",
                                text:'为了您的隐私安全,请尽快登录系统更改账号信息！</br>以下为临时登录密钥</br></br><h3>'+r.data+"</h3>",
                                html:true,
                                type:"success"
                            });
                            $('#footerTip').html("登录系统您可能需要拷贝临时密钥:</br>"+r.data);
                            $('#submit').html("前往登录");
                            $('#submitTip').css("height","188px");
                            $('.color-picker-wrap').remove();//移除颜色选择
                            $('#design').remove();//移除设计按钮
                            $('#footerTip').css("padding-bottom","15px");
                            clearLocalData();
                        } else {
                            swal(r.msg,' ',"error");
                        }
                    },
                    complete:function () {
                        $('#loading').fadeOut(200);
                    }
                });
            }
        });

}
function clearLocalData() {
    localStorage.setItem(key,"");
    localStorage.setItem("theme","");
}