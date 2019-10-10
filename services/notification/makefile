DIR := ${CURDIR}
SUBDIRS := $(wildcard */.)

.PHONY: test-env-arg
test-env-arg:
ifndef ENV
		$(error trailing ENV assignment missing, e.g. make test ENV=dev)
endif

.PHONY: warm-up $(SUBDIRS) test-env-arg
warm-up: $(SUBDIRS) test-env-arg
		@for dir in $(SUBDIRS); do \
			$(MAKE) -C $$dir ENV=$(ENV) warm-up; \
		done

.PHONY: deploy $(SUBDIRS) test-env-arg
deploy: $(SUBDIRS) test-env-arg
		for dir in $(SUBDIRS); do \
			$(MAKE) -C $$dir ENV=$(ENV) deploy; \
		done

.PHONY: initial-deploy $(SUBDIRS) test-env-arg
initial-deploy: $(SUBDIRS) test-env-arg
		for dir in $(SUBDIRS); do \
			$(MAKE) -C $$dir ENV=$(ENV) initial-deploy; \
		done

.PHONY: deploy-all $(SUBDIRS) test-env-arg
deploy-all: $(SUBDIRS) test-env-arg
		for dir in $(SUBDIRS); do \
			$(MAKE) -C $$dir ENV=$(ENV) deploy-all; \
		done
