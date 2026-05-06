import os
from pathlib import Path
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine

# 保留原本 Flask + SQLAlchemy 架構：預設仍支援 MSSQL。
# 作品集 / Docker demo 可用 DATABASE_URL 或 DATABASE_PATH 切換到 SQLite，不重寫既有後端語言與路由架構。
BASE_DIR = Path(__file__).resolve().parents[2]
DATABASE_PATH = os.getenv("DATABASE_PATH")
DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL:
    DB_URI = DATABASE_URL
elif DATABASE_PATH:
    sqlite_path = Path(DATABASE_PATH)
    if not sqlite_path.is_absolute():
        sqlite_path = BASE_DIR / sqlite_path
    DB_URI = f"sqlite:///{sqlite_path}"
else:
    DB_USERNAME = os.getenv("DB_USERNAME", "sa")
    DB_SERVER = os.getenv("DB_SERVER", "localhost")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "QWEasd+123")
    DB_PORT = os.getenv("DB_PORT", "1433")
    DB_NAME = os.getenv("DB_NAME", "DB")
    DB_DRIVER = os.getenv("DB_DRIVER", "ODBC Driver 17 for SQL Server")

    if DB_PORT:
        DB_HOST = f"{DB_SERVER},{DB_PORT}"
    else:
        DB_HOST = DB_SERVER

    DB_URI = (
        f"mssql+pyodbc://{DB_USERNAME}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"
        f"?driver={DB_DRIVER.replace(' ', '+')}&TrustServerCertificate=yes"
    )


def _create_engine_options(uri: str):
    if uri.startswith("sqlite"):
        return {"connect_args": {"check_same_thread": False}}
    return {}


db = SQLAlchemy()
engine = create_engine(DB_URI, **_create_engine_options(DB_URI))

# 原本 models 使用 SQL Server schema='dbo'。
# SQLite 沒有 schema；這裡把同一份 SQLite 檔 attach 成 dbo，讓既有 model/query 不需要改寫。
if DB_URI.startswith("sqlite") and DATABASE_PATH:
    sqlite_file = Path(DATABASE_PATH)
    if not sqlite_file.is_absolute():
        sqlite_file = BASE_DIR / sqlite_file
    sqlite_file = sqlite_file.resolve()

    @event.listens_for(Engine, "connect")
    def _attach_dbo_schema(dbapi_connection, connection_record):
        # Flask-SQLAlchemy 會建立自己的 engine；監聽所有 SQLAlchemy engine 的 connect，
        # 但只有 sqlite connection 會執行 ATTACH。
        if dbapi_connection.__class__.__module__ != "sqlite3":
            return
        try:
            dbapi_connection.execute("ATTACH DATABASE ? AS dbo", (str(sqlite_file),))
        except Exception as exc:
            if "already in use" not in str(exc).lower():
                raise
