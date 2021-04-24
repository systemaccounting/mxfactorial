package sqlbuilder

import sqlb "github.com/huandu/go-sqlbuilder"

func SelectProfileIDsByAccount(accountNames []interface{}) (string, []interface{}) {
	sb := sqlb.PostgreSQL.NewSelectBuilder()
	sb.Select(
		"id",
		"account_name",
	)
	sb.From("account_profile").
		Where(
			sb.In("account_name", accountNames...),
			sb.IsNull("removal_time"),
		)
	return sb.Build()
}
