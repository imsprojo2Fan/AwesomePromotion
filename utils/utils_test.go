package utils

import (
	"testing"
	"fmt"
	"math/rand"
	"time"
)

func Test(t *testing.T) {
	//密码加密
	/*password := "123456"
	salt := "AwesomePromotion_"
	key := "0123456789abcdef"
	result, err := utils.AesEncrypt([]byte(password+salt), []byte(key))
	if err != nil {
		panic(err)
	}
	resultStr := base64.StdEncoding.EncodeToString(result)
	fmt.Println(resultStr)

	//密码解密
	key2 := []byte("0123456789abcdef")
	result2, err := AesEncrypt([]byte("pbhANIi1ZWv3ex9Jdet7nrs4ZkT6/Fz9WDDoTOE0IyU="), key2)
	if err != nil {
		panic(err)
	}
	fmt.Println(base64.StdEncoding.EncodeToString(result2))
	origData, err := AesDecrypt(result2, key2)
	if err != nil {
		panic(err)
	}
	fmt.Println(string(origData))*/

	for a := 0; a < 10; a++ {
		time.Sleep(100)
		rnd := rand.New(rand.NewSource(time.Now().UnixNano()))
		vcode := fmt.Sprintf("%06v", rnd.Int31n(1000000))
		fmt.Println(vcode)
	}
}
