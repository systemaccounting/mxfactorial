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

func IsStringUnique(s string, l []interface{}) bool {
	for _, v := range l {
		if v.(string) == s {
			return false
		}
	}
	return true
}

func IsIntUnique(i types.ID, l []interface{}) bool {
	for _, v := range l {
		if v.(types.ID) == i {
			return false
		}
	}
	return true
}
