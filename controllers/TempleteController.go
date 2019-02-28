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
	"github.com/astaxie/beego/orm"
	"io/ioutil"
)

type TemplateController struct {
	beego.Controller
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

var lHost string
func(this *TemplateController) Add()  {
	lHost = "http://"+this.Ctx.Request.Host
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
	content := (bMap["content"]).(string)

	id :=template.ReadOrCreate(*template)//插入记录
	if id>0{
		//生成html文件
		htmlName := "./views/template/"+template.Url+".html"
		if WriteFile(htmlName,content){
			this.jsonResult(200,-1,"创建文件失败,请稍后再试!",nil)
		}
		this.jsonResult(200,0,"插入成功!",template.Url)
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
		if err != nil {
			log.Fatal(err)
		}
		//添加蜘蛛抓取规则
		htmlDoc.Find("title").AfterHtml("<meta name=\"Robots\" contect=\"INDEX,FOLLOW\">")
		//禁止百度快照
		htmlDoc.Find("title").AfterHtml("<meta name=\"baiduspider\" content=\"noarchive\">")
		//添加域名获取样式等
		htmlDoc.Find("title").AfterHtml("<base href=\"http://"+u.Host+"\"/>")
		//添加token
		htmlDoc.Find("div").First().AfterHtml("<input type=\"hidden\" value=\"{{ ._xsrf}}\" id=\"token\"/>")
		//添加定制容器
		htmlDoc.Find("div").First().AfterHtml("<div id=\"myWrap\"></div>")
		//添加jquery
		htmlDoc.Find("body").AppendHtml("<script src=\"https://cdn.bootcss.com/jquery/3.3.1/jquery.min.js\"></script>")
		//添加定制js
		htmlDoc.Find("body").AppendHtml("<script src=\""+lHost+"/static/js/design.js\"></script>")
		bMap["content"],_ = htmlDoc.Html()//获取文档内容

	})
	// 对visit的线程数做限制，visit可以同时运行多个
	c.Limit(&colly.LimitRule{
		Parallelism: 2,
		//Delay:      3 * time.Second,
	})
	c.Visit(rUrl)

	return bMap
}


func WriteFile(fileName, content string)(flag bool)  {
	/***************************** 第一种方式: 使用 io.WriteString 写入文件 ***********************************************/
	var f *os.File
	var err error
	if utils.CheckFileIsExist(fileName) { //如果文件存在
		f, err = os.OpenFile(fileName,os.O_WRONLY|os.O_TRUNC|os.O_CREATE, os.ModePerm) //打开文件
		fmt.Println("文件存在")
	} else {
		f, err = os.Create(fileName) //创建文件
		fmt.Println("文件不存在")
	}
	flag = utils.Check(err)
	n, err := io.WriteString(f, content) //写入文件(字符串)
	flag = utils.Check(err)
	fmt.Printf("写入 %d 个字节n", n)
	return flag
}
