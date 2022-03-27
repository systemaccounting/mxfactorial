package tools

import (
	"encoding/json"
	"log"

	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

// Marshal returns a IntraTransaction as json string
func MarshalIntraTransaction(t *types.IntraTransaction) (string, error) {
	j, err := json.Marshal(t)
	if err != nil {
		return "", err
	}

	js := string(j)

	// ## debugging only
	transInd, err := json.MarshalIndent(t, "", "  ")
	if err != nil {
		log.Print(err)
		return "", err
	}
	indented := string(transInd)
	_ = indented
	// log.Print(indented)
	// ###

	return js, nil
}

// Marshal returns a IntraTransaction as json string
func MarshalIntraTransactions(t *types.IntraTransactions) (string, error) {
	j, err := json.Marshal(t)
	if err != nil {
		return "", err
	}

	js := string(j)

	// ## debugging only
	transInd, err := json.MarshalIndent(t, "", "  ")
	if err != nil {
		log.Print(err)
		return "", err
	}
	indented := string(transInd)
	_ = indented
	// log.Print(indented)
	// ###

	return js, nil
}
