package controllers

import (
	"github.com/astaxie/beego"
	"AwesomePromotion/utils"
	"AwesomePromotion/models"
	"AwesomePromotion/enums"
	"AwesomePromotion/models/other"
	"time"
	"strconv"
	"github.com/astaxie/beego/orm"
)

type AdController struct {
	beego.Controller
}
//var GlobalDraw int
func(this *AdController) List()  {
	sesion,_ := utils.GlobalSessions.SessionStart(this.Ctx.ResponseWriter, this.Ctx.Request)
	uid := sesion.Get("id").(int64)
	uids := strconv.FormatInt(uid, 10)
	uType := sesion.Get("type").(int)
	//{"recordsFiltered":1,"data":[{"password":"9f593c69b108dedf0f56e4907d46eff1","phone":"13922305912","created":"2018-08-06 10:06:36","nickname":"范tel青年","id":6,"type":3,"updated":"2018-09-26 17:46:15","account":"admin","email":"imsprojo2fan@gmail.com"}],"draw":17,"recordsTotal":1}
	GlobalDraw++
	qMap := make(map[string]interface{})
	var dataList []orm.Params
	backMap := make(map[string]interface{})

	pageNow,err2 := this.GetInt64("start")
	pageSize,err := this.GetInt64("length")

	if err!=nil || err2!=nil{
		pageNow = 1
		pageSize = 20
		//this.jsonResult(http.StatusOK,-1, "rows or page should be number", nil)
	}
	sortType := this.GetString("order[0][dir]")
	sortCol := "created"
	searchKey := this.GetString("search[value]")

	qMap["pageNow"] = pageNow
	qMap["pageSize"] = pageSize
	qMap["sortCol"] = sortCol
	qMap["sortType"] = sortType
	qMap["searchKey"] = searchKey
	if uType>2{//账号类型小于3的用户可查看所有信息
		qMap["uid"] = uids
	}

	obj := new(models.Ad)

	//获取总记录数
	records := obj.Count(qMap)
	backMap["draw"] = GlobalDraw
	backMap["recordsTotal"] = records
	backMap["recordsFiltered"] = records
	dataList = obj.ListByPage(qMap)
	backMap["data"] = dataList
	if len(dataList)==0{
		backMap["data"] = make([]int, 0)
	}

	this.Data["json"] = backMap
	this.ServeJSON()
	this.StopRun()
	//this.jsonResult(200,0,"查询成功！",backMap)
}

func (this *AdController) All() {

	obj:= new(models.Ad)
	dataList := obj.All()
	this.jsonResult(200,0,"查询成功!",dataList)

}

func(this *AdController) Add()  {
	sesion,_ := utils.GlobalSessions.SessionStart(this.Ctx.ResponseWriter, this.Ctx.Request)
	uid := sesion.Get("id").(int64)
	obj := new(models.Ad)
	obj.Uid = uid
	obj.Keyword = this.GetString("keyword")
	obj.Description = this.GetString("description")
	obj.Url = utils.RandomString(16)
	obj.Title = this.GetString("title")
	obj.Remark = this.GetString("remark")
	if obj.Title==""{
		this.jsonResult(200,-1,"页面标题不能为空！",nil)
	}
	id :=obj.ReadOrCreate(obj)//插入表记录
	if id>0{
		this.jsonResult(200,1,"插入成功",nil)
	}else{
		this.jsonResult(200,-1,"插入失败",nil)
	}
}

func(this *AdController) Update() {
	obj := new(models.Ad)
	obj.Id,_ = this.GetInt64("id")
	obj.Keyword = this.GetString("keyword")
	obj.Description = this.GetString("description")
	obj.Title = this.GetString("title")
	obj.Remark = this.GetString("remark")
	if obj.Id==0{
		this.jsonResult(200,-1,"id不能为空！",nil)
	}
	if obj.Title==""{
		this.jsonResult(200,-1,"页面标题不能为空！",nil)
	}
	obj.Updated = time.Now()
	if obj.Update(obj){
		this.jsonResult(200,1,"更新数据成功！",nil)
	}else{
		this.jsonResult(200,-1,"更新数据失败,请稍后再试！",nil)
	}
}

func(this *AdController) Delete() {
	obj := new(models.Ad)
	obj.Id,_ = this.GetInt64("id")

	if obj.Id==0{
		this.jsonResult(200,-1,"id不能为空！",nil)
	}
	if obj.Delete(obj){
		this.jsonResult(200,1,"删除数据成功！",nil)
	}else{
		this.jsonResult(200,-1,"删除数据失败,请稍后再试！",nil)
	}
}

func(this *AdController) Redirect()  {
	url := this.GetString("v")
	//查询resume表获取模板url
	obj:= new(models.Ad)
	obj.Url = url
	obj.SelectByCol(obj,"url")
	if obj.Id==0{
		this.TplName = "tip/404.html"
		return
	}
	//设置token
	this.Data["_xsrf"] = this.XSRFToken()
	htmlName:= "ad/"+url+".html"
	this.TplName = htmlName
}

func (c *AdController) jsonResult(status enums.JsonResultCode,code int, msg string, data interface{}) {
	r := &other.JsonResult{status, code, msg,data}
	c.Data["json"] = r
	c.ServeJSON()
	c.StopRun()
	return
}