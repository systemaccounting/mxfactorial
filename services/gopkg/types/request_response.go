package types

// IntraEvent is embedded for
// post-auth internal service requests
type IntraEvent struct {
	AuthAccount string `json:"auth_account"`
}

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
