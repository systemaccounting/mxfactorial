#!/bin/bash

GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RESET='\033[0m'

# set CLIENT_URI and GRAPHQL_URI vars
source ./scripts/set-uri-vars.sh

function eval_with_no_print_directory() {
	eval "make --no-print-directory $(echo "$1" | sed 's/make //')"
}

while [[ $CMD != "make rule" ]]; do
	read -rep $'\e[32m"make rule" to see a request and response from services/rule\e[0m\n\n> ' CMD
done

eval_with_no_print_directory "$CMD"

echo -e -n "\n${YELLOW}*** OBSERVE the additional \"9% state sales tax\" transaction_items returned by the rule service${RESET}\n"

echo ""

while [[ $CMD != "make request-create" ]]; do
	read -rep $'\e[32m"make request-create" to see a request and response from services/request-create\e[0m\n\n> ' CMD
done

eval_with_no_print_directory "$CMD"

echo -e -n "\n${YELLOW}*** OBSERVE timestamp values in \"creditor_approval_time\" AND null values in \"debitor_approval_time\": the creditor sent a transaction request to the debitor${RESET}\n"

echo ""

while [[ $CMD != "make request-approve" ]]; do
	read -rep $'\e[32m"make request-approve" to see a request and response from services/request-approve\e[0m\n\n> ' CMD
done

eval_with_no_print_directory "$CMD"

echo -e -n "\n${YELLOW}*** OBSERVE timestamp values in \"creditor_approval_time\" AND \"debitor_approval_time\": the debitor approved the transaction request from the creditor${RESET}\n"

echo ""

while [[ $CMD != "make balance-by-account" ]]; do
	read -rep $'\e[32m"make balance-by-account" to see a request and response from services/balance-by-account\e[0m\n\n> ' CMD
done

eval_with_no_print_directory "$CMD"

echo ""

while [[ $CMD != "make request-by-id" ]]; do
	read -rep $'\e[32m"make request-by-id" to see a request and response from services/request-by-id\e[0m\n\n> ' CMD
done

eval_with_no_print_directory "$CMD"

echo ""

while [[ $CMD != "make requests-by-account" ]]; do
	read -rep $'\e[32m"make requests-by-account" to see a request and response from services/requests-by-account\e[0m\n\n> ' CMD
done

eval_with_no_print_directory "$CMD"

echo ""

while [[ $CMD != "make transaction-by-id" ]]; do
	read -rep $'\e[32m"make transaction-by-id" to see a request and response from services/transaction-by-id\e[0m\n\n> ' CMD
done

eval_with_no_print_directory "$CMD"

echo ""

while [[ $CMD != "make transactions-by-account" ]]; do
	read -rep $'\e[32m"make transactions-by-account" to see a request and response from services/transactions-by-account\e[0m\n\n> ' CMD
done

eval_with_no_print_directory "$CMD"

echo ""

echo -e -n "${GREEN}now add log.Println(\"hello cadet\") at the top of func main() in services/transactions-by-account/cmd/main.go to restart the service with a code change. press any key to continue${RESET}\n\n>"
read -n 1

echo ""

echo -e -n "${GREEN}switch to the initial shell to view the log entry from the transactions-by-account code change. press any key to continue${RESET}\n\n>"
read -n 1

echo ""

echo -e -n "${GREEN}navigate to $CLIENT_URI in a browser and sign in on the web client as \"JacobWebb\" without a password. press any key to continue${RESET}\n\n>"
read -n 1

echo ""

echo -e -n "${GREEN}navigate to $GRAPHQL_URI in a browser to view the graphiql explorer. press any key to continue${RESET}\n\n>"
read -n 1

echo ""

while [[ $CMD != "make -C client test" ]]; do
	read -rep $'\e[32m"make -C client test" to e2e test a transaction in a headless browser\e[0m\n\n> ' CMD
done

eval "$CMD"

echo ""

while [[ $CMD != "make reset-db" ]]; do
	read -rep $'\e[32m"make reset-db" to reset the database for integration tests\e[0m\n\n> ' CMD
done

eval_with_no_print_directory "$CMD"

echo ""

while [[ $CMD != "make -C tests test-local" ]]; do
	read -rep $'\e[32m"make -C tests test-local" to test service integration locally\e[0m\n\n> ' CMD
done

eval "$CMD"

echo ""

while [[ $CMD != "make list-pids" ]]; do
	read -rep $'\e[32m"make list-pids" to print a list of running services and their pids\e[0m\n\n> ' CMD
done

eval_with_no_print_directory "$CMD"

echo ""

if [[ $GITPOD_WORKSPACE_URL ]] || [[ $CODESPACES ]]; then
	echo -e -n "${GREEN}open the vscode command palette (Shift+Command+P on Mac, Ctrl+Shift+P on Windows/Linux) and run \"View: Toggle Ports\" to view ports opened by running services. press any key to continue${RESET}\n\n>"
	read -n 1

	echo ""
fi

echo -e -n "${GREEN}OPTIONAL: \"aws configure && make build-dev\" to build a cloud dev environment in your own aws account (cost: 0.60/day). press any key to continue${RESET}\n\n>"
read -n 1

echo ""

while [[ $CMD != "make stop" ]]; do
	read -rep $'\e[32m"make stop" to stop services locally\e[0m\n\n> ' CMD
done

eval "$CMD"

echo ""

echo -e "\033[0;36m\"make start\" to start services again. welcome to systemaccounting${RESET}"

echo ""