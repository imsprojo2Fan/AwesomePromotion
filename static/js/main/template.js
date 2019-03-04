var myTable;
$(document).ready(function() {

    //调用父页面弹窗通知
    //window.parent.swalInfo('TEST',666,'error')

    //tab导航栏切换
    $('#tabHref01').on("click",function () {
        var isActive = $(this).attr("class");
        if(!isActive){
            return
        }else{
            $('#tabHref02').addClass("active");
            $(this).removeClass("active");
            $('#myModal02').modal('hide');
            $("#tab1").fadeIn(100);
            refresh();
        }
    });
    $('#tabHref02').on("click",function () {
        var isActive = $(this).attr("class");
        if(!isActive){
            return
        }else{
            $('#tabHref01').addClass("active");
            $(this).removeClass("active");
            $('#tab1').fadeOut(100);
            $('#myModal02').modal('show');
        }
    });

    $('#addTemplete').on('click',function () {
        add();
    });
    //渲染checkbox
    $('input[type=radio]').iCheck({
        checkboxClass: 'icheckbox_flat-blue',  // 注意square和blue的对应关系
        radioClass: 'iradio_flat-blue'
    });

    // 中文重写select 查询为空提示信息
    $('.selectpicker').selectpicker({
        noneSelectedText: '下拉选择关键词',
        noneResultsText: '无匹配选项',
        maxOptionsText: function (numAll, numGroup) {
            var arr = [];
            arr[0] = (numAll == 1) ? '最多可选中数为{n}' : '最多可选中数为{n}';
            arr[1] = (numGroup == 1) ? 'Group limit reached ({n} item max)' : 'Group limit reached ({n} items max)';
            return arr;
        },
        liveSearch: true,
        size:10   //设置select高度，同时显示5个值
    });
    if(!dataList){
        $('#selectAddWrap').html("暂无关键词可选!请前往'关键词管理'添加关键词。");
        $('#selectAddWrap').css("margin-top","7px");
        $('#selectEditWrap').html("暂无关键词可选!请前往'关键词管理'添加关键词。");
        $('#selectEditWrap').css("margin-top","7px");
    }else {
        //keywords=keywords.concat(keywords);
        var tempAjax = "";
        $.each(dataList, function (i, item) {
            tempAjax += "<option value='" + item.id + "'>" + item.keyword + "</option>";
        });
        $("#selectAdd").empty();
        $("#selectAdd").append(tempAjax);
        //更新内容刷新到相应的位置
        $('#selectAdd').selectpicker('render');
        $('#selectAdd').selectpicker('refresh');
        $("#selectEdit").empty();
        $("#selectEdit").append(tempAjax);
        //更新内容刷新到相应的位置
        $('#selectEdit').selectpicker('render');
        $('#selectEdit').selectpicker('refresh');
    }

    //datatable setting
    myTable =$('#myTable').DataTable({
        /*scrollY:        '100vh',*/
        autoWidth: true,
        scrollCollapse: true,
        "processing": true,
        serverSide: true,
        //bSort:false,//排序
        "aoColumnDefs": [ { "bSortable": false, "aTargets": [ 0,1,2,3,5 ] }],//指定哪些列不排序
        "order": [[ 4, "desc" ]],//默认排序
        ajax: {
            url: '/main/template/list',
            type: 'POST',
            data:{
                _xsrf:$("#token", parent.document).val()
            }
        },
        columns: [
            { data: 'label',"render":function (data) {
                    var temp = data;
                    if(data.length>10){
                        data = data.substring(0,6)+"...";
                    }
                    return "<span title='"+temp+"'>"+data+"</span>" ;
                }},
            { data: 'keyword',"render":function (data) {
                    var str = "";
                    var temp = "";
                    if(data){
                        for(var i=0;i<data.length;i++){
                            var obj = data[i];
                            str = str+","+obj.keyword;
                        }
                        str = str.substring(1,str.length);
                        temp = str;
                        if(str.length>10){
                            str = str.substring(0,9)+"...";
                        }
                    }
                    return "<span title='"+temp+"'>"+str+"</span>";
                } },
            { data: 'url',"render":function (data) {
                    var url = "/template?v="+data;
                    return "<a href='"+url+"' target='_blank'>点击预览</a>";
                } },
            { data: 'm_url',"render":function (url) {
                    var dom = "";
                    if(url.indexOf("http")>-1){
                        var origin = /^https?:\/\/[\w-.]+(:\d+)?/i.exec(url)[0];
                        dom =  "<a target='_blank' href='"+url+"'>"+origin+"</a>";
                    }else{
                        dom =  "<a target='_blank' href='/ad?v="+url+"'>点击预览</a>";
                    }
                    return dom;
                } },
            { data: 'created',"render":function (data,type,row,meta) {
                    var unixTimestamp = new Date(data);
                    var commonTime = unixTimestamp.toLocaleString('chinese', {hour12: false});
                    return commonTime;
                }},
            { data: null,"render":function () {
                    var html = "<a href='javascript:void(0);'  class='delete btn btn-default btn-xs'>查看</a>&nbsp;"
                    html += "<a href='javascript:void(0);' class='up btn btn-info btn-xs'></i>编辑</a>&nbsp;"
                    html += "<a href='javascript:void(0);' class='down btn btn-danger btn-xs'>删除</a>"
                    return html;
                } }
        ],
        language: {
            url: '../../static/plugins/datatables/zh_CN.json'
        },
        "createdRow": function ( row, data, index ) {//回调函数用于格式化返回数据
            /*if(!data.name){
                $('td', row).eq(2).html("暂未填写");
            }*/
        }
    });

    $('.dataTables_wrapper .dataTables_filter input').css("background","blue");

    var rowData;
    $('#myTable').on("click",".btn-default",function(e){//查看
        rowData = myTable.row($(this).closest('tr')).data();
        $('#detail_title').html(rowData.label);
        var data = rowData.keyword;
        var str = "";
        if(data){
            for(var i=0;i<data.length;i++){
                var obj = data[i];
                str = str+","+obj.keyword;
            }
            str = str.substring(1,str.length);
        }

        $('#detail_keyword').html(str);

        var url = rowData.url;
        var dom =  "<a target='_blank' href='/template?v="+url+"'>本站预览</a>";
        $('#detail_url').html(dom);
        var mUrl = rowData.m_url;
        dom =  "<a target='_blank' href='"+mUrl+"'>源网页预览</a>";
        $('#detail_murl').html(dom);
        var remark = rowData.remark;
        if(!remark){
            remark = "暂未填写";
        }
        $('#detail_remark').html(remark);
        var created = rowData.created;
        var unixTimestamp = new Date(created) ;
        var commonTime = unixTimestamp.toLocaleString('chinese',{hour12:false});
        $('#detail_created').html(commonTime);

        var updated = rowData.updated;
        if(updated){
            var unixTimestamp = new Date(updated) ;
            updated = unixTimestamp.toLocaleString('chinese',{hour12:false});
        }else{
            updated = "暂无更新";
        }

        $('#detail_updated').html(updated);
        $('#detailModal').modal("show");
    });
    $('#myTable').on("click",".btn-info",function(e){//编辑
        rowData = myTable.row($(this).closest('tr')).data();
        $('#Id').val(rowData.id);
        $('#title_edit').val(rowData.label);
        var keywords = rowData.keyword;
        var arr = [];
        $.each(keywords,function (i,item) {
            arr.push(item.id);
        });
        $('#selectEdit').val(arr);
        $('#selectEdit').selectpicker('refresh');
        $('input[name=redirect_edit]').val(rowData.redirect);
        $('#redirectPage_edit').val(rowData.redirectPage);
        $('#description').val(rowData.description);
        $('#remark_edit').val(rowData.remark);
        $('#tip').html("");
        $('#editModal').modal("show");
    });
    $('#myTable').on("click",".btn-danger",function(e){//删除
        rowData = myTable.row($(this).closest('tr')).data();
        console.log(rowData);
        var id = rowData.id;

        swal({
            title: "确定删除吗?",
            text: '删除将无法恢复该信息!',
            type: 'info',
            showCancelButton: true,
            confirmButtonColor: '#ff1200',
            cancelButtonColor: '#474747',
            confirmButtonText: '确定',
            cancelButtonText:'取消'
        },function(){
            del(id);
        });

    });

} );

function add() {
    var url = $('#urlInput').val().trim();

    if(!url||!isURL(url)){
        tipTip("tip","错误提示:请输入正确的网页地址!");
        return
    }
    var val = $('#selectAdd').val();
    if(!val){
        tipTip("tip","错误提示:请选择关键词!");
        return
    }
    var keyArr = "";
    $.each(val,function (i,item) {
        keyArr = keyArr+","+item;
    });
    keyArr = keyArr.substring(1,keyArr.length);

    var origin = /^https?:\/\/[\w-.]+(:\d+)?/i.exec(url)[0];
    $('#loading').show();
    $.post("/main/template/add",
        {
            _xsrf:$('#token').val(),
            inputUrl:url,
            keywords:keyArr,
            domain:origin,
            redirect:$('input:radio[name=redirect]:checked').val(),
            redirectPage:$('#redirectPage').val().trim(),
            remark:$('#remark').val().trim()},
        function (res) {
        $('#loading').hide();
        if(res.code===1){
            $('#myModal02').modal("hide");
            $('#urlInput').val("");
            $('#selectAdd').val("");
            $('#remark').val("");
            $('#tabHref01').click();
            swal("系统提示",res.msg,"success");
            window.open("/template?v="+res.data,"_blank");
        }else{
            tipTip("tip",res.msg);
        }

    });
}

function edit(){
    var id = $('#Id').val();
    var title = $('#title_edit').val().trim();
    if(!title){
        tipTip("标题不能为空!","","error");
        return
    }
    var val = $('#selectEdit').val();
    if(!val){
        tipTip("请选择关键词!","","error");
        return
    }
    var keyArr = "";
    $.each(val,function (i,item) {
        keyArr = keyArr+","+item;
    });
    keyArr = keyArr.substring(1,keyArr.length);
    console.log($('input[name=redirect_edit]:checked'));
    var val = $('input[name=redirect_edit]:checked').val();
    var redirectPage = $('#redirectPage_edit').val().trim();
    debugger
    if(val==1){
        if(!redirectPage){
            tipTip("请填写目标跳转页!","","error");
            return
        }
    }
    $.ajax({
        url : "/main/template/update",
        type : "POST",
        dataType : "json",
        cache : false,
        data : {
            _xsrf:$("#token", parent.document).val(),
            id:id,
            title:title,
            keyArr:keyArr,
            redirect:val,
            redirectPage:redirectPage,
            description:$('#description').val().trim(),
            remark:$('#remark_edit').val().trim()
        },
        beforeSend:function(){
            $('#loading').fadeIn(200);
        },
        success : function(r) {
            $('#editModal').modal("hide");
            var type = "error";
            if (r.code == 1) {
                type = "success";
                refresh();
            }
            swal(r.msg,' ',type);
        },
        complete:function () {
            $('#loading').fadeOut(200);
        }
    });
}

function del(id){

    $.ajax({
        url : "/main/template/delete",
        type : "POST",
        dataType : "json",
        cache : false,
        data : {
            _xsrf:$("#token", parent.document).val(),
            id:id
        },
        beforeSend:function(){
            $('#loading').fadeIn(200);
        },
        success : function(r) {
            if (r.code == 1) {
                swal(r.msg,' ', "success");
                refresh();
            }else{
                swal(r.msg,' ', "error");
            }
        },
        complete:function () {
            $('#loading').fadeOut(200);
        }
    })
}

function reset() {
    $(":input").each(function () {
        $(this).val("");
    });
    $("textarea").each(function () {
        $(this).val("");
    });
}

function refresh() {
    myTable.ajax.reload();
}

function swal(title,msg,type) {
    window.parent.swalInfo(title,msg,type);
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