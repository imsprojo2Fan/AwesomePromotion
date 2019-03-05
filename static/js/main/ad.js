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
            $('#tab2').fadeOut(100);
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
            $("#tab2").fadeIn(100);
        }
    });

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
            url: '/main/ad/list',
            type: 'POST',
            data:{
                _xsrf:$("#token", parent.document).val()
            }
        },
        columns: [
            { data: 'title'},
            { data: 'url',"render":function (data) {
                    var url = "/ad?v="+data;
                    return "<a href='"+url+"' target='_blank'>点击预览</a>";
                } },
            { data: 'keyword',"render":function (data) {
                    return data;
                } },
            { data: 'description',"render":function (data) {
                    var temp = data;
                    if(!data){
                        data = "暂未填写";
                    }else if(data.length>10){
                        data = data.substring(0,6)+"...";
                    }
                    return "<span title='"+temp+"'>"+data+"</span>";
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
        $('#detail_title').html(rowData.title);
        $('#detail_keyword').html(rowData.keyword);
        var description = rowData.description;
        if(!description){
            description = "暂未填写";
        }
        $('#detail_description').html(description);
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
        $('#title_edit').val(rowData.title);
        $('#keyword_edit').val(rowData.keyword);
        $('#description_edit').val(rowData.description);
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

function add(){
    var title = $('#title').val().trim();
    var keyword = $('#keyword').val().trim();
    var description = $('#description').val().trim();
    var remark = $('#remark').val().trim();
    if (!title){
        swal("系统提示","页面标题不能为空!","error");
        return;
    }
    $.ajax({
        url : "/main/ad/add",
        type : "POST",
        dataType : "json",
        cache : false,
        data : {
            _xsrf:$("#token", parent.document).val(),
            title:title,
            keyword:keyword,
            description:description,
            remark:remark
        },
        beforeSend:function(){
            loading(true);
        },
        success : function(r) {
            var type = "error";
            if (r.code == 1) {
                type = "success";
                reset();
            }
            swal("系统提示",r.msg,type);
        },
        complete:function () {
            loading(false);
        }
    });
}

function edit(){
    var id = $('#Id').val();
    var title = $('#title_edit').val().trim();
    var keyword = $('#keyword_edit').val().trim();
    var description = $('#description_edit').val().trim();
    var remark = $('#remark_edit').val().trim();
    if (!title){
        swal("系统提示","页面标题不能为空!","error");
        return;
    }
    $.ajax({
        url : "/main/ad/update",
        type : "POST",
        dataType : "json",
        cache : false,
        data : {
            _xsrf:$("#token", parent.document).val(),
            id:id,
            title:title,
            keyword:keyword,
            description:description,
            remark:remark
        },
        beforeSend:function(){
            loading(true);
        },
        success : function(r) {
            $('#editModal').modal("hide");
            var type = "error";
            if (r.code == 1) {
                type = "success";
                refresh();
            }
            swal("系统提示",r.msg,type);
        },
        complete:function () {
            loading(false);
        }
    });
}

function del(id){

    $.ajax({
        url : "/main/ad/delete",
        type : "POST",
        dataType : "json",
        cache : false,
        data : {
            _xsrf:$("#token", parent.document).val(),
            id:id
        },
        beforeSend:function(){
            loading(true);
        },
        success : function(r) {
            if (r.code == 1) {
                swal("系统提示",r.msg,"success");
                refresh();
            }else{
                swal("系统提示",r.msg,"error");
            }
        },
        complete:function () {
            loading(false);
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
function loading(flag) {
    window.parent.loading(flag);
}