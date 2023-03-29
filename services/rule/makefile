APP_NAME=rule
ARTIFACT_NAME=$(APP_NAME)-src.zip
RELATIVE_PROJECT_ROOT_PATH=../..
PROJECT_CONF_FILE_NAME=project.json
PROJECT_CONF=$(RELATIVE_PROJECT_ROOT_PATH)/$(PROJECT_CONF_FILE_NAME)
EXECUTABLE_NAME=$(shell jq -r ".apps.\"$(APP_NAME)\".executable_name" $(PROJECT_CONF))
REGION=$(shell jq -r ".region" $(PROJECT_CONF))
APP_PATH=$(shell jq -r ".apps.\"$(APP_NAME)\".path" $(PROJECT_CONF))
ENV_FILE=.env
CARGO_BUILD_DIR=target
LAMBDA_TARGET=x86_64-unknown-linux-musl
RELEASE_DIR=$(CARGO_BUILD_DIR)/$(LAMBDA_TARGET)/release
DOCKER_URL=$(shell jq -r ".env_var.RULE_URL.docker" $(PROJECT_CONF))

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
	for p in "$$(ps aux | grep -e "cargo-watch" | grep -v 'grep' | awk '{print $$2}')"; do \
		kill -9 "$$p"; \
	done
	kill -9 "$$(ps aux | grep -e 'target/debug/rule' | grep -v 'grep' | awk '{print $$2}')"
	$(MAKE) -C "$(RELATIVE_PROJECT_ROOT_PATH)/migrations" clean

run:
	cd $(RELATIVE_PROJECT_ROOT_PATH); \
		READINESS_CHECK_PATH=/healthz cargo run -p $(APP_NAME)

water:
	@REQ=$$(jq -c . $(RELATIVE_PROJECT_ROOT_PATH)/pkg/testdata/bottledWater.json); \
		curl -d "$$REQ" -H 'Content-Type: application/json' http://0.0.0.0:8081 \
		| jq .

###################### test ######################

test:
	$(MAKE) test-lint
	$(MAKE) test-unit
	$(MAKE) -C '../..' test-compose-up

test-unit:
	cargo test

test-lint:
	cargo clippy

lint:
	$(MAKE) test-lint

###################### build ######################

build:
	@$(MAKE) -S clean
	$(MAKE) compile
	$(MAKE) zip

compile:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	cross build \
		--manifest-path=$(APP_PATH)/Cargo.toml \
		--target $(LAMBDA_TARGET) \
		--release

zip:
	@cp $(RELATIVE_PROJECT_ROOT_PATH)/$(RELEASE_DIR)/$(APP_NAME) $(EXECUTABLE_NAME)
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/zip-executable.sh \
		--app-name $(APP_NAME) \
		--artifact-name $(ARTIFACT_NAME) \
		--executable-name $(EXECUTABLE_NAME)

###################### clean ######################

clean:
	$(MAKE) clean-build
	$(MAKE) clean-artifact
	$(MAKE) clean-log

clean-artifact:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/clean-artifact.sh \
		--app-name $(APP_NAME) \
		--artifact-name $(ARTIFACT_NAME)

clean-build:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	cargo clean -p $(APP_NAME)

clean-log:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/clean-invoke-log.sh \
		--app-name $(APP_NAME)

###################### secrets ######################

test-env-file:
ifeq (,$(wildcard $(ENV_FILE)))
	$(error no .env file, run 'make get-secrets ENV=dev')
endif

clean-env:
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/clean-env.sh \
		--app-name $(APP_NAME)

get-secrets:
	@$(MAKE) -s test-env-arg
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/create-env.sh \
		--app-name $(APP_NAME) \
		--env $(ENV) \
		--region $(REGION)

###################### deploy ######################

put-object:
	@$(MAKE) -s test-env-arg
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/put-object.sh \
		--app-name $(APP_NAME) \
		--artifact-name $(ARTIFACT_NAME) \
        --env $(ENV) \
        --region $(REGION)

update-function:
	@$(MAKE) -s test-env-arg
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/update-function.sh \
		--app-name $(APP_NAME) \
		--artifact-name $(ARTIFACT_NAME) \
        --env $(ENV) \
        --region $(REGION)

initial-deploy:
	@$(MAKE) -s test-env-arg
	$(MAKE) build
	$(MAKE) put-object

deploy:
	@$(MAKE) -s test-env-arg
	$(MAKE) build
	$(MAKE) put-object
	$(MAKE) update-function

deploy-only:
	@$(MAKE) -s test-env-arg
	$(MAKE) put-object
	$(MAKE) update-function

now:
	@$(MAKE) -s clean
	$(MAKE) compile
	$(MAKE) zip
	$(MAKE) deploy-only ENV=dev

###################### invoke ######################

invoke:
	@$(MAKE) invoke-url

invoke-url:
	@$(MAKE) -s test-env-arg
	@cd $(RELATIVE_PROJECT_ROOT_PATH); \
	bash scripts/invoke-function-url.sh \
		--app-name $(APP_NAME) \
		--payload $(TEST_EVENT) \
        --env $(ENV) \
        --region $(REGION)

invoke-docker:
	@curl -s -H 'Content-Type: application/json' -d $(TEST_EVENT) $(DOCKER_URL) | jq .

demo-docker:
	@printf "*** request to %s service at %s\n" $(APP_NAME) $(DOCKER_URL)
	@echo $(TEST_EVENT) | jq .
	@printf "*** response from %s service at %s\n" $(APP_NAME) $(DOCKER_URL)
	@$(MAKE) invoke-docker

###################### make tests ######################

test-env-arg:
ifndef ENV
	$(error trailing ENV assignment missing, e.g. make test ENV=dev)
endif

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