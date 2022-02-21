package request

import (
	"fmt"
	"log"

	"github.com/systemaccounting/mxfactorial/services/gopkg/data"
	lpg "github.com/systemaccounting/mxfactorial/services/gopkg/lambdapg"
	"github.com/systemaccounting/mxfactorial/services/gopkg/notify"
	"github.com/systemaccounting/mxfactorial/services/gopkg/tools"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

func Approve(
	db lpg.SQLDB,
	accountName *string,
	authAccount *string,
	accountRole types.Role,
	preApprovalTransaction *types.Transaction,
	preApprovals []*types.Approval,
	notifyTopicArn *string,
) (string, error) {

	// test debitor capacity
	// todo: test capacity of all debitors to avoid stale approvals
	err := TestDebitorCapacity(
		db,
		accountName,
		preApprovalTransaction.TransactionItems,
	)
	if err != nil {
		log.Print(err)
		return "", err
	}

	// fail approval when self payment
	// detected in any transaction item
	err = tools.IsEachContraAccountUnique(
		preApprovalTransaction.TransactionItems,
	)
	if err != nil {
		log.Print(err)
		return "", err
	}

	// fail approval if timestamps not pending
	err = TestPendingRoleApproval(
		accountName,
		accountRole,
		preApprovals,
	)
	if err != nil {
		log.Print(err)
		return "", err
	}

	// add manual approval timestamps to approval records
	_, err = data.UpdateApprovalsByAccountAndRole(
		db,
		accountName,
		accountRole,
		preApprovalTransaction.ID,
	)
	if err != nil {
		log.Print(err)
		return "", err
	}

	// get ending approvals
	endingApprovals, err := data.GetApprovalsByTransactionID(
		db,
		preApprovalTransaction.ID,
	)
	if err != nil {
		log.Print(err)
		return "", err
	}

	// update approved transaction items
	postApprovalTransaction, err := AddApprovalTimes(
		db,
		endingApprovals,
		preApprovalTransaction,
	)
	if err != nil {
		log.Print(err)
		return "", err
	}

	// get ending transaction items
	endingTrItems, err := data.GetTrItemsByTransactionID(
		db,
		preApprovalTransaction.ID,
	)
	if err != nil {
		log.Print(err)
		return "", err
	}

	// attach ending transaction items to returning transaction
	postApprovalTransaction.TransactionItems = endingTrItems

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

func AddApprovalTimes(
	db lpg.SQLDB,
	approvals []*types.Approval,
	preApprovalTransaction *types.Transaction,
) (*types.Transaction, error) {

	// map transaction item id count from debitor approvals
	DbTrItemCount := MapTrItemIDOccurrenceFromApprovals(
		types.DEBITOR,
		approvals,
	)

	// map transaction item id count from creditor approvals
	CrTrItemCount := MapTrItemIDOccurrenceFromApprovals(
		types.CREDITOR,
		approvals,
	)

	// map debitor approved transaction item ids to latest approval time stamp
	DbApprovedTrItemIDs, err := MapApprovedTrItemIDsToApprovalTimes(
		DbTrItemCount,
		types.DEBITOR,
		approvals,
	)
	if err != nil {
		return nil, fmt.Errorf("UpdateApprovalTimes debitor error: %v", err.Error())
	}

	// map creditor approved transaction item ids to latest approval time stamp
	CrApprovedTrItemIDs, err := MapApprovedTrItemIDsToApprovalTimes(
		CrTrItemCount,
		types.CREDITOR,
		approvals,
	)
	if err != nil {
		return nil, fmt.Errorf("UpdateApprovalTimes creditor error: %v", err.Error())
	}

	// update debitor approvals of transaction items
	data.UpdateTrItemApprovalTimesByRole(
		db,
		types.DEBITOR,
		DbApprovedTrItemIDs,
	)

	// update creditor approvals of transaction items
	data.UpdateTrItemApprovalTimesByRole(
		db,
		types.CREDITOR,
		CrApprovedTrItemIDs,
	)

	// set ending transaction to pre approval transaction if not equilibrium
	endingTransaction := preApprovalTransaction

	// test for equilibrium from approvals
	if IsEquilibrium(approvals) {

		// get equilibrium time from last approval time
		equilibriumTime, err := GetLastApprovalTime(approvals)
		if err != nil {
			return nil, err
		}

		// set transaction equilibrium time
		endingTransaction, err = SetEquilibrium(
			db,
			approvals[0].TransactionID,
			equilibriumTime,
		)
		if err != nil {
			return nil, err
		}

		// change account balances from transaction items
		ChangeAccountBalances(
			db,
			preApprovalTransaction.TransactionItems,
		)
	}

	return endingTransaction, nil
}
