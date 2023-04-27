RELATIVE_PROJECT_ROOT_PATH=$(shell REL_PATH="."; while [ $$(ls "$$REL_PATH" | grep project.yaml | wc -l | xargs) -eq 0 ]; do REL_PATH="$$REL_PATH./.."; done; printf '%s' "$$REL_PATH")
include $(RELATIVE_PROJECT_ROOT_PATH)/make/shared.mk
include $(RELATIVE_PROJECT_ROOT_PATH)/make/rust.mk

DOCKER_URL=$(shell yq '.infrastructure.terraform.aws.modules.environment.env_var.set.RULE_URL.default' $(PROJECT_CONF))

TEST_DATA_FILE=preRuleTrItems.json
TEST_DATA_DIR=$(RELATIVE_PROJECT_ROOT_PATH)/pkg/testdata
TEST_EVENT='$(shell cat $(TEST_DATA_DIR)/$(TEST_DATA_FILE))'

# use "provided.al2" in lambda per https://github.com/awslabs/aws-lambda-rust-runtime/tree/a2386b9768974f4647582cdf6ec332cb090e440f#12-build-your-lambda-functions

dev:
	$(MAKE) -C $(RELATIVE_PROJECT_ROOT_PATH)/migrations run
	cd $(RELATIVE_PROJECT_ROOT_PATH); \
		cargo watch \
			-w $(APP_PATH)/src \
			-- \
			READINESS_CHECK_PATH=/healthz \
			PGDATABASE=mxfactorial \
			PGUSER=test \
			PGPASSWORD=test \
			PGHOST=localhost \
			PGPORT=5432 \
			RUST_LOG=info \
			HOSTNAME_OR_IP=localhost \
			PORT=8050 \
			cargo run -p $(APP_NAME)

stop-dev:
	@for p in "$$(ps aux | grep -e "cargo-watch" | grep -v 'grep' | awk '{print $$2}')"; do kill $$p; done
	$(MAKE) -C "$(RELATIVE_PROJECT_ROOT_PATH)/migrations" clean

run:
	cd $(RELATIVE_PROJECT_ROOT_PATH); \
		READINESS_CHECK_PATH=/healthz cargo run -p $(APP_NAME)

water:
	@REQ=$$(yq -I0 $(RELATIVE_PROJECT_ROOT_PATH)/pkg/testdata/bottledWater.json); \
		curl -d "$$REQ" -H 'Content-Type: application/json' http://0.0.0.0:8081 \
		| yq -o=json


###################### invoke ######################

invoke-docker:
	@curl -s -H 'Content-Type: application/json' -d $(TEST_EVENT) $(DOCKER_URL) | yq -o=json

demo-docker:
	@printf "*** request to %s service at %s\n" $(APP_NAME) $(DOCKER_URL)
	@echo $(TEST_EVENT) | yq -o=json
	@printf "*** response from %s service at %s\n" $(APP_NAME) $(DOCKER_URL)
	@$(MAKE) invoke-docker


###################### docker ######################

test-docker-availability:
	@docker version > /dev/null 2>&1; if [ $$? -ne 0 ]; then echo "\033[1;31mdocker required. start docker \033[0m"; fi

start-postgres-in-docker:
	$(MAKE) test-docker-availability
	NUM=$$(psql 'postgresql://test:test@0.0.0.0/mxfactorial' -t -c '\dt' | wc -l | tr -d ' ' > /dev/null 2>&1); \
	if [ "$$NUM" -eq 0 ]; then \
		$(MAKE) -C '../../migrations' run DB=test; \
		echo "waiting 3 seconds for postgres init before migrate"; \
		sleep 3; \
		$(MAKE) -C '../../migrations' updocker DB=test; \
	fi