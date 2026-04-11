TF ?= terraform
TFVARS ?= terraform.tfvars

.PHONY: init fmt validate plan apply destroy

init:
	$(TF) init

fmt:
	$(TF) fmt -recursive

validate:
	$(TF) validate

plan:
	$(TF) plan -var-file=$(TFVARS)

apply:
	$(TF) apply -var-file=$(TFVARS)

destroy:
	$(TF) destroy -var-file=$(TFVARS)
