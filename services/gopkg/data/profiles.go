package data

import (
	"context"

	lpg "github.com/systemaccounting/mxfactorial/services/gopkg/lambdapg"
	sqlb "github.com/systemaccounting/mxfactorial/services/gopkg/sqlbuilder"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

func GetProfileIDsByAccountList(
	db lpg.SQLDB,
	sbc func() sqlb.SelectSQLBuilder,
	accounts []interface{}) ([]*types.AccountProfileID, error) {

	// create sql builder from constructor
	sb := sbc()

	// create sql to get profile ids of debitors
	// and creditors referenced in transaction items
	profileIDSQL, profileIDArgs := sb.SelectProfileIDsByAccount(
		accounts,
	)

	// get account profile ids with account names
	profileIDRows, err := db.Query(
		context.Background(),
		profileIDSQL,
		profileIDArgs...,
	)
	if err != nil {
		return nil, err
	}

	// unmarshal account profile ids with account names
	profileIDList, err := lpg.UnmarshalAccountProfileIDs(profileIDRows)
	if err != nil {
		return nil, err
	}

	return profileIDList, nil
}
