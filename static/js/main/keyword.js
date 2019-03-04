var myTable;
$(function () {
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

    $('input[type=radio]').iCheck({
        checkboxClass: 'icheckbox_flat-blue',  // 注意square和blue的对应关系
        radioClass: 'iradio_flat-blue'
    });

    $('input[name=switch]').on('ifChecked', function(event){ //ifCreated 事件应该在插件初始化之前绑定
        var val = $(this).val();
        if(val==0){
            $('#ourlHtml').html('<input type="text" class="form-control" style="ime-mode:disabled" id="oUrl" placeholder="请输入外链链接">');
        }else{
            $('#ourlHtml').html('' +
                '<select id="oUrl" class="selectpicker" >\n' +
                '   <option selected value="0">暂无可选项</option>\n' +
                '</select>');
            //渲染下拉框
            if(ads){
                $('#oUrl').html('');
                for(var i=0;i<ads.length;i++){
                    var item = ads[i];
                    $('#oUrl').append('<option value="'+item.url+'">'+item.title+'</option>');
                }
            }

            $("#oUrl").selectpicker('refresh');
        }
    });
    var tempDom;
    var tempDom2;
    $('input[name=switch_edit]').on('ifChecked', function(event){ //ifCreated 事件应该在插件初始化之前绑定
        var val = $(this).val();
        if(val==0){
            tempDom2 = $('#oUrl_edit').clone();
            $('#ourlHtml_edit').html(tempDom);
        }else{
            tempDom = $('#oUrl_edit').clone();
            $('#ourlHtml_edit').html(tempDom2);
            $("#oUrl_edit").selectpicker('refresh');
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
            url: '/main/keyword/list',
            type: 'POST',
            data:{
                _xsrf:$("#token", parent.document).val()
            }
        },
        columns: [
            { data: 'keyword'},
            { data: 'url',"render":function (url) {
                    var dom = "";
                    if(url.indexOf("http")>-1){
                        var origin = /^https?:\/\/[\w-.]+(:\d+)?/i.exec(url)[0];
                        dom =  "<a target='_blank' href='"+url+"'>"+origin+"</a>";
                    }else{
                        dom =  "<a target='_blank' href='/ad?v="+url+"'>点击预览</a>";
                    }
                    return dom;
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
            { data: 'type',"render":function (data) {
                    return data;
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
        console.log(rowData);
        $('#detail_keyword').html(rowData.keyword);
        var url = rowData.url;
        var dom = "";
        if(url.indexOf("http")>-1){
            var origin = /^https?:\/\/[\w-.]+(:\d+)?/i.exec(url)[0];
            dom =  "<a target='_blank' href='"+url+"'>"+origin+"</a>";
        }else{
            dom =  "<a target='_blank' href='/ad?v="+url+"'>点击预览</a>";
        }
        $('#detail_url').html(dom);
        var type = rowData.type;
        $('#detail_type').html(type);
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
        console.log(rowData);
        $('#id_edit').val(rowData.id);
        $('#keyword_edit').val(rowData.keyword);
        var type = rowData.type;
        $("#type_edit").selectpicker('val',type);//默认选中 value=“1” 的option
        $("#type_edit").selectpicker('refresh');
        var url = rowData.url;
        var urlType = rowData.url_type;
        $('input[name=switch_edit]').each(function () {//选中radio
            if($(this).val()==urlType){
                $(this).iCheck('check');
            }
        });
        if(urlType==0){//手动输入

            $('#oUrl_edit').val(url);
        }else{
            $('#ourlHtml_edit').html('<select id="oUrl_edit" class="selectpicker" >\n' +
                '                <option selected value="0">暂无可选项</option>\n' +
                '             </select>');
            //渲染下拉框
            if(ads!=0){
                $('#oUrl_edit').html('');
                for(var i=0;i<ads.length;i++){
                    var item = ads[i];
                    if(item.url==url){
                        $('#oUrl_edit').append('<option selected value="'+item.url+'">'+item.title+'</option>');
                    }else{
                        $('#oUrl_edit').append('<option value="'+item.url+'">'+item.title+'</option>');
                    }
                }
            }

            $("#oUrl_edit").selectpicker('refresh');
        }
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
});


function add(){
    var keyword = $('#keyword').val().trim();
    var type = $('#type').val();
    var url = $('#oUrl').val().trim();
    var urlType = $('input:radio[name=switch]:checked').val();
    var description = $('#description').val().trim();
    var remark = $('#remark').val().trim();
    if (!keyword){
        swal("系统提示",'关键字不能为空!',"warning");
        return;
    }
    $.ajax({
        url : "/main/keyword/add",
        type : "POST",
        dataType : "json",
        cache : false,
        data : {
            _xsrf:$("#token", parent.document).val(),
            keyword:keyword,
            type:type,
            url:url,
            urlType:urlType,
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
    var id = $('#id_edit').val();
    var keyword = $('#keyword_edit').val().trim();
    var type = $('#type_edit').val();
    var url = $('#oUrl_edit').val().trim();
    var urlType = $('input:radio[name=switch_edit]:checked').val();
    var description = $('#description_edit').val().trim();
    var remark = $('#remark_edit').val().trim();
    if (!keyword){
        swal("系统提示",'关键字不能为空!',"warning");
        return;
    }
    $.ajax({
        url : "/main/keyword/update",
        type : "POST",
        dataType : "json",
        cache : false,
        data : {
            _xsrf:$("#token", parent.document).val(),
            id:id,
            keyword:keyword,
            type:type,
            url:url,
            urlType:urlType,
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
            swal(r.msg,' ',type);
        },
        complete:function () {
            loading(false);
        }
    });
}

function del(id){

    $.ajax({
        url : "/main/keyword/delete",
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
                swal("系统提示",r.msg, "success");
                refresh();
            }else{
                swal("系统提示",r.msg, "error");
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
    $(".selectpicker").selectpicker('val',1);//下拉框选中 value=“1” 的option
    $(".selectpicker").selectpicker('refresh');
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