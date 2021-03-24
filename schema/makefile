APP=mxfactorial
CONTAINER_NAME=$(APP)-postgres
POSTGRESQL_PASSWORD=test
POSTGRESQL_USERNAME=test
POSTGRESQL_DATABASE=mxfactorial
HOST_PORT=5432
CONTAINER_PORT=5432
POSTGRES_VOLUME_MOUNT_PATH=$(PWD)/postgres-data
CONTAINER_POSTGRES_STORAGE_PATH=/bitnami/postgresql
DOCKER_IMAGE=bitnami/postgresql
IMAGE_VERSION=latest
MIGRATION_PATH=$(CURDIR)/migrations
DATABASE_TYPE=postgres
POSTGRESQL_HOST=localhost
POSTGRESQL_PORT=$(CONTAINER_PORT)
POSTGRESQL_CONNECTION=$(DATABASE_TYPE)://$(POSTGRESQL_USERNAME):$(POSTGRESQL_PASSWORD)@$(POSTGRESQL_HOST):$(POSTGRESQL_PORT)/$(POSTGRESQL_DATABASE)?sslmode=disable

# migration lambda vars
test-env-arg:
ifndef ENV
		$(error trailing ENV assignment missing, e.g. make test ENV=dev)
endif
MIGRATION_LAMBDA_NAME=go-migrate-faas-$(ENV)
REGION=us-east-1
MIGRATION_BRANCH=199/db-item-transaction
MIGRATION_COMMAND=down
MIGRATION_COUNT=all
# MIGRATION_VERSION only relevant to force command
MIGRATION_VERSION=7
MIGRATION_EVENT='{"branch":"$(MIGRATION_BRANCH)","command":"$(MIGRATION_COMMAND)","count":"$(MIGRATION_COUNT)","version":"$(MIGRATION_VERSION)"}'

# postgres docker
run:
	docker run \
	--rm \
	--name $(CONTAINER_NAME) \
	-e POSTGRESQL_USERNAME=$(POSTGRESQL_USERNAME) \
	-e POSTGRESQL_PASSWORD=$(POSTGRESQL_PASSWORD) \
	-e POSTGRESQL_DATABASE=$(POSTGRESQL_DATABASE) \
	-p $(HOST_PORT):$(CONTAINER_PORT) \
	-v $(POSTGRES_VOLUME_MOUNT_PATH):$(CONTAINER_POSTGRES_STORAGE_PATH) \
	$(DOCKER_IMAGE):$(IMAGE_VERSION)

stop:
	docker stop $(CONTAINER_NAME)

clean:
	-@$(MAKE) stop
	rm -rf $(POSTGRES_VOLUME_MOUNT_PATH)

# go migrate
test-name-arg:
ifndef NAME
	$(error trailing NAME assignment missing, e.g. make create NAME=rule)
endif

test-count-arg:
ifndef COUNT
	$(info trailing COUNT assignment missing, defaulting to COUNT=1)
COUNT=1
endif

test-version-arg:
ifndef VERSION
	$(info trailing VERSION assignment missing, defaulting to VERSION=1)
endif

init:
	migrate create -ext sql -dir $(MIGRATION_PATH) -seq init_schema

create:
	@$(MAKE) -s test-name-arg
	migrate -verbose create -ext sql -dir $(MIGRATION_PATH) -seq $(NAME)

up:
	@$(MAKE) -s test-count-arg
	migrate -verbose -path $(MIGRATION_PATH) -database "$(POSTGRESQL_CONNECTION)" up $(COUNT)

down:
	@$(MAKE) -s test-count-arg
	migrate -verbose -path $(MIGRATION_PATH) -database "$(POSTGRESQL_CONNECTION)" down $(COUNT)

up-all:
	migrate -verbose -path $(MIGRATION_PATH) -database "$(POSTGRESQL_CONNECTION)" up

down-all:
	yes | migrate -verbose -path $(MIGRATION_PATH) -database "$(POSTGRESQL_CONNECTION)" down

drop:
	migrate -verbose -path $(MIGRATION_PATH) -database "$(POSTGRESQL_CONNECTION)" drop -f

force:
	@$(MAKE) -s test-version-arg
	migrate -verbose -path $(MIGRATION_PATH) -database "$(POSTGRESQL_CONNECTION)" force $(VERSION)

test:
	$(MAKE) up-all
	$(MAKE) down-all

re-up:
	$(MAKE) clear
	$(MAKE) up-all

clear:
	# avoids error: Dirty database version 1
	$(MAKE) drop
	# avoids left over enums
	$(MAKE) down-all
	# drops migration table after cleaning enums
	$(MAKE) drop

# lambda
deploy-migrations:
	@$(MAKE) -s test-env-arg
	@aws lambda invoke \
		--region $(REGION) \
		--invocation-type RequestResponse \
		--function-name $(MIGRATION_LAMBDA_NAME) \
		--payload "$$(echo $(MIGRATION_EVENT) | base64)" \
		invoke.log