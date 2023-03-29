package types

import (
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v4"
	"github.com/shopspring/decimal"
	"github.com/systemaccounting/mxfactorial/pkg/logger"
)

// Transaction is an envelope for TransactionItems
type Transaction struct {
	ID                 *ID                  `json:"id"`
	RuleInstanceID     *ID                  `json:"rule_instance_id"`
	Author             *string              `json:"author"`
	AuthorDeviceID     *string              `json:"author_device_id"`
	AuthorDeviceLatlng *LatLng              `json:"author_device_latlng"` // pg point type
	AuthorRole         *string              `json:"author_role"`
	EquilibriumTime    *TZTime              `json:"equilibrium_time"`
	SumValue           *decimal.NullDecimal `json:"sum_value"`
	TransactionItems   TransactionItems     `json:"transaction_items"`
}

func (t *Transaction) ScanID(row pgx.Row) error {

	err := row.Scan(&t.ID)

	if err != nil {
		return fmt.Errorf("Transaction id scan: %v", err)
	}

	return nil
}

func (t *Transaction) ScanRow(row pgx.Row) error {

	// not using "createdAt" but returning extra column
	// for easy "select *" building in sqls pkg
	var createdAt time.Time

	err := row.Scan(
		&t.ID,
		&t.RuleInstanceID,
		&t.Author,
		&t.AuthorDeviceID,
		&t.AuthorDeviceLatlng,
		&t.AuthorRole,
		&t.EquilibriumTime,
		&t.SumValue,
		&createdAt,
	)

	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	return nil
}

func (t Transaction) IsEachContraAccountUnique() error {
	for _, v := range t.TransactionItems {
		if *v.Creditor == *v.Debitor {
			return fmt.Errorf("same debitor and creditor in transaction_item. exiting %v", v.Creditor)
		}
	}
	return nil
}

func (t Transaction) GetApprovals() (Approvals, error) {

	if len(t.TransactionItems) == 0 {
		return nil, fmt.Errorf("%s: 0 transaction items found", logger.Trace())
	}

	var approvals Approvals

	for _, v := range t.TransactionItems {

		if len(v.Approvals) == 0 {
			return nil, fmt.Errorf("%s: 0 approvals found", logger.Trace())
		}

		for _, u := range v.Approvals {
			approvals = append(approvals, u)
		}
	}

	return approvals, nil
}

func (t *Transaction) CreateIntraTransaction(authAccount string) IntraTransaction {
	return IntraTransaction{
		IntraEvent: IntraEvent{
			AuthAccount: authAccount,
		},
		Transaction: t,
	}
}

// GetAuthorRole gets author role from a transaction
func (t Transaction) GetAuthorRole(author string) (Role, error) {

	// test for rule added transaction author
	if t.RuleInstanceID != nil && *t.RuleInstanceID != "" {
		var authorRole *Role
		authorRole.Set(*t.AuthorRole)
		return *authorRole, nil
	}

	// if transaction is NOT rule generated
	for _, v := range t.TransactionItems {

		if v.RuleInstanceID == nil || *v.RuleInstanceID == "" {

			if *v.Debitor == author {
				return DEBITOR, nil
			}

			if *v.Creditor == author {
				return CREDITOR, nil
			}

		}
	}

	return 0, errors.New("author not in items")
}

type Transactions []*Transaction

func (trs *Transactions) ScanRows(rows pgx.Rows) error {
	defer rows.Close()
	for rows.Next() {

		t := new(Transaction)

		// not using "createdAt" but returning extra column
		// for easy "select *" building in sqls pkg
		var createdAt time.Time

		err := rows.Scan(
			&t.ID,
			&t.RuleInstanceID,
			&t.Author,
			&t.AuthorDeviceID,
			&t.AuthorDeviceLatlng,
			&t.AuthorRole,
			&t.EquilibriumTime,
			&t.SumValue,
			&createdAt,
		)

		if err != nil {
			return fmt.Errorf("Transactions scan: %v", err)
		}

		*trs = append(*trs, t)
	}

	err := rows.Err()
	if err != nil {
		return fmt.Errorf("Transactions rows: %v", err)
	}

	return nil
}

func (trs Transactions) ListIDs() IDs {
	var trIDs IDs

	for _, v := range trs {
		trIDs = append(trIDs, v.ID)
	}

	return trIDs
}

func (trs Transactions) CreateIntraTransactions(authAccount string) IntraTransactions {
	return IntraTransactions{
		IntraEvent: IntraEvent{
			AuthAccount: authAccount,
		},
		// todo: change field name to "transactions"
		Transaction: trs,
	}
}
