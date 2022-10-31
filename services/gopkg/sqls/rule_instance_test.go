package sqls

import (
	"testing"

	"github.com/google/go-cmp/cmp"
)

func TestSelectRuleInstanceSQL(t *testing.T) {
	testruletype := "testruletype"
	testrulename := "testrulename"
	testruleinstancename := "testruleinstancename"
	testacctrole := "creditor"
	testacctname := "testruletype"
	testvariables := "{'testvalue'}"

	want1 := "SELECT rule_type, rule_name, rule_instance_name, account_role, account_name, variable_values FROM rule_instance WHERE rule_type = $1 AND rule_name = $2 AND rule_instance_name = $3 AND account_role = $4 AND account_name = $5 AND variable_values = $6"
	want2 := []interface{}{
		testruletype,
		testrulename,
		testruleinstancename,
		testacctrole,
		testacctname,
		testvariables,
	}

	testbuilder := RuleInstanceSQLs{}
	got1, got2 := testbuilder.SelectRuleInstanceSQL(
		testruletype,
		testrulename,
		testruleinstancename,
		testacctrole,
		testacctname,
		testvariables,
	)
	if got1 != want1 {
		t.Errorf("got %v, want %v", got1, want1)
	}
	if !cmp.Equal(got2, want2) {
		t.Errorf("got %v, want %v", got2, want2)
	}
}
func TestInsertRuleInstanceSQL(t *testing.T) {

	testruletype := "testruletype"
	testrulename := "testrulename"
	testruleinstancename := "testruleinstancename"
	testacctrole := "creditor"
	testacctname := "testruletype"
	testvariables := "{'testvalue'}"

	testbuilder := RuleInstanceSQLs{}
	want1 := "INSERT INTO rule_instance (rule_type, rule_name, rule_instance_name, account_role, account_name, variable_values) VALUES ($1, $2, $3, $4, $5, $6)"
	want2 := []interface{}{
		testruletype,
		testrulename,
		testruleinstancename,
		testacctrole,
		testacctname,
		testvariables,
	}
	got1, got2 := testbuilder.InsertRuleInstanceSQL(
		testruletype,
		testrulename,
		testruleinstancename,
		testacctrole,
		testacctname,
		testvariables,
	)
	if got1 != want1 {
		t.Errorf("got %v, want %v", got1, want1)
	}
	if !cmp.Equal(got2, want2) {
		t.Errorf("got %v, want %v", got2, want2)
	}
}
