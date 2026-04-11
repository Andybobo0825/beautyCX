data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

resource "aws_iam_role" "ec2" {
  name = "${local.name_prefix}-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ec2_ssm" {
  role       = aws_iam_role.ec2.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_role_policy" "ec2_app" {
  name = "${local.name_prefix}-ec2-app-policy"
  role = aws_iam_role.ec2.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowS3ImageBucketAccess"
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.product_images.arn,
          "${aws_s3_bucket.product_images.arn}/*"
        ]
      }
    ]
  })
}

resource "aws_iam_instance_profile" "ec2" {
  name = "${local.name_prefix}-ec2-profile"
  role = aws_iam_role.ec2.name
}

resource "aws_instance" "app" {
  ami                         = data.aws_ami.amazon_linux.id
  instance_type               = var.ec2_instance_type
  subnet_id                   = values(aws_subnet.public)[0].id
  vpc_security_group_ids      = [aws_security_group.ec2.id]
  iam_instance_profile        = aws_iam_instance_profile.ec2.name
  key_name                    = var.ec2_key_name != "" ? var.ec2_key_name : null
  associate_public_ip_address = true

  user_data = templatefile("${path.module}/templates/ec2_user_data.sh.tftpl", {
    app_repo_url      = var.app_repo_url
    app_branch        = var.app_branch
    app_port          = var.app_port
    secret_key        = var.app_secret_key
    db_username       = var.db_username
    db_password       = var.db_password
    db_name           = var.db_name
    db_host           = aws_db_instance.sqlserver.address
    db_port           = aws_db_instance.sqlserver.port
    redis_host        = aws_elasticache_replication_group.redis.primary_endpoint_address
    redis_port        = 6379
    aws_region        = var.aws_region
    s3_bucket_name    = aws_s3_bucket.product_images.bucket
    cloudfront_domain = aws_cloudfront_distribution.product_images.domain_name
    api_gateway_url   = "${aws_api_gateway_stage.email.invoke_url}/${local.api_gateway_path}"
  })

  tags = {
    Name = "${local.name_prefix}-app-ec2"
    Role = "flask-app"
  }
}
