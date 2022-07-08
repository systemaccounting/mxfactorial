package request

import (
	"testing"

	"github.com/systemaccounting/mxfactorial/services/gopkg/testdata"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

func TestGetApprovalsFromTransactionCount(t *testing.T) {
	testtr := testdata.GetTestTransaction(transWAppr)
	apprvs := getApprovalsFromTransaction(&testtr)
	got := len(apprvs)
	want := 21
	if got != want {
		t.Errorf("got %v, want %v", got, want)
	}
}

func TestGetApprovalsFromTransactionPendingDbApprovalsCount(t *testing.T) {
	testtr := testdata.GetTestTransaction(transWAppr)
	apprvs := getApprovalsFromTransaction(&testtr)
	var pendingDebitorApprovals []*types.Approval
	for _, v := range apprvs {
		if *v.AccountName == "JoeCarter" && *v.AccountRole == types.DB {
			pendingDebitorApprovals = append(pendingDebitorApprovals, v)
		}
	}
	got := len(pendingDebitorApprovals)
	want := 6
	if got != want {
		t.Errorf("got %v, want %v", got, want)
	}
}

func TestGetApprovalsFromTransactionCrApprovalsCount(t *testing.T) {
	testtr := testdata.GetTestTransaction(transWAppr)
	apprvs := getApprovalsFromTransaction(&testtr)
	var creditorApprovals []*types.Approval
	for _, v := range apprvs {
		if *v.AccountRole == types.CR && v.ApprovalTime != nil {
			creditorApprovals = append(creditorApprovals, v)
		}
	}
	got := len(creditorApprovals)
	want := 15
	if got != want {
		t.Errorf("got %v, want %v", got, want)
	}
}
