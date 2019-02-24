package models

import (
	"time"
	"github.com/astaxie/beego/orm"
	"fmt"
)

type User struct {
	Id       int64
	Actived  int
	Type     int
	Account  string
	Email    string
	Password string
	Remark string
	Updated time.Time `orm:"auto_now_add;type(datetime)"`
	Created time.Time `orm:"auto_now_add;type(datetime)"`
}

func (a *User) UserTBName() string {
	return UserTBName()
}

func(this *User) Insert(user *User) int {

	o := orm.NewOrm()

	if user.Account !=""{
		o.Read(user,"account")
		if user.Id>0{
			return -2//账号已存在
		}
	}

	if user.Email !=""{
		o.Read(user,"email")
		if user.Id>0{
			return -2//邮箱已存在
		}
	}

	_,err := o.Insert(user)
	if err!=nil{
		return -1
	}else{
		return 1
	}
}

func(this *User) Update(User *User) bool {

	o := orm.NewOrm()
	_,err := o.Update(User)
	if err!=nil{
		return false
	}else{
		return true
	}
}

func(this *User) Delete(User *User) bool {

	o := orm.NewOrm()
	_,err := o.Delete(User)
	if err!=nil{
		return false
	}else{
		return true
	}
}

func(this *User) Read(User *User) bool {

	o := orm.NewOrm()
	err := o.Read(User)
	if err == orm.ErrNoRows {
		fmt.Println("查询不到")
		return false
	} else if err == orm.ErrMissPK {
		fmt.Println("找不到主键")
		return false
	} else {
		fmt.Println(User.Id)
		return true
	}
}

func(this *User) ReadOrCreate(user User) int64  {
	o := orm.NewOrm()
	// 三个返回参数依次为：是否新创建的，对象 Id 值，错误
	var ID int64
	if created, id, err := o.ReadOrCreate(&user, "uid"); err == nil {
		ID = id
		if created {
			fmt.Println("New Insert an object. Id:", id)
		} else {
			fmt.Println("Get an object. Id:", id)
		}
	}
	return ID
}

func(this *User) Login(user *User) bool{

	o := orm.NewOrm()
	err := o.Raw("SELECT * FROM user WHERE account = ? OR email = ?", user.Account,user.Account).QueryRow(&user)

	if err!=nil{
		return false
	}
	return true
}

func(this *User) ReadByMail(user *User) int {

	o := orm.NewOrm()
	o.Read(user,"email","actived")
	//o.Raw("SELECT id,is_activate  FROM user WHERE email = ? AND is_activate=1", user.Mail).QueryRow(&user)
	if user.Email==""{
		return -1
	}
	// 三个返回参数依次为：是否新创建的，对象 Id 值，错误
	/*if created, _, err := o.ReadOrCreate(user, "mail"); err == nil {
		if created {
			return 0
		} else {
			return 1
		}
	}*/
	return 1

}

func(this *User) Activate(user *User) bool {

	o := orm.NewOrm()
	err := o.Raw("UPDATE user SET activated = 1 WHERE id = ?", user.Id)
	if err!=nil{
		return false
	}else{
		return true
	}
}

func(this *User) UpdatePassword(user *User) bool {

	o := orm.NewOrm()
	_, err := o.Raw("UPDATE user SET password = ? WHERE id =?", user.Password,user.Id).Exec()
	if err == nil {
		return true
	}
	return false
}

func(this *User) UpdateActived(user *User) bool {

	o := orm.NewOrm()
	_, err := o.Update(user,"email","actived")
	if err == nil {
		return true
	}
	return false
}

func(this *User) UpdatePasswordByEmail(user *User) bool {

	o := orm.NewOrm()
	_,err := o.Raw("update user set password=? where email=?",user.Password,user.Email).Exec()
	if err!=nil{
		return false
	}
	return true
}

func(this *User) SelectByCol(user *User,col string) {
	o := orm.NewOrm()
	o.Read(user,col)
}

func(this *User) SelectByEmail(email string,dataList *[]User) {
	o := orm.NewOrm()
	o.Raw("select * from user where email=?",email).QueryRows(dataList)
}

