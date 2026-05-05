# beautyCX

這份專案是我的大學期末專題作品，主題是「美妝商品比價與會員收藏平台」。

這份 README 以作品集展示為目的撰寫，重點放在我負責的 `後端開發`、`雲端架構設計` 與後續補強的 `Docker / ECS / CodePipeline DevOps`。前端介面為團隊共同成果；目前 repository 已整理成低成本、可部署、可驗證的作品集展示版。

## HR 快速摘要

- 專案類型：大學期末團隊專題，後續整理為作品集展示專案。
- 我的角色：後端工程、資料模型設計、雲端架構設計、DevOps 整理。
- 核心目標：整合多通路美妝商品資料，提供搜尋、比價、價格歷史、會員登入、收藏追蹤與商品圖片服務。
- 原始後端亮點：JWT 驗證、Redis 快取與回寫、SQL Server / RDS 資料模型、S3 + CloudFront 圖片交付、註冊通知串接 API Gateway + Lambda + SES。
- 目前作品集展示版亮點：MSSQL 備份轉 SQLite snapshot、Node.js / Express API、Docker Compose、本機測試、ECS Fargate、ECR、CodeBuild、CodePipeline、Terraform。
- 展示策略：保留原始系統設計脈絡，同時用 SQLite + ECS CI/CD 降低 demo 成本與維運負擔。

## 面試 1 分鐘速讀版

- 我負責這個美妝比價平台的後端 API 與雲端設計，主軸是「把商品、價格、會員、圖片服務整合成可運作的系統」。
- 原始專題以 `Flask + SQLAlchemy + SQL Server` 建立商品列表、搜尋、商品明細、價格歷史、評論、收藏與會員系統。
- 我設計過 `JWT + refresh token + Redis blacklist` 的登入驗證流程，處理登入狀態與登出失效。
- 我用 `Redis + SQL Server` 設計熱門商品點擊數快取與回寫機制，降低高頻更新直接打資料庫的成本。
- 我把商品圖片從資料庫二進位欄位遷移到 `S3`，並透過 `CloudFront` 與簽名 URL 設計圖片交付方式。
- 我也把註冊通知流程拆到 `API Gateway + Lambda + SES`，代表我不只寫 API，也有基礎雲端分層與服務整合能力。
- 後續作品集整理時，我將原始 `DB20251219_backup` SQL Server 備份轉成匿名化 SQLite snapshot，改成低成本展示版。
- DevOps 版本改用 `Docker + ECS Fargate + ECR + CodeBuild + CodePipeline + Terraform`，並移除舊 GitHub Actions，避免 push 時誤觸發舊 EC2 workflow。

## 專案背景

`beautyCX` 想解決的問題是：使用者在購買美妝商品時，常需要在不同通路之間反覆比價、查看價格波動、確認評論與追蹤喜歡的商品。

因此這個平台整合了：

- 商品列表與分類瀏覽
- 關鍵字搜尋
- 單一商品的多通路價格比較
- 價格歷史查詢
- 商品評論查詢
- 會員註冊 / 登入 / 個人資料管理
- 商品收藏追蹤
- 商品圖片雲端化與 CDN 加速

## 我負責的內容

我在原始專題中主要負責 `serverclient/` 內的後端與雲端設計。後續整理作品集時，也補上 Docker、資料轉換與 ECS CI/CD 流程。

### 原始專題後端與雲端設計

- 使用 `Flask` 與 `SQLAlchemy` 建立模組化後端 API，拆分為登入、註冊、商品列表、商品明細、會員中心與圖片服務等 Blueprint。
- 設計並維護 `SQL Server` 資料模型，涵蓋商品、即時價格、價格歷史、會員、收藏、評論與商品圖片 metadata。
- 實作會員驗證機制，包含 `JWT access token`、`refresh token`、密碼雜湊儲存與 `Redis blacklist` 登出失效流程。
- 開發商品搜尋、分類瀏覽、價格查詢、價格歷史、評論讀取、收藏切換與會員資料更新等核心 API。
- 設計 `Redis + Database` 混合快取策略處理商品 `clickTimes`，以 write-back、cache-aside 與 fallback 機制降低高頻更新對資料庫的壓力。
- 規劃商品圖片雲端化流程，將圖片由資料庫 `varbinary` 遷移至 `AWS S3`，並透過 `CloudFront` 提供公開 URL 或簽名 URL。
- 串接 `API Gateway + Lambda + SES` 作為註冊通知流程，將即時通知能力從主應用服務中拆分。
- 整理資料表、API 文件、測試腳本與架構圖，提升專案展示、交接與作品集說明的完整度。

### 作品集展示版整理

- 將原始 SQL Server `.bak` 備份還原並轉成 SQLite snapshot。
- 匿名化會員個資欄位，避免作品集 repo 帶出 email、phone、password 等敏感資料。
- 將後端展示 API 改為 `Node.js / Express + node:sqlite`，方便在容器與 ECS 中低成本執行。
- 補上 `Dockerfile`、`compose.yaml`、`buildspec.yml`、Terraform ECS pipeline scaffold。
- 移除舊 GitHub Actions workflow，改以 AWS CodePipeline 作為預期 CI/CD 入口。

## 功能總覽

### 1. 商品探索

- 首頁可依分類瀏覽商品。
- 可依熱門度、價格、評論排序。
- 搜尋功能可用關鍵字查詢商品名稱與品牌。

原始實作對應：`HomePage`、`GoodPage`、`Frame` 相關 API 模組。  
目前展示版對應：`GET /api/products`。

### 2. 商品明細與比價

- 取得商品基本資訊。
- 顯示不同通路的即時價格。
- 查詢價格歷史，觀察價格波動。
- 顯示商品評論。
- 顯示商品圖片 metadata 與圖片內容。

目前展示版對應：

- `GET /api/products/:productId`
- `GET /api/products/:productId/pictures/:pictureId`

### 3. 會員系統

原始專題支援：

- 註冊帳號
- 登入並取得 access token / refresh token
- 驗證登入狀態
- refresh token 換發 access token
- 登出後將 token 加入 Redis blacklist
- 查詢與更新會員資料
- 修改密碼

目前展示版以資料瀏覽與 DevOps 展示為主，未重新開放登入流程；SQLite 內的會員資料已匿名化。

### 4. 收藏追蹤

原始專題支援：

- 使用者可切換商品追蹤狀態。
- 可查詢自己的追蹤清單。
- 商品明細頁可回傳目前是否已收藏。

目前展示版保留 `Client_Favorites` 資料表與資料，可作為日後補回會員功能的資料基礎。

### 5. 熱門度統計

原始專題中，商品 `clickTimes` 是高頻更新欄位，我設計了 Redis 優先累加與背景回寫 SQL Server 的策略。

目前展示版保留商品熱門度欄位，並透過 SQLite snapshot 提供 demo 查詢。

### 6. 圖片雲端化

原始專題設計：

- 商品圖片早期存放於 SQL Server `varbinary`。
- 後續遷移到 AWS S3，資料表只保留 `storage_key`、尺寸、可見性等欄位。
- API 依圖片權限產生 CloudFront URL，減少資料庫負擔並改善前端載入。

目前展示版：

- SQLite snapshot 保留 `Product_Picture` blob 與 metadata。
- API 可直接回傳圖片 blob，方便作品集 demo 不依賴 S3。
- README 與部署文件保留 production 可切回 S3 / CloudFront 的設計說明。

## 架構設計

### 原始專題架構

- 前端：React。
- 後端：Flask + SQLAlchemy REST API。
- 資料庫：SQL Server / AWS RDS for SQL Server。
- 快取：Redis，負責熱門商品點擊數與部分列表快取。
- 物件儲存：AWS S3，儲存商品圖片。
- CDN：AWS CloudFront，提供圖片加速與 URL 發佈。
- 雲端整合：AWS API Gateway + Lambda + SES，處理註冊通知信串接。

### 目前作品集展示版架構

- 前端：`Client/`，Vite + React，正式環境由 Nginx container 提供靜態檔案。
- 後端：`serverclient/`，Node.js / Express API。
- 資料庫：`data/beautycx.sqlite`，由原始 SQL Server 備份轉換並匿名化。
- 本機：`docker compose up --build` 啟動 web + api。
- 雲端：ECS Fargate service 內同時執行 `web` 與 `api` 兩個 container。
- CI/CD：CodePipeline 從 GitHub 取碼，CodeBuild 建置 image 並推送到 ECR，ECS deploy action 更新服務。

### 依原始架構整理的雲端流程

原始專題曾設計以下雲端分層：

- 對外流量進入 public subnet 中的應用服務入口。
- 應用服務部署在 public subnet，承接 Flask API 與背景排程。
- Redis 與 RDS SQL Server 放在 private subnet，降低核心資料直接暴露風險。
- 商品圖片由 S3 + CloudFront 提供交付與快取。
- 註冊通知信流程走 `API Gateway -> Lambda -> SES -> User`。

### 圖片 CDN 設計思路

商品圖片的 production 設計流程是：

1. 商品頁向後端圖片 API 請求圖片列表。
2. 後端查詢資料庫內的圖片 metadata，例如 `storage_key`、`is_main`、`width`、`height`、`visibility`。
3. 若圖片是公開資源，後端直接組出 CloudFront URL。
4. 若圖片是私有資源，後端產生 Signed URL。
5. 前端向 CloudFront 取圖，命中 edge cache 就直接回應，未命中則透過 Origin Access Control 回源到私有 S3 bucket。

這個設計代表我在專題中不只是把圖片搬到 S3，而是進一步思考：

- 公開圖與私有圖要用不同交付策略。
- CloudFront 應該站在使用者與 S3 之間，減少源站壓力。
- S3 bucket 可維持私有，不直接暴露給前端。
- 後端 API 應負責 URL 組裝與權限判斷，而不是把儲存細節暴露給前端。

## 後端設計重點

### A. 模組化 API 架構

原始專題將 API 依功能拆成不同模組，讓每個模組責任單一、方便維護：

- 登入 / token / 登出
- 註冊與欄位驗證
- 首頁商品列表
- 商品列表頁
- 商品明細 / 價格 / 評論 / 點擊 / 收藏
- 會員資料與收藏清單
- 商品圖片 URL

目前展示版則保留最能展示資料與 DevOps 的 API：

- `GET /health`
- `GET /health/ready`
- `GET /api/products`
- `GET /api/products/stats`
- `GET /api/products/:productId`
- `GET /api/products/:productId/pictures/:pictureId`

### B. Redis + Database 混合策略

原始專題中，`clickTimes` 是高頻更新欄位，如果每次點擊都直接寫資料庫，成本高且容易造成壓力。因此我設計了：

- `Write-Back`：先寫 Redis，再定期回寫 DB。
- `Cache-Aside`：查詢時優先讀 Redis，沒有再回 DB。
- `Fallback`：Redis 異常時改直接寫 DB，避免功能中斷。
- `Batch Sync`：背景排程定期合併 Redis 與 DB，取較大值避免資料被覆蓋。

目前展示版不啟用 Redis，改用 SQLite snapshot 展示資料查詢；這是為了降低雲端 demo 成本。

### C. 資料庫展示策略

原始 production-like 版本使用 RDS SQL Server；作品集展示版改用 SQLite snapshot：

- 原始備份：`DB20251219_backup`，不提交版本控制。
- 展示資料庫：`data/beautycx.sqlite`。
- 轉換報告：`data/beautycx-sqlite-report.json`。
- 轉換工具：`tools/mssql-json-to-sqlite.mjs`。

資料量：

- `Client`：7 筆，已匿名化。
- `Product`：42 筆。
- `Price_Now`：126 筆。
- `Price_History`：509 筆。
- `Client_Favorites`：10 筆。
- `Good_Review`：24 筆。
- `Product_Picture`：48 筆。

這個策略的目的不是否定 RDS，而是讓作品集 demo 可以低成本、穩定、可重現地部署；若要正式營運，可切回 RDS SQL Server 或改為 RDS PostgreSQL。

## DevOps / CI/CD 設計

### 本機開發

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

### 驗證指令

```bash
docker compose config --quiet
npm --prefix serverclient test
npm --prefix Client run build
terraform -chdir=infra/terraform fmt -check -recursive
terraform -chdir=infra/terraform init -backend=false
terraform -chdir=infra/terraform validate
```

### AWS ECS CI/CD 架構

Pipeline 流程：

1. Source：CodePipeline 透過 CodeStar Connection 從 GitHub 取得程式碼。
2. Build：CodeBuild 執行 `buildspec.yml`。
3. Images：CodeBuild 建置 API 與 Web Docker image，並推送到 ECR。
4. Deploy：CodePipeline 使用 `imagedefinitions.json` 更新 ECS Fargate service。

因為 CodeBuild 需要建置 Docker image，所以 CodeBuild project 必須啟用 privileged mode。

### 部署基礎設施

```bash
cp infra/terraform/terraform.tfvars.example infra/terraform/terraform.tfvars
# 編輯 github_repo_id 與 codestar_connection_arn
terraform -chdir=infra/terraform init
terraform -chdir=infra/terraform plan
terraform -chdir=infra/terraform apply
```

小型專案預設為 1 個 Fargate task，並在同一個 task 中執行 `web` 與 `api` 兩個 container，前方使用 1 個 ALB 對外提供 HTTP 服務。

### Container 名稱契約

`buildspec.yml` 產出的 `imagedefinitions.json` 使用以下 container 名稱：

- `api`
- `web`

這兩個名稱必須與 ECS task definition 中的 container name 完全一致，否則 CodePipeline 的 ECS deploy action 無法更新 image。

### API 反向代理

`web` container 會將 `/api` 代理到 API container：

- 本機 Docker Compose：`API_UPSTREAM=api:8080`
- ECS Fargate 同 task 部署：`API_UPSTREAM=127.0.0.1:8080`

### GitHub Actions 狀態

目前 repository 不使用 GitHub Actions，`.github/workflows/` 內沒有 workflow 檔案。

這是刻意設計：避免 push 到 `main` 時觸發舊版 EC2 / GHCR workflow；目前預期的 CI/CD surface 是 AWS CodePipeline。

## 專案結構

```text
beautyCX/
|- Client/                  # Vite + React 前端展示頁
|- serverclient/            # Node.js / Express API
|  |- routes/               # health 與 products API
|  |- services/             # SQLite 商品查詢服務
|  |- dbconfig/             # SQLite 連線設定
|  |- test-scripts/         # Node test regression tests
|- data/                    # 匿名化 SQLite snapshot 與轉換報告
|- tools/                   # MSSQL JSON 轉 SQLite 工具
|- infra/terraform/         # ECS / ECR / CodeBuild / CodePipeline Terraform
|- deploy/aws/              # AWS ECS 部署說明
|- compose.yaml             # 本機 Docker Compose
|- buildspec.yml            # AWS CodeBuild 規格
|- README.md                # 作品集與部署說明
```

## 我希望 HR 看見的能力

- 我會把功能拆模組，而不是把所有邏輯塞進單一檔案。
- 我會考慮快取、資料一致性與失敗 fallback，而不是只追求功能能跑。
- 我會思考圖片、資料庫與 CDN 各自適合做什麼。
- 我會把註冊通知、圖片交付、熱門度統計拆成不同服務，降低耦合。
- 我知道作品集展示版與正式 production 架構可以不同，並能根據成本、維運與展示目的做取捨。
- 我能把既有專題整理成 container-first、可測試、可部署、可說明的 DevOps 版本。

## 後續可優化方向

如果把這份專題再往正式產品推進，我會優先補這幾件事：

- 將展示版 SQLite 切回 RDS SQL Server 或 RDS PostgreSQL，並用 Secrets Manager 管理連線資訊。
- 補回完整登入、收藏、會員 API 到目前 Node.js 版本。
- 將商品圖片正式遷移到 S3 + CloudFront，不再由 SQLite blob 回傳。
- 加上 CloudWatch dashboard、ECS deployment alarm 與集中式日誌。
- 補上更完整的 API 文件與端對端測試。
- 視需求增加 staging branch / staging pipeline，避免 main 直接部署 production。

## 備註

- 本 README 同時保留「原始專題能力說明」與「目前作品集展示版部署方式」。
- 原始 SQL Server 備份 `DB20251219_backup` 不應提交版本控制；目前已由 `.gitignore` 排除。
- 目前 commit 內保留匿名化 SQLite snapshot，方便作品集展示與 ECS demo。
