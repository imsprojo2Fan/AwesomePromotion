package models

import (
	"github.com/astaxie/beego"
	"github.com/astaxie/beego/orm"
)

//初始化
func init() {
	orm.RegisterModel(new(User))
	orm.RegisterModel(new(Template))
	orm.RegisterModel(new(KeyWord))
	orm.RegisterModel(new(Ad))
	orm.RegisterModel(new(Setting))
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

//获取对应的表名称
func KeyWordTBName() string {
	return TableName("key_word")
}

//获取对应的表名称
func AdTBName() string {
	return TableName("ad")
}

//获取对应的表名称
func SettingTBName() string {
	return TableName("setting")
}