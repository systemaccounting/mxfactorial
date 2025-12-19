test-up:
	@$(MAKE) test && $(MAKE) compose-up

compose-build:
	bash scripts/compose.sh --build

compose-up:
	bash scripts/compose.sh --up

compose-up-build:
	bash scripts/compose.sh --up --build

compose-down:
	bash scripts/compose.sh --down

rebuild-db:
	@$(MAKE) -C migrations rebuild
	@$(MAKE) -C migrations run

reset-db:
	@$(MAKE) -C migrations reset

rebuild-rule:
	@bash scripts/rebuild-service.sh --name rule

rebuild-request-create:
	@bash scripts/rebuild-service.sh --name request-create

rebuild-request-approve:
	@bash scripts/rebuild-service.sh --name request-approve

rebuild-balance-by-account:
	@bash scripts/rebuild-service.sh --name balance-by-account

rebuild-request-by-id:
	@bash scripts/rebuild-service.sh --name request-by-id

rebuild-requests-by-account:
	@bash scripts/rebuild-service.sh --name requests-by-account

rebuild-transaction-by-id:
	@bash scripts/rebuild-service.sh --name transaction-by-id

rebuild-transactions-by-account:
	@bash scripts/rebuild-service.sh --name transactions-by-account

rebuild-event:
	@bash scripts/rebuild-service.sh --name event

rebuild-graphql:
	@bash scripts/rebuild-service.sh --name graphql

rebuild-client:
	@bash scripts/rebuild-service.sh --name client