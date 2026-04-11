output "ec2_public_ip" {
  description = "Public IP of the EC2 application server."
  value       = aws_instance.app.public_ip
}

output "ec2_public_dns" {
  description = "Public DNS of the EC2 application server."
  value       = aws_instance.app.public_dns
}

output "cloudfront_domain_name" {
  description = "CloudFront domain for product images."
  value       = aws_cloudfront_distribution.product_images.domain_name
}

output "s3_bucket_name" {
  description = "S3 bucket name for product images."
  value       = aws_s3_bucket.product_images.bucket
}

output "api_gateway_invoke_url" {
  description = "Invoke URL for the register email API."
  value       = "${aws_api_gateway_stage.email.invoke_url}/${local.api_gateway_path}"
}

output "rds_endpoint" {
  description = "SQL Server endpoint."
  value       = aws_db_instance.sqlserver.address
}

output "redis_primary_endpoint" {
  description = "Primary Redis endpoint."
  value       = aws_elasticache_replication_group.redis.primary_endpoint_address
}
