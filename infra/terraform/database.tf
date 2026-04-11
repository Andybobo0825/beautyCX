resource "aws_db_subnet_group" "sqlserver" {
  name       = "${local.name_prefix}-db-subnet-group"
  subnet_ids = values(aws_subnet.private)[*].id

  tags = {
    Name = "${local.name_prefix}-db-subnet-group"
  }
}

resource "aws_db_instance" "sqlserver" {
  identifier                 = "${local.name_prefix}-sqlserver"
  engine                     = var.rds_engine
  engine_version             = var.rds_engine_version != "" ? var.rds_engine_version : null
  instance_class             = var.rds_instance_class
  allocated_storage          = var.rds_allocated_storage
  max_allocated_storage      = var.rds_max_allocated_storage
  storage_type               = "gp3"
  username                   = var.db_username
  password                   = var.db_password
  port                       = 1433
  publicly_accessible        = false
  skip_final_snapshot        = true
  deletion_protection        = false
  apply_immediately          = true
  backup_retention_period    = 0
  db_subnet_group_name       = aws_db_subnet_group.sqlserver.name
  vpc_security_group_ids     = [aws_security_group.rds.id]
  auto_minor_version_upgrade = true
  license_model              = "license-included"

  tags = {
    Name = "${local.name_prefix}-sqlserver"
  }
}
