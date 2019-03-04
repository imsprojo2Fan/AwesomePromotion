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
            url: '/main/user/list',
            type: 'POST',
            data:{
                _xsrf:$("#token", parent.document).val()
            }
        },
        columns: [
            { data: 'account'},
            { data: 'actived',"render":function (data) {
                    if(data==1){
                        return "<span style='color:green;'>正常</span>";
                    }else{
                        return "<span style='color:red;'>禁用</span>";
                    }
                } },
            { data: 'type',"render":function (data) {
                    var str = "";
                    if(data==0){
                        str = "普通用户";
                    }else if(data==1){
                        str = "管理员";
                    }else if(data==2){
                        str = "高级管理员";
                    }else if(data==3){
                        str = "超级管理员";
                    }else{
                        str = "访客";
                    }
                    return str;
                } },
            { data: 'email',"render":function (data) {
                    if(!data){
                        return "<span>暂未填写</span>";
                    }else{
                        return data;
                    }

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
        $('#detail_account').html(rowData.account);
        $('#detail_actived').html(rowData.actived);
        $('#detail_type').html(rowData.type);
        var email = rowData.email;
        if(!email){
            email = "暂未填写";
        }
        $('#detail_email').html(email);
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
        $('#account_edit').val(rowData.account);
        $('#actived_edit').selectpicker('val',rowData.actived);
        $("#actived_edit").selectpicker('refresh');
        $("#type_edit").selectpicker('val',rowData.type);
        $("#type_edit").selectpicker('refresh');
        $('#password_edit').val(rowData.password);
        $('#email_edit').val(rowData.email);
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
    var account = $('#account').val().trim();
    var actived = $('#actived').val();
    var type = $('#type').val();
    var password = $('#password').val().trim();
    var email = $('#email').val().trim();
    var remark = $('#remark').val().trim();
    if (!account){
        swal("账号不能为空!",' ',"warning");
        return;
    }
    if(email){
        if (!checkEmail(email)){
            swal("邮箱格式不正确!",' ',"warning");
        }
    }
    if (!password){
        swal("密码不能为空!",' ',"warning");
        return;
    }
    $.ajax({
        url : "/main/user/add",
        type : "POST",
        dataType : "json",
        cache : false,
        data : {
            _xsrf:$("#token", parent.document).val(),
            account:account,
            actived:actived,
            type:type,
            password:password,
            email:email,
            remark:remark
        },
        beforeSend:function(){
            $('#loading').fadeIn(200);
        },
        success : function(r) {
            var type = "error";
            if (r.code == 1) {
                type = "success";
                reset();
            }
            swal(r.msg,' ',type);
        },
        complete:function () {
            $('#loading').fadeOut(200);
        }
    });
}

function edit(){
    var account = $('#account_edit').val().trim();
    var actived = $('#actived_edit').val();
    var type = $('#type_edit').val();
    var password = $('#password_edit').val().trim();
    var email = $('#email_edit').val().trim();
    var remark = $('#remark_edit').val().trim();
    if (!password){
        swal("密码不能为空!",' ',"warning");
        return;
    }
    if(email){
        if (!checkEmail(email)){
            swal("邮箱格式不正确!",' ',"warning");
        }
    }
    $.ajax({
        url : "/main/user/update",
        type : "POST",
        dataType : "json",
        cache : false,
        data : {
            _xsrf:$("#token", parent.document).val(),
            id:$('#Id').val(),
            account:account,
            actived:actived,
            type:type,
            password:password,
            email:email,
            remark:remark
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
        url : "/main/user/delete",
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