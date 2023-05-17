package types

import (
	"errors"
	"fmt"

	"github.com/jackc/pgx/v4"
)

// Approval approves a transaction item
type Approval struct {
	ID                *ID     `json:"id"`
	RuleInstanceID    *ID     `json:"rule_instance_id"`
	TransactionID     *ID     `json:"transaction_id"`
	TransactionItemID *ID     `json:"transaction_item_id"`
	AccountName       *string `json:"account_name"`
	AccountRole       *Role   `json:"account_role"`
	DeviceID          *string `json:"device_id"`
	DeviceLatlng      *LatLng `json:"device_latlng"`
	ApprovalTime      *TZTime `json:"approval_time"`
	RejectionTime     *TZTime `json:"rejection_time"`
	ExpirationTime    *TZTime `json:"expiration_time"`
}

type Approvals []*Approval

func (apprvs *Approvals) ScanRows(rows pgx.Rows) error {

	defer rows.Close()
	for rows.Next() {

		a := new(Approval)

		err := rows.Scan(
			&a.ID,
			&a.RuleInstanceID,
			&a.TransactionID,
			&a.TransactionItemID,
			&a.AccountName,
			&a.AccountRole,
			&a.DeviceID,
			&a.DeviceLatlng,
			&a.ApprovalTime,
			&a.RejectionTime,
			&a.ExpirationTime,
		)
		if err != nil {
			return fmt.Errorf("Approvals scan: %v", err)
		}

		*apprvs = append(*apprvs, a)
	}

	err := rows.Err()
	if err != nil {
		return fmt.Errorf("Approvals rows: %v", err)
	}

	return nil
}

// TestPendingRoleApproval errors when 0 pending
// approvals found for current debitor or creditor account
func (apprvs Approvals) TestPendingRoleApproval(
	accountName string,
	accountRole Role,
) error {

	approvalTimeStampsPending := 0

	for _, v := range apprvs {
		if *v.AccountName == accountName &&
			*v.AccountRole == accountRole &&
			v.ApprovalTime == nil {
			approvalTimeStampsPending++
		}
	}

	if approvalTimeStampsPending == 0 {
		return errors.New("0 timestamps pending for approver. skipping approval")
	}

	return nil
}
