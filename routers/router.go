package routers

import (
	"AwesomePromotion/controllers"
	"github.com/astaxie/beego"
)

func init() {
	//网站首页相关
	beego.Router("/", &controllers.IndexController{},"*:Index")
	beego.Router("/index/mail4index", &controllers.IndexController{},"*:Mail4Index")
	//登录相关
	beego.Router("/login", &controllers.LoginController{},"*:LoginIndex")
	beego.Router("/validate", &controllers.LoginController{},"*:Validate")
	beego.Router("/timeout", &controllers.LoginController{},"*:Timeout")
	beego.Router("/forget", &controllers.LoginController{},"POST:Forget")
	beego.Router("/reset", &controllers.LoginController{},"POST:Reset")

	//模板页相关
	beego.Router("/template", &controllers.TemplateController{},"*:Redirect")
	beego.Router("/main/template/add",&controllers.TemplateController{},"POST:Add")
	beego.Router("/main/template/delete",&controllers.TemplateController{},"POST:Delete")
	beego.Router("/main/template/list",&controllers.TemplateController{},"POST:List")
	beego.Router("/main/template/update",&controllers.TemplateController{},"POST:Update")

	//关键字相关
	beego.Router("/main/keyword/add",&controllers.KeywordController{},"POST:Add")
	beego.Router("/main/keyword/update",&controllers.KeywordController{},"POST:Update")
	beego.Router("/main/keyword/delete",&controllers.KeywordController{},"POST:Delete")
	beego.Router("/main/keyword/list",&controllers.KeywordController{},"POST:List")
	beego.Router("/main/keyword/all", &controllers.KeywordController{},"POST:All")

	//广告页相关
	beego.Router("/ad",&controllers.AdController{},"*:Redirect")
	beego.Router("/main/ad/add",&controllers.AdController{},"POST:Add")
	beego.Router("/main/ad/update",&controllers.AdController{},"POST:Update")
	beego.Router("/main/ad/delete",&controllers.AdController{},"POST:Delete")
	beego.Router("/main/ad/list",&controllers.AdController{},"POST:List")
	beego.Router("/main/ad/ads", &controllers.AdController{},"POST:All")

	//后台管理相关
    beego.Router("/main",&controllers.MainController{},"*:Index")
	beego.Router("/main/redirect",&controllers.MainController{},"*:Redirect")
	//图片上传
	beego.Router("/main/upload4pic",&controllers.MainController{},"POST:Upload4Pic")

	//用户信息管理
	beego.Router("/main/user/list",&controllers.UserController{},"POST:List")
	beego.Router("/main/user/add",&controllers.UserController{},"POST:Add")
	beego.Router("/main/user/update",&controllers.UserController{},"POST:Update")
	beego.Router("/main/user/delete",&controllers.UserController{},"POST:Delete")
	beego.Router("/main/user/listOne",&controllers.UserController{},"POST:ListOne")
	beego.Router("/main/user/validate4mail",&controllers.UserController{},"POST:Validate4mail")
	beego.Router("/main/user/mail4confirm",&controllers.UserController{},"POST:Mail4confirm")
	//定制错误页
	beego.ErrorController(&controllers.ErrorController{})

}
