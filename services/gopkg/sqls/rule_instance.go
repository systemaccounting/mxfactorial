package sqls

import "github.com/huandu/go-sqlbuilder"

type IRuleInstanceSQLs interface {
	SelectRuleInstanceSQL(string, string, string, string, string, string) (string, []interface{})
	InsertRuleInstanceSQL(string, string, string, string, string, string) (string, []interface{})
}

type RuleInstanceSQLs struct {
	SQLBuilder
}

func (r *RuleInstanceSQLs) SelectRuleInstanceSQL(
	ruleType,
	ruleName,
	ruleInstanceName,
	accountRole,
	accountName,
	variableValuesArray string,
) (string, []interface{}) {
	r.Init()
	r.sb.Select(
		"rule_type",
		"rule_name",
		"rule_instance_name",
		"account_role",
		"account_name",
		"variable_values",
	)
	r.sb.From("rule_instance").
		Where(
			r.sb.Equal("rule_type", ruleType),
			r.sb.Equal("rule_name", ruleName),
			r.sb.Equal("rule_instance_name", ruleInstanceName),
			r.sb.Equal("account_role", accountRole),
			r.sb.Equal("account_name", accountName),
			r.sb.Equal("variable_values", variableValuesArray),
		)
	return r.sb.BuildWithFlavor(sqlbuilder.PostgreSQL)
}

func (r *RuleInstanceSQLs) InsertRuleInstanceSQL(
	ruleType,
	ruleName,
	ruleInstanceName,
	accountRole,
	accountName,
	variableValues string,
) (string, []interface{}) {
	r.Init()
	r.ib.InsertInto("rule_instance")
	r.ib.Cols(
		"rule_type",
		"rule_name",
		"rule_instance_name",
		"account_role",
		"account_name",
		"variable_values",
	)
	r.ib.Values(
		ruleType,
		ruleName,
		ruleInstanceName,
		accountRole,
		accountName,
		variableValues,
	)
	return r.ib.BuildWithFlavor(sqlbuilder.PostgreSQL)
}
