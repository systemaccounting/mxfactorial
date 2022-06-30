package sqls

import "github.com/huandu/go-sqlbuilder"

func NullSQLFromStrPtr(s *string) interface{} {
	if s == nil {
		return sqlbuilder.Raw("NULL")
	}
	if *s == "" {
		return sqlbuilder.Raw("NULL")
	}
	return sqlbuilder.Raw(*s)
}
