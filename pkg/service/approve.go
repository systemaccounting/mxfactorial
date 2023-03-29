package service

import (
	"context"
	"log"
	"os"

	"github.com/jackc/pgtype"
	"github.com/systemaccounting/mxfactorial/pkg/logger"
	"github.com/systemaccounting/mxfactorial/pkg/types"
)

type ApproveService struct {
	*TransactionService
	*BalanceService
	*TransactionNotificationService
}

func (a ApproveService) Approve(
	ctx context.Context,
	authAccount string, // requester may be different from preApprovalTransaction.Author
	approverRole types.Role,
	preApprovalTransaction *types.Transaction,
	notifyTopicArn string,
) (string, error) {

	err := a.BalanceService.TestDebitorCapacity(preApprovalTransaction.TransactionItems)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return "", err
	}

	// fail approval when self payment
	// detected in any transaction item
	err = preApprovalTransaction.IsEachContraAccountUnique()
	if err != nil {
		logger.Log(logger.Trace(), err)
		return "", err
	}

	beginningApprovals, err := preApprovalTransaction.GetApprovals()
	if err != nil {
		logger.Log(logger.Trace(), err)
		return "", err
	}

	var equilibriumTime pgtype.Timestamptz

	// test for pending approvals to reduce db writes
	err = beginningApprovals.TestPendingRoleApproval(authAccount, approverRole)
	if err == nil {

		// add requester timestamps to approvals
		equilibriumTime, err = a.TransactionService.AddApprovalTimesByAccountAndRole(
			*preApprovalTransaction.ID,
			authAccount,
			approverRole,
		)

		if err != nil {
			logger.Log(logger.Trace(), err)
			return "", err
		}

	} else {

		// avoid repeating approval when added by rule
		log.Println(err)
	}

	postApprovalTransaction, err := a.TransactionService.GetTransactionWithTrItemsAndApprovalsByID(
		*preApprovalTransaction.ID,
	)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return "", err
	}

	endingApprovals, err := postApprovalTransaction.GetApprovals()
	if err != nil {
		logger.Log(logger.Trace(), err)
		return "", err
	}

	// test for equilibrium
	if !equilibriumTime.Time.IsZero() {

		// change account balances from transaction items
		a.BalanceService.ChangeAccountBalances(preApprovalTransaction.TransactionItems)

	}

	if os.Getenv("ENABLE_NOTIFICATIONS") == "true" {
		// notify role approvers
		err = a.TransactionNotificationService.NotifyTransactionRoleApprovers(
			endingApprovals,
			postApprovalTransaction,
			&notifyTopicArn,
		)
		if err != nil {
			logger.Log(logger.Trace(), err)
			return "", err
		}
	}

	// create transaction for response to client
	intraTr := postApprovalTransaction.CreateIntraTransaction(authAccount)

	// send string or error response to client
	return intraTr.MarshalIntraTransaction()
}

func NewApproveService(db SQLDB) *ApproveService {
	return &ApproveService{
		TransactionService:             NewTransactionService(db),
		BalanceService:                 NewAccountBalanceService(db),
		TransactionNotificationService: NewTransactionNotificationService(db),
	}
}
