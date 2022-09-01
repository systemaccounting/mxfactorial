package service

import (
	"github.com/systemaccounting/mxfactorial/services/gopkg/logger"
	"github.com/systemaccounting/mxfactorial/services/gopkg/postgres"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

type IWebsocketService interface {
	AddAccountToCurrentWebsocket(string, string) error
	AddWebsocketConnection(int64, string) error
	DeleteWebsocketConnection(string) error
	DeleteWebsocketsByConnectionIDs(connectionIDs []string) error
	GetWebsocketsByAccounts([]string) (types.Websockets, error)
}

type WebsocketService struct {
	*postgres.WebsocketsModel
}

// account names not added to websocket connection records on connect
// workaround: each lambda updates current websocket record with account value

// adding account values to all connection id records supports notification
// broadcast (send notifications to all connection ids owned by current account)

func (w WebsocketService) AddAccountToCurrentWebsocket(accountName, connectionID string) error {

	err := w.WebsocketsModel.UpdateWebsocketByConnID(accountName, connectionID)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	return nil
}

func (w WebsocketService) AddWebsocketConnection(epochCreatedAt int64, connectionID string) error {

	err := w.WebsocketsModel.InsertWebsocketConnection(epochCreatedAt, connectionID)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	return nil
}

func (w WebsocketService) DeleteWebsocketConnection(connectionID string) error {

	err := w.WebsocketsModel.DeleteWebsocketConnection(connectionID)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	return nil
}

func (w WebsocketService) GetWebsocketsByAccounts(accounts []string) (types.Websockets, error) {

	err := w.WebsocketsModel.SelectWebsocketsByAccounts(accounts)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	return w.Websockets, nil
}

func (w WebsocketService) DeleteWebsocketsByConnectionIDs(connectionIDs []string) error {

	err := w.WebsocketsModel.DeleteWebsocketsByConnectionIDs(connectionIDs)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	return nil
}

func NewWebsocketService(db *postgres.DB) *WebsocketService {
	return &WebsocketService{
		WebsocketsModel: postgres.NewWebsocketsModel(db),
	}
}
