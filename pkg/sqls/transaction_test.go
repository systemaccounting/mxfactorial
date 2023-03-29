package sqls

import (
	"fmt"
	"os"
	"testing"

	"github.com/google/go-cmp/cmp"
	"github.com/shopspring/decimal"
	"github.com/systemaccounting/mxfactorial/pkg/testdata"
	"github.com/systemaccounting/mxfactorial/pkg/types"
)

func TestInsertTransactionSQL(t *testing.T) {

	testacctid := types.ID("1")
	testauthor := "testauthor"
	testdeviceid := "testdeviceid"
	testauthdevicelatlng := "(1,2)"
	testauthrole := types.Role(1)
	testequilibriumtime := "2022-06-24T03:09:32.772Z"
	testsumvalue := &decimal.NullDecimal{}

	want1 := "INSERT INTO transaction (rule_instance_id, author, author_device_id, author_device_latlng, author_role, equilibrium_time, sum_value) VALUES ($1, $2, $3, $4, $5, $6, $7) returning *"
	want2 := []interface{}{
		&testacctid,
		&testauthor,
		&testdeviceid,
		&testauthdevicelatlng,
		testauthrole.String(),
		&testequilibriumtime,
		testsumvalue,
	}

	testbuilder := TransactionSQLs{}
	got1, got2 := testbuilder.InsertTransactionSQL(
		&testacctid,
		&testauthor,
		&testdeviceid,
		&testauthdevicelatlng,
		testauthrole,
		&testequilibriumtime,
		testsumvalue,
	).Build()

	if got1 != want1 {
		t.Errorf("got %v, want %v", got1, want1)
	}

	if !cmp.Equal(got2, want2) {
		t.Errorf("got %v, want %v", got2, want2)
	}
}

func TestSelectTransactionByIDSQL(t *testing.T) {

	testtrid := types.ID("1")

	want1 := "SELECT * FROM transaction WHERE id = $1"
	want2 := []interface{}{testtrid}

	testbuilder := TransactionSQLs{}
	got1, got2 := testbuilder.SelectTransactionByIDSQL(testtrid)

	if got1 != want1 {
		t.Errorf("got %v, want %v", got1, want1)
	}

	if !cmp.Equal(got2, want2) {
		t.Errorf("got %v, want %v", got2, want2)
	}
}

func TestSelectTransactionsByIDsSQL(t *testing.T) {

	testtrid1 := types.ID("1")
	testtrid2 := types.ID("2")
	testtrids := types.IDs{&testtrid1, &testtrid2}

	want1 := "SELECT * FROM transaction WHERE id IN ($1, $2)"
	want2 := []interface{}{&testtrid1, &testtrid2}

	testbuilder := TransactionSQLs{}
	got1, got2 := testbuilder.SelectTransactionsByIDsSQL(testtrids)

	if got1 != want1 {
		t.Errorf("got %v, want %v", got1, want1)
	}

	if !cmp.Equal(got2, want2) {
		t.Errorf("got %v, want %v", got2, want2)
	}
}

func TestUpdateTransactionByIDSQL(t *testing.T) {

	testtrid := types.ID("1")
	testequiltime := "testequiltime"

	want1 := "UPDATE transaction SET equilibrium_time = $1 WHERE id = $2 returning *"
	want2 := []interface{}{testequiltime, testtrid}

	testbuilder := TransactionSQLs{}
	got1, got2 := testbuilder.UpdateTransactionByIDSQL(&testtrid, testequiltime)

	if got1 != want1 {
		t.Errorf("got %v, want %v", got1, want1)
	}

	if !cmp.Equal(got2, want2) {
		t.Errorf("got %v, want %v", got2, want2)
	}
}

func TestBuildAuxStmtName(t *testing.T) {
	want := "i_1"
	testbuilder := TransactionSQLs{}
	got := testbuilder.buildAuxStmtName(trItemAliasPrefix, 1)
	if got != want {
		t.Errorf("got %v, want %v", got, want)
	}
}

func TestBuildAuxStmt(t *testing.T) {
	testbuilder := TransactionSQLs{}
	teststmtname := testbuilder.buildAuxStmtName(trItemAliasPrefix, 1)

	want := "i_1 AS ($?), "
	got := testbuilder.buildAuxStmt(teststmtname)

	if got != want {
		t.Errorf("got %v, want %v", got, want)
	}
}

func TestBuildWithSQL(t *testing.T) {

	testtransaction := testdata.GetTestTransaction("../testdata/transWTimes.json")
	testtritems := testtransaction.TransactionItems

	testbuilder := TransactionSQLs{}
	got, err := testbuilder.buildWithSQL(testtritems)

	if err != nil {
		t.Errorf("TestBuildWithSQL error: %v", err)
	}

	want := "WITH insert_transaction AS ($?), i_0 AS ($?), a_0 AS ($?), i_1 AS ($?), a_1 AS ($?), i_2 AS ($?), a_2 AS ($?), i_3 AS ($?), a_3 AS ($?), i_4 AS ($?), a_4 AS ($?), i_5 AS ($?), a_5 AS ($?) SELECT id FROM insert_transaction"
	if got != want {
		t.Errorf("got %v, want %v", got, want)
	}
}

func TestBuildWithSQLErr(t *testing.T) {

	testtransaction := testdata.GetTestTransaction("../testdata/transWTimes.json")
	testtritems := testtransaction.TransactionItems

	// hit error by setting empty approvals
	testtritems[0].Approvals = types.Approvals{}

	testbuilder := TransactionSQLs{}
	_, got := testbuilder.buildWithSQL(testtritems)

	if got == nil {
		t.Errorf("got nil, want %v", got)
	}

	want := "buildWithSQL: 0 approvals"

	if got.Error() != want {
		t.Errorf("got %v, want %v", got, want)
	}
}

func TestCreateTransactionRequestSQL(t *testing.T) {
	testdata := testdata.GetTestTransactions("../testdata/requests.json")
	testtransaction := testdata[0].Transaction

	testbuilder := TransactionSQLs{}
	got1, got2, err := testbuilder.CreateTransactionRequestSQL(testtransaction)
	if err != nil {
		t.Errorf("CreateTransactionRequestSQL error: %v", err)
	}

	golden1, err := os.ReadFile("./testdata/transaction_query.golden")
	if err != nil {
		t.Errorf("Readfile error: %v", err)
	}
	want1 := string(golden1)

	if got1 != want1 {
		t.Errorf("got %v, want %v", got1, want1)
	}

	var testauthordevicelatlng *string
	var testequiltime *string

	want2 := []interface{}{}

	// 1. add transaction values
	want2 = append(want2,
		testtransaction.RuleInstanceID,
		testtransaction.Author,
		testtransaction.AuthorDeviceID,
		// cadet todo: switch InsertTransactionSQL trAuthorDeviceLatlng param to LatLng type
		testauthordevicelatlng,
		*testtransaction.AuthorRole,
		// cadet todo: switch InsertTransactionSQL trEquilibriumTime param to TZTime type
		testequiltime,
		testtransaction.SumValue)

	// 2. add transaction item values
	for _, v := range testtransaction.TransactionItems {
		want2 = append(want2,
			v.ItemID,
			v.Price,
			v.Quantity,
			v.DebitorFirst,
			v.RuleInstanceID,
			v.RuleExecIDs,
			v.UnitOfMeasurement,
			v.UnitsMeasured,
			v.Debitor,
			v.Creditor,
			v.DebitorProfileID,
			v.CreditorProfileID,
			v.DebitorApprovalTime,
			v.CreditorApprovalTime,
			v.DebitorExpirationTime,
			v.CreditorExpirationTime,
		)

		// 3. add approval values
		for _, w := range v.Approvals {
			want2 = append(want2,
				w.RuleInstanceID,
				w.AccountName,
				w.AccountRole,
				w.DeviceID,
				w.DeviceLatlng,
				w.ApprovalTime,
				w.ExpirationTime,
			)
		}
	}

	if !cmp.Equal(got2, want2) {
		t.Errorf("got %v, want %v", got2, want2)
	}
}

func TestCreateTransactionRequestSQLErr1(t *testing.T) {
	testdata := testdata.GetTestTransactions("../testdata/requests.json")
	testtransaction := testdata[0].Transaction

	testauthorrole := "doesntexist"
	testtransaction.AuthorRole = &testauthorrole

	want := fmt.Sprintf("%q neither debitor or creditor", testauthorrole)

	testbuilder := TransactionSQLs{}
	_, _, got := testbuilder.CreateTransactionRequestSQL(testtransaction)
	if got == nil {
		t.Errorf("got nil, want %v", want)
	}

	if got.Error() != want {
		t.Errorf("got nil, want %v", want)
	}
}

func TestCreateTransactionRequestSQLErr2(t *testing.T) {
	testdata := testdata.GetTestTransactions("../testdata/requests.json")
	testtransaction := testdata[0].Transaction

	// hit error by setting empty approvals
	testtransaction.TransactionItems[0].Approvals = types.Approvals{}

	want := "buildWithSQL: 0 approvals"

	testbuilder := TransactionSQLs{}
	_, _, got := testbuilder.CreateTransactionRequestSQL(testtransaction)
	if got == nil {
		t.Errorf("got nil, want %v", want)
	}

	if got.Error() != want {
		t.Errorf("got nil, want %v", want)
	}
}

func TestSelectLastNReqsOrTransByAccountTrue(t *testing.T) {
	testacct := "testacct"
	testisallapproved := true
	testrecordlimit := "1"
	testbuilder := TransactionSQLs{}
	got1, got2 := testbuilder.SelectLastNReqsOrTransByAccount(testacct, testisallapproved, testrecordlimit)

	want1 := `WITH transactions AS (
		SELECT transaction_id, every(approval_time IS NOT NULL) AS all_approved
		FROM approval
		WHERE transaction_id IN (
			SELECT DISTINCT(transaction_id)
			FROM approval
			WHERE account_name = $1
			ORDER BY transaction_id
			DESC
		)
		GROUP BY transaction_id
		ORDER BY transaction_id
		DESC
	)
	SELECT * FROM transaction
	WHERE id IN (
		SELECT transaction_id
		FROM transactions
		WHERE all_approved IS TRUE
		LIMIT $2
	);`
	want2 := []interface{}{testacct, testrecordlimit}

	if got1 != want1 {
		t.Errorf("got %v, want %v", got1, want1)
	}

	if !cmp.Equal(got2, want2) {
		t.Errorf("got %v, want %v", got2, want2)
	}
}

func TestSelectLastNReqsOrTransByAccountFalse(t *testing.T) {
	testacct := "testacct"
	testisallapproved := false
	testrecordlimit := "1"
	testbuilder := TransactionSQLs{}
	got1, got2 := testbuilder.SelectLastNReqsOrTransByAccount(testacct, testisallapproved, testrecordlimit)

	want1 := `WITH transactions AS (
		SELECT transaction_id, every(approval_time IS NOT NULL) AS all_approved
		FROM approval
		WHERE transaction_id IN (
			SELECT DISTINCT(transaction_id)
			FROM approval
			WHERE account_name = $1
			ORDER BY transaction_id
			DESC
		)
		GROUP BY transaction_id
		ORDER BY transaction_id
		DESC
	)
	SELECT * FROM transaction
	WHERE id IN (
		SELECT transaction_id
		FROM transactions
		WHERE all_approved IS FALSE
		LIMIT $2
	);`
	want2 := []interface{}{testacct, testrecordlimit}

	if got1 != want1 {
		t.Errorf("got %v, want %v", got1, want1)
	}

	if !cmp.Equal(got2, want2) {
		t.Errorf("got %v, want %v", got2, want2)
	}
}
