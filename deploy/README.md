# Deploy Layout

這份目錄對應 EC2 上的部署結構：

- `docker-compose.prod.yml` 用來跑後端 container 與 nginx
- `nginx/default.conf` 提供 SPA 靜態站台與 `/api` 反向代理
- `backend.env.example` 是後端 runtime 環境變數範本

## 部署方式

CI/CD 會做兩件事：

1. 建立後端 Docker image 並推到 GHCR
2. 建立前端 `build/` artifact，透過 SSH 傳到 EC2

EC2 上只需要：

- Docker
- Docker Compose plugin
- 可讓 deploy 使用者執行 Docker

## GitHub Secrets

部署 workflow 會用到這些 secrets：

- `EC2_HOST`
- `EC2_USER`
- `EC2_SSH_KEY`
- `EC2_DEPLOY_PATH`
- `GHCR_USERNAME`
- `GHCR_TOKEN`
- `APP_SECRET_KEY`
- `DB_USERNAME`
- `DB_PASSWORD`
- `DB_SERVER`
- `DB_PORT`
- `DB_NAME`
- `REDIS_HOST`
- `REDIS_PORT`
- `REDIS_DB`
- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `S3_BUCKET_NAME`
- `CLOUDFRONT_DOMAIN`
- `API_GATEWAY_URL`

前端 build 會固定使用：

- `REACT_APP_API_URL=/api`

這樣 nginx 會把 `/api/*` 轉發到 backend container。
