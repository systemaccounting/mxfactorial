package tools

//go:generate mockgen -destination=./mock/tools.go -package=mock github.com/systemaccounting/mxfactorial/services/gopkg/tools Marshaler

import (
	"encoding/json"
	"fmt"

	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

// not adding receivers to services/gopkg/types yet
// so wrapping transactions
type Printable struct {
	types.Transaction
}

type Marshaler interface {
	MarshalIndent() ([]byte, error)
}

func NewPrintable(t *types.Transaction) Marshaler {
	p := Printable{*t}
	return p
}

func (p Printable) MarshalIndent() ([]byte, error) {
	return json.MarshalIndent(p, "", "  ")
}

func PrintTransaction(j Marshaler) {
	b, err := j.MarshalIndent()
	if err != nil {
		panic(err)
	}
	fmt.Println(string(b))
}
