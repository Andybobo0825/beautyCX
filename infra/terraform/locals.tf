locals {
  name_prefix                            = lower("${var.project_name}-${var.environment}")
  cloudfront_caching_optimized_policy_id = "658327ea-f89d-4fab-a63d-7e88639e58f6"

  common_tags = merge(
    {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
    },
    var.extra_tags
  )

  api_gateway_path = "ProjectEmail"
}
