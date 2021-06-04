const sql = `
SELECT *
FROM account_profile
WHERE account_name = $1;`;

export default sql;