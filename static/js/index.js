var RefreshId;
var GlobalPageNow = 0;
var linkWrap;
var miniRefresh01;
var linkWrap02;
var miniRefresh02;
var GlobalKey;
var GlobalType;
window.onload=function(){
    $('#preloader').hide();
}
$(function () {

    if(isPhone()){
        $('#PCWrap').hide();
        data4phone();
    }else{
        $('#phoneWrap').hide();
        data4pc();
    }

    $('.btn').on("click",function () {
        sweetAlert(
            '错误提示',
            '网络似乎已被外星人劫持!!！',
            'error'
        );
    });

   $('.headWrap01 span').on('click',function () {
       $('.headWrap01 span').each(function () {
           $(this).css("border-bottom","0px solid #0084FF");
           $(this).css("font-weight","normal");
       })
       $(this).css("border-bottom","5px solid #0084FF");
       $(this).css("font-weight","bold");
       var text = $(this).html();
       console.log(text);
   }) ;



});

function data4pc() {
    linkWrap = document.querySelector('#linkWrap');
    miniRefresh01 = new MiniRefresh({
        container: '#minirefresh01',
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
                $.post("/data4page",{_xsrf:$('#token').val(),pageNow:GlobalPageNow,pageSize:10,key:GlobalKey},function (r) {
                    //console.log(r);
                    var dataArr = r.data;
                    if(GlobalKey&&GlobalPageNow==1){
                        $('#linkWrap').html("");
                    }
                    for(var i=0;i<dataArr.length;i++){
                        var obj = dataArr[i];
                        if(GlobalPageNow==1&&i==0){
                            RefreshId = obj.id;
                        }
                        var url = "/template?v="+obj.url;
                        var title = obj.title.trim();
                        $('#linkWrap').append('' +
                            '<div class="item" style="">\n' +
                            '     <a title="'+title+'" target="_blank" href="'+url+'">'+title+'</a>\n' +
                            '</div>');
                    }
                    miniRefresh01.endUpLoading(linkWrap.children.length >= r.recordsTotal ? true : false);

                });

            }

        }
    });
}

function data4phone() {
    linkWrap02 = document.querySelector('#linkWrap02');
    miniRefresh02 = new MiniRefresh({
        container: '#minirefresh02',
        down: {
            isLock:false,
            callback:function () {
                if(!RefreshId){
                    return;
                }else {
                    preLoading();
                    $.post("/data4refresh", {_xsrf:$('#token').val(),id: RefreshId}, function (r) {
                        console.log(r);
                        var dataArr = r.data;
                        if(!dataArr){
                            miniRefresh02.endDownLoading();
                            return
                        }
                        for(var i=0;i<r.data.length;i++){
                            var obj = dataArr[i];
                            if(i==0){
                                RefreshId = obj.id;
                            }
                            var url = "/template?v="+obj.url;
                            var title = obj.title.trim();
                            $(linkWrap02.children[0]).before('' +
                                '<div class="item" style="">\\n\' +\n' +
                                '   \'<a title="'+title+'" target="_blank" href="'+url+'">'+title+'</a>\\n\' +\n' +
                                '\'</div>');
                        }
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
                $.post("/data4page",{_xsrf:$('#token').val(),pageNow:GlobalPageNow,pageSize:10,key:GlobalKey},function (r) {
                    //console.log(r);
                    var dataArr = r.data;
                    if(GlobalKey&&GlobalPageNow==1){
                        $('#linkWrap02').html("");
                    }
                    for(var i=0;i<dataArr.length;i++){
                        var obj = dataArr[i];
                        if(GlobalPageNow==1&&i==0){
                            RefreshId = obj.id;
                        }
                        var url = "/template?v="+obj.url;
                        var title = obj.title.trim();
                        $('#linkWrap02').append('' +
                            '<div class="item" style="">\n' +
                            '     <a title="'+title+'" target="_blank" href="'+url+'">'+title+'</a>\n' +
                            '</div>');
                    }
                    miniRefresh02.endUpLoading(linkWrap02.children.length >= r.recordsTotal ? true : false);

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