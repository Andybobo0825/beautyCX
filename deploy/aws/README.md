# AWS ECS CI/CD 部署說明

本專案採用 ECS Fargate 作為正式 CI/CD 部署目標。

流程如下：

1. CodePipeline 透過 CodeStar Connections 從 GitHub 取得程式碼。
2. CodeBuild 執行測試、驗證 `compose.yaml`、建置 API 與 Web Docker image，並推送到 ECR。
3. CodeBuild 產生 `imagedefinitions.json`。
4. CodePipeline 使用 `imagedefinitions.json` 將新 image 部署到 ECS service。

## 小型專案 ECS 架構

Terraform 會建立以下資源：

- 1 個 VPC。
- 2 個 public subnet。
- 1 個 Application Load Balancer。
- 1 個 ECS Fargate service。
- 1 個 ECS task definition，內含兩個 container：
  - `web` — Nginx + Vite 靜態前端，使用 port 80。
  - `api` — Express API，使用 port 8080。
- 2 個 ECR repository：
  - `beautycx-web`
  - `beautycx-api`
- CodePipeline。
- CodeBuild。

為了控制小型專案成本，預設 `ecs_desired_count = 1`。若需要更高可用性，可改為 `2` 或更高。

## Container 名稱契約

`buildspec.yml` 會產生：

```json
[
  { "name": "api", "imageUri": "..." },
  { "name": "web", "imageUri": "..." }
]
```

這些 `name` 必須與 ECS task definition 的 container name 完全一致。

## 前端 API 路由

前端統一透過 `/api` 呼叫後端。

- 本機 Docker Compose：`web` 將 `/api` 代理到 `api:8080`。
- ECS Fargate 同 task：`web` 將 `/api` 代理到 `127.0.0.1:8080`。

此設定由 `API_UPSTREAM` 環境變數控制。

## 部署步驟

```bash
cp infra/terraform/terraform.tfvars.example infra/terraform/terraform.tfvars
# 編輯 github_repo_id 與 codestar_connection_arn
terraform -chdir=infra/terraform init
terraform -chdir=infra/terraform plan
terraform -chdir=infra/terraform apply
```

Terraform apply 完成後，推送程式碼到設定的 GitHub branch，即可觸發 CI/CD。

## 驗證部署

取得 ALB 網址：

```bash
terraform -chdir=infra/terraform output application_url
```

驗證服務：

```bash
curl http://ALB_DNS_NAME/health
curl http://ALB_DNS_NAME/api/health
```

## 資料庫策略

作品集展示版使用 SQLite snapshot，檔案會被打包進 API image：

- `data/beautycx.sqlite`
- container 內路徑：`/app/data/beautycx.sqlite`

這個做法適合 demo 與作品集展示，優點是成本低、部署簡單、不需要長期維護 RDS。

原始資料來源是 AWS RDS for SQL Server / MSSQL 備份。若要改回 production-like 架構，建議使用：

- Amazon RDS SQL Server 或 RDS PostgreSQL
- AWS Secrets Manager
- private subnet
- ECS task secrets 注入

不建議在正式 ECS task 內直接執行資料庫 container，避免資料持久化與備份風險。
