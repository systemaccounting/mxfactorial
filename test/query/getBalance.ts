import { gql } from "graphql-request"

export const getBalance = gql`
query getBalance($account_name: String!, $auth_account: String!) {
  balance(account_name: $account_name, auth_account: $auth_account)
}`