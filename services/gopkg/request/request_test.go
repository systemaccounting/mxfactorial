package request

import (
	"encoding/json"
	"io/ioutil"
	"testing"

	"github.com/google/go-cmp/cmp"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

const (
	transNoAppr string = "../testdata/transNoAppr.json"
)

func GetTestTransaction(t *testing.T, testPath string) types.Transaction {
	f, err := ioutil.ReadFile(testPath)
	if err != nil {
		t.Fatalf("read fail %s: %v", testPath, err)
	}
	var i types.IntraTransaction
	if err := json.Unmarshal(f, &i); err != nil {
		t.Fatalf("unmarshal fail: %v", err)
	}
	return *i.Transaction
}

func TestEmptyStringIfNilPtr(t *testing.T) {

	strPtrVar := "test"

	tests := []struct {
		input *string
		want  string
	}{
		{
			input: nil,
			want:  "",
		},
		{
			input: &strPtrVar,
			want:  "test",
		},
	}

	for _, v := range tests {
		got := EmptyStringIfNilPtr(v.input)
		want := v.want
		if got != want {
			t.Errorf("got %v, want %v", got, want)
		}
	}
}

func TestFalseIfNilPtr(t *testing.T) {

	boolPrtVar := true

	tests := []struct {
		input *bool
		want  bool
	}{
		{
			input: nil,
			want:  false,
		},
		{
			input: &boolPrtVar,
			want:  true,
		},
	}

	for _, v := range tests {
		got := FalseIfNilPtr(v.input)
		want := v.want
		if got != want {
			t.Errorf("got %v, want %v", got, want)
		}
	}
}

func TestRemoveUnauthorizedValues(t *testing.T) {
	testTransaction := GetTestTransaction(t, transNoAppr)
	got := RemoveUnauthorizedValues(testTransaction.TransactionItems)
	want := []types.TransactionItem{}
	for _, v := range testTransaction.TransactionItems {
		debitorFirst := FalseIfNilPtr(v.DebitorFirst)
		debitorRejectionTime := EmptyStringIfNilPtr(v.DebitorRejectionTime)
		creditorRejectionTime := EmptyStringIfNilPtr(v.CreditorRejectionTime)
		debitorExpirationTime := EmptyStringIfNilPtr(v.DebitorExpirationTime)
		creditorExpirationTime := EmptyStringIfNilPtr(v.CreditorExpirationTime)
		want = append(want, types.TransactionItem{
			ID:                     nil,
			TransactionID:          nil,
			ItemID:                 v.ItemID,
			Price:                  v.Price,
			Quantity:               v.Quantity,
			DebitorFirst:           &debitorFirst,
			RuleInstanceID:         v.RuleInstanceID,
			UnitOfMeasurement:      nil,
			UnitsMeasured:          v.UnitsMeasured,
			Debitor:                v.Debitor,
			Creditor:               v.Creditor,
			DebitorProfileID:       nil,
			CreditorProfileID:      nil,
			DebitorApprovalTime:    nil,
			CreditorApprovalTime:   nil,
			DebitorRejectionTime:   &debitorRejectionTime,
			CreditorRejectionTime:  &creditorRejectionTime,
			DebitorExpirationTime:  &debitorExpirationTime,
			CreditorExpirationTime: &creditorExpirationTime,
			Approvals:              []*types.Approval{},
		})
	}

	for i, v := range got {
		if v.ID != nil {
			t.Errorf("got %v for v.ID, want nil", got)
		}
		if v.TransactionID != nil {
			t.Errorf("got %v for v.TransactionID, want nil", got)
		}
		if *v.ItemID != *want[i].ItemID {
			t.Errorf("got %v for *v.ItemID, want %v", *v.ItemID, *want[i].ItemID)
		}
		if v.Price != want[i].Price {
			t.Errorf("got %v for v.Price, want %v", v.Price, want[i].Price)
		}
		if v.Quantity != want[i].Quantity {
			t.Errorf("got %v for v.Quantity, want %v", v.Quantity, want[i].Quantity)
		}
		if *v.DebitorFirst != *want[i].DebitorFirst {
			t.Errorf("got %v for *v.DebitorFirst, want %v", *v.DebitorFirst, *want[i].DebitorFirst)
		}
		if *v.RuleInstanceID != *want[i].RuleInstanceID {
			t.Errorf("got %v for *v.RuleInstanceID, want %v", *v.RuleInstanceID, *want[i].RuleInstanceID)
		}
		if v.UnitOfMeasurement != nil {
			t.Errorf("got %v for UnitOfMeasurement, want nil", got)
		}
		if v.UnitsMeasured != want[i].UnitsMeasured {
			t.Errorf("got %v for v.UnitsMeasured, want %v", v.UnitsMeasured, want[i].UnitsMeasured)
		}
		if *v.Debitor != *want[i].Debitor {
			t.Errorf("got %v for *v.Debitor, want %v", *v.Debitor, *want[i].Debitor)
		}
		if *v.Creditor != *want[i].Creditor {
			t.Errorf("got %v for *v.Creditor, want %v", *v.Creditor, *want[i].Debitor)
		}
		if v.DebitorProfileID != nil {
			t.Errorf("got %v for DebitorProfileID, want nil", got)
		}
		if v.CreditorProfileID != nil {
			t.Errorf("got %v for CreditorProfileID, want nil", got)
		}
		if v.DebitorApprovalTime != nil {
			t.Errorf("got %v for DebitorApprovalTime, want nil", got)
		}
		if v.CreditorApprovalTime != nil {
			t.Errorf("got %v for CreditorApprovalTime, want nil", got)
		}
		if *v.DebitorRejectionTime != "" {
			t.Errorf("got %v for DebitorRejectionTime, want empty string", got)
		}
		if *v.CreditorRejectionTime != "" {
			t.Errorf("got %v for CreditorRejectionTime, want empty string", got)
		}
		if *v.DebitorExpirationTime != "" {
			t.Errorf("got %v for DebitorExpirationTime, want empty string", got)
		}
		if *v.CreditorExpirationTime != "" {
			t.Errorf("got %v for CreditorExpirationTime, want empty string", got)
		}
		if !cmp.Equal(v.Approvals, []*types.Approval{}) {
			t.Errorf("got %v for Approvals, want empty slice", got)
		}
	}
}
