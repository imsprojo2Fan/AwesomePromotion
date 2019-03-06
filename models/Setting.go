package models

import (
	"github.com/astaxie/beego/orm"
	"fmt"
)

type Setting struct {
	Id       int64
	Key  	 string
	Value    string
}

func (this *Setting) SettingTBName() string {
	return SettingTBName()
}

func(this *Setting) Insert(model *Setting) int {

	o := orm.NewOrm()

	_,err := o.Insert(model)
	if err!=nil{
		fmt.Println(err)
		return -1
	}else{
		return 1
	}
}

func(this *Setting) Update(Setting *Setting) bool {

	o := orm.NewOrm()
	_,err := o.Update(Setting)
	if err!=nil{
		fmt.Println(err)
		return false
	}else{
		return true
	}

}

func(this *Setting) Delete(Setting *Setting) bool {

	o := orm.NewOrm()
	_,err := o.Delete(Setting)
	if err!=nil{
		fmt.Println(err)
		return false
	}else{
		return true
	}
}

func(this *Setting) Read(Setting *Setting) bool {

	o := orm.NewOrm()
	err := o.Read(Setting)
	if err == orm.ErrNoRows {
		fmt.Println(err)
		fmt.Println("查询不到")
		return false
	} else if err == orm.ErrMissPK {
		fmt.Println("找不到主键")
		return false
	} else {
		fmt.Println(Setting.Id)
		return true
	}
}

func(this *Setting) SelectByCol(model *Setting,col string) {
	o := orm.NewOrm()
	o.Read(model,col)
}

func(this *Setting) All()[]orm.Params {
	var maps []orm.Params
	o := orm.NewOrm()
	o.Raw("SELECT * from setting").Values(&maps)
	return maps
}
