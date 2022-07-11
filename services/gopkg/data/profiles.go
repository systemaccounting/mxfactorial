package data

import (
	"context"

	lpg "github.com/systemaccounting/mxfactorial/services/gopkg/lambdapg"
	"github.com/systemaccounting/mxfactorial/services/gopkg/sqls"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

func GetProfileIDsByAccountList(
	db lpg.SQLDB,
	u lpg.PGUnmarshaler,
	sbc func() sqls.SelectSQLBuilder,
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
	profileIDList, err := u.UnmarshalAccountProfileIDs(profileIDRows)
	if err != nil {
		return nil, err
	}

	return profileIDList, nil
}
