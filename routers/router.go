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
	beego.Router("/login_", &controllers.LoginController{},"*:LoginIndex")
	beego.Router("/validate", &controllers.LoginController{},"*:Validate")
	beego.Router("/timeout", &controllers.LoginController{},"*:Timeout")
	beego.Router("/forget", &controllers.LoginController{},"POST:Forget")
	beego.Router("/reset", &controllers.LoginController{},"POST:Reset")

	//模板页相关
	beego.Router("/template", &controllers.IndexController{},"*:Redirect")
	beego.Router("/main/template/add",&controllers.TemplateController{},"POST:Add")
	beego.Router("/main/template/update",&controllers.TemplateController{},"POST:Update")

	//后台管理相关
    beego.Router("/main",&controllers.MainController{},"*:Index")
	beego.Router("/main/redirect",&controllers.MainController{},"*:Redirect")
	//图片上传
	beego.Router("/main/upload4pic",&controllers.MainController{},"POST:Upload4Pic")

	//用户信息管理
	beego.Router("/main/user/listOne",&controllers.UserController{},"POST:ListOne")
	beego.Router("/main/user/update",&controllers.UserController{},"POST:Update")
	beego.Router("/main/user/validate4mail",&controllers.UserController{},"POST:Validate4mail")
	beego.Router("/main/user/mail4confirm",&controllers.UserController{},"POST:Mail4confirm")
	//定制错误页
	beego.ErrorController(&controllers.ErrorController{})

}
