var workItem,skillItem,eduItem;
var GlobalResume = {};
var GlobalDataArr = [];
$(function () {
    $('#resetBtn').on('click',function () {
        swal({
                title: "<h3>是否确定重置?</h3>",
                text: "重置将导致您之前分享的简历链接及二维码不可访问",
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
                    $.post("/main/info4resume/reset4share",{_xsrf:$("#token").val(),id:$('#editId').val()},function (r) {
                        if(r.code==1){
                            var index = $('#editIndex').val();
                            GlobalDataArr[index].Sid = r.data;
                            swal("即刻提示",r.msg,"success");
                        }else{
                            swal("即刻提示",r.msg,"error");
                        }
                    });
                }
        });
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
            var val = $(obj).val().trim();
            var val2 = $(obj2).val().trim();
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
            if(!$(obj).val().trim()){
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
            if(!$(obj).val().trim()){
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

});
function tipTip(str) {
    $('#tip').html("<p>即刻提示:<span class='red'>"+str+"</span></p>");
    setTimeout(function () {
        $('#tip').html("");
    },5000);
}
function renderForm(index) {
    //重置弹框显示页从1开始
    $('.page').each(function () {
        $(this).css("display","none");
    });
    $('#page1').show();
    $("#prev").hide();
    $('#next').show();
    $('#preview').hide();
    $('#curPage').html(1);
    $('#pageTitle').html("基础信息");
    var resume = GlobalDataArr[index];
    GlobalResume = resume;
    $('#editId').val(resume.Id);
    $('#editUid').val(resume.Uid);
    $('#editRid').val(resume.Rid);
    $('#editSid').val(resume.Sid);
    $('#editIndex').val(resume.Index);
    $('#colorInput').val(resume.ThemeColor.substring(1,resume.ThemeColor.length));
    if(resume.ThemeColor){
        $('#colorInput').css("background-color",resume.ThemeColor);
        $('#colorInput').css("color","#ffffff");
    }else{
        $('#colorInput').val("暂未选择");
    }
    $('#name').val(resume.Name);
    $('#objective').val(resume.Objective);
    var gender = resume.Gender;
    if(gender==="男"){
        $('#radio1').prop('checked',true);;
        $('#radio2').prop("checked",false);
    }else{
        $('#radio2').prop("checked","true");
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
    //var works = JSON.parse(resume.Works);
    var works = resume.Works;
    if(typeof works==="string"&&works){
        works = JSON.parse(resume.Works);
    }
    if(works.length>0){
        $('#workWrap').html("");
    }
    for(var i=0;i<works.length;i++){
        var obj = works[i];
        var start = obj.start;
        var end = obj.end;
        var company = obj.company;
        var position = obj.position;
        var id = i+"work";
        var description = obj.description.replace(/<br\/>/g, "\n");
        $('#workWrap').append('<div class="workItem" style="margin-top: 5px;padding: 5px;border:1px solid #eee;">\n' +
            '                                <div class="del4work" style="width: 100%;text-align: right;margin-top: -5px;display:none"><button style="margin-right:-5px;" class="btn btn-danger btn-xs" title="删除当前项"><i class="fa fa-trash-o" aria-hidden="true"></i></button></div>\n' +
            '                                <div class="form-group alertPickDate">\n' +
            '                                    <label class="col-sm-3 control-label form-label">起止时间<span class="red"></span></label>\n' +
            '                                    <div class="col-sm-4" style="border: 0px solid red;">\n' +
            '                                        <input type="month" value="'+start+'" class="form-control start">\n' +
            '                                    </div>\n' +
            '                                    <div class="col-sm-4" style="border: 0px solid red;">\n' +
            '                                        <input type="month" value="'+end+'" class="form-control end">\n' +
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

    //var skills = JSON.parse(resume.Skills);
    var skills = resume.Skills;
    if(typeof skills==="string"&&skills){
        skills = JSON.parse(resume.Skills);
    }
    if(skills.length>0){
        $('#skillWrap').html("");
    }

    for(var i=0;i<skills.length;i++){
        var obj = skills[i];
        var skillName = obj.name;
        var num = obj.num;
        $('#skillWrap').append('<div class="skillItem" style="margin-top: 8px;padding:5px;border: 1px solid #EEE">\n' +
            '                                <div class="del4skill" style="width: 100%;text-align: right;margin-top: -5px;display:none"><button style="margin-right:-5px;" class="btn btn-danger btn-xs" title="删除当前项"><i class="fa fa-trash-o" aria-hidden="true"></i></button></div>\n' +
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

    //var edus = JSON.parse(resume.Educations);
    var edus = resume.Educations;
    if(typeof edus==="string"&&edus){
        edus = JSON.parse(resume.Educations);
    }
    if(edus.length>0){
        $('#eduWrap').html("");
    }

    for(var i=0;i<edus.length;i++){
        var obj = edus[i];
        var start = obj.start;
        var end = obj.end;
        var school = obj.school;
        var id = i+"edu";
        var description = obj.description;
        $('#eduWrap').append('<div class="eduItem" style="margin-top: 5px;padding: 5px;border: 1px solid #eee;">\n' +
            '                                <div class="del4edu" style="width: 100%;text-align: right;margin-top: -5px;display:none"><button style="margin-right:-5px;" class="btn btn-danger btn-xs" title="删除当前项"><i class="fa fa-trash-o" aria-hidden="true"></i></button></div>\n' +
            '                                <div class="form-group alertPickDate">\n' +
            '                                    <label class="col-sm-3 control-label form-label">起止时间<span class="red"></span></label>\n' +
            '                                    <div class="col-sm-4" style="border: 0px solid red;">\n' +
            '                                        <input type="month" value="'+start+'" class="form-control start">\n' +
            '                                    </div>\n' +
            '                                    <div class="col-sm-4" style="border: 0px solid red;">\n' +
            '                                        <input type="month" value="'+end+'" class="form-control end">\n' +
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
function dataCollect() {
    $('#tip').html("");
    var theme = "#"+$('#colorInput').val().trim();
    var name = $('#name').val().trim();
    var objective = $('#objective').val().trim();
    var gender = $('input:radio:checked').val();
    var birthday = $('#birthday').val();
    var phone = $('#phone').val().trim();
    var email = $('#email').val().trim();
    var home = $('#province').val()+"-"+$('#city').val();
    var address = $('#address').val().trim();
    var hobby = $('#hobby').val().trim();
    var honor = $('#honor').val().trim();
    var introduce = $('#introduce').val().trim();
    var works = [];
    $("#workWrap").find(".workItem").each(function () {
        var workItem = {};
        workItem.start = $(this).find(".start").val();
        workItem.end = $(this).find(".end").val();
        var companyName = $(this).find(".companyName").val().trim();
        workItem.company = companyName;
        var position = $(this).find(".position").val().trim();
        workItem.position = position;
        workItem.description = $(this).find("textarea").val().trim().replace(/\n/g,'<br/>');
        if(companyName&&position){
            works.push(workItem);
        }
    });
    var skills = [];
    $("#skillWrap").find(".skillItem").each(function () {
        var skillItem = {};
        skillItem.name = $(this).find(".skillName").val().trim();
        skillItem.num = $(this).find(".slide").val();
        if($(this).find(".skillName").val().trim()){
            skills.push(skillItem);
        }
    });
    var edus = [];
    $("#eduWrap").find(".eduItem").each(function () {
        var eduItem = {};
        eduItem.start = $(this).find(".start").val();
        eduItem.end = $(this).find(".end").val();
        eduItem.school = $(this).find(".school").val().trim();
        eduItem.description = $(this).find("textarea").val().trim().replace(/\n/g,'<br/>');
        if($(this).find(".school").val().trim()){
            edus.push(eduItem);
        }
    });
    if(!name){
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
    if(!email){
        tipTip("邮箱地址有时其实也挺需要的.");
        return;
    }
    if(!introduce){
        tipTip("自我评价能让别人更容易的了解你呢!");
        return;
    }
    if(works.length==0){
        tipTip("您似乎没有填写工作经历.");
        return;
    }
    if(works.length==0){
        tipTip("您似乎忘了填写教育背景.");
        return;
    }
    GlobalResume.Theme = theme;
    GlobalResume.Name = name;
    GlobalResume.Objective = objective;
    GlobalResume.Gender = gender;
    GlobalResume.Birthday = birthday;
    GlobalResume.Phone = phone;
    GlobalResume.Email = email;
    GlobalResume.Home = home;
    GlobalResume.Province = $('#province').val();
    GlobalResume.City = $('#city').val();
    GlobalResume.Address = address;
    GlobalResume.Hobby = hobby;
    GlobalResume.Honor = honor;
    GlobalResume.Introduce = introduce;
    GlobalResume.Works = works;
    GlobalResume.Skills = skills;
    GlobalResume.Edus = edus;
    localStorage.setItem("resume4made",JSON.stringify(GlobalResume));
    submit();

}
function submit() {
    if(!GlobalResume){
        return
    }
    var unixTimestamp = new Date(GlobalResume.Created) ;
    var tm = new Date(unixTimestamp).getTime();

    $.ajax({
        url : "/main/info4resume/update",
        type : "POST",
        data : {
            id:$('#editId').val(),
            uid:$('#editUid').val(),
            rid:$('#editRid').val(),
            sid:$('#editSid').val(),
            theme:GlobalResume.Theme,
            name:GlobalResume.Name,
            objective:GlobalResume.Objective,
            gender:GlobalResume.Gender,
            birthday:GlobalResume.Birthday,
            phone:GlobalResume.Phone,
            email:GlobalResume.Email,
            province:GlobalResume.Province,
            city:GlobalResume.City,
            address:GlobalResume.Address,
            hobby:GlobalResume.Hobby,
            honor:GlobalResume.Honor,
            introduce:GlobalResume.Introduce,
            works:JSON.stringify(GlobalResume.Works),
            skills:JSON.stringify(GlobalResume.Skills),
            edus:JSON.stringify(GlobalResume.Edus),
            created:tm,
            _xsrf:$("#token").val()
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
                    title:"更新成功!",
                    text:'可前往预览简历并生成最新二维码',
                    html:true,
                    type:"success"
                });
                //更新本地数据
                var index = $('#editIndex').val();
                GlobalDataArr[index] = GlobalResume;
                $('#modalClose').click();
                clearLocalData();
            } else {
                swal("即刻提示",r.msg,"error");
            }
        },
        complete:function () {
            $('#loading').fadeOut(200);
        }
    });
}
function clearLocalData() {
    localStorage.setItem("resume4made","");
}