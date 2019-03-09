var RefreshId;
var GlobalPageNow = 0;
var GlobalKey;
var GlobalType = "recommend";
var GlobalIndex = 0;
window.onload=function(){
    $('#preloader').hide();
}
$(function () {

    if(isPhone()){
        $('#PCWrap').hide();
        //初始化tab推荐
        data4phone(0);
    }else{
        $('#phoneWrap').hide();
        //初始化tab推荐
        data4pc(0);
    }

    $('#search').on("click",function () {
        var val = $('#keyInput').val().trim();
        if(!val){
            sweetAlert(
                '错误提示',
                '您似乎没有填查询关键字！',
                'warning'
            );
        }
        GlobalKey = val;
        GlobalPageNow = 0;
        data4pc(GlobalIndex);

    });

   $('.headWrap01 span').on('click',function () {
       $('.headWrap01 span').each(function () {
           $(this).css("border-bottom","0px solid #6195FF");
           $(this).css("font-weight","normal");
       })
       $(this).css("border-bottom","5px solid #6195FF");
       $(this).css("font-weight","bold");
       var text = $(this).html();
       $('.minirefresh-wrap-pc').each(function () {
          $(this).hide() ;
       });
       $('.minirefresh-wrap-phone').each(function () {
           $(this).hide() ;
       });
       GlobalPageNow = 0;
       GlobalKey = "";
       $('#keyInput').val("");
       if(isPhone()){
           if(text==="推荐"){
               GlobalIndex = 0;
               $('#phone_minirefresh0').show();
           }else if(text==="最新"){
               $('#phone_minirefresh1').show();
               if(!$('#phone_linkWrap1').children[0]){
                   //初始化tab最新
                   GlobalType = "latest";
                   data4phone(1);
               }
               GlobalIndex = 1;
           }else{
               $('#phone_minirefresh2').show();
               if(!$('#phone_linkWrap2').children[0]){
                   //初始化tab最新
                   GlobalType = "hot";
                   data4phone(2);
               }
               GlobalIndex = 2;
           }
       }else{
           if(text==="推荐"){
               GlobalIndex = 0;
               $('#pc_minirefresh0').show();
           }else if(text==="最新"){
               $('#pc_minirefresh1').show();
               if(!$('#pc_linkWrap1').children[0]){
                   //初始化tab最新
                   GlobalType = "latest";
                   data4pc(1);
               }
               GlobalIndex = 1;
           }else{
               $('#pc_minirefresh2').show();
               if(!$('#pc_linkWrap2').children[0]){
                   //初始化tab最新
                   GlobalType = "hot";
                   data4pc(2);
               }
               GlobalIndex = 2;
           }
       }

   }) ;

});

function data4pc(index) {
    var linkWrap = document.querySelector('#pc_linkWrap'+index);
    var miniRefresh = new MiniRefresh({
        container: '#pc_minirefresh'+index,
        down: {
            isLock:true,
            callback:function () {
                if(!RefreshId){
                    return;
                }else {
                    preLoading();
                    $.post("/data4refresh", {_xsrf:$('#token').val(),id: RefreshId}, function (r) {
                        console.log(r);
                    });
                }
            }
        },
        up: {
            isAuto: true,
            callback: function() {
                preLoading();
                GlobalPageNow++;
                GlobalKey = $('#keyInput').val().trim();
                $.post("/data4page",{_xsrf:$('#token').val(),pageNow:GlobalPageNow,pageSize:10,key:GlobalKey,type:GlobalType},function (r) {
                    //console.log(r);
                    var dataArr = r.data;
                    if(GlobalPageNow===1){
                        miniRefresh.endUpLoading(false);
                        $('#pc_linkWrap'+index).html("");
                    }
                    if(!dataArr){
                        miniRefresh.endUpLoading(true);
                    }
                    for(var i=0;i<dataArr.length;i++){
                        var obj = dataArr[i];
                        if(GlobalPageNow==1&&i==0){
                            RefreshId = obj.id;
                        }
                        var url = "/template?v="+obj.url;
                        var title = obj.title.trim();
                        $(linkWrap).append('' +
                            '<div class="item" style="">\n' +
                            '     <a title="'+title+'" target="_blank" href="'+url+'">'+title+'</a>\n' +
                            '</div>');
                    }
                    miniRefresh.endUpLoading(linkWrap.children.length >= r.recordsTotal ? true : false);

                });

            }

        }
    });
}

function data4phone(index) {
    var linkWrap = document.querySelector('#phone_linkWrap'+index);
    var miniRefresh = new MiniRefresh({
        container: '#phone_minirefresh'+index,
        down: {
            isLock:false,
            callback:function () {
                if(!RefreshId){
                    return;
                }else {
                    preLoading();
                    $.post("/data4refresh", {_xsrf:$('#token').val(),id: RefreshId}, function (r) {
                        var dataArr = r.data;
                        if(!dataArr){
                            miniRefresh.endDownLoading();
                            return
                        }
                        for(var i=0;i<r.data.length;i++){
                            var obj = dataArr[i];
                            if(i==0){
                                RefreshId = obj.id;
                            }
                            var url = "/template?v="+obj.url;
                            var title = obj.title.trim();
                            $(linkWrap.children[0]).before('' +
                                '<div class="item" style="">'+
                                '   <a title="'+title+'" target="_blank" href="'+url+'">'+title+'</a>' +
                                '</div>');
                        }
                        miniRefresh.endDownLoading();
                    });

                }
            }
        },
        up: {
            isAuto: true,
            callback: function() {
                preLoading();
                GlobalPageNow++;
                $.post("/data4page",{_xsrf:$('#token').val(),pageNow:GlobalPageNow,pageSize:10,key:GlobalKey,type:GlobalType},function (r) {
                    //console.log(r);
                    var dataArr = r.data;
                    if(GlobalPageNow===1){
                        $(linkWrap).html("");
                    }
                    if(!dataArr){
                        miniRefresh.endUpLoading(true);
                        return
                    }
                    for(var i=0;i<dataArr.length;i++){
                        var obj = dataArr[i];
                        if(GlobalPageNow==1&&i==0){
                            RefreshId = obj.id;
                        }
                        var url = "/template?v="+obj.url;
                        var title = obj.title.trim();
                        $(linkWrap).append('' +
                            '<div class="item" style="">\n' +
                            '     <a title="'+title+'" target="_blank" href="'+url+'">'+title+'</a>\n' +
                            '</div>');
                    }
                    miniRefresh.endUpLoading(linkWrap.children.length >= r.recordsTotal ? true : false);

                });

            }

        }
    });
}

function preLoading() {

    //返回顶部
    $('body,html').animate({
        scrollTop: 0
    }, 300);
    $("#preloader").fadeOut(200);
}

function search() {
    swal({
        title: '请输入关键字',//标题
        input: 'text',
        showCancelButton: true,
        cancelButtonText:'取消',
        confirmButtonText: '确定',
        showLoaderOnConfirm: true,
        preConfirm: function(val) {               //功能执行前确认操作，支持function
            return new Promise(function(resolve, reject) {
                //$('#search').val(val);

                resolve();
                /*setTimeout(function() {                 //添加一个时间函数，在俩秒后执行，这里可以用作异步操作数据
                    if (email === 'taken@example.com') {  //这里的意思是：如果输入的值等于'taken@example.com',数据已存在，提示信息
                        reject('用户已存在')                  //提示信息
                    } else {
                        resolve()                           //方法出口
                    }
                }, 2000)*/
            })
        },
        allowOutsideClick: true
    }).then(function(val) {
        console.log(val)
        GlobalKey = val.value;
        GlobalPageNow = 0;
        data4phone(GlobalIndex);
    });
}