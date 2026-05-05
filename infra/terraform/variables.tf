variable "project_name" {
  description = "Lowercase project identifier used for AWS resource names."
  type        = string
  default     = "beautycx"
}

variable "aws_region" {
  description = "AWS region for ECS, CodePipeline, CodeBuild, and ECR."
  type        = string
  default     = "ap-northeast-1"
}

variable "github_repo_id" {
  description = "GitHub repository in owner/name format for the CodeStar source action."
  type        = string
}

variable "github_branch" {
  description = "Git branch that triggers the pipeline."
  type        = string
  default     = "main"
}

variable "codestar_connection_arn" {
  description = "AWS CodeStar Connection ARN connected to GitHub."
  type        = string
}

variable "artifact_bucket_name" {
  description = "Optional globally unique S3 bucket name for pipeline artifacts. Leave null to derive one from account/region/project."
  type        = string
  default     = null
}

variable "force_destroy_artifact_bucket" {
  description = "Allow Terraform to delete non-empty artifact buckets in non-production cleanup."
  type        = bool
  default     = false
}

variable "vpc_cidr" {
  description = "CIDR block for the small ECS VPC."
  type        = string
  default     = "10.42.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "Two public subnet CIDRs for ALB and Fargate tasks."
  type        = list(string)
  default     = ["10.42.1.0/24", "10.42.2.0/24"]
}

variable "ecs_desired_count" {
  description = "Number of Fargate tasks to run. Use 1 for a small project; use 2+ for higher availability."
  type        = number
  default     = 1
}

variable "ecs_task_cpu" {
  description = "Fargate task CPU units."
  type        = number
  default     = 512
}

variable "ecs_task_memory" {
  description = "Fargate task memory MiB."
  type        = number
  default     = 1024
}

variable "container_insights" {
  description = "Enable ECS Container Insights. Disabled by default to keep a small project cheaper."
  type        = bool
  default     = false
}
