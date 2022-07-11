package request

import (
	"log"

	"github.com/jackc/pgtype"
	"github.com/systemaccounting/mxfactorial/services/gopkg/data"
	lpg "github.com/systemaccounting/mxfactorial/services/gopkg/lambdapg"
	"github.com/systemaccounting/mxfactorial/services/gopkg/notify"
	"github.com/systemaccounting/mxfactorial/services/gopkg/sqls"
	"github.com/systemaccounting/mxfactorial/services/gopkg/tools"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

func Approve(
	db lpg.SQLDB,
	u lpg.PGUnmarshaler,
	ibc func() sqls.InsertSQLBuilder,
	sbc func() sqls.SelectSQLBuilder,
	ubc func() sqls.UpdateSQLBuilder,
	dbc func() sqls.DeleteSQLBuilder,
	authAccount *string, // requester may be different from preApprovalTransaction.Author
	accountRole types.Role,
	preApprovalTransaction *types.Transaction,
	notifyTopicArn *string,
) (string, error) {

	var preAppTrItems types.TransactionItems = preApprovalTransaction.TransactionItems

	// test debitor capacity
	err := TestDebitorCapacity(
		db,
		u,
		sbc,
		preAppTrItems,
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

	var equilibriumTime pgtype.Timestamptz

	// test for pending approvals to reduce db writes
	err = TestPendingRoleApproval(
		authAccount,
		accountRole,
		beginningApprovals,
	)
	if err == nil {
		// add requester timestamps to approvals
		equilibriumTime, err = data.AddApprovalTimesByAccountAndRole(
			db,
			authAccount,
			accountRole,
			preApprovalTransaction.ID,
		)
		if err != nil {
			return "", err
		}
	} else {
		// avoid repeating approval when added by rule
		log.Println(err)
	}

	postApprovalTransaction, err := data.GetTransactionWithTrItemsAndApprovalsByID(
		db,
		u,
		sbc,
		preApprovalTransaction.ID,
	)
	if err != nil {
		return "", err
	}

	endingApprovals := getApprovalsFromTransaction(postApprovalTransaction)

	// test for equilibrium
	if !equilibriumTime.Time.IsZero() {
		// change account balances from transaction items
		ChangeAccountBalances(
			db,
			ubc,
			preApprovalTransaction.TransactionItems,
		)

	}

	// notify role approvers
	err = notify.NotifyTransactionRoleApprovers(
		db,
		u,
		ibc,
		dbc,
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
