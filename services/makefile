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
			if [ -f $$dir/makefile ]; then \
				echo $$dir; \
				$(MAKE) -C $$dir ENV=$(ENV) warm-up; \
			fi \
		done

.PHONY: deploy $(SUBDIRS) test-env-arg
deploy: $(SUBDIRS) test-env-arg
		@for dir in $(SUBDIRS); do \
			if [ -f $$dir/makefile ]; then \
				$(MAKE) -C $$dir ENV=$(ENV) deploy; \
			fi \
		done

.PHONY: deploy-all $(SUBDIRS) test-env-arg
deploy-all: $(SUBDIRS) test-env-arg
		@for dir in $(SUBDIRS); do \
			if [ -f $$dir/makefile ]; then \
				$(MAKE) -C $$dir ENV=$(ENV) deploy-all; \
			fi \
		done


