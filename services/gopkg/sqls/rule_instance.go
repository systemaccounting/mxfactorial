package sqls

import "github.com/huandu/go-sqlbuilder"

func (b *BuildSelectSQL) SelectRuleInstanceSQL(
	ruleType,
	ruleName,
	ruleInstanceName,
	accountRole,
	accountName,
	variableValuesArray string,
) (string, []interface{}) {
	b.sb.Select(
		"rule_type",
		"rule_name",
		"rule_instance_name",
		"account_role",
		"account_name",
		"variable_values",
	)
	b.sb.From("rule_instance").
		Where(
			b.sb.Equal("rule_type", ruleType),
			b.sb.Equal("rule_name", ruleName),
			b.sb.Equal("rule_instance_name", ruleInstanceName),
			b.sb.Equal("account_role", accountRole),
			b.sb.Equal("account_name", accountName),
			b.sb.Equal("variable_values", variableValuesArray),
		)
	return b.sb.BuildWithFlavor(sqlbuilder.PostgreSQL)
}

func (b *BuildInsertSQL) InsertRuleInstanceSQL(
	ruleType,
	ruleName,
	ruleInstanceName,
	accountRole,
	accountName,
	variableValues string,
) (string, []interface{}) {
	b.ib.InsertInto("rule_instance")
	b.ib.Cols(
		"rule_type",
		"rule_name",
		"rule_instance_name",
		"account_role",
		"account_name",
		"variable_values",
	)
	b.ib.Values(
		ruleType,
		ruleName,
		ruleInstanceName,
		accountRole,
		accountName,
		variableValues,
	)
	return b.ib.BuildWithFlavor(sqlbuilder.PostgreSQL)
}
