package sqls

import (
	"github.com/huandu/go-sqlbuilder"
	"github.com/systemaccounting/mxfactorial/pkg/types"
)

type Builder = sqlbuilder.Builder

type SQLBuilder struct {
	sb *sqlbuilder.SelectBuilder
	ib *sqlbuilder.InsertBuilder
	ub *sqlbuilder.UpdateBuilder
	db *sqlbuilder.DeleteBuilder
}

func (s *SQLBuilder) Init() {
	s.sb = sqlbuilder.NewSelectBuilder()
	s.ib = sqlbuilder.NewInsertBuilder()
	s.ub = sqlbuilder.NewUpdateBuilder()
	s.db = sqlbuilder.NewDeleteBuilder()
}

func stringToInterfaceSlice(s []string) []interface{} {
	i := []interface{}{}
	for _, v := range s {
		i = append(i, v)
	}
	return i
}

func IDtoInterfaceSlice(IDs types.IDs) []interface{} {
	i := []interface{}{}
	for _, v := range IDs {
		i = append(i, v)
	}
	return i
}
