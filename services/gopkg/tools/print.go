package tools

import (
	"encoding/json"
	"fmt"

	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

func PrintTransaction(t *types.Transaction) {
	j, err := json.MarshalIndent(t, "", "  ")
	if err != nil {
		panic(err)
	}
	fmt.Println(string(j))
}
