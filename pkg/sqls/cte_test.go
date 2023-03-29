package sqls

import (
	"fmt"
	"testing"
)

func TestSelectIDFromInsertTransactionCTEAuxStmt(t *testing.T) {
	testsqlb := WithSQLs{}
	got1, got2 := testsqlb.SelectIDFromInsertTransactionCTEAuxStmt().Build()
	want1 := "SELECT id FROM insert_transaction"
	if got1 != want1 {
		t.Errorf("got %v, want %v", got1, want1)
	}
	if len(got2) != 0 {
		t.Errorf("got %v, want 0 len slice", got2)
	}
}

func TestSelectIDFromTrItemAliasCTEAuxStmt(t *testing.T) {
	testsqlb := WithSQLs{}
	testalias := "t_01"
	got1, got2 := testsqlb.SelectIDFromTrItemAliasCTEAuxStmt(testalias).Build()
	want1 := fmt.Sprintf("SELECT id FROM %s", testalias)
	if got1 != want1 {
		t.Errorf("got %v, want %v", got1, want1)
	}
	if len(got2) != 0 {
		t.Errorf("got %v, want 0 len slice", got2)
	}
}
