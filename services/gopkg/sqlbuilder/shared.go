package sqlbuilder

import gsqlb "github.com/huandu/go-sqlbuilder"

func NullSQLFromStrPtr(s *string) interface{} {
	if s == nil {
		return gsqlb.Raw("NULL")
	}
	if *s == "" {
		return gsqlb.Raw("NULL")
	}
	return gsqlb.Raw(*s)
}
