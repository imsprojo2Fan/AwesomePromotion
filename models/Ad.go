package models

import (
	"github.com/astaxie/beego/orm"
	"time"
	"fmt"
	"strconv"
)


type Ad struct {
	Id       int64
	Uid  	 int64
	Url      string
	Title	 string
	Keyword  string
	Description string
	Remark string
	Updated time.Time `orm:"auto_now_add;type(datetime)"`
	Created time.Time `orm:"auto_now_add;type(datetime)"`
}

func (this *Ad) AdTBName() string {
	return AdTBName()
}

func(this *Ad) Insert(model *Ad) int {

	o := orm.NewOrm()

	_,err := o.Insert(model)
	if err!=nil{
		fmt.Println(err)
		return -1
	}else{
		return 1
	}
}

func(this *Ad) Update(Ad *Ad) bool {

	o := orm.NewOrm()
	_,err := o.Update(Ad,"title","keyword","description","remark","updated")
	if err!=nil{
		fmt.Println(err)
		return false
	}else{
		return true
	}
}

func(this *Ad) Delete(Ad *Ad) bool {

	o := orm.NewOrm()
	_,err := o.Delete(Ad)
	if err!=nil{
		fmt.Println(err)
		return false
	}else{
		return true
	}
}

func(this *Ad) Read(Ad *Ad) bool {

	o := orm.NewOrm()
	err := o.Read(Ad)
	if err == orm.ErrNoRows {
		fmt.Println(err)
		fmt.Println("查询不到")
		return false
	} else if err == orm.ErrMissPK {
		fmt.Println("找不到主键")
		return false
	} else {
		fmt.Println(Ad.Id)
		return true
	}
}

func(this *Ad) ReadOrCreate(model *Ad) int64  {
	o := orm.NewOrm()
	// 三个返回参数依次为：是否新创建的，对象 Id 值，错误
	var ID int64
	 created, id, err := o.ReadOrCreate(model, "id");
	if err == nil {
		ID = id
		if created {
			fmt.Println("New Insert an object. Id:", id)
		} else {
			fmt.Println("Get an object. Id:", id)
		}
	}
	fmt.Println(err)
	return ID
}

func(this *Ad) SelectByCol(model *Ad,col string) {
	o := orm.NewOrm()
	o.Read(model,col)
}

func(this *Ad) Count(qMap map[string]interface{})int64{
	var count int64
	o := orm.NewOrm()
	if qMap["uid"]!=""{
		cnt,_ := o.QueryTable(new(Ad)).Filter("title__startswith",qMap["searchKey"]).Filter("uid",qMap["uid"]).Count() // SELECT COUNT(*) FROM USER
		count = cnt
	}else{
		cnt,_ := o.QueryTable(new(Ad)).Filter("title__startswith",qMap["searchKey"]).Count() // SELECT COUNT(*) FROM USER
		count = cnt
	}
	//cnt,_ := o.QueryTable("resume").Count()
	//var count[] Resume
	//o.Raw("select count(*) from resume where 1=1 and name like %?%",searchKey).QueryRows(count)
	return count
}

func(this *Ad) ListByPage(qMap map[string]interface{})[]orm.Params{
	var maps []orm.Params
	o := orm.NewOrm()
	//qs := o.QueryTable("login_log")
	sql := "select * from ad where 1=1"
	if qMap["uid"]!=""{
		sql = sql+ " and uid="+qMap["uid"].(string)
	}
	if qMap["searchKey"]!=""{
		sql = sql+" and title like '%"+qMap["searchKey"].(string)+"%'"
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

func(this *Ad) All()[]orm.Params {
	var maps []orm.Params
	o := orm.NewOrm()
	o.Raw("SELECT id,title from ad").Values(&maps)
	return maps
}



