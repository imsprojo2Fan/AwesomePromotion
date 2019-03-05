package models

import (
	"github.com/astaxie/beego/orm"
	"time"
	"fmt"
	"strconv"
)


type KeyWord struct {
	Id       int64
	Uid  	 int64
	Type	 string
	Keyword  string
	Description string
	Url      string
	UrlType  string
	Remark string
	Updated time.Time `orm:"auto_now_add;type(datetime)"`
	Created time.Time `orm:"auto_now_add;type(datetime)"`
}

func (this *KeyWord) KeyWordTBName() string {
	return KeyWordTBName()
}

func(this *KeyWord) Insert(model *KeyWord) int {

	o := orm.NewOrm()

	if model.Keyword !=""{
		o.Read(model,"keyword")
		if model.Id>0{
			return -2//关键词已存在
		}
	}

	_,err := o.Insert(model)
	if err!=nil{
		return -1
	}else{
		return 1
	}
}

func(this *KeyWord) Update(KeyWord *KeyWord) bool {

	o := orm.NewOrm()
	_,err := o.Update(KeyWord,"keyword","description","type","url","url_type","remark","updated")
	if err!=nil{
		return false
	}else{
		return true
	}
}

func(this *KeyWord) Delete(KeyWord *KeyWord) bool {

	o := orm.NewOrm()
	o.Begin()
	//删除模板-关键字关联表
	_, err01 := o.Raw("delete from k2t where kid=?",KeyWord.Id).Exec()
	if err01!=nil{
		o.Rollback()
		return false
	}
	_,err := o.Delete(KeyWord)
	if err!=nil{
		o.Rollback()
		return false
	}else{
		o.Commit()
		return true
	}
}

func(this *KeyWord) Read(KeyWord *KeyWord) bool {

	o := orm.NewOrm()
	err := o.Read(KeyWord)
	if err == orm.ErrNoRows {
		fmt.Println("查询不到")
		return false
	} else if err == orm.ErrMissPK {
		fmt.Println("找不到主键")
		return false
	} else {
		fmt.Println(KeyWord.Id)
		return true
	}
}

func(this *KeyWord) ReadOrCreate(model KeyWord) int64  {
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

func(this *KeyWord) SelectByCol(model *KeyWord,col string) {
	o := orm.NewOrm()
	o.Read(model,col)
}

func(this *KeyWord) All(uid string)[]orm.Params {
	var maps []orm.Params
	o := orm.NewOrm()
	if uid==""{
		o.Raw("SELECT id,keyword from key_word").Values(&maps)
	}else{
		o.Raw("SELECT id,keyword from key_word where uid="+uid).Values(&maps)
	}
	return maps
}

func(this *KeyWord) Count(qMap map[string]interface{})int64{
    var count int64
	o := orm.NewOrm()
	if qMap["uid"]!=""{
		cnt,_ := o.QueryTable(new(KeyWord)).Filter("keyword__startswith",qMap["searchKey"]).Filter("uid",qMap["uid"]).Count() // SELECT COUNT(*) FROM USER
		count = cnt
	}else{
		cnt,_ := o.QueryTable(new(KeyWord)).Filter("keyword__startswith",qMap["searchKey"]).Count() // SELECT COUNT(*) FROM USER
		count = cnt
	}
	//cnt,_ := o.QueryTable("resume").Count()
	//var count[] Resume
	//o.Raw("select count(*) from resume where 1=1 and name like %?%",searchKey).QueryRows(count)
	return count
}

func(this *KeyWord) ListByPage(qMap map[string]interface{})[]orm.Params{
	var maps []orm.Params
	o := orm.NewOrm()
	//qs := o.QueryTable("login_log")
	sql := "select * from key_word where 1=1"
	if qMap["uid"]!=""{
		sql = sql+ " and uid="+qMap["uid"].(string)
	}
	if qMap["searchKey"]!=""{
		sql = sql+" and keyword like '%"+qMap["searchKey"].(string)+"%'"
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



