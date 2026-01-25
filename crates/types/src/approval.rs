use crate::account_role::AccountRole;
use crate::time::TZTime;
use async_graphql::{Object, SimpleObject};
use serde::{Deserialize, Serialize};
use thiserror::Error;
use tokio_postgres::{
    types::{FromSql, ToSql},
    Row,
};

#[derive(Error, Debug, Eq, PartialEq)]
pub enum ApprovalError {
    #[error("expiration time lapsed")]
    ExpirationTimeLapsed,
    #[error("previously approved")]
    PreviouslyApproved(TZTime),
    #[error("previously rejected")]
    PreviouslyRejected,
    #[error("zero approvals")] // transaction items always have at least one approval
    ZeroApprovals,
    #[error("zero approvals for {}", .0)]
    ZeroApprovalsForAccount(String),
    #[error("incomplete previous approval")]
    IncompletePreviousApproval,
    #[error("missing transaction_id in approval")]
    MissingTransactionId,
    #[error("missing transaction_item_id in approval")]
    MissingTransactionItemId,
}

#[derive(Eq, PartialEq, Debug, Deserialize, Serialize, FromSql, ToSql, Clone, SimpleObject)]
#[graphql(rename_fields = "snake_case")]
pub struct Approval {
    pub id: Option<String>,
    pub rule_instance_id: Option<String>,
    pub transaction_id: Option<String>,
    pub transaction_item_id: Option<String>,
    pub account_name: String,
    pub account_role: AccountRole,
    pub device_id: Option<String>,
    pub device_latlng: Option<String>,
    pub approval_time: Option<TZTime>,
    pub rejection_time: Option<TZTime>,
    pub expiration_time: Option<TZTime>,
}

impl Approval {
    pub fn test_pending(&self) -> Result<(), ApprovalError> {
        self.expiration_time_not_lapsed()?;
        self.previously_approved()?;
        self.previously_rejected()?;
        Ok(())
    }

    pub fn previously_approved(&self) -> Result<(), ApprovalError> {
        if let Some(time) = self.approval_time {
            Err(ApprovalError::PreviouslyApproved(time))
        } else {
            Ok(())
        }
    }

    pub fn expiration_time_not_lapsed(&self) -> Result<(), ApprovalError> {
        if self.expiration_time.is_none() || self.expiration_time.unwrap().not_lapsed() {
            Ok(())
        } else {
            Err(ApprovalError::ExpirationTimeLapsed)
        }
    }

    pub fn previously_rejected(&self) -> Result<(), ApprovalError> {
        if self.rejection_time.is_some() {
            Err(ApprovalError::PreviouslyRejected)
        } else {
            Ok(())
        }
    }
}

impl From<Row> for Approval {
    fn from(row: Row) -> Self {
        Self {
            id: row.get(0),
            rule_instance_id: row.get(1),
            transaction_id: row.get(2),
            transaction_item_id: row.get(3),
            account_name: row.get(4),
            account_role: row.get(5),
            device_id: row.get(6),
            device_latlng: row.get(7),
            approval_time: row.get(8),
            rejection_time: row.get(9),
            expiration_time: row.get(10),
        }
    }
}

#[derive(Default, Eq, PartialEq, Debug, Deserialize, Serialize, FromSql, ToSql, Clone)]
pub struct Approvals(pub Vec<Approval>);

impl IntoIterator for Approvals {
    type Item = Approval;
    type IntoIter = std::vec::IntoIter<Self::Item>;

    fn into_iter(self) -> Self::IntoIter {
        self.0.into_iter()
    }
}

impl From<Vec<Row>> for Approvals {
    fn from(rows: Vec<Row>) -> Self {
        Self(
            rows.into_iter()
                .map(Approval::from)
                .collect::<Vec<Approval>>(),
        )
    }
}

impl Approvals {
    pub fn get_approvals_per_role(&self, account_role: AccountRole) -> Self {
        Approvals(
            self.0
                .clone()
                .into_iter()
                .filter(|a| a.account_role == account_role)
                .collect(),
        )
    }

    pub fn account_role_approvals(
        &self,
        auth_account: &str,
        account_role: AccountRole,
    ) -> Result<Self, ApprovalError> {
        if self.is_empty() {
            return Err(ApprovalError::ZeroApprovalsForAccount(
                auth_account.to_string(),
            ));
        }

        let account_role_approvals = Approvals(
            self.0
                .clone()
                .into_iter()
                .filter(|a| a.account_name == auth_account && a.account_role == account_role)
                .collect(),
        );

        Ok(account_role_approvals)
    }

    pub fn len(&self) -> usize {
        self.0.len()
    }

    pub fn is_empty(&self) -> bool {
        self.0.is_empty()
    }

    pub fn test_pending_role_approval(
        &self,
        auth_account: &str,
        account_role: AccountRole,
    ) -> Result<(), ApprovalError> {
        let mut previously_approved = 0;

        let account_role_approvals = self.account_role_approvals(auth_account, account_role)?;

        if account_role_approvals.is_empty() {
            return Err(ApprovalError::ZeroApprovalsForAccount(
                auth_account.to_string(),
            ));
        }

        for approval in account_role_approvals.0.iter() {
            match approval.test_pending() {
                Ok(_) => (),
                Err(e) => match e {
                    ApprovalError::PreviouslyApproved(_) => {
                        previously_approved += 1;
                    }
                    _ => return Err(e),
                },
            }
        }

        if previously_approved == 0 {
            Ok(())
        } else if previously_approved == account_role_approvals.len() {
            let previously_approved_time = account_role_approvals.0[0].approval_time.unwrap();
            Err(ApprovalError::PreviouslyApproved(previously_approved_time))
        } else {
            Err(ApprovalError::IncompletePreviousApproval)
        }
    }

    pub fn filter_by_transaction_and_transaction_item(
        &self,
        transaction_id: i32,
        transaction_item_id: i32,
    ) -> Result<Self, ApprovalError> {
        let mut filtered = Approvals(Vec::new());

        for approval in self.0.iter() {
            if approval.transaction_id.is_none() {
                return Err(ApprovalError::MissingTransactionId);
            }
            if approval.transaction_item_id.is_none() {
                return Err(ApprovalError::MissingTransactionItemId);
            }

            let approval_transaction_id = approval
                .clone()
                .transaction_id
                .unwrap()
                .parse::<i32>()
                .unwrap();
            let approval_transaction_item_id = approval
                .clone()
                .transaction_item_id
                .unwrap()
                .parse::<i32>()
                .unwrap();

            if approval_transaction_id == transaction_id
                && approval_transaction_item_id == transaction_item_id
            {
                filtered.0.push(approval.clone());
            }
        }

        Ok(filtered)
    }
}

#[Object]
impl Approvals {
    async fn approvals(&self) -> Vec<Approval> {
        self.0.clone()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_tests_positive_for_expired_approval() {
        let test_approval = Approval {
            id: None,
            rule_instance_id: None,
            transaction_id: None,
            transaction_item_id: None,
            account_name: String::from("JoeCarter"),
            account_role: AccountRole::Debitor,
            device_id: None,
            device_latlng: None,
            approval_time: None,
            rejection_time: None,
            expiration_time: Some(TZTime::from("2023-10-30T04:56:56Z")),
        };

        assert_eq!(
            test_approval
                .expiration_time_not_lapsed()
                .unwrap_err()
                .to_string(),
            "expiration time lapsed"
        );
    }

    #[test]
    fn it_tests_negative_for_expired_approval() {
        let test_approval = Approval {
            id: None,
            rule_instance_id: None,
            transaction_id: None,
            transaction_item_id: None,
            account_name: String::from("JoeCarter"),
            account_role: AccountRole::Debitor,
            device_id: None,
            device_latlng: None,
            approval_time: None,
            rejection_time: None,
            expiration_time: Some(TZTime::from("3023-01-01T04:56:56Z")),
        };

        assert_eq!(test_approval.expiration_time_not_lapsed(), Ok(()));
    }

    #[test]
    fn it_tests_positive_for_previously_approved_approval() {
        let test_approval = Approval {
            id: None,
            rule_instance_id: None,
            transaction_id: None,
            transaction_item_id: None,
            account_name: String::from("JoeCarter"),
            account_role: AccountRole::Debitor,
            device_id: None,
            device_latlng: None,
            approval_time: Some(TZTime::from("2023-10-30T04:56:56Z")),
            rejection_time: None,
            expiration_time: None,
        };

        assert_eq!(
            test_approval.previously_approved().unwrap_err().to_string(),
            "previously approved"
        );
    }

    #[test]
    fn it_tests_negative_for_previously_approved_approval() {
        let test_approval = Approval {
            id: None,
            rule_instance_id: None,
            transaction_id: None,
            transaction_item_id: None,
            account_name: String::from("JoeCarter"),
            account_role: AccountRole::Debitor,
            device_id: None,
            device_latlng: None,
            approval_time: None,
            rejection_time: None,
            expiration_time: None,
        };

        assert_eq!(test_approval.previously_approved(), Ok(()));
    }

    #[test]
    fn it_tests_positive_for_previously_rejected_approval() {
        let test_approval = Approval {
            id: None,
            rule_instance_id: None,
            transaction_id: None,
            transaction_item_id: None,
            account_name: String::from("JoeCarter"),
            account_role: AccountRole::Debitor,
            device_id: None,
            device_latlng: None,
            approval_time: None,
            rejection_time: Some(TZTime::from("2023-10-30T04:56:56Z")),
            expiration_time: None,
        };

        assert_eq!(
            test_approval.previously_rejected().unwrap_err().to_string(),
            "previously rejected"
        );
    }

    #[test]
    fn it_tests_negative_for_previously_rejected_approval() {
        let test_approval = Approval {
            id: None,
            rule_instance_id: None,
            transaction_id: None,
            transaction_item_id: None,
            account_name: String::from("JoeCarter"),
            account_role: AccountRole::Debitor,
            device_id: None,
            device_latlng: None,
            approval_time: None,
            rejection_time: None,
            expiration_time: None,
        };

        assert_eq!(test_approval.previously_rejected(), Ok(()));
    }

    #[test]
    fn it_returns_account_role_approvals() {
        let want = Approvals(vec![Approval {
            id: None,
            rule_instance_id: None,
            transaction_id: None,
            transaction_item_id: None,
            account_name: String::from("JoeCarter"),
            account_role: AccountRole::Debitor,
            device_id: None,
            device_latlng: None,
            approval_time: None,
            rejection_time: None,
            expiration_time: None,
        }]);

        let test_approvals = Approvals(vec![
            want.0[0].clone(),
            Approval {
                id: None,
                rule_instance_id: None,
                transaction_id: None,
                transaction_item_id: None,
                account_name: String::from("GroceryCo"),
                account_role: AccountRole::Creditor,
                device_id: None,
                device_latlng: None,
                approval_time: None,
                rejection_time: None,
                expiration_time: None,
            },
        ]);

        let got = test_approvals
            .account_role_approvals("JoeCarter", AccountRole::Debitor)
            .unwrap();

        assert_eq!(got, want, "got {:?}, want {:?}", got, want)
    }

    #[test]
    fn it_gets_approvals_per_role() {
        let want = Approvals(vec![Approval {
            id: None,
            rule_instance_id: None,
            transaction_id: None,
            transaction_item_id: None,
            account_name: String::from("GroceryCo"),
            account_role: AccountRole::Creditor,
            device_id: None,
            device_latlng: None,
            approval_time: None,
            rejection_time: None,
            expiration_time: None,
        }]);

        let test_role = AccountRole::Creditor;

        let test_approvals = Approvals(vec![
            Approval {
                id: None,
                rule_instance_id: None,
                transaction_id: None,
                transaction_item_id: None,
                account_name: String::from("JoeCarter"),
                account_role: AccountRole::Debitor,
                device_id: None,
                device_latlng: None,
                approval_time: None,
                rejection_time: None,
                expiration_time: None,
            },
            want.0[0].clone(),
        ]);

        let got = test_approvals.get_approvals_per_role(test_role);

        assert_eq!(got, want, "got {:?}, want {:?}", got, want)
    }

    #[test]
    fn it_tests_positive_for_expiration_time_not_lapsed_on_an_approval() {
        let test_approval = Approval {
            id: None,
            rule_instance_id: None,
            transaction_id: None,
            transaction_item_id: None,
            account_name: String::from("JoeCarter"),
            account_role: AccountRole::Debitor,
            device_id: None,
            device_latlng: None,
            approval_time: None,
            rejection_time: None,
            expiration_time: Some(TZTime::from("3023-01-01T04:56:56Z")),
        };

        assert_eq!(test_approval.expiration_time_not_lapsed(), Ok(()));
    }

    #[test]
    fn it_tests_negative_for_expiration_time_not_lapsed_on_an_approval() {
        let test_approval = Approval {
            id: None,
            rule_instance_id: None,
            transaction_id: None,
            transaction_item_id: None,
            account_name: String::from("JoeCarter"),
            account_role: AccountRole::Debitor,
            device_id: None,
            device_latlng: None,
            approval_time: None,
            rejection_time: None,
            expiration_time: Some(TZTime::from("2023-10-30T04:56:56Z")),
        };

        assert_eq!(
            test_approval
                .expiration_time_not_lapsed()
                .unwrap_err()
                .to_string(),
            "expiration time lapsed"
        );
    }

    #[test]
    fn it_tests_positive_for_pending_role_approval_on_an_approval() {
        let test_approval = Approval {
            id: None,
            rule_instance_id: None,
            transaction_id: None,
            transaction_item_id: None,
            account_name: String::from("JoeCarter"),
            account_role: AccountRole::Debitor,
            device_id: None,
            device_latlng: None,
            approval_time: None,
            rejection_time: None,
            expiration_time: None,
        };

        match test_approval.test_pending() {
            Ok(_) => (),
            Err(e) => panic!("test failed with error: {:?}", e),
        }
    }

    #[test]
    fn it_tests_positive_for_previously_approved_approval_on_an_approval() {
        let test_approval = Approval {
            id: None,
            rule_instance_id: None,
            transaction_id: None,
            transaction_item_id: None,
            account_name: String::from("JoeCarter"),
            account_role: AccountRole::Debitor,
            device_id: None,
            device_latlng: None,
            approval_time: Some(TZTime::from("2023-10-30T04:56:56Z")),
            rejection_time: None,
            expiration_time: None,
        };
        assert_eq!(
            test_approval.test_pending().unwrap_err().to_string(),
            "previously approved"
        );
    }

    #[test]
    fn it_tests_positive_for_pending_role_approval_on_approvals() {
        let test_approvals = Approvals(vec![
            Approval {
                id: None,
                rule_instance_id: None,
                transaction_id: None,
                transaction_item_id: None,
                account_name: String::from("JoeCarter"),
                account_role: AccountRole::Debitor,
                device_id: None,
                device_latlng: None,
                approval_time: None,
                rejection_time: None,
                expiration_time: None,
            },
            Approval {
                id: None,
                rule_instance_id: None,
                transaction_id: None,
                transaction_item_id: None,
                account_name: String::from("GroceryCo"),
                account_role: AccountRole::Creditor,
                device_id: None,
                device_latlng: None,
                approval_time: None,
                rejection_time: None,
                expiration_time: None,
            },
        ]);

        match test_approvals.test_pending_role_approval("GroceryCo", AccountRole::Creditor) {
            Ok(_) => (),
            Err(e) => panic!("test failed with error: {:?}", e),
        }
    }

    #[test]
    fn it_tests_positive_for_previously_approved_on_approvals() {
        let test_approval_time = TZTime::from("2023-10-30T04:56:56Z");
        let test_approvals = Approvals(vec![
            Approval {
                id: None,
                rule_instance_id: None,
                transaction_id: None,
                transaction_item_id: None,
                account_name: String::from("JoeCarter"),
                account_role: AccountRole::Debitor,
                device_id: None,
                device_latlng: None,
                approval_time: Some(test_approval_time),
                rejection_time: None,
                expiration_time: None,
            },
            Approval {
                id: None,
                rule_instance_id: None,
                transaction_id: None,
                transaction_item_id: None,
                account_name: String::from("GroceryCo"),
                account_role: AccountRole::Creditor,
                device_id: None,
                device_latlng: None,
                approval_time: None,
                rejection_time: None,
                expiration_time: None,
            },
        ]);
        assert_eq!(
            test_approvals.test_pending_role_approval("JoeCarter", AccountRole::Debitor),
            Err(ApprovalError::PreviouslyApproved(test_approval_time)),
        );
    }

    #[test]
    fn it_will_filter_by_transaction_and_transaction_item() {
        let want = Approvals(vec![Approval {
            id: None,
            rule_instance_id: None,
            transaction_id: Some(String::from("1")),
            transaction_item_id: Some(String::from("1")),
            account_name: String::from("JoeCarter"),
            account_role: AccountRole::Debitor,
            device_id: None,
            device_latlng: None,
            approval_time: None,
            rejection_time: None,
            expiration_time: None,
        }]);

        let test_approvals = Approvals(vec![
            want.0[0].clone(),
            Approval {
                id: None,
                rule_instance_id: None,
                transaction_id: Some(String::from("1")),
                transaction_item_id: Some(String::from("2")),
                account_name: String::from("JoeCarter"),
                account_role: AccountRole::Debitor,
                device_id: None,
                device_latlng: None,
                approval_time: None,
                rejection_time: None,
                expiration_time: None,
            },
        ]);

        let got = test_approvals
            .filter_by_transaction_and_transaction_item(1, 1)
            .unwrap();

        assert_eq!(got, want, "got {:?}, want {:?}", got, want)
    }

    #[test]
    fn it_will_error_on_missing_transaction_id_in_approval() {
        let test_approvals = Approvals(vec![Approval {
            id: None,
            rule_instance_id: None,
            transaction_id: None,
            transaction_item_id: Some(String::from("1")),
            account_name: String::from("JoeCarter"),
            account_role: AccountRole::Debitor,
            device_id: None,
            device_latlng: None,
            approval_time: None,
            rejection_time: None,
            expiration_time: None,
        }]);

        assert_eq!(
            test_approvals
                .filter_by_transaction_and_transaction_item(1, 1)
                .unwrap_err()
                .to_string(),
            "missing transaction_id in approval"
        );
    }

    #[test]
    fn it_will_error_on_missing_transaction_item_id_in_approval() {
        let test_approvals = Approvals(vec![Approval {
            id: None,
            rule_instance_id: None,
            transaction_id: Some(String::from("1")),
            transaction_item_id: None,
            account_name: String::from("JoeCarter"),
            account_role: AccountRole::Debitor,
            device_id: None,
            device_latlng: None,
            approval_time: None,
            rejection_time: None,
            expiration_time: None,
        }]);

        assert_eq!(
            test_approvals
                .filter_by_transaction_and_transaction_item(1, 1)
                .unwrap_err()
                .to_string(),
            "missing transaction_item_id in approval"
        );
    }

    #[test]
    fn it_deserializes_an_approval() {
        let got: Approval = serde_json::from_str(
            r#"
    {
        "id": null,
        "rule_instance_id": null,
        "transaction_id": null,
        "transaction_item_id": null,
        "account_name": "JoeCarter",
        "account_role": "debitor",
        "device_id": null,
        "device_latlng": null,
        "approval_time": null,
        "rejection_time": null,
        "expiration_time": null
    }
    "#,
        )
        .unwrap();

        let want = Approval {
            id: None,
            rule_instance_id: None,
            transaction_id: None,
            transaction_item_id: None,
            account_name: String::from("JoeCarter"),
            account_role: AccountRole::Debitor,
            device_id: None,
            device_latlng: None,
            approval_time: None,
            rejection_time: None,
            expiration_time: None,
        };

        if got != want {
            panic!("got {:#?}, want {:#?}", got, want);
        }
    }

    #[test]
    fn it_deserializes_approvals() {
        let want = Approvals(vec![
            Approval {
                id: None,
                rule_instance_id: None,
                transaction_id: None,
                transaction_item_id: None,
                account_name: String::from("JacobWebb"),
                account_role: AccountRole::Debitor,
                device_id: None,
                device_latlng: None,
                approval_time: None,
                rejection_time: None,
                expiration_time: None,
            },
            Approval {
                id: None,
                rule_instance_id: None,
                transaction_id: None,
                transaction_item_id: None,
                account_name: String::from("GroceryStore"),
                account_role: AccountRole::Creditor,
                device_id: None,
                device_latlng: None,
                approval_time: None,
                rejection_time: None,
                expiration_time: None,
            },
        ]);

        let got: Approvals = serde_json::from_str(
            r#"
            [
                {
                    "id": null,
                    "rule_instance_id": null,
                    "transaction_id": null,
                    "transaction_item_id": null,
                    "account_name": "JacobWebb",
                    "account_role": "debitor",
                    "device_id": null,
                    "device_latlng": null,
                    "approval_time": null,
                    "rejection_time": null,
                    "expiration_time": null
                },
                {
                    "id": null,
                    "rule_instance_id": null,
                    "transaction_id": null,
                    "transaction_item_id": null,
                    "account_name": "GroceryStore",
                    "account_role": "creditor",
                    "device_id": null,
                    "device_latlng": null,
                    "approval_time": null,
                    "rejection_time": null,
                    "expiration_time": null
                }
            ]
            "#,
        )
        .unwrap();

        assert_eq!(got, want)
    }
}
