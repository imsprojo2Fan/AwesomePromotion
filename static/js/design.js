

$(function () {
    var key = getQueryString("v");
    var host = location.host;
    host = "http://"+host;
    var url = host+"/template/is_redirect";
    $.post(url,{_xsrf:$('#token').val(),key:key},function (res) {
        var data = res.data;
        if(data.redirect==1){
            window.open(data.redirectPage,"_self");
        }
    });

});


function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]); return null;
}

