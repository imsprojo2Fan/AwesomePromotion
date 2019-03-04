package models

import (
	"github.com/astaxie/beego/orm"
	"time"
	"fmt"
	"strconv"
)


type Template struct {
	Id       int64
	Uid  	 int64
	Url      string
	Label    string
	Description string
	Domain   string
	MUrl	 string
	Content	 string
	Redirect int
	RedirectPage string
	Remark string
	Updated time.Time `orm:"auto_now_add;type(datetime)"`
	Created time.Time `orm:"auto_now_add;type(datetime)"`
}

func (this *Template) TemplateTBName() string {
	return TemplateTBName()
}

func(this *Template) Insert(model *Template) int {

	o := orm.NewOrm()

	if model.MUrl !=""{
		o.Read(model,"murl")
		if model.Id>0{
			return -2//模板已存在
		}
	}

	_,err := o.Insert(model)
	if err!=nil{
		return -1
	}else{
		return 1
	}
}

func(this *Template) Update(Template *Template) bool {

	o := orm.NewOrm()
	_,err := o.Update(Template,"label","redirect","redirect_page","description","remark","updated")
	if err!=nil{
		return false
	}else{
		return true
	}
}

func(this *Template) Delete(Template *Template) bool {

	o := orm.NewOrm()
	_,err := o.Delete(Template)
	if err!=nil{
		return false
	}else{
		return true
	}
}

func(this *Template) Read(Template *Template) bool {

	o := orm.NewOrm()
	err := o.Read(Template)
	if err == orm.ErrNoRows {
		fmt.Println("查询不到")
		return false
	} else if err == orm.ErrMissPK {
		fmt.Println("找不到主键")
		return false
	} else {
		fmt.Println(Template.Id)
		return true
	}
}

func(this *Template) ReadOrCreate(model Template) int64  {
	o := orm.NewOrm()
	// 三个返回参数依次为：是否新创建的，对象 Id 值，错误
	var ID int64
	if created, id, err := o.ReadOrCreate(&model, "id"); err == nil {
		ID = id
		if created {
			fmt.Println("New Insert an object. Id:", id)
		} else {
			fmt.Println("Get an object. Id:", id)
		}
	}
	return ID
}

func(this *Template) SelectByCol(model *Template,col string) {
	o := orm.NewOrm()
	o.Read(model,col)
}

func(this *Template) SelectByKey(model *Template)[]orm.Params {
	var maps []orm.Params
	o := orm.NewOrm()
	o.Raw("SELECT k.keyword,k.description,k.url FROM template t,key_word k,keyword2template kt WHERE t.id = kt.tid and  kt.kid=k.id and t.url=?", model.Url).Values(&maps)
	return maps
}

func(this *Template) SelectLatest()[]orm.Params {
	var maps []orm.Params
	o := orm.NewOrm()
	o.Raw("SELECT label,url FROM template  order by id desc limit 0,100").Values(&maps)
	return maps
}

func(this *Template) Insert4k2t(qMap map[string]interface{}) int64 {
	var count int64
	o := orm.NewOrm()
	res, err := o.Raw("insert into keyword2template(kid,tid) values(?,?)", qMap["kid"],qMap["tid"]).Exec()
	if err == nil {
		num, _ := res.RowsAffected()
		count = num
		fmt.Println("mysql row affected nums: ", num)
	}
	return count
}

func(this *Template) Reset4k2t() int64 {

	o := orm.NewOrm()
	res,_:=o.Raw("update keyword2template set kid=6").Exec()
	count,_ := res.RowsAffected()
	return count
}

func(this *Template) Del4k2t(tid int64) int64 {

	o := orm.NewOrm()
	res,_:=o.Raw("delete from keyword2template WHERE tid=?",tid).Exec()
	count,_ := res.RowsAffected()
	return count
}

func(this *Template) List4k2t() []orm.Params {
	var maps []orm.Params
	o := orm.NewOrm()
	o.Raw("select k.id,k.keyword,t.id as tid from template t,key_word k,keyword2template kt WHERE t.id=kt.tid AND k.id=kt.kid").Values(&maps)

	return maps
}

func(this *Template) Count(qMap map[string]interface{})int64{
	var count int64
	o := orm.NewOrm()
	if qMap["uid"]!=""{
		cnt,_ := o.QueryTable(new(Template)).Filter("label__startswith",qMap["searchKey"]).Filter("uid",qMap["uid"]).Count() // SELECT COUNT(*) FROM USER
		count = cnt
	}else{
		cnt,_ := o.QueryTable(new(Template)).Filter("label__startswith",qMap["searchKey"]).Count() // SELECT COUNT(*) FROM USER
		count = cnt
	}
	//cnt,_ := o.QueryTable("resume").Count()
	//var count[] Resume
	//o.Raw("select count(*) from resume where 1=1 and name like %?%",searchKey).QueryRows(count)
	return count
}

func(this *Template) ListByPage(qMap map[string]interface{})[]orm.Params{
	var maps []orm.Params
	o := orm.NewOrm()
	//qs := o.QueryTable("login_log")
	sql := "select id, url,label,m_url,redirect,redirect_page,remark,updated,created from template where 1=1"
	if qMap["uid"]!=""{
		sql = sql+ " and uid="+qMap["uid"].(string)
	}
	if qMap["searchKey"]!=""{
		sql = sql+" and label like '%"+qMap["searchKey"].(string)+"%'"
	}
	if qMap["sortCol"]!=""{
		sortCol := qMap["sortCol"].(string)
		sortType := qMap["sortType"].(string)
		sql = sql+" order by "+sortCol+" "+sortType
	}else{
		sql = sql+" order by id desc"
	}
	pageNow := qMap["pageNow"].(int64)
	pageNow_ := strconv.FormatInt(pageNow,10)
	pageSize := qMap["pageSize"].(int64)
	pageSize_ := strconv.FormatInt(pageSize,10)
	sql = sql+" LIMIT "+pageNow_+","+pageSize_
	o.Raw(sql).Values(&maps)
	return maps
}



