var gUrl;

//动态更改iframe高度
$(window.parent.document).find("#mainframe").load(function(){
    var main = $(window.parent.document).find("#mainframe");
    var thisHeight = window.innerHeight-80;
    //var width = window.innerWidth;
    main.height(thisHeight);
});

$(function () {

    if(userInfo.Type<3){
        $('#user').remove();
        $('#sysSetting').remove();
    }
    //$('#account').html(userInfo.Account);
    if(isPhone()){//设置导航栏箭头方向
        $('.btn-toggle-fullwidth').find("i").removeClass("lnr-arrow-left-circle");
        $('.btn-toggle-fullwidth').find("i").addClass("lnr-arrow-right-circle");
    }

    var myFrame = document.getElementById('mainframe');
    myFrame.onload = myFrame.onreadystatechange = function () {
        if (this.readyState && this.readyState != 'complete') {
            //console.log("加载中。。。");
        }
        else {
            //console.log("加载完成。。。");
            $('#loading').hide();
        }

    };

    //默认选中
    $('#home').click();

    $('#navBtn').on('click',function () {
        $('#myModal').modal('show');
    });
    $('#confirm').on('click',function () {
        var url = $('input:radio:checked').val();
        gUrl = url;
        //$('#mainframe').attr("src",url);
        $('#myModal').modal("hide");
        $('#home').click();
    });

});


//选中数量
function selectedCount(name) {
    return $("input[name='" + name + "']:checked").length;
}

function redirect(htmlName,obj){
    if(htmlName){
        $('#loading').show(200);
    }
    $('#navUl li').each(function (index) {//全置默认
        $(this).removeClass("navItemActive");
        $(this).find("i").removeClass("navItemActive4span");
        $(this).find("span").removeClass("navItemActive4span");

    });
    //设置选中
    $(obj).addClass("navItemActive");
    $(obj).find("i").addClass("navItemActive4span");
    $(obj).find("span").addClass("navItemActive4span");
    if(isPhone()){
        $('.btn-toggle-fullwidth').click();
    }
    if(!htmlName){
        return;
    }
    var url = "/main/redirect?htmlName="+htmlName;
    if(htmlName==="home"){
        if(!gUrl){
            url = "https://www.baidu.com";
        }else{
            url = gUrl;
        }
        $('#copyBtn').show(200);
        $('#navBtn').show(200);
        $('#resetBtn').show(200);
    }else{
        $('#copyBtn').hide(200);
        $('#navBtn').hide(200);
        $('#resetBtn').hide(200);
    }
    $('#mainframe').attr("src",url);
}

function changeDrop() {
    var class_ = $('#drop').attr("class");
    if(class_!="fa fa-angle-down"){
        $('#drop').attr("class","fa fa-angle-down");
    }else{
        $('#drop').attr("class","fa fa-angle-up");
    }
}

function tipTip(id,msg) {
    $('#'+id).show();
    $('#'+id).html(msg);
    $('#'+id).css({
        "color":"#ff0002b5",
        "font-size":"13px",
        "margin-left":"12px"
    });
    setTimeout(function () {
        $('#'+id).hide();
    },2000);
}

function swalInfo(title,msg,type){
    swal(title,msg,type);
}

function loading(flag) {
    if(flag){
        $('#loading').show();
    }else{
        $('#loading').hide();
    }
}