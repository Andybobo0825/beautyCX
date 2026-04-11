from flask import Flask
from routes.LoginPage import login_bp
from routes.RegisterPage import register_bp
from routes.Frame import frame_bp
from routes.HomePage import home_bp
from routes.GoodPage import goodPage_bp
from routes.GoodDetail import goodDetail_bp
from routes.ClientPage import clientPage_bp
from routes.ProductPicture import product_picture_bp
from dbconfig.dbconnect import DB_URI, db
from services.click_times_service import click_times_service
import os
from flask_cors import CORS
from apscheduler.schedulers.background import BackgroundScheduler

# 創建 Flask 應用實例
# app = Flask(__name__)
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})


# 設定應用密鑰（用於會話、JWT等）
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev_key_for_testing')

# 設定 SQLAlchemy 連線
app.config['SQLALCHEMY_ECHO'] = os.environ.get('SQLALCHEMY_ECHO', 'false').lower() == 'true'
app.config["SQLALCHEMY_DATABASE_URI"] = DB_URI
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# 初始化 SQLAlchemy
db.init_app(app)

# 註冊藍圖（Blueprint）- 這將引入 login_bp 中定義的所有路由
app.register_blueprint(login_bp)
app.register_blueprint(register_bp)
app.register_blueprint(frame_bp)
app.register_blueprint(home_bp)
app.register_blueprint(goodPage_bp)
app.register_blueprint(goodDetail_bp)
app.register_blueprint(clientPage_bp)
app.register_blueprint(product_picture_bp)
# 定義根路由 - 用來檢查 API 服務是否正常運行
@app.route("/")
def home():
    """首頁端點，返回簡單訊息表示 API 服務運行中"""
    return {"message": "API Server is running"}

# 全域變數：背景任務排程器
scheduler = None

# 啟動背景任務：定期同步 Redis 點擊次數到資料庫
def start_background_sync():
    """啟動背景任務，每 5 分鐘同步一次點擊次數"""
    global scheduler
    try:
        scheduler = BackgroundScheduler()
        scheduler.add_job(
            func=click_times_service.sync_to_db,
            trigger="interval",
            minutes=5,  # 每 5 分鐘同步一次
            id='sync_click_times',
            name='同步點擊次數到資料庫',
            replace_existing=True
        )
        scheduler.start()
        print("背景任務已啟動：每 5 分鐘同步點擊次數到資料庫")
    except Exception as e:
        print(f"背景任務啟動失敗: {e}")

def shutdown_background_sync():
    """關閉背景任務"""
    global scheduler
    if scheduler:
        try:
            scheduler.shutdown()
            print("背景任務已關閉")
        except Exception as e:
            print(f"關閉背景任務失敗: {e}")

# 主程序入口點
if __name__ == "__main__":
    import atexit
    
    # 啟動背景同步任務
    start_background_sync()
    
    # 註冊關閉處理函數
    atexit.register(shutdown_background_sync)
    
    try:
        app.run(
            debug=os.environ.get("FLASK_DEBUG", "false").lower() == "true",
            host="0.0.0.0",
            port=int(os.environ.get("PORT", "5001"))
        )
    finally:
        shutdown_background_sync()
