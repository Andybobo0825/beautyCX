variable "project_name" {
  description = "Project name prefix."
  type        = string
  default     = "beautycx"
}

variable "environment" {
  description = "Deployment environment."
  type        = string
  default     = "dev"
}

variable "aws_region" {
  description = "AWS region."
  type        = string
  default     = "ap-east-2"
}

variable "aws_access_key_id" {
  description = "AWS access key ID. Leave empty to use environment credentials."
  type        = string
  default     = ""
  sensitive   = true
}

variable "aws_secret_access_key" {
  description = "AWS secret access key. Leave empty to use environment credentials."
  type        = string
  default     = ""
  sensitive   = true
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC."
  type        = string
  default     = "10.20.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "Public subnet CIDR blocks."
  type        = list(string)
  default     = ["10.20.1.0/24", "10.20.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "Private subnet CIDR blocks."
  type        = list(string)
  default     = ["10.20.11.0/24", "10.20.12.0/24"]
}

variable "admin_cidr_blocks" {
  description = "CIDR blocks allowed to SSH into EC2."
  type        = list(string)
  default     = []
}

variable "ec2_instance_type" {
  description = "EC2 instance type for the Flask server."
  type        = string
  default     = "t3.small"
}

variable "ec2_key_name" {
  description = "Optional EC2 key pair name."
  type        = string
  default     = ""
}

variable "app_repo_url" {
  description = "Optional git repository URL to deploy on EC2."
  type        = string
  default     = ""
}

variable "app_branch" {
  description = "Git branch for EC2 bootstrap."
  type        = string
  default     = "main"
}

variable "app_port" {
  description = "Flask application port on EC2."
  type        = number
  default     = 5001
}

variable "app_secret_key" {
  description = "Flask SECRET_KEY."
  type        = string
  default     = ""
  sensitive   = true
}

variable "rds_instance_class" {
  description = "RDS instance class."
  type        = string
  default     = "db.t3.small"
}

variable "rds_engine" {
  description = "RDS engine."
  type        = string
  default     = "sqlserver-ex"
}

variable "rds_engine_version" {
  description = "Optional RDS engine version."
  type        = string
  default     = ""
}

variable "rds_allocated_storage" {
  description = "RDS allocated storage in GB."
  type        = number
  default     = 20
}

variable "rds_max_allocated_storage" {
  description = "RDS max allocated storage in GB."
  type        = number
  default     = 100
}

variable "db_name" {
  description = "Application database name used by the app."
  type        = string
  default     = "DB"
}

variable "db_username" {
  description = "RDS master username."
  type        = string
  default     = ""
  sensitive   = true
}

variable "db_password" {
  description = "RDS master password."
  type        = string
  default     = ""
  sensitive   = true
}

variable "redis_node_type" {
  description = "ElastiCache node type."
  type        = string
  default     = "cache.t4g.micro"
}

variable "redis_engine_version" {
  description = "Redis engine version."
  type        = string
  default     = "7.1"
}

variable "s3_bucket_name" {
  description = "S3 bucket name for product images."
  type        = string
  default     = ""
}

variable "cloudfront_price_class" {
  description = "CloudFront price class."
  type        = string
  default     = "PriceClass_100"
}

variable "api_gateway_stage_name" {
  description = "API Gateway stage name."
  type        = string
  default     = "ap-east"
}

variable "ses_sender_email" {
  description = "SES verified sender email address."
  type        = string
  default     = ""
}

variable "extra_tags" {
  description = "Additional AWS tags."
  type        = map(string)
  default     = {}
}
