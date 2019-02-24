package controllers

import (
	"github.com/astaxie/beego"
	"AwesomePromotion/utils"
	"AwesomePromotion/models"
	"AwesomePromotion/enums"
	"AwesomePromotion/models/other"
	"encoding/base64"
	"time"
	"net/smtp"
	"strings"
	"fmt"
)

type UserController struct {
	beego.Controller
}

func(this *UserController) ListOne() {
	sesion,_ := utils.GlobalSessions.SessionStart(this.Ctx.ResponseWriter, this.Ctx.Request)
	uid := sesion.Get("id").(int64)
	user := new(models.User)
	user.Id = uid
	user.Read(user)
	this.jsonResult(200,1,"用户信息",user)
}

func(this *UserController) Add()  {
	user := new(models.User)
	user.Email = this.GetString("email")
	user.SelectByCol(user,"account")//查询账号是否已被用
	if user.Id>0{
		this.jsonResult(200,-1,"当前账号不可用",nil)
	}
	id :=user.ReadOrCreate(*user)//插入用户表记录
	if id>0{
		this.jsonResult(200,0,"插入成功",nil)
	}else{
		this.jsonResult(200,-1,"插入失败",nil)
	}
}

func(this *UserController) Update() {

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

func(this *UserController) Validate4mail() {
	sesion,_ := utils.GlobalSessions.SessionStart(this.Ctx.ResponseWriter, this.Ctx.Request)

	var dataList []models.User
	email := this.GetString("email")
	if email==""{
		this.jsonResult(200,-1,"参数错误",nil)
	}
	user := new(models.User)
	user.Email = email
	user.SelectByEmail(email,&dataList)
	for _,item:= range dataList{
		if item.Actived==1{
			this.jsonResult(200,-1,"当前邮箱不可用!",nil)
			break
		}
	}
	code := utils.RandomCode()
	sesion.Set("email",email)
	sesion.Set("code",code)
	go SendMail4Validate(email,code)
	this.jsonResult(200,1,"验证码已发送",nil)
}

func(this *UserController) Mail4confirm() {
	sesion,_ := utils.GlobalSessions.SessionStart(this.Ctx.ResponseWriter, this.Ctx.Request)
	var changeMail string
	type_ := this.GetString("type")
	if type_=="edit"{
		changeMail = this.GetString("changeMail")
		if changeMail==""{
			this.jsonResult(200,-1,"更换的邮箱不能为空!",nil)
		}
		localMail := sesion.Get("email")
		if localMail!=changeMail{
			this.jsonResult(200,-1,"邮箱不一致!",nil)
		}
	}

	code := this.GetString("code")
	if code==""{
		this.jsonResult(200,-1,"验证码不能为空!",nil)
	}

	localCode := sesion.Get("code")
	if code!=localCode{
		this.jsonResult(200,-1,"验证码错误!",nil)
	}
	user := new(models.User)
	user.Id = sesion.Get("id").(int64)
	user.Email = sesion.Get("email").(string)
	user.Actived = 1
	if !user.UpdateActived(user){
		this.jsonResult(200,-1,"数据库更新失败,请稍后再试!",nil)
	}
	this.jsonResult(200,1,"邮箱验证成功",nil)
}

func SendMail4Validate(mail,code string)  {
	auth := smtp.PlainAuth("", "zooori@foxmail.com", "fznqfopwakggibej", "smtp.qq.com")
	to := []string{mail}

	nickname := "AwesomePromotion"
	user := "zooori@foxmail.com"
	subject := "用户操作-验证邮箱"
	content_type := "Content-Type: text/plain; charset=UTF-8"
	body := "【验证码】:"+code+"\r\n 十分钟内有效!请尽快验证邮箱"

	msg := []byte("To: " + strings.Join(to, ",") + "\r\nFrom: " + nickname +
		"<" + user + ">\r\nSubject: " + subject + "\r\n" + content_type + "\r\n\r\n" + body)
	err := smtp.SendMail("smtp.qq.com:25", auth, user, to, msg)
	if err != nil {
		fmt.Printf("send mail error: %v", err)
	}
}

func (c *UserController) jsonResult(status enums.JsonResultCode,code int, msg string, data interface{}) {
	r := &other.JsonResult{status, code, msg,data}
	c.Data["json"] = r
	c.ServeJSON()
	c.StopRun()
	return
}