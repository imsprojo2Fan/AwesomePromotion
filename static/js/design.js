/*

$(function () {
    var key = getQueryString("v");
    var host = location.host;
    host = "http://"+host;
    var url = host+"/template/keyword";
    $.post(url,{_xsrf:$('#token').val(),key:key},function (res) {
        var keyword = res.data[0][0];
        var href = res.data[0][1];
        var text = "<a href='"+href+"' target='_blank'>"+keyword+"</a>";
        $('#myWrap').html(text);
        $('#myWrap').css({
            "color":"red",
            "font-size":"55px",
            "position":"fixed",
            "z-index":"99999"
        });
        $('meta[name="og:description"]').attr('content',keyword );
        $('title').html(keyword);
        $("h1").each(function () {
            $(this).html(keyword);
            $(this).css({
               "color":"red",
               "background":"#311cdc"
            });
        });
        $("h2").each(function () {
            $(this).html(keyword);
            $(this).css({
                "color":"red",
                "background":"#311cdc"
            });
        });
        $("a").each(function () {
            $(this).attr("href",href);
            $(this).attr("target","_blank");
        });
    })

});


function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]); return null;
}

*/
