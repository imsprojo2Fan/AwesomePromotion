package controllers

import (
	"github.com/astaxie/beego"
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
	"strings"
	"strconv"
	"time"
	"github.com/piex/transcode"
)

type TemplateController struct {
	beego.Controller
}

func (this *TemplateController) Redirect() {
	//session,_ := utils.GlobalSessions.SessionStart(this.Ctx.ResponseWriter, this.Ctx.Request)
	//utils.Global#fffis.Get("host")

	lHost = "http://"+this.Ctx.Request.Host

	url := this.GetString("v")
	//查询resume表获取模板url
	template:= new(models.Template)
	template.Url = url
	template.SelectByCol(template,"url")
	if template.Id==0{
		this.TplName = "tip/404.html"
		return
	}
	//更新views
	template.UpdateViews(url)

	//获取关键字及外链
	var dataList []orm.Params
	dataList = template.SelectByKey(template)
	fmt.Println(dataList)
	var kArr []string
	var urlArr []string
	var ks4title string
	var ks string
	var description string
	for _,item := range dataList{
		keyword := item["keyword"]
		ks = ks+","+keyword.(string)
		ks4title = ks4title+" | "+keyword.(string)
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
	//文件不存在则创建
	if !utils.CheckFileIsExist(filePath){
		WriteFile(filePath,template.Content)
	}
	b, err := ioutil.ReadFile(filePath)
	if err != nil {
		fmt.Print(err)
	}
	htmlDoc, _ :=goquery.NewDocumentFromReader(bytes.NewReader(b))
	if template.Redirect==1{//页面直接跳转
		htmlDoc.Find("head").AppendHtml("<script>window.open('"+template.RedirectPage+"',\"_self\");</script>")
		htmlDoc.Find("body").Empty()
	}else{//正常渲染页面
		//动态渲染关键字及链接等
		//更改title
		var tempTitle = template.Title
		ks4title = ks4title+" | "+tempTitle
		nameRune := []rune(ks4title)
		ks4title = string(nameRune[2:])
		htmlDoc.Find("title").ReplaceWith(ks4title)
		htmlDoc.Find("meta").Last().AfterHtml("<title>"+ks4title+"</title>")

		metaArr := htmlDoc.Find("meta")
		for i := 0; i < metaArr.Length(); i++ {
			name, _ := metaArr.Eq(i).Attr("name")
			content, _ := metaArr.Eq(i).Attr("content")
			if name=="keywords"{//添加keywords
				if strings.Index(content,ks)<1{
					metaArr.Eq(i).SetAttr("content",content+ks)
				}
			}
			if name=="description"{
				var tempDes = template.Description
				metaArr.Eq(i).SetAttr("content",tempDes+","+description)
			}
		}

		//解决oschina网页错误
		htmlDoc.Find(".question").Each(func(i int, selection *goquery.Selection) {
			selection.Remove()
		})
		//移除google广告
		htmlDoc.Find("script").Each(func(i int, selection *goquery.Selection) {
			src,_:=selection.Attr("src")
			if strings.Contains(src,"google"){
				selection.Remove()
			}
		})
		//兼容全集网
		htmlDoc.Find("a:contains(留言建议)").Each(func(i int, selection *goquery.Selection) {
			selection.Remove()
		})
		if template.RedirectPage!=""{
			if htmlDoc.Find("#myFrame").Length()==0{
				//添加iframe
				htmlDoc.Find("body").BeforeHtml("<iframe id=\"myFrame\"  width=\"100%\" height=\"550px\" src=\""+template.RedirectPage+"\" frameborder=\"0\" ></iframe>")
			}else{
				htmlDoc.Find("#myFrame").SetAttr("src",template.RedirectPage)
			}
		}

		//添加自定义样式
		htmlDoc.Find("#wrapCss").Remove()
		htmlDoc.Find("head").AppendHtml("<link id='wrapCss' href=\"http://promotion.zooori.cn/static/css/myWrap.css\" rel=\"stylesheet\">")
		//添加定制js
		htmlDoc.Find("#designJs").Remove()
		htmlDoc.Find("body").AppendHtml("<script id='designJs' src=\"http://promotion.zooori.cn/static/js/design.js\"></script>")
		//添加token
		htmlDoc.Find("div").First().AfterHtml("<input type=\"hidden\" id=\"token\"/>")
		//添加定制容器01
		htmlDoc.Find("#myWrap01").Remove()
		htmlDoc.Find("div").First().AfterHtml("<div id=\"myWrap01\"></div>")
		//添加定制容器02
		htmlDoc.Find("#myWrap02").Remove()
		htmlDoc.Find("div").First().AfterHtml("<div id=\"myWrap02\"></div>")
		//添加定制容器03
		htmlDoc.Find("#myWrap03").Remove()
		htmlDoc.Find("div").First().AfterHtml("<div id=\"myWrap03\"></div>")
		//添加链接容器
		htmlDoc.Find("#linkWrap").Remove()
		htmlDoc.Find("body").AppendHtml("<div id='linkWrap'><p>友情链接:</p><div><span id=\"myLink01\"></span><span id=\"myLink02\"></span><span id=\"myLink03\"></span></div></div>")

		if len(kArr)==1{
			keyWord := kArr[0]
			//更改h1标题
			htmlDoc.Find("h1").Each(func(i int, selection *goquery.Selection) {
				selection.ReplaceWithHtml("<h4 style='color:#fff;background:#5e6cd9;padding:8px;'>"+keyWord+"</h4>")
			})
			//更改h2标题
			htmlDoc.Find("h2").Each(func(i int, selection *goquery.Selection) {
				selection.ReplaceWithHtml("<h2 style='color:#fff;background:#c3d719;padding:8px;'>"+keyWord+"</h2>")
			})
			//更改h3标题
			htmlDoc.Find("h3").Each(func(i int, selection *goquery.Selection) {
				selection.ReplaceWithHtml("<h3 style='color:#fff;background:#54d17b;padding:8px;'>"+keyWord+"</h3>")
			})
			//添加固定栏位替换
			htmlDoc.Find("#myWrap01").ReplaceWithHtml("<div id='myWrap01'><a href='"+urlArr[0]+"' target='_blank'>"+keyWord+"</a></div>")
			//添加友情链接
			htmlDoc.Find("#myLink01").ReplaceWithHtml("<span id='myLink01' style=\"margin-left:28px\"><a href='"+urlArr[0]+"' target='_blank'>"+keyWord+"</a></span>")
		}else if len(kArr)==2{
			keyWord01 := kArr[0]
			keyWord02 := kArr[1]
			//更改h1标题
			htmlDoc.Find("h1").Each(func(i int, selection *goquery.Selection) {
				selection.ReplaceWithHtml("<h4 style='#fff:#fff;background:#5e6cd9;padding:8px;'>"+keyWord01+"</h4>")
			})
			//更改h2标题
			htmlDoc.Find("h2").Each(func(i int, selection *goquery.Selection) {
				selection.ReplaceWithHtml("<h2 style='color:#fff;background:#c3d719;padding:8px;'>"+keyWord02+"</h2>")
			})
			//更改h3标题
			htmlDoc.Find("h3").Each(func(i int, selection *goquery.Selection) {
				selection.ReplaceWithHtml("<h3 style='color:#fff;background:#2e5853;padding:8px;'>"+keyWord01+"</h3>")
			})

			//添加固定栏位替换
			htmlDoc.Find("#myWrap01").ReplaceWithHtml("<div id='myWrap01'><a href='"+urlArr[0]+"' target='_blank'>"+keyWord01+"</a></div>")
			htmlDoc.Find("#myWrap02").ReplaceWithHtml("<div id='myWrap02'><a href='"+urlArr[1]+"' target='_blank'>"+keyWord02+"</a></div>")
			//添加友情链接
			htmlDoc.Find("#myLink01").ReplaceWithHtml("<span id='myLink01'><a href='"+urlArr[0]+"' target='_blank'>"+keyWord01+"</a></span>")
			htmlDoc.Find("#myLink02").ReplaceWithHtml("<span id='myLink02'><a href='"+urlArr[1]+"' target='_blank'>"+keyWord02+"</a></span>")

		}else{
			keyWord01 := kArr[0]
			keyWord02 := kArr[1]
			keyWord03 := kArr[2]
			//更改h1标题
			h1Arr :=htmlDoc.Find("h4")
			if h1Arr.Length()<3{
				//htmlDoc.Find("#myWrap01").ReplaceWithHtml("<div id='myWrap01' style='position:fixed;z-index:9999;left:3%;top:25%;padding:8px;color:#fff;background:#5e6cd9;font-size:30px;'>"+keyWord01+"</div>")
			}else{
				htmlDoc.Find("h4").Each(func(i int, selection *goquery.Selection) {
					selection.ReplaceWithHtml("<h4 style='color:#fff;background:#5e6cd9;padding:8px;'>"+keyWord01+"</h4>")
				})
			}
			//更改h2标题
			h2Arr :=htmlDoc.Find("h2")
			if h2Arr.Length()<3{
				//htmlDoc.Find("#myWrap02").ReplaceWithHtml("<div id='myWrap02' style='position:fixed;z-index:9999;left:3%;top:50%;padding:8px;color:#fff;background:#c3d719;font-size:26px;'>"+keyWord02+"</div>")
			}else{
				htmlDoc.Find("h2").Each(func(i int, selection *goquery.Selection) {
					selection.ReplaceWithHtml("<h2 style='color:#fff;background:#c3d719;padding:8px;'>"+keyWord02+"</h2>")
				})
			}
			//更改h3标题
			h3Arr :=htmlDoc.Find("h3")
			if h3Arr.Length()<3{
				//htmlDoc.Find("#myWrap03").ReplaceWithHtml("<div id='myWrap03' style='position:fixed;z-index:9999;left:3%;top:75%;padding:8px;color:#fff;background:#54d17b;font-size:23px;'>"+keyWord03+"</div>")
			}else{
				htmlDoc.Find("h3").Each(func(i int, selection *goquery.Selection) {
					selection.ReplaceWithHtml("<h3 style='color:#fff;background:#54d17b;padding:8px;'>"+keyWord03+"</h3>")
				})
			}

			//添加固定栏位替换
			htmlDoc.Find("#myWrap01").ReplaceWithHtml("<div id='myWrap01'><a href='"+urlArr[0]+"' target='_blank'>"+keyWord01+"</a></div>")
			htmlDoc.Find("#myWrap02").ReplaceWithHtml("<div id='myWrap02'><a href='"+urlArr[1]+"' target='_blank'>"+keyWord02+"</a></div>")
			htmlDoc.Find("#myWrap03").ReplaceWithHtml("<div id='myWrap03'><a href='"+urlArr[2]+"' target='_blank'>"+keyWord03+"</a></div>")
			//添加友情链接
			htmlDoc.Find("#myLink01").ReplaceWithHtml("<span id='myLink01'><a href='"+urlArr[0]+"' target='_blank'>"+keyWord01+"</a></span>")
			htmlDoc.Find("#myLink02").ReplaceWithHtml("<span id='myLink02'><a href='"+urlArr[1]+"' target='_blank'>"+keyWord02+"</a></span>")
			htmlDoc.Find("#myLink03").ReplaceWithHtml("<span id='myLink03'><a href='"+urlArr[2]+"' target='_blank'>"+keyWord03+"</a></span>")

		}

		//替换a标签链接
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

		//设置token
		htmlDoc.Find("#token").SetAttr("value",this.XSRFToken())
	}

	content,_:=htmlDoc.Html()
	//os.Remove(filePath)
	WriteFile(filePath,content)
	//设置token
	//this.Data["_xsrf"] = this.XSRFToken()
	htmlName:= "template/"+url+".html"
	this.TplName = htmlName

}

func(this *TemplateController) List()  {
	sesion,_ := utils.GlobalSessions.SessionStart(this.Ctx.ResponseWriter, this.Ctx.Request)
	uid := sesion.Get("id").(int64)
	uids := strconv.FormatInt(uid, 10)
	uType := sesion.Get("type").(int)
	//{"recordsFiltered":1,"data":[{"password":"9f593c69b108dedf0f56e4907d46eff1","phone":"13922305912","created":"2018-08-06 10:06:36","nickname":"范tel青年","id":6,"type":3,"updated":"2018-09-26 17:46:15","account":"admin","email":"imsprojo2fan@gmail.com"}],"draw":17,"recordsTotal":1}
	GlobalDraw++
	qMap := make(map[string]interface{})
	var dataList []orm.Params
	var dataList02 []orm.Params
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
	if uType<=2{//账号类型小于3的用户可查看所有信息
		qMap["uid"] = uids
	}else{
		qMap["uid"] = ""
	}

	obj := new(models.Template)

	//获取总记录数
	records := obj.Count(qMap)
	backMap["draw"] = GlobalDraw
	backMap["recordsTotal"] = records
	backMap["recordsFiltered"] = records
	dataList = obj.ListByPage(qMap)
	if len(dataList)==0{
		backMap["data"] = make([]int, 0)
	}else{
		//获取模板-关键字关联信息
		dataList02 = obj.List4k2t()
		for _,item01:=range dataList{
			item01["keyword"] = make([]interface{},0)
			for _,item02 := range dataList02{
				if item02["tid"] == item01["id"]{
					var arr = item01["keyword"].([]interface{})
					arr = append(arr,item02)
					item01["keyword"] = arr
				}
			}
		}
		backMap["data"] = dataList
	}

	this.Data["json"] = backMap
	this.ServeJSON()
	this.StopRun()
	//this.jsonResult(200,0,"查询成功！",backMap)
}

var lHost string
func(this *TemplateController) Add()  {
	lHost = "http://"+this.Ctx.Request.Host
	session,_ := utils.GlobalSessions.SessionStart(this.Ctx.ResponseWriter, this.Ctx.Request)
	template := new(models.Template)
	inputUrl := this.GetString("inputUrl")
	keyword := this.GetString("keywords")

	if inputUrl==""{
		this.jsonResult(200,-1,"请输入正确的url地址！",nil)
	}
	if keyword==""{
		this.jsonResult(200,-1,"请输入关键字！",nil)
	}
	template.Uid = (session.Get("id")).(int64)
	template.MUrl = inputUrl
	template.Url = utils.RandomString(12)
	template.Host = this.GetString("domain")
	template.Redirect,_ = this.GetInt("redirect")
	template.RedirectPage = this.GetString("redirectPage")
	template.Remark = this.GetString("remark")
	keyArr := strings.Split(keyword, ",")


	template.SelectByCol(template,"murl")//查询网页模板是否已存在
	if template.Id>0{
		this.jsonResult(200,-1,"模板页已存在!",nil)
	}
	//爬虫获取网页dom信息
	bMap := Reptile(inputUrl)
	template.Title = (bMap["title"]).(string)
	template.Description = (bMap["description"]).(string)
	template.Content = (bMap["content"]).(string)
	content := (bMap["content"]).(string)
	id :=template.ReadOrCreate(*template)//插入记录
	if id>0{
		for _,item:=range keyArr{//插入关键词及模板页关联表
			qMap := make(map[string]interface{})
			qMap["kid"] = item
			qMap["tid"] = id
			template.Insert4k2t(qMap)
		}
		//生成html文件
		htmlName := "./views/template/"+template.Url+".html"
		if WriteFile(htmlName,content){
			this.jsonResult(200,-1,"创建文件失败,请稍后再试!",nil)
		}
		this.jsonResult(200,1,"提交成功!",template.Url)
	}else{
		this.jsonResult(200,-1,"数据库操作失败,请稍后再试!",nil)
	}
}

func(this *TemplateController) Update() {

	obj := new(models.Template)
	obj.Id,_ = this.GetInt64("id")
	obj.Title = this.GetString("title")
	obj.Description = this.GetString("description")
	obj.Redirect,_ = this.GetInt("redirect")
	obj.RedirectPage = this.GetString("redirectPage")
	if obj.Id==0{
		this.jsonResult(200,-1,"id不能为空！",nil)
	}
	keyword := this.GetString("keyArr")
	if keyword==""{
		this.jsonResult(200,-1,"请输入关键字！",nil)
	}
	keyArr := strings.Split(keyword, ",")
	//删除所有当前tid的数据
	if obj.Del4k2t(obj.Id)>0{
		for _,item:=range keyArr{//插入关键词及模板页关联表
			qMap := make(map[string]interface{})
			qMap["kid"] = item
			qMap["tid"] = obj.Id
			obj.Insert4k2t(qMap)
		}
	}
	//更新template信息
	obj.Updated = time.Now()
	if obj.Update(obj){
		this.jsonResult(200,1,"更新数据成功！",nil)
	}else{
		this.jsonResult(200,-1,"更新数据失败！请稍后再试",nil)
	}


}

func(this *TemplateController) Delete() {
	obj := new(models.Template)
	obj.Id,_ = this.GetInt64("id")
	if obj.Id==0{
		this.jsonResult(200,-1,"id不能为空！",nil)
	}
	//删除html文件
	obj.SelectByCol(obj,"id")
	filePath := "./views/template/"+obj.Url+".html"
	os.Remove(filePath)
	//删除keyword-template关联表数据
	obj.Del4k2t(obj.Id)
	if obj.Delete(obj){
		this.jsonResult(200,1,"删除数据成功！",nil)
	}else{
		this.jsonResult(200,-1,"删除数据失败,请稍后再试！",nil)
	}
}

func(this *TemplateController) IsRedirect() {
	obj := new(models.Template)
	obj.Url = this.GetString("key")
	if obj.Url==""{
		this.jsonResult(200,-1,"参数错误！",nil)
	}
	obj.SelectByCol(obj,"url")
	bMap := make(map[string]string)
	bMap["redirect"] = strconv.Itoa(obj.Redirect)
	bMap["redirectPage"] = obj.RedirectPage
	this.jsonResult(200,1,"查询成功！",bMap)
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
		//bMap["title"] = e.Text
	})

	// 发现并访问下一个连接
	//c.OnHTML(`.next a[href]`, func(e *colly.HTMLElement) {
	//  e.Request.Visit(e.Attr("href"))
	//})

	// extract status code
	c.OnResponse(func(resp *colly.Response) {
		fmt.Println("response received", resp.StatusCode)
		// goquery直接读取resp.Body的内容
		var htmlDoc *goquery.Document
		htmlDoc,_= goquery.NewDocumentFromReader(bytes.NewReader(resp.Body))
		temp,_ := htmlDoc.Find("head").Html()
		//encoding, _, _ := charset.DetermineEncoding(resp.Body, "")
		if !strings.Contains(temp,"utf-8")&&!strings.Contains(temp,"UTF-8"){
			res := transcode.FromByteArray(resp.Body).Decode("GBK").ToString()
			resBody := bytes.NewReader([]byte(res))
			htmlDoc,_ = goquery.NewDocumentFromReader(resBody)
		}

		metaArr := htmlDoc.Find("meta")
		for i := 0; i < metaArr.Length(); i++ {
			name, _ := metaArr.Eq(i).Attr("name")
			if name=="description"{
				bMap["description"],_ = metaArr.Eq(i).Attr("content")
			}
		}

		bMap["title"] = htmlDoc.Find("title").Text()
		//添加域名获取样式等
		htmlDoc.Find("title").AfterHtml("<base href=\"http://"+u.Host+"\"/>")
		//添加蜘蛛抓取规则
		htmlDoc.Find("title").AfterHtml("<meta name=\"Robots\" contect=\"INDEX,FOLLOW\">")
		//禁止百度快照
		htmlDoc.Find("title").AfterHtml("<meta name=\"baiduspider\" content=\"noarchive\">")
		//添加jquery
		htmlDoc.Find("body").AppendHtml("<script src=\"https://cdn.bootcss.com/jquery/3.3.1/jquery.min.js\"></script>")
		content,_ := htmlDoc.Html()//获取文档内容
		bMap["content"] = content

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
