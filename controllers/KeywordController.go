package controllers

import (
	"github.com/astaxie/beego"
	"AwesomePromotion/utils"
	"AwesomePromotion/models"
	"AwesomePromotion/enums"
	"AwesomePromotion/models/other"
	"time"
)

type KeywordController struct {
	beego.Controller
}

func(this *KeywordController) Add()  {
	sesion,_ := utils.GlobalSessions.SessionStart(this.Ctx.ResponseWriter, this.Ctx.Request)
	uid := sesion.Get("id").(int64)
	obj := new(models.KeyWord)
	obj.Uid = uid
	obj.Keyword = this.GetString("keyword")
	obj.Description = this.GetString("description")
	obj.Url = this.GetString("url")
	obj.Type = this.GetString("type")
	obj.Remark = this.GetString("remark")
	if obj.Keyword==""||obj.Description==""{
		this.jsonResult(200,-1,"参数错误！",nil)
	}
	obj.SelectByCol(obj,"keyword")//查询关键词是否已被用
	if obj.Id>0{
		this.jsonResult(200,-1,"当前关键词已存在！",nil)
	}
	id :=obj.ReadOrCreate(*obj)//插入表记录
	if id>0{
		this.jsonResult(200,0,"插入成功",nil)
	}else{
		this.jsonResult(200,-1,"插入失败",nil)
	}
}

func(this *KeywordController) Update() {
	obj := new(models.KeyWord)
	obj.Id,_ = this.GetInt64("id")
	obj.Keyword = this.GetString("keyword")
	obj.Description = this.GetString("description")
	obj.Url = this.GetString("url")
	obj.Type = this.GetString("type")
	obj.Remark = this.GetString("remark")
	if obj.Id==0|| obj.Keyword==""||obj.Description==""{
		this.jsonResult(200,-1,"参数错误！",nil)
	}
	obj.Updated = time.Now()
	if obj.Update(obj){
		this.jsonResult(200,1,"更新数据成功！",nil)
	}else{
		this.jsonResult(200,-1,"更新数据失败,请稍后再试！",nil)
	}
}

func(this *KeywordController) Delete() {
	obj := new(models.KeyWord)
	obj.Id,_ = this.GetInt64("id")

	if obj.Id==0{
		this.jsonResult(200,-1,"参数错误！",nil)
	}
	if obj.Delete(obj){
		this.jsonResult(200,1,"删除数据成功！",nil)
	}else{
		this.jsonResult(200,-1,"删除数据失败,请稍后再试！",nil)
	}
}


func (c *KeywordController) jsonResult(status enums.JsonResultCode,code int, msg string, data interface{}) {
	r := &other.JsonResult{status, code, msg,data}
	c.Data["json"] = r
	c.ServeJSON()
	c.StopRun()
	return
}