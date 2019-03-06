package controllers

import (
	"github.com/astaxie/beego"
	"AwesomePromotion/models"
	"AwesomePromotion/utils"
	"AwesomePromotion/enums"
	"AwesomePromotion/models/other"
)

type SettingController struct {
	beego.Controller
}

func(this *SettingController) Reset() {
	obj := new(models.Template)
	sesion,_ := utils.GlobalSessions.SessionStart(this.Ctx.ResponseWriter, this.Ctx.Request)
	uType := sesion.Get("type").(int)
	if uType<=2{
		this.jsonResult(200,-1,"当前用户无权限！",nil)
	}
	if obj.Reset4k2t()>0{
		this.jsonResult(200,1,"关键词重置成功！",nil)
	}else{
		this.jsonResult(200,-1,"关键词重置失败,请稍后再试！",nil)
	}
}

func(this *SettingController) Setting() {
	obj := new(models.Setting)
	obj.Key = this.GetString("key")
	obj.Value = this.GetString("value")
	obj.Id,_ = this.GetInt64("id")

	sesion,_ := utils.GlobalSessions.SessionStart(this.Ctx.ResponseWriter, this.Ctx.Request)
	uType := sesion.Get("type").(int)
	if uType<=2{
		this.jsonResult(200,-1,"当前用户无权限！",nil)
	}
	if obj.Key==""||obj.Value==""{
		this.jsonResult(200,-1,"参数错误！",nil)
	}
	if obj.Update(obj){
		this.jsonResult(200,1,"系统设置成功！",nil)
	}else{
		this.jsonResult(200,-1,"系统设置失败,请稍后再试！",nil)
	}
}

func (c *SettingController) jsonResult(status enums.JsonResultCode,code int, msg string, data interface{}) {
	r := &other.JsonResult{status, code, msg,data}
	c.Data["json"] = r
	c.ServeJSON()
	c.StopRun()
	return
}
