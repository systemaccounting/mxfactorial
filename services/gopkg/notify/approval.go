package notify

import (
	"context"
	"encoding/json"
	"log"

	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/sns"
	"github.com/jackc/pgtype"
	lpg "github.com/systemaccounting/mxfactorial/services/gopkg/lambdapg"
	"github.com/systemaccounting/mxfactorial/services/gopkg/sqls"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

var (
	snsMsgAttributeName          = "SERVICE"
	snsMsgAttributeValueDataType = "String"
	TRANSACT_SERVICE_NAME        = "TRANSACT"
)

func NotifyTransactionRoleApprovers(
	db lpg.SQLDB,
	u lpg.PGUnmarshaler,
	ibc func() sqls.InsertSQLBuilder,
	dbc func() sqls.DeleteSQLBuilder,
	topicArn *string,
	approvals []*types.Approval,
	transaction *types.Transaction,
) error {

	// delete obselete notifications
	err := deleteObseleteApprovalNotifications(db, dbc, *transaction.ID)
	if err != nil {
		log.Printf("delete obselete transaction notification error: %v", err)
		return err
	}

	// create transaction approval notifications
	notifications, err := createNotificationsPerRoleApprover(
		approvals,
		transaction,
	)
	if err != nil {
		log.Printf("create notifications per role approver error: %v", err)
		return err
	}

	// create transaction notifications returning ids
	notifIDs, err := insertTransactionApprovalNotifications(
		db,
		u,
		ibc,
		notifications)
	if err != nil {
		log.Printf("create transaction notitfications error: %v", err)
		return err
	}

	// marshal notifcation ids
	snsMsgBytes, err := json.Marshal(notifIDs)
	if err != nil {
		log.Printf("json marshal error: %v", err)
		return err
	}

	// create sns input
	snsInput := createSNSInput(
		snsMsgBytes,
		&TRANSACT_SERVICE_NAME,
		topicArn,
	)

	// create aws session
	sess := session.Must(session.NewSession())

	// create sns client from session
	svc := sns.New(sess)

	// send notification ids to send message service
	_, err = svc.Publish(snsInput)
	if err != nil {
		log.Printf("sns publish error: %v", err)
		return err
	}
	return nil
}

func createNotificationsPerRoleApprover(
	approvals []*types.Approval,
	transaction *types.Transaction,
) ([]*types.TransactionNotification, error) {
	// dedupe role approvers to send only 1 notification
	// per approver role: someone shopping at their own store
	// receives 1 debitor and 1 creditor approval
	var uniqueRoleApprovers []*types.Approval
	for _, v := range approvals {
		if isRoleApproverUnique(*v, uniqueRoleApprovers) {
			uniqueRoleApprovers = append(uniqueRoleApprovers, v)
		}
	}

	// add transaction items to returning transaction
	pgMsg, err := json.Marshal(transaction)
	if err != nil {
		log.Print("marshal transaction notifcation error ", err)
		return nil, err
	}
	jsonb := pgtype.JSONB{}
	jsonb.Set(pgMsg)

	// create transaction_notification per role approver
	var roleApproverNotifications []*types.TransactionNotification
	for _, v := range uniqueRoleApprovers {
		n := &types.TransactionNotification{
			TransactionID: v.TransactionID,
			AccountName:   v.AccountName,
			AccountRole:   v.AccountRole,
			Message:       &jsonb,
		}
		roleApproverNotifications = append(roleApproverNotifications, n)
	}

	return roleApproverNotifications, nil
}

func deleteObseleteApprovalNotifications(
	db lpg.SQLDB,
	dbc func() sqls.DeleteSQLBuilder,
	trID types.ID,
) error {

	// create sql builder from constructor
	dbSQL := dbc()

	// create delete transaction_notification sql to delete obsolete notifications
	delNotifSQL, delNotifArgs := dbSQL.DeleteTransNotificationsByTransIDSQL(
		trID,
	)

	// delete obselete notifications
	_, err := db.Exec(context.Background(), delNotifSQL, delNotifArgs...)
	if err != nil {
		log.Printf("delete notifications error: %v", err)
		return err
	}

	return nil
}

func insertTransactionApprovalNotifications(
	db lpg.SQLDB,
	u lpg.PGUnmarshaler,
	ibc func() sqls.InsertSQLBuilder,
	notifications []*types.TransactionNotification,
) ([]int64, error) {

	// create sql builder from constructor
	ib := ibc()

	// create insert transaction_notification sql returning ids
	insNotifSQL, insNotifArgs := ib.InsertTransactionNotificationSQL(
		notifications,
	)

	// insert notifications per unique role_approver
	notifIDRows, err := db.Query(context.Background(), insNotifSQL, insNotifArgs...)
	if err != nil {
		log.Printf("query notification id error: %v", err)
		return nil, err
	}

	// unmarshal notification ids
	notifIDs, err := u.UnmarshalIDs(notifIDRows)
	if err != nil {
		log.Printf("unmarshal ids error: %v", err)
		return nil, err
	}

	return notifIDs, nil
}

func createSNSInput(
	msg []byte,
	serviceName *string,
	topicArn *string,
) *sns.PublishInput {
	snsMsg := string(msg)
	snsMsgAttributes := make(map[string]*sns.MessageAttributeValue)
	snsMsgAttributes[snsMsgAttributeName] = &sns.MessageAttributeValue{
		DataType:    &snsMsgAttributeValueDataType,
		StringValue: serviceName,
	}
	return &sns.PublishInput{
		Message:           &snsMsg,
		TopicArn:          topicArn,
		MessageAttributes: snsMsgAttributes,
	}
}

func isRoleApproverUnique(a types.Approval, l []*types.Approval) bool {
	for _, v := range l {
		if *v.AccountName == *a.AccountName && *v.AccountRole == *a.AccountRole {
			return false
		}
	}
	return true
}
