package websocket

import (
	"context"
	"errors"
	"log"

	lpg "github.com/systemaccounting/mxfactorial/services/gopkg/lambdapg"
	sqlb "github.com/systemaccounting/mxfactorial/services/gopkg/sqlbuilder"
)

// account names not added to websocket connection records on connect
// workaround: each lambda updates current websocket record with account value

// adding account values to all connection id records supports notification
// broadcast (send notifications to all connection ids owned by current account)

func AddAccountToCurrentWebsocket(
	db lpg.SQLDB,
	ubc func() sqlb.UpdateSQLBuilder,
	accountName,
	connectionID string,
) error {

	// create sql builder from constructor
	ub := ubc()

	// create update websocket by id sql
	updWss, updWssArgs := ub.UpdateWebsocketByConnIDSQL(
		accountName,
		connectionID,
	)

	// update current websocket
	_, err := db.Exec(
		context.Background(),
		updWss,
		updWssArgs...,
	)
	if err != nil {
		var errMsg string = "delete websockets err: %v"
		log.Printf(errMsg, err)
		return errors.New(errMsg)
	}
	return nil
}
