#!/bin/bash

GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RESET='\033[0m'

while [[ $CMD != "make compose-up" ]]; do
	read -rep $'\n\e[32m"make compose-up" to create services in docker compose (several minutes to build)\e[0m\n\n> ' CMD
done

eval "$CMD"

echo ""

while [[ $CMD != "make rules" ]]; do
	read -rep $'\e[32m"make rules" to see a request and response from services/rules\e[0m\n\n> ' CMD
done

eval "$CMD"

echo -e -n "\n${YELLOW}*** OBSERVE the additional \"9% state sales tax\" transaction_items returned by the rules service${RESET}\n"
echo ""

while [[ $CMD != "make request-create" ]]; do
	read -rep $'\e[32m"make request-create" to see a request and response from services/request-create\e[0m\n\n> ' CMD
done

eval "$CMD"

echo -e -n "\n${YELLOW}*** OBSERVE timestamp values in \"creditor_approval_time\" AND null values in \"debitor_approval_time\": the creditor sent a transaction request to the debitor${RESET}\n"
echo ""

while [[ $CMD != "make request-approve" ]]; do
	read -rep $'\e[32m"make request-approve" to see a request and response from services/request-approve\e[0m\n\n> ' CMD
done

eval "$CMD"

echo -e -n "\n${YELLOW}*** OBSERVE timestamp values in \"creditor_approval_time\" AND \"debitor_approval_time\": the debitor approved the transaction request from the creditor${RESET}\n"
echo ""

while [[ $CMD != "make balance-by-account" ]]; do
	read -rep $'\e[32m"make balance-by-account" to see a request and response from services/balance-by-account\e[0m\n\n> ' CMD
done

eval "$CMD"

echo ""

while [[ $CMD != "make request-by-id" ]]; do
	read -rep $'\e[32m"make request-by-id" to see a request and response from services/request-by-id\e[0m\n\n> ' CMD
done

eval "$CMD"

echo ""

while [[ $CMD != "make requests-by-account" ]]; do
	read -rep $'\e[32m"make requests-by-account" to see a request and response from services/requests-by-account\e[0m\n\n> ' CMD
done

eval "$CMD"

echo ""

while [[ $CMD != "make transaction-by-id" ]]; do
	read -rep $'\e[32m"make transaction-by-id" to see a request and response from services/transaction-by-id\e[0m\n\n> ' CMD
done

eval "$CMD"

echo ""

while [[ $CMD != "make transactions-by-account" ]]; do
	read -rep $'\e[32m"make transactions-by-account" to see a request and response from services/transactions-by-account\e[0m\n\n> ' CMD
done

eval "$CMD"

echo ""

while [[ $CMD != "make rebuild-db" ]]; do
	read -rep $'\e[32m"make rebuild-db" to reset the database for integration tests\e[0m\n\n> ' CMD
done

eval "$CMD"

echo ""

while [[ $CMD != "make test-docker" ]]; do
	read -rep $'\e[32m"make test-docker" to test service integration in docker compose (<1 min run time)\e[0m\n\n> ' CMD
done

eval "$CMD"

echo ""

while [[ $CMD != "make rebuild-transactions-by-account" ]]; do
	read -rep $'\e[32mnow add log.Println("hello tutorial") at the top of func main() in services/transactions-by-account/cmd/main.go and "make rebuild-transactions-by-account" to rebuild\e[0m\n\n> ' CMD
done

eval "$CMD"

echo ""

while [[ $CMD != "docker logs mxf-transactions-by-account-1" ]]; do
	read -rep $'\e[32m"docker logs mxf-transactions-by-account-1" to view first entry "hello tutorial" in docker logs\e[0m\n\n> ' CMD
done

eval "$CMD"

echo ""

echo -e -n "${GREEN}press any key to print all rebuild commands available during development:${RESET}\n\n>"
read -n 1

echo ""

grep -E '^rebuild-' ./makefile | sed 's/.$//' | awk '$0="make " $0'

echo ""

echo -e -n "${GREEN}navigate to http://localhost:8090 in a browser and sign in on the web client as \"JacobWebb\" without a password. press any key to continue${RESET}\n\n>"
read -n 1

echo ""

echo -e -n "${GREEN}navigate to http://localhost:8080 in a browser to view the graphiql explorer. press any key to continue${RESET}\n\n>"
read -n 1

echo ""

echo -e -n "${GREEN}import services/graphql/postman/graphql.postman_collection.json into postman and set GRAPHQL_URI=http://localhost:8088 to test graphql requests. press any key to continue${RESET}\n\n>"
read -n 1

echo ""

echo -e -n "${GREEN}OPTIONAL: \"make build-dev\" to build a cloud dev environment in your own aws account (cost: 0.60/day). press any key to continue${RESET}\n\n>"
read -n 1

echo ""

echo -e "${GREEN}\"make compose-down\" to clean up${RESET}"

echo ""

echo -e "\033[0;36mwelcome to systemaccounting${RESET}"