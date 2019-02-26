package controllers

import (
	"github.com/astaxie/beego"
	"fmt"
	"AwesomePromotion/enums"
	"AwesomePromotion/models/other"
	"net/smtp"
	"strings"
	"AwesomePromotion/models"
	"bytes"
	"github.com/PuerkitoBio/goquery"
	"io/ioutil"
	"github.com/astaxie/beego/orm"
	"os"
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

	c.TplName = "index.html"

}

func (this *IndexController) Redirect() {
	//session,_ := utils.GlobalSessions.SessionStart(this.Ctx.ResponseWriter, this.Ctx.Request)
	//utils.Global#fffis.Get("host")

	url := this.GetString("v")
	//查询resume表获取模板url
	template:= new(models.Template)
	template.Url = url
	template.SelectByCol(template,"url")
	if template.Id==0{
		this.TplName = "tip/404.html"
		return
	}
	//获取关键字及外链
	var dataList []orm.Params
	dataList = template.SelectByKey(template)
	fmt.Println(dataList)
	var kArr []string
	var urlArr []string
	var ks string
	var description string
	for _,item := range dataList{
		keyword := item["keyword"]
		ks = ks+"|"+keyword.(string)
		description = (item["description"]).(string)
		kArr = append(kArr,keyword.(string))
		urlArr = append(urlArr,(item["url"]).(string))
	}

	if len(dataList)==0{
		//设置token
		this.Data["_xsrf"] = this.XSRFToken()
		htmlName:= "template/"+url+".html"
		this.TplName = htmlName
		return
	}

	//读取本地html文档并解析，动态更改节点信息
	filePath := "./views/template/"+template.Url+".html"
	b, err := ioutil.ReadFile(filePath)
	if err != nil {
		fmt.Print(err)
	}
	htmlDoc, _ :=goquery.NewDocumentFromReader(bytes.NewReader(b))
	//动态渲染关键字及链接等
	//更改title
	//htmlDoc.Find("title").AppendHtml(ks)

	metaArr := htmlDoc.Find("meta")
	for i := 0; i < metaArr.Length(); i++ {
		name, _ := metaArr.Eq(i).Attr("name")
		content, _ := metaArr.Eq(i).Attr("content")
		if name=="keywords"{//添加keywords
			metaArr.Eq(i).SetAttr("content",content+","+ks)
		}
		if name=="description"{
			metaArr.Eq(i).SetAttr("content",description)
		}
	}

	if len(kArr)==1{
		keyWord := kArr[0]
		//更改h1标题
		htmlDoc.Find("h1").Each(func(i int, selection *goquery.Selection) {
			selection.ReplaceWithHtml("<h1 style='color:#fff;background:#5e6cd9'>"+keyWord+"</h1>")
		})
		//更改h2标题
		htmlDoc.Find("h2").Each(func(i int, selection *goquery.Selection) {
			selection.ReplaceWithHtml("<h2 style='color:#fff;background:#d719c7'>"+keyWord+"</h2>")
		})
		//更改h3标题
		htmlDoc.Find("h3").Each(func(i int, selection *goquery.Selection) {
			selection.ReplaceWithHtml("<h3 style='color:#fff;background:#54d17b'>"+keyWord+"</h3>")
		})
	}else if len(kArr)==2{
		keyWord01 := kArr[0]
		keyWord02 := kArr[1]
		//更改h1标题
		htmlDoc.Find("h1").Each(func(i int, selection *goquery.Selection) {
			selection.ReplaceWithHtml("<h1 style='#fff:#fff;background:#5e6cd9'>"+keyWord01+"</h1>")
		})
		//更改h2标题
		htmlDoc.Find("h2").Each(func(i int, selection *goquery.Selection) {
			selection.ReplaceWithHtml("<h2 style='color:#fff;background:#f17be7'>"+keyWord02+"</h2>")
		})
		//更改h3标题
		htmlDoc.Find("h3").Each(func(i int, selection *goquery.Selection) {
			selection.ReplaceWithHtml("<h3 style='color:#fff;background:#2e5853'>"+keyWord01+"</h3>")
		})
	}else{
		keyWord01 := kArr[0]
		keyWord02 := kArr[1]
		keyWord03 := kArr[2]
		//更改h1标题
		htmlDoc.Find("h1").Each(func(i int, selection *goquery.Selection) {
			selection.ReplaceWithHtml("<h1 style='color:#fff;background:#5e6cd9'>"+keyWord01+"</h1>")
		})
		//更改h2标题
		htmlDoc.Find("h2").Each(func(i int, selection *goquery.Selection) {
			selection.ReplaceWithHtml("<h2 style='color:#fff;background:#d719c7'>"+keyWord02+"</h2>")
		})
		//更改h3标题
		htmlDoc.Find("h3").Each(func(i int, selection *goquery.Selection) {
			selection.ReplaceWithHtml("<h3 style='color:#fff;background:#54d17b'>"+keyWord03+"</h3>")
		})
	}

	hrefArr := htmlDoc.Find("a")
	for i := 0; i < hrefArr.Length(); i++ {
		selection := hrefArr.Eq(i)
		if len(urlArr)==1{
			selection.SetAttr("href",urlArr[0])
		}else if len(urlArr)==2{
			num := i%2
			if num==0{
				selection.SetAttr("href",urlArr[0])
			}else {
				selection.SetAttr("href",urlArr[1])
			}
		}else{
			num := i%3
			if num==0{
				selection.SetAttr("href",urlArr[0])
			}else if num==1{
				selection.SetAttr("href",urlArr[1])
			}else{
				selection.SetAttr("href",urlArr[2])
			}
		}
		selection.SetAttr("target","_blank")
	}

	content,_:=htmlDoc.Html()
	os.Remove(filePath)
	WriteFile(filePath,content)
	//设置token
	this.Data["_xsrf"] = this.XSRFToken()
	htmlName:= "template/"+url+".html"
	this.TplName = htmlName

}

func (this *IndexController) KeyWord() {

	key := this.GetString("key")
	if key==""{
		this.jsonResult(200,0,"参数错误!",nil)
	}
	//var dataList []map[string]interface{}
	//查询resume表获取模板url
	template:= new(models.Template)
	template.Url = key
	dataList := template.SelectByKey(template)
	this.jsonResult(200,0,"查询成功!",dataList)

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


