# beautyCX

beautyCX 目前整理為以容器為核心、可透過 AWS ECS 進行 CI/CD 的 Web 專案：

- `Client/` — Vite + React 前端，正式環境由 Nginx 提供靜態檔案服務。
- `serverclient/` — Node.js / Express API。
- `compose.yaml` — 本機開發用 Docker Compose，包含前端與 API。
- `buildspec.yml` — AWS CodeBuild 使用的建置、測試、推送映像檔流程。
- `infra/terraform/` — AWS ECS Fargate、ECR、CodePipeline、CodeBuild 基礎設施。
- `deploy/aws/` — AWS 部署操作說明。

## 本機開發

```bash
cp .env.example .env
npm --prefix serverclient install
npm --prefix Client install
docker compose up --build
```

開啟服務：

- 前端：<http://localhost:3000>
- API health check：<http://localhost:8080/health>
- 前端反向代理 API health check：<http://localhost:3000/api/health>

## 驗證 DevOps 設定

```bash
docker compose config --quiet
npm --prefix serverclient test
npm --prefix Client run build
terraform -chdir=infra/terraform fmt -check -recursive
terraform -chdir=infra/terraform init -backend=false
terraform -chdir=infra/terraform validate
```

## AWS ECS CI/CD 架構

Pipeline 流程：

1. Source：CodePipeline 透過 CodeStar Connection 從 GitHub 取得程式碼。
2. Build：CodeBuild 執行 `buildspec.yml`。
3. Images：CodeBuild 建置 API 與 Web Docker image，並推送到 ECR。
4. Deploy：CodePipeline 使用 `imagedefinitions.json` 更新 ECS Fargate service。

因為 CodeBuild 需要建置 Docker image，所以 CodeBuild project 必須啟用 privileged mode。

## 部署基礎設施

```bash
cp infra/terraform/terraform.tfvars.example infra/terraform/terraform.tfvars
# 編輯 github_repo_id 與 codestar_connection_arn
terraform -chdir=infra/terraform init
terraform -chdir=infra/terraform plan
terraform -chdir=infra/terraform apply
```

小型專案預設為 1 個 Fargate task，並在同一個 task 中執行 `web` 與 `api` 兩個 container，前方使用 1 個 ALB 對外提供 HTTP 服務。

## 重要設定

### Container 名稱契約

`buildspec.yml` 產出的 `imagedefinitions.json` 使用以下 container 名稱：

- `api`
- `web`

這兩個名稱必須與 ECS task definition 中的 container name 完全一致，否則 CodePipeline 的 ECS deploy action 無法更新 image。

### API 反向代理

`web` container 會將 `/api` 代理到 API container：

- 本機 Docker Compose：`API_UPSTREAM=api:8080`
- ECS Fargate 同 task 部署：`API_UPSTREAM=127.0.0.1:8080`

### 資料庫

原始專案資料來源是 AWS RDS for SQL Server / MSSQL 備份。作品集展示版為了降低雲端成本與維運複雜度，已將 `DB20251219_backup` 轉為 SQLite snapshot：

- SQLite 檔案：`data/beautycx.sqlite`
- 轉換報告：`data/beautycx-sqlite-report.json`
- 匯入資料量：Product 42 筆、Price_Now 126 筆、Price_History 509 筆、Product_Picture 48 筆

正式 production 若需要多人高併發寫入，可再切回 RDS SQL Server 或改用 RDS PostgreSQL。

## MSSQL 備份轉 SQLite

目前轉換流程會先用 SQL Server container 還原 `.bak`，再匯出 JSON 並建立 SQLite：

```bash
# 備份檔不建議 commit，放在專案根目錄即可
# DB20251219_backup

# 產生 SQLite snapshot
node --experimental-sqlite tools/mssql-json-to-sqlite.mjs .tmp/mssql/export data/beautycx.sqlite data/beautycx-sqlite-report.json
```

`tools/mssql-json-to-sqlite.mjs` 保留在專案中，方便日後重新產生展示資料庫。
