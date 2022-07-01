package testdata

import (
	"encoding/json"
	"fmt"
	"io/ioutil"

	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

func GetTestTransaction(path string) types.Transaction {
	f, err := ioutil.ReadFile(path)
	if err != nil {
		msgErr := fmt.Errorf("read fail %s: %v", path, err)
		panic(msgErr)
	}
	var i types.IntraTransaction
	if err := json.Unmarshal(f, &i); err != nil {
		msgErr := fmt.Errorf("unmarshal fail: %v", err)
		panic(msgErr)
	}
	return *i.Transaction
}
