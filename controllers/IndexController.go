package controllers

import (
	"github.com/astaxie/beego"
	"fmt"
	"AwesomePromotion/enums"
	"AwesomePromotion/models/other"
	"net/smtp"
	"strings"
	"AwesomePromotion/models"
)

type IndexController struct {
	beego.Controller
}

func (this *IndexController) Index() {

	//跳转页面及传递数据
	this.Data["Website"] = "beego.me"
	this.Data["Email"] = "astaxie@gmail.com"
	//设置token
	token := this.XSRFToken()
	this.Data["_xsrf"] = token
	fmt.Println(token)
	//获取最近添加的100条模板数据
	template := new(models.Template)
	this.Data["dataList"] = template.SelectLatest()
	this.TplName = "index.html"

}

func (this *IndexController) Data4Refresh() {

	lastId := this.GetString("id")
	if lastId==""{
		this.jsonResult(200,-1,"参数错误",nil)
	}
	template := new(models.Template)
	qMap := make(map[string]interface{})
	bMap := make(map[string]interface{})

	qMap["lastId"] = lastId
	dataList := template.List4Refresh(qMap)
	if
	bMap["data"] = dataList

	this.Data["json"] = bMap
	this.ServeJSON()
	this.StopRun()

}

func (this *IndexController) Data4Page() {

	pageNow,err01 := this.GetInt("pageNow")
	pageSize,err02 := this.GetInt("pageSize")
	key := this.GetString("key")
	if err01!=nil||err02!=nil{
		this.jsonResult(200,-1,"参数错误",nil)
	}
	template := new(models.Template)
	qMap := make(map[string]interface{})
	bMap := make(map[string]interface{})

	pageNow = (pageNow-1)*pageSize
	qMap["pageNow"] = pageNow
	qMap["pageSize"] = pageSize
	qMap["searchKey"] = key

	recordsTotal:= template.Count4Index(qMap)
	dataList := template.List4Page(qMap)
	bMap["data"] = dataList
	bMap["recordsTotal"] = recordsTotal

	this.Data["json"] = bMap
	this.ServeJSON()
	this.StopRun()

}



func (this *IndexController) Mail4Index()  {
	contact := this.GetString("contact")
	message := this.GetString("message")
	go SendMail(contact,message)
	this.jsonResult(200,1,"提交成功",nil)
}

func SendMail(parameter1,parameter2 string)  {
	auth := smtp.PlainAuth("", "zooori@foxmail.com", "fznqfopwakggibej", "smtp.qq.com")
	to := []string{"imsprojo2fan@foxmail.com"}

	nickname := "AwesomePromotion"
	user := "zooori@foxmail.com"
	subject := "AwesomePromotion-首页留言"
	content_type := "Content-Type: text/plain; charset=UTF-8"

	body := "联系方式:"+parameter1+"\r\n留言信息:"+parameter2
	msg := []byte("To: " + strings.Join(to, ",") + "\r\nFrom: " + nickname +
		"<" + user + ">\r\nSubject: " + subject + "\r\n" + content_type + "\r\n\r\n" + body)
	err := smtp.SendMail("smtp.qq.com:25", auth, user, to, msg)
	if err != nil {
		fmt.Printf("send mail error: %v", err)
	}
}

func (c *IndexController) jsonResult(status enums.JsonResultCode,code int, msg string, data interface{}) {
	r := &other.JsonResult{status, code, msg,data}
	c.Data["json"] = r
	c.ServeJSON()
	c.StopRun()
	return
}


