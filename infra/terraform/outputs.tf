output "application_url" {
  value       = "http://${aws_lb.app.dns_name}"
  description = "Public ALB URL for the ECS service."
}

output "api_ecr_repository_url" {
  value       = aws_ecr_repository.api.repository_url
  description = "ECR repository URL for the API image."
}

output "web_ecr_repository_url" {
  value       = aws_ecr_repository.web.repository_url
  description = "ECR repository URL for the web image."
}

output "ecs_cluster_name" {
  value       = aws_ecs_cluster.app.name
  description = "ECS cluster name."
}

output "ecs_service_name" {
  value       = aws_ecs_service.app.name
  description = "ECS service name."
}

output "codebuild_project_name" {
  value       = aws_codebuild_project.app.name
  description = "CodeBuild project used by the pipeline."
}

output "codepipeline_name" {
  value       = aws_codepipeline.app.name
  description = "CodePipeline name."
}

output "artifact_bucket_name" {
  value       = aws_s3_bucket.artifacts.bucket
  description = "S3 artifact bucket used by CodePipeline."
}
