package sqlbuilder

import (
	sqlb "github.com/huandu/go-sqlbuilder"
)

func SelectRuleInstanceSQL(
	ruleType,
	ruleName,
	ruleInstanceName,
	accountRole,
	accountName,
	variableValuesArray string,
) (string, []interface{}) {
	sb := sqlb.PostgreSQL.NewSelectBuilder()
	sb.Select(
		"rule_type",
		"rule_name",
		"rule_instance_name",
		"account_role",
		"account_name",
		"variable_values",
	)
	sb.From("rule_instance").
		Where(
			sb.Equal("rule_type", ruleType),
			sb.Equal("rule_name", ruleName),
			sb.Equal("rule_instance_name", ruleInstanceName),
			sb.Equal("account_role", accountRole),
			sb.Equal("account_name", accountName),
			sb.Equal("variable_values", variableValuesArray),
		)
	return sb.Build()
}

func InsertRuleInstanceSQL(
	ruleType,
	ruleName,
	ruleInstanceName,
	accountRole,
	accountName,
	variableValues string,
) (string, []interface{}) {
	ib := sqlb.PostgreSQL.NewInsertBuilder()
	ib.InsertInto("rule_instance")
	ib.Cols(
		"rule_type",
		"rule_name",
		"rule_instance_name",
		"account_role",
		"account_name",
		"variable_values",
	)
	ib.Values(
		ruleType,
		ruleName,
		ruleInstanceName,
		accountRole,
		accountName,
		variableValues,
	)
	return ib.Build()
}
