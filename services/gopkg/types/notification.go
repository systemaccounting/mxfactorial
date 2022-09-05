package types

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/jackc/pgtype"
	"github.com/jackc/pgx/v4"
	"github.com/systemaccounting/mxfactorial/services/gopkg/logger"
)

type TransactionNotification struct {
	ID            *ID           `json:"id"`
	TransactionID *ID           `json:"transaction_id"`
	AccountName   *string       `json:"account_name"`
	AccountRole   *string       `json:"account_role"`
	Message       *pgtype.JSONB `json:"message"`
	CreatedAt     *time.Time    `json:"created_at"`
}

type TransactionNotifications []*TransactionNotification

func (t *TransactionNotifications) ScanRows(rows pgx.Rows) error {
	defer rows.Close()

	for rows.Next() {

		n := new(TransactionNotification)

		err := rows.Scan(
			&n.ID,
			&n.TransactionID,
			&n.AccountName,
			&n.AccountRole,
			&n.Message,
			&n.CreatedAt,
		)

		if err != nil {
			return fmt.Errorf("TransactionNotifications scan: %v", err)
		}

		*t = append(*t, n)
	}

	err := rows.Err()
	if err != nil {
		return fmt.Errorf("TransactionNotifications rows: %v", err)
	}

	return nil
}

func (t *TransactionNotifications) ScanIDs(rows pgx.Rows) error {
	defer rows.Close()

	for rows.Next() {

		n := new(TransactionNotification)

		err := rows.Scan(
			&n.ID,
		)

		if err != nil {
			return fmt.Errorf("TransactionNotifications scan: %v", err)
		}

		*t = append(*t, n)
	}

	err := rows.Err()
	if err != nil {
		return fmt.Errorf("TransactionNotifications rows: %v", err)
	}

	return nil
}

func (trs TransactionNotifications) ListIDs() IDs {
	var trIDs IDs

	for _, v := range trs {
		trIDs = append(trIDs, v.ID)
	}

	return trIDs
}

func (trs *TransactionNotifications) CreateNotificationsPerRoleApprover(
	approvals Approvals,
	transaction *Transaction,
) error {

	// dedupe role approvers to send only 1 notification
	// per approver role: someone shopping at their own store
	// receives 1 debitor and 1 creditor approval
	var uniqueRoleApprovers Approvals
	for _, v := range approvals {
		if isRoleApproverUnique(*v, uniqueRoleApprovers) {
			uniqueRoleApprovers = append(uniqueRoleApprovers, v)
		}
	}

	// add transaction as notification message
	pgMsg, err := json.Marshal(transaction)
	if err != nil {
		return fmt.Errorf("%s: %v", logger.Trace(), err)
	}

	jsonb := new(pgtype.JSONB)
	jsonb.Set(pgMsg)

	// create transaction_notification per role approver
	for _, v := range uniqueRoleApprovers {

		n := &TransactionNotification{
			TransactionID: v.TransactionID,
			AccountName:   v.AccountName,
			AccountRole:   v.AccountRole,
			Message:       jsonb,
		}

		*trs = append(*trs, n)
	}

	return nil
}

func isRoleApproverUnique(a Approval, l Approvals) bool {
	for _, v := range l {
		if *v.AccountName == *a.AccountName && *v.AccountRole == *a.AccountRole {
			return false
		}
	}
	return true
}

type NotificationEvent struct {
	Service *string
}

type TransactionNotificationEvent struct {
	NotificationEvent
	TransactionNotification
}

type Message struct {
	NotificationID *ID          `json:"notification_id"`
	Message        pgtype.JSONB `json:"message"`
}

type PendingNotifications struct {
	Pending []*Message `json:"pending"`
}

type ClearedNotifications struct {
	Cleared []*ID `json:"cleared"`
}
