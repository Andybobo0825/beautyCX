"""
從 SQL Server 的 Product_Picture.pic (varbinary) 直接搬到 S3
執行：
  python services/migrate_sql_to_s3.py --dry-run        # 只檢查
  python services/migrate_sql_to_s3.py                 # 實際遷移
  python services/migrate_sql_to_s3.py --limit 10      # 先遷移 10 筆測試
  python services/migrate_sql_to_s3.py --verify        # 遷移後檢查
  python services/migrate_sql_to_s3.py --test --pId P01  # 單筆測試
"""
import os
import sys
from datetime import datetime
import traceback
import io
from dotenv import load_dotenv
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, '.env'))
from PIL import Image

# 專案根目錄放進 sys.path，方便 import
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, PROJECT_ROOT)

from dbconfig.dbconnect import engine
from models.models import Product_Picture
from services.s3_service import s3_service
from sqlalchemy.orm import sessionmaker

class SqlToS3Migrator:
    def __init__(self):
        self.session_factory = sessionmaker(bind=engine)
        # 驗證 AWS/S3 連線
        import boto3
        self.bucket = os.environ.get('S3_BUCKET_NAME')
        try:
            boto3.client(
                's3',
                aws_access_key_id=os.environ.get('AWS_ACCESS_KEY_ID'),
                aws_secret_access_key=os.environ.get('AWS_SECRET_ACCESS_KEY'),
                region_name=os.environ.get('AWS_REGION'),
            ).head_bucket(Bucket=self.bucket)
            print(f"✓ 已連線 S3 bucket: {self.bucket}")
        except Exception as exc:
            raise RuntimeError(f"S3 Bucket 無法連線，請檢查環境變數與權限: {exc}")

    def _detect_extension(self, data: bytes) -> str:
        try:
            img = Image.open(io.BytesIO(data))
            fmt = (img.format or 'PNG').lower()
            return {'jpeg': 'jpg', 'jpg': 'jpg'}.get(fmt, fmt)
        except Exception:
            return 'png'

    def _get_size(self, data: bytes):
        try:
            img = Image.open(io.BytesIO(data))
            return img.size
        except Exception:
            return None, None

    def migrate_record(self, record, session):
        if not record.pic:
            return False, "pic 為空"

        pic_id = str(record.picId)
        raw = bytes(record.pic)          # 轉成 bytes
        if not raw:
            return False, "pic 長度為 0"

        ext = self._detect_extension(raw)
        width, height = self._get_size(raw)
        storage_key = f"public/{record.pId}/{pic_id}.{ext}"

        try:
            s3_service.s3_client.put_object(
                Bucket=self.bucket,
                Key=storage_key,
                Body=raw,
                ContentType=f"image/{ext}",
                Metadata={
                    "product_id": str(record.pId or ""),
                    "pic_id": pic_id,
                    "is_main": str(record.isMain or 0),
                    "migrated_at": datetime.utcnow().isoformat()
                }
            )
        except Exception as exc:
            session.rollback()
            return False, f"S3 上傳失敗: {exc}"

        record.storage_key = storage_key
        record.file_extension = ext
        record.width = width
        record.height = height
        record.visibility = record.visibility or 'public'
        record.updateTime = datetime.utcnow()
        session.commit()
        return True, f"已更新 storage_key={storage_key}"
    def migrate_all(self, dry_run=False, limit=None):
        session = self.session_factory()
        try:
            query = session.query(Product_Picture).filter(
                Product_Picture.pic.isnot(None),
                (Product_Picture.storage_key.is_(None)) | (Product_Picture.storage_key == '')
            ).order_by(Product_Picture.pId)
            if limit:
                query = query.limit(limit)

            rows = query.all()
            total = len(rows)
            if total == 0:
                print("沒有待遷移的資料")
                return

            print(f"共 {total} 筆需要遷移")
            preview = rows[:5]
            for idx, rec in enumerate(preview, 1):
                size = len(rec.pic) if rec.pic else 0
                print(f"  {idx}. pId={rec.pId}, picId={rec.picId}, size={size} bytes, isMain={rec.isMain}")

            if dry_run:
                print("Dry-run 模式，不做任何修改")
                return

            confirm = input("輸入 yes 開始遷移: ").strip().lower()
            if confirm != 'yes':
                print("已取消")
                return

            success = fail = 0
            errors = []
            for idx, rec in enumerate(rows, 1):
                ok, msg = self.migrate_record(rec, session)
                tag = "✓" if ok else "✗"
                if ok:
                    success += 1
                else:
                    fail += 1
                    errors.append((rec.pId, rec.picId, msg))
                print(f"[{idx}/{total}] {tag} {rec.pId}/{rec.picId}: {msg}")

            print(f"\n完成: 成功 {success} 筆，失敗 {fail} 筆")
            if errors:
                print("失敗明細 (最多顯示 10 筆):")
                for item in errors[:10]:
                    print(f"  - {item[0]}/{item[1]}: {item[2]}")

        finally:
            session.close()

    def verify(self):
        session = self.session_factory()
        try:
            total = session.query(Product_Picture).count()
            migrated = session.query(Product_Picture).filter(
                Product_Picture.storage_key.isnot(None),
                Product_Picture.storage_key != ''
            ).count()
            pending = session.query(Product_Picture).filter(
                Product_Picture.pic.isnot(None),
                (Product_Picture.storage_key.is_(None)) | (Product_Picture.storage_key == '')
            ).count()

            print("驗證結果：")
            print(f"  總筆數     : {total}")
            print(f"  已遷移     : {migrated}")
            print(f"  尚未遷移   : {pending}")
            print(f"  遷移完成率 : {migrated}/{total} ({round(migrated*100/total, 2) if total else 0}%)")
        finally:
            session.close()

    def test_single(self, pId=None):
        session = self.session_factory()
        try:
            query = session.query(Product_Picture).filter(Product_Picture.pic.isnot(None))
            if pId:
                query = query.filter(Product_Picture.pId == pId)
            rec = query.first()
            if not rec:
                print("找不到可測試的資料")
                return
            ok, msg = self.migrate_record(rec, session)
            print(("✓" if ok else "✗") + f" 測試結果: {msg}")
            if ok:
                visibility = rec.visibility or 'public'
                url = f"https://{os.environ.get('CLOUDFRONT_DOMAIN')}/{rec.storage_key}"
                print(f"  visibility: {visibility}")
                print(f"  URL: {url}")
        finally:
            session.close()


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="SQL varbinary → S3 遷移工具")
    parser.add_argument("--dry-run", action="store_true", help="只預覽，不寫入")
    parser.add_argument("--limit", type=int, help="僅處理前 N 筆")
    parser.add_argument("--verify", action="store_true", help="檢查遷移狀態")
    parser.add_argument("--test", action="store_true", help="測試單筆遷移")
    parser.add_argument("--pId", type=str, help="搭配 --test 指定商品 ID")
    args = parser.parse_args()
 
    tool = SqlToS3Migrator()
    if args.verify:
        tool.verify()
    elif args.test:
        tool.test_single(args.pId)
    else:
        tool.migrate_all(dry_run=args.dry_run, limit=args.limit)
        tool.verify()