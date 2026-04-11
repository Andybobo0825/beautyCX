#!/usr/bin/env bash
set -euo pipefail

ACTION="${1:-plan}"
TFVARS_FILE="${TFVARS_FILE:-terraform.tfvars}"

case "${ACTION}" in
  init)
    terraform init
    ;;
  fmt)
    terraform fmt -recursive
    ;;
  validate)
    terraform validate
    ;;
  plan)
    terraform plan -var-file="${TFVARS_FILE}"
    ;;
  apply)
    terraform apply -var-file="${TFVARS_FILE}"
    ;;
  destroy)
    terraform destroy -var-file="${TFVARS_FILE}"
    ;;
  *)
    echo "Usage: ./deploy.sh [init|fmt|validate|plan|apply|destroy]"
    exit 1
    ;;
esac
