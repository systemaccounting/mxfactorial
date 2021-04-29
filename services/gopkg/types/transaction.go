package types

import (
	"time"

	"github.com/jackc/pgtype"
	"github.com/shopspring/decimal"
)

// Transaction is an envelope for TransactionItems
type Transaction struct {
	ID                 *int32              `json:"id,omitempty"`
	RuleInstanceID     *int32              `json:"rule_instance_id,omitempty"`
	Author             *string             `json:"author"`
	AuthorDeviceID     *string             `json:"author_device_id,omitempty"`
	AuthorDeviceLatlng *string             `json:"author_device_latlng,omitempty"` // pg point type
	AuthorRole         *string             `json:"author_role"`
	EquilibriumTime    *string             `json:"equilibrium_time"`
	SumValue           decimal.NullDecimal `json:"sum_value"`
	TransactionItems   []*TransactionItem  `json:"transaction_items"`
}

// TransactionItem transacts goods and services
type TransactionItem struct {
	ID                     *int32              `json:"id,omitempty"`
	TransactionID          *int32              `json:"transaction_id,omitempty"`
	ItemID                 *string             `json:"item_id"`
	Price                  decimal.Decimal     `json:"price"`
	Quantity               decimal.Decimal     `json:"quantity"`
	DebitorFirst           *bool               `json:"debitor_first,omitempty"`
	RuleInstanceID         *int32              `json:"rule_instance_id"`
	UnitOfMeasurement      *string             `json:"unit_of_measurement"`
	UnitsMeasured          decimal.NullDecimal `json:"units_measured"`
	Debitor                *string             `json:"debitor"`
	Creditor               *string             `json:"creditor"`
	DebitorProfileID       *int32              `json:"debitor_profile_id,omitempty"`
	CreditorProfileID      *int32              `json:"creditor_profile_id,omitempty"`
	DebitorApprovalTime    *string             `json:"debitor_approval_time,omitempty"`
	CreditorApprovalTime   *string             `json:"creditor_approval_time,omitempty"`
	DebitorRejectionTime   *string             `json:"debitor_rejection_time,omitempty"`
	CreditorRejectionTime  *string             `json:"creditor_rejection_time,omitempty"`
	DebitorExpirationTime  *string             `json:"debitor_expiration_time,omitempty"`
	CreditorExpirationTime *string             `json:"creditor_expiration_time,omitempty"`
	Approvers              []*Approver         `json:"approvers,omitempty"`
}

type TransactionNotification struct {
	ID            *int32        `json:"id"`
	TransactionID *int32        `json:"transaction_id"`
	AccountName   *string       `json:"account_name"`
	AccountRole   *string       `json:"account_role"`
	Message       *pgtype.JSONB `json:"message"`
	CreatedAt     *time.Time    `json:"created_at"`
}

// Approver approves a transaction item
type Approver struct {
	ID                *int32  `json:"id,omitempty"`
	RuleInstanceID    *int32  `json:"rule_instance_id,omitempty"`
	TransactionID     *int32  `json:"transaction_id,omitempty"`
	TransactionItemID *int32  `json:"transaction_item_id,omitempty"`
	AccountName       *string `json:"account_name"`
	AccountRole       *string `json:"account_role"`
	DeviceID          *string `json:"device_id,omitempty"`
	DeviceLatlng      *string `json:"device_latlng,omitempty"`
	ApprovalTime      *string `json:"approval_time,omitempty"`
	RejectionTime     *string `json:"rejection_time,omitempty"`
	ExpirationTime    *string `json:"expiration_time,omitempty"`
}

// IntraEvent is embedded for
// post-auth internal service requests
type IntraEvent struct {
	AuthAccount string `json:"auth_account"`
}

// IntraTransaction ...
type IntraTransaction struct {
	IntraEvent
	Transaction *Transaction `json:"transaction"`
}

type RequestApprove struct {
	IntraEvent
	ID          *int32  `json:"id"`
	AccountName *string `json:"account_name"`
	AccountRole *string `json:"account_role"`
}

type AccountProfileID struct {
	ID          *int32  `json:"id"`
	AccountName *string `json:"account_name"`
}

type QueryByAccount struct {
	IntraEvent
	AccountName *string `json:"account_name"`
}

type QueryByID struct {
	IntraEvent
	ID *int32 `json:"id"`
}
