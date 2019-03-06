$(function () {
    console.log(sysSetting);
    //渲染数据
    var RootMode;
    for(var i=0;i<sysSetting.length;i++){
        var item = sysSetting[i];
        if(item.key=="RootMode"){
            RootMode = item;
        }
    }

    if (RootMode.value=="true"){
        $('#switchRoot').bootstrapSwitch('toggleState');
    }else{
        //$('#switchRoot').bootstrapSwitch('setState', "关闭");
    }

    $('#reset').on('click',function () {
        swal({
            title: "确定重置关键词吗?",
            text: '重置将无法恢复该信息!',
            type: 'info',
            showCancelButton: true,
            confirmButtonColor: '#ff1200',
            cancelButtonColor: '#474747',
            confirmButtonText: '确定',
            cancelButtonText:'取消'
        },function(){
            loading(true);
            $.post('/main/kt/reset',{_xsrf:$('#token').val()},function (res) {
                loading(false);
                if(res.code==1){
                    swal("系统提示",res.msg,"success");
                }else{
                    swal("系统提示",res.msg,"error");
                }
            }) ;
        });

    });

    //渲染switch开关
    $("#switchRoot").bootstrapSwitch({
        /*onText:'开启',
        offText:'关闭'*/
    });
    //点击触发事件，监听按钮状态
    $('#switchRoot').on('switchChange.bootstrapSwitch',function(event,state){
        //内置对象、内置属性
        //console.log(event);
        //获取状态
        console.log(state);
        var str="是否关闭Root模式？";
        var str_="关闭,普通用户将可以登录";
        if(state){
            str = "是否开启Root模式?";
            str_="开启,普通用户将无法登录";
        }
        swal({
            title: str,
            text: str_,
            type: 'info',
            showCancelButton: true,
            confirmButtonColor: '#ff1200',
            cancelButtonColor: '#474747',
            confirmButtonText: '确定',
            cancelButtonText:'取消'
        },function(){
            loading(true);
            $.post('/main/setting',{_xsrf:$('#token').val(),id:RootMode.id,key:RootMode.key,value:state},function (res) {
                loading(false);
                if(res.code==1){
                    swal("系统提示",res.msg,"success");
                }else{
                    swal("系统提示",res.msg,"error");
                }

            }) ;
        });
    });
});

function swal(title,msg,type) {
    window.parent.swalInfo(title,msg,type);
}

function loading(flag) {
    window.parent.loading(flag);
}