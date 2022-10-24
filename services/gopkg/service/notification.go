package service

import (
	"encoding/json"
	"fmt"

	awssns "github.com/aws/aws-sdk-go/service/sns"
	"github.com/jackc/pgtype"
	"github.com/systemaccounting/mxfactorial/services/gopkg/aws/sns"
	"github.com/systemaccounting/mxfactorial/services/gopkg/logger"
	"github.com/systemaccounting/mxfactorial/services/gopkg/postgres"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

type ITransactionNotificationModel interface {
	InsertTransactionApprovalNotifications(types.TransactionNotifications) (types.IDs, error)
	SelectTransNotifsByIDs(types.IDs) (types.TransactionNotifications, error)
	SelectTransNotifsByAccount(string, int) (types.TransactionNotifications, error)
	DeleteTransactionApprovalNotifications(types.ID) error
	DeleteTransNotificationsByIDs(types.IDs) error
}

type ISNS interface {
	PublishMessage(*awssns.PublishInput) (*awssns.PublishOutput, error)
}

type TransactionNotificationService struct {
	m    ITransactionNotificationModel
	ISNS *sns.SNS
}

func (tn TransactionNotificationService) InsertTransactionApprovalNotifications(n types.TransactionNotifications) (types.IDs, error) {

	notifIDs, err := tn.m.InsertTransactionApprovalNotifications(n)
	if err != nil {
		return nil, err
	}

	return notifIDs, nil
}

func (tn TransactionNotificationService) DeleteTransactionApprovalNotifications(trID types.ID) error {

	err := tn.m.DeleteTransactionApprovalNotifications(trID)
	if err != nil {
		return err
	}

	return nil
}

func (tn TransactionNotificationService) DeleteTransNotificationsByIDs(notifIDs types.IDs) error {

	err := tn.m.DeleteTransNotificationsByIDs(notifIDs)
	if err != nil {
		return err
	}

	return nil
}

func (tn TransactionNotificationService) Publish(notifIDs types.IDs, serviceName *string, topicArn *string) error {

	err := tn.ISNS.Publish(notifIDs, serviceName, topicArn)
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

	err := tn.m.DeleteTransactionApprovalNotifications(*transaction.ID)
	if err != nil {
		return err
	}

	notifs, err := tn.CreateNotificationsPerRoleApprover(approvals, transaction)
	if err != nil {
		return err
	}

	notifIDs, err := tn.InsertTransactionApprovalNotifications(notifs)
	if err != nil {
		return err
	}

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

	notifs, err := tn.m.SelectTransNotifsByIDs(notifIDs)
	if err != nil {
		return nil, err
	}

	return notifs, nil
}

func (tn TransactionNotificationService) GetTransNotifsByAccount(accountName string, recordLimit int) (types.TransactionNotifications, error) {

	notifs, err := tn.m.SelectTransNotifsByAccount(accountName, recordLimit)
	if err != nil {
		return nil, err
	}

	return notifs, nil
}

func (tn *TransactionNotificationService) CreateNotificationsPerRoleApprover(
	approvals types.Approvals,
	transaction *types.Transaction,
) (types.TransactionNotifications, error) {

	// dedupe role approvers to send only 1 notification
	// per approver role: someone shopping at their own store
	// receives 1 debitor and 1 creditor approval
	var uniqueRoleApprovers types.Approvals
	for _, v := range approvals {
		if isRoleApproverUnique(*v, uniqueRoleApprovers) {
			uniqueRoleApprovers = append(uniqueRoleApprovers, v)
		}
	}

	// add transaction as notification message
	pgMsg, err := json.Marshal(transaction)
	if err != nil {
		return nil, fmt.Errorf("%s: %v", logger.Trace(), err)
	}

	jsonb := new(pgtype.JSONB)
	jsonb.Set(pgMsg)

	// create transaction_notification per role approver
	var notifs types.TransactionNotifications
	for _, v := range uniqueRoleApprovers {

		n := &types.TransactionNotification{
			TransactionID: v.TransactionID,
			AccountName:   v.AccountName,
			AccountRole:   v.AccountRole,
			Message:       jsonb,
		}

		notifs = append(notifs, n)
	}

	return notifs, nil
}

func isRoleApproverUnique(a types.Approval, l types.Approvals) bool {
	for _, v := range l {
		if *v.AccountName == *a.AccountName && *v.AccountRole == *a.AccountRole {
			return false
		}
	}
	return true
}

func NewTransactionNotificationService(db SQLDB) *TransactionNotificationService {
	return &TransactionNotificationService{
		m:    postgres.NewTransactionNotificationModel(db),
		ISNS: sns.NewSNS(),
	}
}
