package types

// Approval approves a transaction item
type Approval struct {
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
