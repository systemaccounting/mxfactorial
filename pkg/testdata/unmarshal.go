package testdata

import (
	"encoding/json"
	"fmt"
	"os"

	"github.com/systemaccounting/mxfactorial/pkg/types"
)

func GetTestTransaction(path string) types.Transaction {
	f, err := os.ReadFile(path)
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

func GetTestTransactions(path string) []*types.IntraTransaction {
	f, err := os.ReadFile(path)
	if err != nil {
		msgErr := fmt.Errorf("read fail %s: %v", path, err)
		panic(msgErr)
	}
	var i []*types.IntraTransaction
	if err := json.Unmarshal(f, &i); err != nil {
		msgErr := fmt.Errorf("unmarshal fail: %v", err)
		panic(msgErr)
	}
	return i
}
