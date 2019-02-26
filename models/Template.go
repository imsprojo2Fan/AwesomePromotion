package models

import (
	"github.com/astaxie/beego/orm"
	"time"
	"fmt"
)


type Template struct {
	Id       int64
	Uid  	 int64
	Url      string
	OUrl  	 string
	Label    string
	Domain   string
	MUrl	 string
	Content	 string
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
	_,err := o.Update(Template)
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

func(this *Template) SelectByKey(model *Template)[]orm.ParamsList {
	var lists []orm.ParamsList
	o := orm.NewOrm()
	o.Raw("SELECT k.keyword,k.url FROM template t,keyword k,keyword2template kt WHERE t.id = kt.tid and  kt.kid=k.id and t.url=?", model.Url).ValuesList(&lists)
	return lists
}



