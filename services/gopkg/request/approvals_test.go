package request

import (
	"testing"

	"github.com/systemaccounting/mxfactorial/services/gopkg/testdata"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

const (
	transWAppr  string = "../testdata/transWAppr.json"
	transWTimes        = "../testdata/transWTimes.json"
)

func TestTestPendingRoleApproval(t *testing.T) {
	tr := testdata.GetTestTransaction(transWAppr)
	testapprovals := tr.TransactionItems[3].Approvals
	testaccount := "JoeCarter"
	testrole := types.Role(0)

	got := TestPendingRoleApproval(&testaccount, testrole, testapprovals)

	if got != nil {
		t.Errorf("got %v, want nil", got.Error())
	}
}

func TestTestPendingRoleApprovalErr(t *testing.T) {
	tr := testdata.GetTestTransaction(transWAppr)
	testapprovals := tr.TransactionItems[0].Approvals
	testaccount := "BenRoss"
	testrole := types.Role(1)

	got := TestPendingRoleApproval(&testaccount, testrole, testapprovals)
	want := "0 timestamps pending for approver. skipping approval"

	if got != nil {
		if got.Error() != want {
			t.Errorf("got %v, want %v", got, want)
		}
	}
}
