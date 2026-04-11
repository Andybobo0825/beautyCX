# Terraform Flow

這份 Terraform 目錄對應目前 README 與 draw.io 架構圖中的服務：

- AWS VPC
- Public / Private Subnet
- EC2 Flask App Server
- ElastiCache Redis
- RDS SQL Server
- S3 Product Images Bucket
- CloudFront CDN
- API Gateway
- Lambda
- SES

敏感資訊不會寫死在 Terraform 檔案中，請改填 `terraform.tfvars` 或改用環境變數。

## 目錄

```text
infra/terraform/
|- versions.tf
|- providers.tf
|- locals.tf
|- variables.tf
|- network.tf
|- security.tf
|- compute.tf
|- database.tf
|- cache.tf
|- storage.tf
|- notifications.tf
|- outputs.tf
|- terraform.tfvars.example
|- Makefile
|- deploy.sh
|- lambda/register_email_handler.py
|- templates/ec2_user_data.sh.tftpl
```

## 前置準備

1. 安裝 Terraform 1.6 以上版本。
2. 複製範例變數檔：

```bash
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars
```

3. 把以下敏感欄位補上：

- `aws_access_key_id`
- `aws_secret_access_key`
- `db_username`
- `db_password`
- `app_secret_key`
- `s3_bucket_name`
- `ses_sender_email`

## 執行流程

```bash
cd infra/terraform
terraform init
terraform plan
terraform apply
```

若只想看差異：

```bash
terraform plan -out=tfplan
```

若要刪除：

```bash
terraform destroy
```

## 部署後流程

Terraform 會先建立基礎設施，再由 EC2 `user_data` 做最基本的主機初始化：

- 安裝 Python 3、Git、Nginx
- 建立反向代理，把 `80` 導到 Flask `5001`
- 產生 `/opt/beautycx/serverclient/.env`
- 若 `app_repo_url` 有填，會自動 clone 專案並建立 systemd service

也可以直接用這兩種封裝流程：

```bash
make init
make plan
make apply
```

或：

```bash
./deploy.sh init
./deploy.sh plan
./deploy.sh apply
```

目前這份流程偏向作品集等級的基礎架構樣板，不包含：

- 多台 EC2 或 Auto Scaling
- Blue/Green 或 Rolling Deployment
- Secret Manager / Parameter Store
- CI/CD Pipeline

## 重要說明

- RDS 與 ElastiCache 使用 private subnets。
- EC2 放在第一個 public subnet。
- `terraform.tfvars` 不應提交到版本控制。
