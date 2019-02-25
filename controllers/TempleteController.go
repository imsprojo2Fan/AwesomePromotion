package controllers

import (
	"github.com/astaxie/beego"
	"encoding/base64"
	"time"
	"AwesomePromotion/utils"
	"AwesomePromotion/models"
	"AwesomePromotion/enums"
	"AwesomePromotion/models/other"
	"github.com/gocolly/colly"
	"fmt"
	"log"
	"net/url"
	"github.com/PuerkitoBio/goquery"
	"bytes"
	"os"
	"io"
)

type TemplateController struct {
	beego.Controller
}

func(this *TemplateController) Add()  {

	session,_ := utils.GlobalSessions.SessionStart(this.Ctx.ResponseWriter, this.Ctx.Request)
	template := new(models.Template)
	inputUrl := this.GetString("inputUrl")
	keyword := this.GetString("keyword")
	if inputUrl==""{
		this.jsonResult(200,-1,"请输入正确的url地址！",nil)
	}
	if keyword==""{
		this.jsonResult(200,-1,"请输入关键字！",nil)
	}
	template.Uid = (session.Get("id")).(int64)
	template.MUrl = inputUrl
	template.Url = utils.RandomString(12)
	template.Domain = this.GetString("domain")
	template.Remark = this.GetString("remark")


	template.SelectByCol(template,"murl")//查询网页模板是否已存在
	if template.Id>0{
		this.jsonResult(200,-1,"模板页已存在!",nil)
	}
	//爬虫获取网页dom信息
	bMap := Reptile(inputUrl)
	template.Label = (bMap["title"]).(string)
	template.Content = (bMap["content"]).(string)
	//生成html文件
	htmlName := "./views/template/"+template.Url+".html"
	if WriteFile(htmlName,template){
		this.jsonResult(200,-1,"创建文件失败,请稍后再试!",nil)
	}

	id :=template.ReadOrCreate(*template)//插入记录
	if id>0{
		this.jsonResult(200,0,"插入成功!",nil)
	}else{
		this.jsonResult(200,-1,"数据库操作失败,请稍后再试!",nil)
	}
}

func(this *TemplateController) Update() {

	str:= "更新用户信息成功"
	user := new(models.User)
	dbUser := new(models.User)
	dbUser.Id,_ = this.GetInt64("id")
	dbUser.Read(dbUser)//查询数据库的用户信息
	account := this.GetString("account")
	user.Account = account
	if dbUser.Account==""{//当账号为空时才查询账号是否已被使用
		user.SelectByCol(user,"account")//查询账号是否已被用
		if user.Id>0{
			this.jsonResult(200,-1,"当前账号不可用",nil)
		}
		str = "操作成功,您的密钥登录将会失效"
	}
	email := this.GetString("email")
	user.Email = email
	if dbUser.Email==""{
		user.SelectByCol(user,"email")//查询邮箱是否已被用
		if user.Id>0{
			this.jsonResult(200,-1,"当前邮箱不可用",nil)
		}
	}
	user.Id,_ = this.GetInt64("id")
	user.Password = this.GetString("password")
	if user.Password!=dbUser.Password{
		key := beego.AppConfig.String("password::key")
		salt := beego.AppConfig.String("password::salt")
		//密码加密
		result, err := utils.AesEncrypt([]byte(user.Password+salt), []byte(key))
		if err != nil {
			panic(err)
		}
		user.Password = base64.StdEncoding.EncodeToString(result)
	}
	user.Updated = time.Now()
	cteate_,_ := this.GetInt64("created")
	tm2 := time.Unix(cteate_/1000,0).Format("2006-01-02 15:04:05")
	t,_ := time.Parse("2006-01-02 15:04:05",tm2)
	user.Created = t
	if user.Update(user){
		this.jsonResult(200,1,str,nil)
	}else{
		this.jsonResult(200,-1,"更新用户信息失败,请稍后再试",nil)
	}
}


func (c *TemplateController) jsonResult(status enums.JsonResultCode,code int, msg string, data interface{}) {
	r := &other.JsonResult{status, code, msg,data}
	c.Data["json"] = r
	c.ServeJSON()
	c.StopRun()
	return
}

func Reptile(rUrl string) (map[string]interface{}) {

	bMap := make(map[string]interface{})

	u, err := url.Parse(rUrl)
	if err != nil {
		log.Fatal(err)
	}
	// NewCollector(options ...func(*Collector)) *Collector
	// 声明初始化NewCollector对象时可以指定Agent，连接递归深度，URL过滤以及domain限制等
	c := colly.NewCollector(
		//colly.AllowedDomains("news.baidu.com"),
		colly.UserAgent("Opera/9.80 (Windows NT 6.1; U; zh-cn) Presto/2.9.168 Version/11.50"))

	// 发出请求时附的回调
	c.OnRequest(func(r *colly.Request) {
		// Request头部设定
		r.Headers.Set("Host", u.Host)
		r.Headers.Set("Connection", "keep-alive")
		r.Headers.Set("Accept", "*/*")
		r.Headers.Set("Origin", "")
		r.Headers.Set("Referer", u.Host)
		r.Headers.Set("Referer", rUrl)
		r.Headers.Set("Accept-Encoding", "gzip, deflate")
		r.Headers.Set("Accept-Language", "zh-CN, zh;q=0.9")
		fmt.Println("Visiting", r.URL)
	})

	// 对响应的HTML元素处理
	c.OnHTML("title", func(e *colly.HTMLElement) {
		//e.Request.Visit(e.Attr("href"))
		//获取文档标题
		bMap["title"] = e.Text
	})

	// 发现并访问下一个连接
	//c.OnHTML(`.next a[href]`, func(e *colly.HTMLElement) {
	//  e.Request.Visit(e.Attr("href"))
	//})

	// extract status code
	c.OnResponse(func(resp *colly.Response) {
		fmt.Println("response received", resp.StatusCode)
		// goquery直接读取resp.Body的内容
		htmlDoc, err := goquery.NewDocumentFromReader(bytes.NewReader(resp.Body))
		htmlDoc.Find("head").AppendHtml("<")
		if err != nil {
			log.Fatal(err)
		}
		bMap["content"],_ = htmlDoc.Html()//获取文档内容
		fmt.Println(htmlDoc.Html())

	})
	// 对visit的线程数做限制，visit可以同时运行多个
	c.Limit(&colly.LimitRule{
		Parallelism: 2,
		//Delay:      3 * time.Second,
	})
	c.Visit(rUrl)

	return bMap
}


func WriteFile(fileName string,template *models.Template)(flag bool)  {
	/***************************** 第一种方式: 使用 io.WriteString 写入文件 ***********************************************/
	var f *os.File
	var err error
	if utils.CheckFileIsExist(fileName) { //如果文件存在
		f, err = os.OpenFile(fileName, os.O_APPEND, 0666) //打开文件
		fmt.Println("文件存在")
	} else {
		f, err = os.Create(fileName) //创建文件
		fmt.Println("文件不存在")
	}
	flag = utils.Check(err)
	n, err := io.WriteString(f, template.Content) //写入文件(字符串)
	flag = utils.Check(err)
	fmt.Printf("写入 %d 个字节n", n)
	return flag
}
