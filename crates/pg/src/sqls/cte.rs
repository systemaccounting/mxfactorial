use crate::sqls::common::*;

pub fn select_id_from_insert_transaction_cte_aux_stmt_sql() -> String {
    let column = "id";
    let aux_table_name = "insert_transaction";
    format!("({} {} {} {})", SELECT, column, FROM, aux_table_name,)
}

pub fn select_id_from_tr_item_alias_cte_aux_stmt_sql(alias: String) -> String {
    let column = "id";
    format!("({} {} {} {})", SELECT, column, FROM, alias,)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_creates_a_select_id_from_insert_transaction_cte_aux_stmt_sql() {
        assert_eq!(
            select_id_from_insert_transaction_cte_aux_stmt_sql(),
            "(SELECT id FROM insert_transaction)"
        );
    }

    #[test]
    fn it_creates_a_select_id_from_tr_item_alias_cte_aux_stmt_sql() {
        let alias = "t_01";
        assert_eq!(
            select_id_from_tr_item_alias_cte_aux_stmt_sql(alias.to_string()),
            "(SELECT id FROM t_01)"
        );
    }
}
