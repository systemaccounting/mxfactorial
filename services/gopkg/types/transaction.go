package types

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
