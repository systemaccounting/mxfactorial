package tools

import "github.com/systemaccounting/mxfactorial/services/gopkg/types"

func IsCustomIDUnique(i types.ID, l []interface{}) bool {
	for _, v := range l {
		if i == v.(types.ID) {
			return false
		}
	}
	return true
}
