$(function () {
    $('.btn').on("click",function () {
        sweetAlert(
            '错误提示',
            '网络似乎已被外星人劫持!!！',
            'error'
        );
    });
    if(dataList){
        for(var i=0;i<dataList.length;i++){
            var item = dataList[i];
            var url = "/template?v="+item.url;
            var title = item.title.trim();
            var temp = title;
            /*if(title.length>){
                title = title.substring(0,7)+"...";
            }*/
            $('#linkWrap').append('' +
                '<div class="item" style="">\n' +
                '     <a title="'+temp+'" target="_blank" href="'+url+'">'+title+'</a>\n' +
                '</div>');
        }
    }

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