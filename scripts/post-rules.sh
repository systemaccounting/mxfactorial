#!/bin/bash

HOST_ADDR=0.0.0.0
HOST_PORT=8081

# human readable json body
read -r -d '' BODY <<-'EOF'
[
  {
    "id": null,
    "transaction_id": null,
    "item_id": "bottled water",
    "price": "1.000",
    "quantity": "2",
    "debitor_first": null,
    "rule_instance_id": null,
    "rule_exec_ids": [],
    "unit_of_measurement": null,
    "units_measured": null,
    "debitor": "JacobWebb",
    "creditor": "GroceryStore",
    "debitor_profile_id": null,
    "creditor_profile_id": null,
    "debitor_approval_time": null,
    "creditor_approval_time": null,
    "debitor_expiration_time": null,
    "creditor_expiration_time": null,
    "debitor_rejection_time": null,
    "creditor_rejection_time": null
  }
]
EOF

# format json body for curl
PAYLOAD=$(echo "${BODY}" | jq -rcM .)

curl -s \
  -d "${PAYLOAD}" \
  -H 'Content-Type: application/json' \
  http://${HOST_ADDR}:${HOST_PORT}/ | jq .