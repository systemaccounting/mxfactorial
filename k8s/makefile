RELATIVE_PROJECT_ROOT_PATH=..
include $(RELATIVE_PROJECT_ROOT_PATH)/make/shared.mk

deploy-local:
	@$(MAKE) --no-print-directory -C local env ENV=local
	@$(MAKE) --no-print-directory env ENV=local
	ytt --data-values-file ./local/$(ENV_FILE_NAME) --data-values-file $(ENV_FILE_NAME) -f . | kubectl apply -f -

delete-local:
	@$(MAKE) --no-print-directory -C local env ENV=local
	@$(MAKE) --no-print-directory env ENV=local
	ytt --data-values-file ./local/$(ENV_FILE_NAME) --data-values-file $(ENV_FILE_NAME) -f . | kubectl delete -f -

delete-all-local:
	kubectl delete all --all -n default

list-all:
	kubectl get all -n default