package types

import (
	"github.com/shopspring/decimal"
)

// TransactionItem transacts goods and services
type TransactionItem struct {
	ID                     *ID                 `json:"id,omitempty"`
	TransactionID          *ID                 `json:"transaction_id,omitempty"`
	ItemID                 *string             `json:"item_id"`
	Price                  decimal.Decimal     `json:"price"`
	Quantity               decimal.Decimal     `json:"quantity"`
	DebitorFirst           *bool               `json:"debitor_first,omitempty"`
	RuleInstanceID         *ID                 `json:"rule_instance_id"`
	RuleExecIDs            []*string           `json:"rule_exec_ids"`
	UnitOfMeasurement      *string             `json:"unit_of_measurement"`
	UnitsMeasured          decimal.NullDecimal `json:"units_measured"`
	Debitor                *string             `json:"debitor"`
	Creditor               *string             `json:"creditor"`
	DebitorProfileID       *ID                 `json:"debitor_profile_id,omitempty"`
	CreditorProfileID      *ID                 `json:"creditor_profile_id,omitempty"`
	DebitorApprovalTime    *string             `json:"debitor_approval_time,omitempty"`
	CreditorApprovalTime   *string             `json:"creditor_approval_time,omitempty"`
	DebitorRejectionTime   *string             `json:"debitor_rejection_time,omitempty"`
	CreditorRejectionTime  *string             `json:"creditor_rejection_time,omitempty"`
	DebitorExpirationTime  *string             `json:"debitor_expiration_time,omitempty"`
	CreditorExpirationTime *string             `json:"creditor_expiration_time,omitempty"`
	Approvals              []*Approval         `json:"approvals,omitempty"`
}

type TransactionItems []*TransactionItem

type TrItemListHelper interface {
	MapDebitorsToRequiredFunds() map[string]decimal.Decimal
	ListUniqueDebitorAccountsFromTrItems() []string
	ListUniqueAccountsFromTrItems() []interface{}
}

func (trItems TransactionItems) MapDebitorsToRequiredFunds() map[string]decimal.Decimal {

	// map stores debitor funds required for transaction
	// e.g. JacobWebb needs 10.000, SarahBell needs 1.000
	reqd := make(map[string]decimal.Decimal)

	// loop through transaction items
	for _, v := range trItems {

		// test map for debitor
		if _, ok := reqd[*v.Debitor]; !ok {

			// init decimal value for account
			// when account not found in map
			reqd[*v.Debitor] = decimal.New(0, 1)
		}

		// test for pending approval timestamp
		if v.DebitorApprovalTime == nil {

			// increase required debitor funds by price * quantity
			reqd[*v.Debitor] = reqd[*v.Debitor].Add(v.Price.Mul(v.Quantity))
		}
	}

	return reqd
}

func (trItems TransactionItems) ListUniqueDebitorAccountsFromTrItems() []string {
	var uniqueDebitors []string
	for _, v := range trItems {
		if isStringUnique(*v.Debitor, uniqueDebitors) {
			uniqueDebitors = append(uniqueDebitors, *v.Debitor)
		}
	}
	return uniqueDebitors
}

func isStringUnique(s string, l []string) bool {
	for _, v := range l {
		if v == s {
			return false
		}
	}
	return true
}

// used for sql builder
func (trItems TransactionItems) ListUniqueAccountsFromTrItems() []interface{} {
	var uniqueAccounts []interface{}
	for _, v := range trItems {
		if isIfaceStringUnique(*v.Debitor, uniqueAccounts) {
			uniqueAccounts = append(uniqueAccounts, *v.Debitor)
		}
		if isIfaceStringUnique(*v.Creditor, uniqueAccounts) {
			uniqueAccounts = append(uniqueAccounts, *v.Creditor)
		}
	}
	return uniqueAccounts
}

func isIfaceStringUnique(s string, l []interface{}) bool {
	for _, v := range l {
		if v.(string) == s {
			return false
		}
	}
	return true
}
