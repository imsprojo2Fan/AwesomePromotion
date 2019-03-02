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

func (c *IndexController) Index() {

	//跳转页面及传递数据
	c.Data["Website"] = "beego.me"
	c.Data["Email"] = "astaxie@gmail.com"

	//设置token
	token := c.XSRFToken()
	c.Data["_xsrf"] = token
	fmt.Println(token)
	//获取最近添加的100条模板数据
	template := new(models.Template)
	c.Data["dataList"] = template.SelectLatest()
	c.TplName = "index.html"

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


