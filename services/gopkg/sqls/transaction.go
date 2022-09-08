package sqls

import (
	"errors"
	"fmt"
	"strings"

	"github.com/huandu/go-sqlbuilder"
	"github.com/shopspring/decimal"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

const (
	sqlParam            = "$?"
	trItemAliasPrefix   = "i"
	approvalAliasPrefix = "a"
	trAlias             = "insert_transaction"
)

type TransactionSQLs struct {
	SQLBuilder
}

func (t *TransactionSQLs) InsertTransactionSQL(
	trRuleInstanceID *types.ID,
	trAuthor *string,
	trDeviceID *string,
	trAuthorDeviceLatlng *string,
	trAuthorRole types.Role,
	trEquilibriumTime *string,
	trSumValue *decimal.NullDecimal,
) sqlbuilder.Builder {
	t.Init()
	t.ib.InsertInto("transaction")
	t.ib.Cols(
		"rule_instance_id",
		"author",
		"author_device_id",
		"author_device_latlng",
		"author_role",
		"equilibrium_time",
		"sum_value",
	)

	t.ib.Values(
		trRuleInstanceID,
		trAuthor,
		trDeviceID,
		trAuthorDeviceLatlng,
		trAuthorRole.String(),
		trEquilibriumTime,
		trSumValue,
	)

	ret := sqlbuilder.Buildf("%v returning *", t.ib)
	return sqlbuilder.WithFlavor(ret, sqlbuilder.PostgreSQL)
}

func (t *TransactionSQLs) SelectTransactionByIDSQL(trID types.ID) (string, []interface{}) {
	t.Init()
	t.sb.Select("*")
	t.sb.From("transaction").
		Where(
			t.sb.Equal("id", trID),
		)
	return t.sb.BuildWithFlavor(sqlbuilder.PostgreSQL)
}

func (t *TransactionSQLs) SelectTransactionsByIDsSQL(trIDs types.IDs) (string, []interface{}) {
	t.Init()

	// sql builder wants interface slice
	iIDs := IDtoInterfaceSlice(trIDs)

	t.sb.Select("*")
	t.sb.From("transaction").
		Where(
			t.sb.In("id", iIDs...),
		)

	return t.sb.BuildWithFlavor(sqlbuilder.PostgreSQL)
}

func (t *TransactionSQLs) UpdateTransactionByIDSQL(trID *types.ID, equilTime string) (string, []interface{}) {
	t.Init()
	t.ub.Update("transaction").
		Set(
			t.ub.Assign("equilibrium_time", equilTime),
		).
		Where(
			t.ub.Equal("id", *trID),
		)
	// format with ub arg only to avoid
	// can't scan into dest[0]: unable to assign to *int32
	retID := sqlbuilder.Buildf("%v returning *", t.ub)
	return sqlbuilder.WithFlavor(retID, sqlbuilder.PostgreSQL).Build()
}

// => i_0, transaction_item insert index 0
func (TransactionSQLs) buildAuxStmtName(prefix string, idx int) string {
	return fmt.Sprintf("%v_%v", prefix, idx)
}

func (TransactionSQLs) buildAuxStmt(stmtName string) string {
	return fmt.Sprintf("%v AS (%v), ", stmtName, sqlParam)
}

func (t TransactionSQLs) buildWithSQL(trItems types.TransactionItems) (string, error) {
	t.Init()

	cte := fmt.Sprintf("WITH %v AS (%v), ", trAlias, sqlParam)

	for i, u := range trItems {

		trItemName := t.buildAuxStmtName(trItemAliasPrefix, i) // i_0
		cte += t.buildAuxStmt(trItemName)                      // i_0 AS ($?),

		if len(u.Approvals) == 0 {
			return "", errors.New("buildWithSQL: 0 approvals")
		}

		apprName := t.buildAuxStmtName(approvalAliasPrefix, i) // a_0
		cte += t.buildAuxStmt(apprName)                        // a_0 AS ($?),
	}

	// end with clause by removing last comma
	cte = strings.TrimSuffix(cte, ", ")

	// return inserted transaction.id as final query
	cte += fmt.Sprintf(" SELECT id FROM %v", trAlias)

	return cte, nil
}

func (t TransactionSQLs) CreateTransactionRequestSQL(tr *types.Transaction) (string, []interface{}, error) {

	var role types.Role
	err := role.Set(*tr.AuthorRole)
	if err != nil {
		return "", nil, err
	}

	// create transaction sql builder
	insTr := TransactionSQLs{}

	// create insert transaction sql
	insTrBuilder := insTr.InsertTransactionSQL(
		nil,
		tr.Author,
		nil,
		nil,
		role,
		nil,
		tr.SumValue,
	)

	// build with sql
	with, err := insTr.buildWithSQL(tr.TransactionItems)
	if err != nil {
		return "", nil, err
	}

	// init 'WITH' sql builder list
	builders := make([]interface{}, 0)

	// add transaction sql builder as first builder
	builders = append(builders, insTrBuilder)

	// create a "select id from insert_transaction" auxiliary statement sql builder
	trAuxStmt := WithSQLs{}
	trAuxStmtBuilder := trAuxStmt.SelectIDFromInsertTransactionCTEAuxStmt()

	// add to 'WITH' sql builders list by looping
	// through transaction items and adding
	// transaction item sql builders
	for i, v := range tr.TransactionItems {

		// create sql builder from constructor
		insTrItem := TransactionItemSQLs{}

		// create transaction_item sql builder
		trItemBuilder := insTrItem.InsertTrItemSQL(v, trAuxStmtBuilder)

		// add transction_item sql builder to list
		builders = append(builders, trItemBuilder)

		// approvals need to reference the preceding transaction_item id
		// in the cte as theyre inserted, e.g. t_01 AS ...
		trItemAliasName := t.buildAuxStmtName(trItemAliasPrefix, i)

		// create transaction item auxiliary statement for reference by approval inserts
		// e.g. (select id from t_01)
		trItemAlias := WithSQLs{}
		trItemAliasBuilder := trItemAlias.SelectIDFromTrItemAliasCTEAuxStmt(trItemAliasName)

		// create an approval insert sql builder
		ibAppr := ApprovalSQLs{}

		// create approval sql builder
		apprBuilder := ibAppr.InsertApprovalsSQL(v.Approvals, trAuxStmtBuilder, trItemAliasBuilder)

		// add approval sql builder to list
		builders = append(builders, apprBuilder)
	}

	// build 'WITH' sql that includes rows for:
	// 1. transaction
	// 2. transaction_item
	// 3. approval
	insSQL, insArgs := sqlbuilder.Build(with, builders...).BuildWithFlavor(sqlbuilder.PostgreSQL)

	return insSQL, insArgs, nil
}

func (TransactionSQLs) SelectLastNReqsOrTransByAccount(
	accountName string,
	isAllApproved bool,
	recordLimit string,
) (string, []interface{}) {

	// postgres boolean as $2 argument placeholder throws
	// ERROR: syntax error at or near "$2" (SQLSTATE 42601)
	// temp workaround:
	isTransaction := "TRUE"
	if !isAllApproved {
		isTransaction = "FALSE"
	}

	return fmt.Sprintf(`WITH transactions AS (
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
		WHERE all_approved IS %s
		LIMIT $2
	);`, isTransaction), []interface{}{accountName, recordLimit}
}

func NewTransactionSQLs() *TransactionSQLs {
	return new(TransactionSQLs)
}
