package utils

import (
	"testing"
	"fmt"
	"encoding/base64"
	"AwesomeResume/utils"
)

func Test(t *testing.T) {
	password := "123456"
	salt := "AwesomePromotion_"
	key := "0123456789abcdef"
	result, err := utils.AesEncrypt([]byte(password+salt), []byte(key))
	if err != nil {
		panic(err)
	}
	resultStr := base64.StdEncoding.EncodeToString(result)
	fmt.Println(resultStr)
}
