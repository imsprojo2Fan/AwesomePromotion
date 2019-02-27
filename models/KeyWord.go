package models

import (
	"github.com/astaxie/beego/orm"
	"time"
	"fmt"
)


type KeyWord struct {
	Id       int64
	Uid  	 int64
	Type	 string
	Keyword  string
	Description string
	Url      string
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
	_,err := o.Update(KeyWord,"keyword","description","type","url","remark","updated")
	if err!=nil{
		return false
	}else{
		return true
	}
}

func(this *KeyWord) Delete(KeyWord *KeyWord) bool {

	o := orm.NewOrm()
	_,err := o.Delete(KeyWord)
	if err!=nil{
		return false
	}else{
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

func(this *KeyWord) SelectByKey(model *KeyWord)[]orm.Params {
	var maps []orm.Params
	o := orm.NewOrm()
	o.Raw("SELECT k.keyword,k.description,k.url FROM template t,keyword k,keyword2template kt WHERE t.id = kt.tid and  kt.kid=k.id and t.url=?", model.Url).Values(&maps)
	return maps
}


