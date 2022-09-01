package types

import (
	"fmt"

	"github.com/jackc/pgx/v4"
	"github.com/shopspring/decimal"
)

// TransactionItem transacts goods and services
type TransactionItem struct {
	ID                     *ID                 `json:"id"`
	TransactionID          *ID                 `json:"transaction_id"`
	ItemID                 *string             `json:"item_id"`
	Price                  decimal.Decimal     `json:"price"`
	Quantity               decimal.Decimal     `json:"quantity"`
	DebitorFirst           *bool               `json:"debitor_first"`
	RuleInstanceID         *ID                 `json:"rule_instance_id"`
	RuleExecIDs            []*string           `json:"rule_exec_ids"`
	UnitOfMeasurement      *string             `json:"unit_of_measurement"`
	UnitsMeasured          decimal.NullDecimal `json:"units_measured"`
	Debitor                *string             `json:"debitor"`
	Creditor               *string             `json:"creditor"`
	DebitorProfileID       *ID                 `json:"debitor_profile_id"`
	CreditorProfileID      *ID                 `json:"creditor_profile_id"`
	DebitorApprovalTime    *TZTime             `json:"debitor_approval_time"`
	CreditorApprovalTime   *TZTime             `json:"creditor_approval_time"`
	DebitorRejectionTime   *TZTime             `json:"debitor_rejection_time"`
	CreditorRejectionTime  *TZTime             `json:"creditor_rejection_time"`
	DebitorExpirationTime  *TZTime             `json:"debitor_expiration_time"`
	CreditorExpirationTime *TZTime             `json:"creditor_expiration_time"`
	Approvals              Approvals           `json:"approvals"`
}

type TransactionItems []*TransactionItem

func (t *TransactionItems) ScanRows(rows pgx.Rows) error {
	defer rows.Close()
	for rows.Next() {

		i := new(TransactionItem)

		err := rows.Scan(
			&i.ID,
			&i.TransactionID,
			&i.ItemID,
			&i.Price,
			&i.Quantity,
			&i.DebitorFirst,
			&i.RuleInstanceID,
			&i.RuleExecIDs,
			&i.UnitOfMeasurement,
			&i.UnitsMeasured,
			&i.Debitor,
			&i.Creditor,
			&i.DebitorProfileID,
			&i.CreditorProfileID,
			&i.DebitorApprovalTime,
			&i.CreditorApprovalTime,
			&i.DebitorRejectionTime,
			&i.CreditorRejectionTime,
			&i.DebitorExpirationTime,
			&i.CreditorExpirationTime,
		)

		if err != nil {
			return fmt.Errorf("TransactionItems scan %v", err)
		}

		*t = append(*t, i)
	}

	err := rows.Err()
	if err != nil {
		return fmt.Errorf("TransactionItems rows %v", err)
	}

	return nil
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
func (trItems TransactionItems) ListUniqueAccountsFromTrItems() []string {
	var uniqueAccounts []string
	for _, v := range trItems {
		if isStringUnique(*v.Debitor, uniqueAccounts) {
			uniqueAccounts = append(uniqueAccounts, *v.Debitor)
		}
		if isStringUnique(*v.Creditor, uniqueAccounts) {
			uniqueAccounts = append(uniqueAccounts, *v.Creditor)
		}
	}
	return uniqueAccounts
}

func (trItems TransactionItems) RemoveUnauthorizedValues() TransactionItems {
	var authorized TransactionItems

	for _, v := range trItems {

		debitorFirst := falseIfNilPtr(v.DebitorFirst)

		authorized = append(authorized, &TransactionItem{
			ID:                     nil,
			TransactionID:          nil,
			ItemID:                 v.ItemID,
			Price:                  v.Price,
			Quantity:               v.Quantity,
			DebitorFirst:           &debitorFirst,
			RuleInstanceID:         v.RuleInstanceID,
			RuleExecIDs:            []*string{},
			UnitOfMeasurement:      nil,
			UnitsMeasured:          v.UnitsMeasured,
			Debitor:                v.Debitor,
			Creditor:               v.Creditor,
			DebitorProfileID:       nil,
			CreditorProfileID:      nil,
			DebitorApprovalTime:    nil,
			CreditorApprovalTime:   nil,
			DebitorRejectionTime:   nil,
			CreditorRejectionTime:  nil,
			DebitorExpirationTime:  nil,
			CreditorExpirationTime: nil,
			Approvals:              Approvals{},
		})
	}

	return authorized
}

func falseIfNilPtr(v *bool) bool {
	if v == nil {
		return false
	}
	return *v
}

func (trItems TransactionItems) AddProfileIDsToTrItems(accountProfileIDs map[string]ID) {
	for _, v := range trItems {
		v.DebitorProfileID = new(ID)
		*v.DebitorProfileID = accountProfileIDs[*v.Debitor]
		v.CreditorProfileID = new(ID)
		*v.CreditorProfileID = accountProfileIDs[*v.Creditor]
	}
}
