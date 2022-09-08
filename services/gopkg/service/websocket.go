package service

import (
	"fmt"
	"log"

	"github.com/systemaccounting/mxfactorial/services/gopkg/aws/apigwma"
	"github.com/systemaccounting/mxfactorial/services/gopkg/logger"
	"github.com/systemaccounting/mxfactorial/services/gopkg/postgres"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

type IWebsocketsModel interface {
	UpdateWebsocketByConnID(accountName, connectionID string) error
	InsertWebsocketConnection(epochCreatedAt int64, connectionID string) error
	DeleteWebsocketConnection(connectionID string) error
	DeleteWebsocketsByConnectionIDs(connectionIDs []string) error
	SelectWebsocketsByAccounts(accounts []string) (types.Websockets, error)
}

type IApiGatewayMgmtAPIService interface {
	PostToConnection(*string, any) error
}

type WebsocketService struct {
	WebsocketStorageService
	WebsocketNotificationService
}

type IWebsocketStorageService interface {
	AddAccountToCurrentWebsocket(accountName, connectionID string) error
	AddWebsocketConnection(epochCreatedAt int64, connectionID string) error
	DeleteWebsocketConnection(connectionID string) error
	GetWebsocketsByAccounts(accounts []string) (types.Websockets, error)
	DeleteWebsocketsByConnectionIDs(connectionIDs []string) error
}

type WebsocketStorageService struct {
	m IWebsocketsModel
}

type IWebsocketNotificationService interface {
	SendNotificationToWebsocket(connectionID *string, v any) error
}

type WebsocketNotificationService struct {
	a IApiGatewayMgmtAPIService
}

// account names not added to websocket connection records on connect
// workaround: each lambda updates current websocket record with account value

// adding account values to all connection id records supports notification
// broadcast (send notifications to all connection ids owned by current account)

func (w WebsocketStorageService) AddAccountToCurrentWebsocket(accountName, connectionID string) error {

	err := w.m.UpdateWebsocketByConnID(accountName, connectionID)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	return nil
}

func (w WebsocketStorageService) AddWebsocketConnection(epochCreatedAt int64, connectionID string) error {

	err := w.m.InsertWebsocketConnection(epochCreatedAt, connectionID)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	return nil
}

func (w WebsocketStorageService) DeleteWebsocketConnection(connectionID string) error {

	err := w.m.DeleteWebsocketConnection(connectionID)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	return nil
}

func (w WebsocketStorageService) GetWebsocketsByAccounts(accounts []string) (types.Websockets, error) {

	ws, err := w.m.SelectWebsocketsByAccounts(accounts)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	return ws, nil
}

func (w WebsocketStorageService) DeleteWebsocketsByConnectionIDs(connectionIDs []string) error {

	err := w.m.DeleteWebsocketsByConnectionIDs(connectionIDs)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	return nil
}

func (w WebsocketNotificationService) SendNotificationToWebsocket(connectionID *string, v any) error {

	err := w.a.PostToConnection(connectionID, v)
	if err != nil {

		if err.Error() == apigwma.ErrCodeGoneException {

			// return error without logging on GoneException
			return err

		} else {

			// log and return other error
			logger.Log(logger.Trace(), err)
			return err
		}
	}

	return nil
}

func (w WebsocketService) SendNotificationOrDeleteStaleWebsocket(connectionID *string, v any) error {

	err := w.SendNotificationToWebsocket(connectionID, v)
	if err != nil {
		if err.Error() == apigwma.ErrCodeGoneException {

			// delete websocket connection id on GoneException
			err := w.m.DeleteWebsocketConnection(*connectionID)
			if err != nil {

				// log failure to delete websocket connection id
				logger.Log(logger.Trace(), fmt.Errorf("DeleteWebsocketConnection: %v", err))
				return err
			}

			// log deleted stale websocket
			log.Printf("deleted stale websococket %v", connectionID)

			return nil

		} else {

			// log and return other error
			logger.Log(logger.Trace(), err)
			return err
		}

	}

	return nil
}

func (w WebsocketService) BroadcastNotificationsToWebsockets(
	transNotifs types.TransactionNotifications,
) ([]string, error) {

	// list accounts receiving notifications
	wssAccounts := getAccountsFromNotifications(transNotifs)

	// list websockets for accounts
	websockets, err := w.GetWebsocketsByAccounts(wssAccounts)
	if err != nil {
		logger.Log(logger.Trace(), err)
	}

	// attach websockets for accounts receiving notifications
	recipientsWithWebsockets := attachWebsocketsPerRecipient(
		transNotifs,
		websockets,
	)

	// list stale websockets to delete later in single query
	var staleWebsocketsToDelete []string

	for _, r := range recipientsWithWebsockets {
		for _, ws := range r.Websockets {

			// create notification payload
			payload := &types.PendingNotifications{
				Pending: []*types.Message{
					{
						NotificationID: r.Notification.ID,
						Message:        *r.Notification.Message,
					},
				},
			}

			// send notification to websocket
			err = w.SendNotificationToWebsocket(ws.ConnectionID, payload)
			if err != nil {

				// test for GoneException
				if err.Error() == apigwma.ErrCodeGoneException {

					// list unique stale websocket to delete
					if isStringUnique(*ws.ConnectionID, staleWebsocketsToDelete) {
						staleWebsocketsToDelete = append(staleWebsocketsToDelete, *ws.ConnectionID)
					}

				} else {

					// just log while continuing to
					// send notifications, dont exit
					logger.Log(logger.Trace(), err)
				}

			}
		}
	}

	return staleWebsocketsToDelete, nil
}

func (w WebsocketService) BroadcastNotificationsOrDeleteStaleWebsockets(
	transNotifs types.TransactionNotifications,
) error {

	staleWebsocketsToDelete, err := w.BroadcastNotificationsToWebsockets(transNotifs)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	// delete stale websockets
	if len(staleWebsocketsToDelete) > 0 {
		err = w.m.DeleteWebsocketsByConnectionIDs(staleWebsocketsToDelete)
		if err != nil {
			logger.Log(logger.Trace(), err)
			return err
		}
	}

	return nil

}

func isStringUnique(s string, l []string) bool {
	for _, v := range l {
		if v == s {
			return false
		}
	}
	return true
}

func getAccountsFromNotifications(transNotifs types.TransactionNotifications) []string {
	var wssAccounts []string
	for _, v := range transNotifs {
		wssAccounts = append(wssAccounts, *v.AccountName)
	}
	return wssAccounts
}

func attachWebsocketsPerRecipient(
	transNotifs types.TransactionNotifications,
	websockets types.Websockets,
) []*types.NotificationAndWebsockets {

	var recipientsWithWebsockets []*types.NotificationAndWebsockets
	for _, y := range transNotifs {

		wss := &types.NotificationAndWebsockets{
			Notification: y,
		}

		for _, z := range websockets {
			if *z.AccountName == *y.AccountName {
				wss.Websockets = append(wss.Websockets, z)
			}
		}

		recipientsWithWebsockets = append(recipientsWithWebsockets, wss)
	}

	return recipientsWithWebsockets
}

func NewWebsocketStorageService(db SQLDB) *WebsocketStorageService {
	return &WebsocketStorageService{
		m: postgres.NewWebsocketsModel(db),
	}
}

func NewWebsocketNotificationService(apiGWConnectionsURI, awsRegion *string) *WebsocketNotificationService {
	return &WebsocketNotificationService{
		a: apigwma.NewApiGatewayMgmtAPIService(apiGWConnectionsURI, awsRegion),
	}
}

func NewWebsocketService(db SQLDB, apiGWConnectionsURI, awsRegion *string) *WebsocketService {
	return &WebsocketService{
		WebsocketStorageService{
			m: postgres.NewWebsocketsModel(db),
		},
		WebsocketNotificationService{
			a: apigwma.NewApiGatewayMgmtAPIService(apiGWConnectionsURI, awsRegion),
		},
	}
}
