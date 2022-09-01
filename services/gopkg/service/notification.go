package service

import (
	"github.com/systemaccounting/mxfactorial/services/gopkg/aws/sns"
	"github.com/systemaccounting/mxfactorial/services/gopkg/postgres"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

type ITransactionNotificationService interface {
	InsertTransactionApprovalNotifications(types.TransactionNotifications) (types.IDs, error)
	DeleteTransactionApprovalNotifications(types.ID) error
	DeleteTransNotificationsByIDs(types.IDs) error
	Publish(types.IDs, *string, *string) error
	NotifyTransactionRoleApprovers(types.Approvals, *types.Transaction, *string) error
	GetTransactionNotificationsByIDs(types.IDs) (types.TransactionNotifications, error)
	GetTransNotifsByAccount(string, int) (types.TransactionNotifications, error)
}

type TransactionNotificationService struct {
	*postgres.TransactionNotificationModel
	*sns.SNS
}

func (tn TransactionNotificationService) InsertTransactionApprovalNotifications(n types.TransactionNotifications) (types.IDs, error) {

	err := tn.TransactionNotificationModel.InsertTransactionApprovalNotifications(n)
	if err != nil {
		return nil, err
	}

	return tn.TransactionNotifications.ListIDs(), nil
}

func (tn TransactionNotificationService) DeleteTransactionApprovalNotifications(trID types.ID) error {

	err := tn.TransactionNotificationModel.DeleteTransactionApprovalNotifications(trID)
	if err != nil {
		return err
	}

	return nil
}

func (tn TransactionNotificationService) DeleteTransNotificationsByIDs(notifIDs types.IDs) error {

	err := tn.TransactionNotificationModel.DeleteTransNotificationsByIDs(notifIDs)
	if err != nil {
		return err
	}

	return nil
}

func (tn TransactionNotificationService) Publish(notifIDs types.IDs, serviceName *string, topicArn *string) error {

	err := tn.SNS.Publish(notifIDs, serviceName, topicArn)
	if err != nil {
		return err
	}

	return nil
}

func (tn TransactionNotificationService) NotifyTransactionRoleApprovers(
	approvals types.Approvals,
	transaction *types.Transaction,
	topicArn *string,
) error {

	err := tn.TransactionNotificationModel.DeleteTransactionApprovalNotifications(*transaction.ID)
	if err != nil {
		return err
	}

	err = tn.CreateNotificationsPerRoleApprover(approvals, transaction)
	if err != nil {
		return err
	}

	notifIDs, err := tn.InsertTransactionApprovalNotifications(
		tn.TransactionNotifications,
	)

	err = tn.Publish(
		notifIDs,
		&sns.TRANSACT_SERVICE_NAME,
		topicArn,
	)
	if err != nil {
		return err
	}

	return nil
}

func (tn TransactionNotificationService) GetTransactionNotificationsByIDs(notifIDs types.IDs) (types.TransactionNotifications, error) {

	err := tn.TransactionNotificationModel.SelectTransNotifsByIDs(notifIDs)
	if err != nil {
		return nil, err
	}

	return tn.TransactionNotifications, nil
}

func (tn TransactionNotificationService) GetTransNotifsByAccount(accountName string, recordLimit int) (types.TransactionNotifications, error) {

	err := tn.TransactionNotificationModel.SelectTransNotifsByAccount(accountName, recordLimit)
	if err != nil {
		return nil, err
	}

	return tn.TransactionNotifications, nil
}

func NewTransactionNotificationService(db *postgres.DB) *TransactionNotificationService {
	return &TransactionNotificationService{
		TransactionNotificationModel: postgres.NewTransactionNotificationModel(db),
		SNS:                          sns.NewSNS(),
	}
}
