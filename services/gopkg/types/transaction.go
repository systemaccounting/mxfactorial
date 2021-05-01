package types

import (
	"github.com/shopspring/decimal"
)

// Transaction is an envelope for TransactionItems
type Transaction struct {
	ID                 *ID                `json:"id,omitempty"`
	RuleInstanceID     *ID                `json:"rule_instance_id,omitempty"`
	Author             *string            `json:"author"`
	AuthorDeviceID     *string            `json:"author_device_id,omitempty"`
	AuthorDeviceLatlng *string            `json:"author_device_latlng,omitempty"` // pg point type
	AuthorRole         *string            `json:"author_role"`
	EquilibriumTime    *string            `json:"equilibrium_time"`
	SumValue           *string            `json:"sum_value"`
	TransactionItems   []*TransactionItem `json:"transaction_items"`
}

// TransactionItem transacts goods and services
type TransactionItem struct {
	ID                     *ID                 `json:"id,omitempty"`
	TransactionID          *ID                 `json:"transaction_id,omitempty"`
	ItemID                 *string             `json:"item_id"`
	Price                  decimal.Decimal     `json:"price"`
	Quantity               decimal.Decimal     `json:"quantity"`
	DebitorFirst           *bool               `json:"debitor_first,omitempty"`
	RuleInstanceID         *ID                 `json:"rule_instance_id"`
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
	Approvers              []*Approver         `json:"approvers,omitempty"`
}

// Approver approves a transaction item
type Approver struct {
	ID                *ID     `json:"id,omitempty"`
	RuleInstanceID    *ID     `json:"rule_instance_id,omitempty"`
	TransactionID     *ID     `json:"transaction_id,omitempty"`
	TransactionItemID *ID     `json:"transaction_item_id,omitempty"`
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

type IntraTransactions struct {
	IntraEvent
	Transaction []*Transaction `json:"transactions"`
}

type RequestApprove struct {
	IntraEvent
	ID          *ID     `json:"id"`
	AccountName *string `json:"account_name"`
	AccountRole *string `json:"account_role"`
}

type AccountProfileID struct {
	ID          *ID     `json:"id"`
	AccountName *string `json:"account_name"`
}

type QueryByAccount struct {
	IntraEvent
	AccountName *string `json:"account_name"`
}

type QueryByID struct {
	IntraEvent
	ID *ID `json:"id"`
}
