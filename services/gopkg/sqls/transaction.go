package sqls

import (
	"errors"
	"fmt"
	"strings"

	"github.com/huandu/go-sqlbuilder"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

const (
	sqlParam            = "$?"
	trItemAliasPrefix   = "i"
	approvalAliasPrefix = "a"
	trAlias             = "insert_transaction"
)

func (b *BuildInsertSQL) InsertTransactionSQL(
	trRuleInstanceID *types.ID,
	trAuthor *string,
	trDeviceID *string,
	trAuthorDeviceLatlng *string,
	trAuthorRole types.Role,
	trEquilibriumTime *string,
	trSumValue *string,
) sqlbuilder.Builder {

	b.ib.InsertInto("transaction")
	b.ib.Cols(
		"rule_instance_id",
		"author",
		"author_device_id",
		"author_device_latlng",
		"author_role",
		"equilibrium_time",
		"sum_value",
	)

	b.ib.Values(
		trRuleInstanceID,
		trAuthor,
		trDeviceID,
		trAuthorDeviceLatlng,
		trAuthorRole.String(),
		trEquilibriumTime,
		trSumValue,
	)
	ret := sqlbuilder.Buildf("%v returning *", b.ib)
	return sqlbuilder.WithFlavor(ret, sqlbuilder.PostgreSQL)
}

func (b *BuildSelectSQL) SelectTransactionByIDSQL(trID *types.ID) (string, []interface{}) {
	b.sb.Select("*")
	b.sb.From("transaction").
		Where(
			b.sb.Equal("id", *trID),
		)
	return b.sb.BuildWithFlavor(sqlbuilder.PostgreSQL)
}

func (b *BuildSelectSQL) SelectTransactionsByIDsSQL(IDs []interface{}) (string, []interface{}) {
	b.sb.Select("*")
	b.sb.From("transaction").
		Where(
			b.sb.In("id", IDs...),
		)
	return b.sb.BuildWithFlavor(sqlbuilder.PostgreSQL)
}

func (b *BuildUpdateSQL) UpdateTransactionByIDSQL(trID *types.ID, equilTime string) (string, []interface{}) {
	b.ub.Update("transaction").
		Set(
			b.ub.Assign("equilibrium_time", equilTime),
		).
		Where(
			b.ub.Equal("id", *trID),
		)
	// format with ub arg only to avoid
	// can't scan into dest[0]: unable to assign to *int32
	retID := sqlbuilder.Buildf("%v returning *", b.ub)
	return sqlbuilder.WithFlavor(retID, sqlbuilder.PostgreSQL).Build()
}

// => i_0, transaction_item insert index 0
func buildAuxStmtName(prefix string, idx int) string {
	return fmt.Sprintf("%v_%v", prefix, idx)
}

func buildAuxStmt(stmtName string) string {
	return fmt.Sprintf("%v AS (%v), ", stmtName, sqlParam)
}

func buildWithSQL(trItems []*types.TransactionItem) (string, error) {

	cte := fmt.Sprintf("WITH %v AS (%v), ", trAlias, sqlParam)

	for i, u := range trItems {

		trItemName := buildAuxStmtName(trItemAliasPrefix, i) // i_0
		cte += buildAuxStmt(trItemName)                      // i_0 AS ($?),

		if len(u.Approvals) == 0 {
			return "", errors.New("buildWithSQL: 0 approvals")
		}

		apprName := buildAuxStmtName(approvalAliasPrefix, i) // a_0
		cte += buildAuxStmt(apprName)                        // a_0 AS ($?),
	}

	// end with clause by removing last comma
	cte = strings.TrimSuffix(cte, ", ")

	// return inserted transaction.id as final query
	cte += fmt.Sprintf(" SELECT id FROM %v", trAlias)

	return cte, nil
}

func CreateTransactionRequestSQL(
	ibc func() InsertSQLBuilder,
	sbc func() SelectSQLBuilder,
	b func(string, ...interface{}) sqlbuilder.Builder,
	tr *types.Transaction) (string, []interface{}, error) {

	var role types.Role
	err := role.Set(*tr.AuthorRole)
	if err != nil {
		return "", nil, err
	}

	// crete sql builder from constructor
	ibTr := ibc()

	// create insert transaction sql
	insTr := ibTr.InsertTransactionSQL(
		nil,
		tr.Author,
		nil,
		nil,
		role,
		nil,
		tr.SumValue,
	)

	// build with sql
	with, err := buildWithSQL(tr.TransactionItems)
	if err != nil {
		return "", nil, err
	}

	// init 'WITH' sql builder list
	builders := make([]interface{}, 0)
	// add transaction sql builder as first builder
	builders = append(builders, insTr)

	// add to 'WITH' sql builders list by looping
	// through transaction items and adding
	// transaction item sql builders
	for i, v := range tr.TransactionItems {

		// create sql builder from constructor
		ibTrItem := ibc()

		// create transaction_item sql builder
		trItemBuilder := ibTrItem.InsertTrItemSQL(sbc, v)
		// add transction_item sql builder to list
		builders = append(builders, trItemBuilder)

		// approvals need to reference the preceding transaction_item id
		// in the cte as theyre inserted, e.g. t_01 AS ... (select id from t_01)
		trItemAlias := buildAuxStmtName(trItemAliasPrefix, i)

		// create sql builder from constructor
		ibAppr := ibc()

		// create approval sql builder
		apprBuilder := ibAppr.InsertApprovalsSQL(sbc, trItemAlias, v.Approvals)

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

func SelectLastNReqsOrTransByAccount(
	accountName string,
	isAllApproved bool,
	recordLimit string) (string, []interface{}) {

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
