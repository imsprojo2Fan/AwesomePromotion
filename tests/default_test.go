package test

import (
	"testing"
	"encoding/base64"
	"fmt"
	"AwesomePromotion/utils"
)

func init() {

}


// TestBeego is a sample to run an endpoint test
func TestBeego(t *testing.T) {

}

func test01()  {
	password := "123456"
	salt := "AwesomePromotion_"
	key := "0123456789abcdef"
	result, err := utils.AesEncrypt([]byte(password+salt), []byte(key))
	if err != nil {
		panic(err)
	}
	resultStr := base64.StdEncoding.EncodeToString(result)
	fmt.Print(resultStr)
}



