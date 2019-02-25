package models

import (
	"github.com/astaxie/beego"
	"github.com/astaxie/beego/orm"
)

//初始化
func init() {
	orm.RegisterModel(new(User))
	orm.RegisterModel(new(Template))
}

//下面是统一的表名管理
func TableName(name string) string {
	prefix := beego.AppConfig.String("db_dt_prefix")
	return prefix + name
}

//获取对应的表名称
func UserTBName() string {
	return TableName("user")
}

//获取对应的表名称
func TemplateTBName() string {
	return TableName("template")
}

