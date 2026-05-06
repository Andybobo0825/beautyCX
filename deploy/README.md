# GitHub Actions 部署說明

這份專案目前改用 GitHub Actions 做 CI/CD，不使用 AWS CodePipeline / CodeBuild / Terraform pipeline。

## 原則

- `Client/` 與 `serverclient/` 的既有架構與程式語言不重寫。
- 後端保留 Python Flask + SQLAlchemy 架構。
- 作品集展示版使用 `data/beautycx.sqlite`，由 `DATABASE_PATH=/app/data/beautycx.sqlite` 啟用。
- Docker、Compose、GitHub Actions 只負責包裝、建置、驗證與部署。

## 本機 Docker Compose

```bash
docker compose config --quiet
docker compose up --build
```

服務：

- 前端：`http://localhost:3000`
- 後端：`http://localhost:5001`
- Redis：`localhost:6379`

## GitHub Actions

### CI

`.github/workflows/ci.yml` 會在 PR 與 push 到 `main` 時執行：

1. 安裝並建置 React 前端。
2. 建置 Python Flask 後端 Docker image。
3. 檢查 `compose.yaml` 語法。

### CD

`.github/workflows/deploy.yml` 會在 push 到 `main` 或手動觸發時：

1. 建置前端 image 並推送到 GHCR。
2. 建置後端 image 並推送到 GHCR。
3. 若有設定 EC2 secrets，透過 SSH 在 EC2 上執行 `docker compose pull` 與 `docker compose up -d`。

## 需要的 GitHub Secrets

若只要 CI，不需要設定 secrets。

若要部署到 EC2，請設定：

- `EC2_HOST`
- `EC2_USER`
- `EC2_SSH_KEY`
- `EC2_DEPLOY_PATH`
- `APP_SECRET_KEY`

選填，若你的圖片服務要連 S3 / CloudFront 再設定：

- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `S3_BUCKET_NAME`
- `CLOUDFRONT_DOMAIN`
- `API_GATEWAY_URL`

## EC2 前置需求

EC2 只需要：

- Docker
- Docker Compose plugin
- 部署使用者可執行 Docker
- 防火牆 / Security Group 開放 HTTP 80
