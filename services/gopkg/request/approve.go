package request

import (
	"log"

	"github.com/systemaccounting/mxfactorial/services/gopkg/data"
	lpg "github.com/systemaccounting/mxfactorial/services/gopkg/lambdapg"
	"github.com/systemaccounting/mxfactorial/services/gopkg/notify"
	"github.com/systemaccounting/mxfactorial/services/gopkg/tools"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

func Approve(
	db lpg.SQLDB,
	authAccount *string, // requester may be different from preApprovalTransaction.Author
	accountRole types.Role,
	preApprovalTransaction *types.Transaction,
	notifyTopicArn *string,
) (string, error) {

	// test debitor capacity
	err := TestDebitorCapacity(
		db,
		preApprovalTransaction.TransactionItems,
	)
	if err != nil {
		return "", err
	}

	// fail approval when self payment
	// detected in any transaction item
	err = tools.IsEachContraAccountUnique(
		preApprovalTransaction.TransactionItems,
	)
	if err != nil {
		return "", err
	}

	beginningApprovals := getApprovalsFromTransaction(preApprovalTransaction)

	// fail approval if timestamps not pending
	err = TestPendingRoleApproval(
		authAccount,
		accountRole,
		beginningApprovals,
	)
	if err != nil {
		return "", err
	}

	// add requester timestamps to approvals
	eqTime, err := data.AddApprovalTimesByAccountAndRole(
		db,
		authAccount,
		accountRole,
		preApprovalTransaction.ID,
	)
	if err != nil {
		return "", err
	}

	postApprovalTransaction, err := data.GetTransactionWithTrItemsAndApprovalsByID(
		db,
		preApprovalTransaction.ID,
	)
	if err != nil {
		return "", err
	}

	endingApprovals := getApprovalsFromTransaction(postApprovalTransaction)

	// test for equilibrium
	equilibriumTime := *eqTime
	if !equilibriumTime.Time.IsZero() {
		// change account balances from transaction items
		ChangeAccountBalances(
			db,
			preApprovalTransaction.TransactionItems,
		)

	}

	// notify role approvers
	err = notify.NotifyTransactionRoleApprovers(
		db,
		notifyTopicArn,
		endingApprovals,
		postApprovalTransaction,
	)
	if err != nil {
		log.Print("notify transaction role approvers ", err)
	}

	// create transaction for response to client
	intraTr := tools.CreateIntraTransaction(
		*authAccount,
		postApprovalTransaction,
	)

	// send string or error response to client
	return tools.MarshalIntraTransaction(&intraTr)

}

func getApprovalsFromTransaction(tr *types.Transaction) []*types.Approval {
	var approvals []*types.Approval

	for _, v := range tr.TransactionItems {
		for _, u := range v.Approvals {
			approvals = append(approvals, u)
		}
	}

	return approvals
}
