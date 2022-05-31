package sqlbuilder

import (
	"errors"
	"fmt"
	"strings"

	sqlb "github.com/huandu/go-sqlbuilder"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

const (
	sqlParam            = "$?"
	trItemAliasPrefix   = "i"
	approvalAliasPrefix = "a"
	trAlias             = "insert_transaction"
)

func InsertTransactionSQL(
	trRuleInstanceID *types.ID,
	trAuthor *string,
	trDeviceID *string,
	trAuthorDeviceLatlng *string,
	trAuthorRole types.Role,
	trEquilibriumTime *string,
	trSumValue *string,
) sqlb.Builder {

	ib := sqlb.PostgreSQL.NewInsertBuilder()
	ib.InsertInto("transaction")
	ib.Cols(
		"rule_instance_id",
		"author",
		"author_device_id",
		"author_device_latlng",
		"author_role",
		"equilibrium_time",
		"sum_value",
	)

	ib.Values(
		trRuleInstanceID,
		trAuthor,
		trDeviceID,
		trAuthorDeviceLatlng,
		trAuthorRole.String(),
		trEquilibriumTime,
		trSumValue,
	)
	return sqlb.Buildf("%v returning *", ib)
}

func SelectTransactionByIDSQL(trID *types.ID) (string, []interface{}) {
	sb := sqlb.PostgreSQL.NewSelectBuilder()
	sb.Select("*")
	sb.From("transaction").
		Where(
			sb.Equal("id", *trID),
		)
	return sb.Build()
}

func SelectTransactionsByIDsSQL(IDs []interface{}) (string, []interface{}) {
	sb := sqlb.PostgreSQL.NewSelectBuilder()
	sb.Select("*")
	sb.From("transaction").
		Where(
			sb.In("id", IDs...),
		)
	return sb.Build()
}

func UpdateTransactionByIDSQL(trID *types.ID, equilTime string) (string, []interface{}) {
	ub := sqlb.PostgreSQL.NewUpdateBuilder()
	ub.Update("transaction").
		Set(
			ub.Assign("equilibrium_time", equilTime),
		).
		Where(
			ub.Equal("id", *trID),
		)
	// format with ub arg only to avoid
	// can't scan into dest[0]: unable to assign to *int32
	retID := sqlb.Buildf("%v returning *", ub)
	return sqlb.WithFlavor(retID, sqlb.PostgreSQL).Build()
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

func CreateTransactionRequestSQL(tr *types.Transaction) (string, []interface{}, error) {

	var role types.Role
	err := role.Set(*tr.AuthorRole)
	if err != nil {
		return "", nil, err
	}

	insTr := InsertTransactionSQL(
		nil,
		tr.Author,
		nil,
		nil,
		role,
		nil,
		tr.SumValue,
	)

	with, err := buildWithSQL(tr.TransactionItems)
	if err != nil {
		return "", nil, err
	}

	builders := make([]interface{}, 0)
	builders = append(builders, insTr)

	for i, v := range tr.TransactionItems {

		// create transaction_item sql builder
		trItemBuilder := InsertTrItemSQL(v)
		// add transction_item sql builder to list
		builders = append(builders, trItemBuilder)

		// approvals need to reference the preceding transaction_item id
		// in the cte as theyre inserted, e.g. t_01 AS ... (select id from t_01)
		trItemAlias := buildAuxStmtName(trItemAliasPrefix, i)

		// create approval sql builder
		apprBuilder := InsertApprovalsSQL(trItemAlias, v.Approvals)

		// add approval sql builder to list
		builders = append(builders, apprBuilder)
	}

	insSQL, insArgs := sqlb.Build(with, builders...).BuildWithFlavor(sqlb.PostgreSQL)

	return insSQL, insArgs, nil
}
