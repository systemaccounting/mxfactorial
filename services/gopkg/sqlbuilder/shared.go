package sqlbuilder

import sqlb "github.com/huandu/go-sqlbuilder"

func NullSQLFromStrPtr(s *string) interface{} {
	if s == nil {
		return sqlb.Raw("NULL")
	}
	if *s == "" {
		return sqlb.Raw("NULL")
	}
	return sqlb.Raw(*s)
}
