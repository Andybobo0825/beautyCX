"""
商品點擊次數服務 - 高可用性與高效能版本
- Write-Back 模式：寫入時只更新 Redis，定期批量同步到資料庫
- Cache-Aside 模式：讀取時優先從 Redis 讀，沒有才從資料庫讀
- 錯誤處理：Redis 失敗時自動 fallback 到資料庫
- 資料合併策略：同步時比較 Redis 和 DB 的值，取較大者，避免 Redis 當機期間的增量遺失
  * 如果 Redis 值 > DB 值：以 Redis 為準（正常情況）
  * 如果 DB 值 > Redis 值：以 DB 為準（Redis 當機期間的增量）
  * 同步後更新 Redis 為最終值，確保一致性
- 記憶體管理：同步後將 Redis TTL 重置為 1 小時，控制記憶體使用
  * 熱門商品（有持續點擊）：TTL 會持續重置為 24 小時，保持在 Redis 中
  * 冷門商品（無新點擊）：TTL 會在 1 小時後過期，自動釋放記憶體
"""
from dbconfig.dbconnect import db
from dbconfig.redisconfig import cache
from models.models import Product
from datetime import datetime
import time
import logging

logger = logging.getLogger(__name__)

class ClickTimesService:
    """管理商品點擊次數的服務 - 高可用性版本"""
    
    CACHE_PREFIX = "click_times:"
    CACHE_TTL = 21600  # 6 小時過期時間（用於新寫入的值：熱門資料）
    POST_SYNC_TTL = 3600  # 同步後保留 1 小時（冷門資料）
    BATCH_SIZE = 100  # 每次批量更新的商品數量
    SYNC_INTERVAL = 600  # 每 10 分鐘同步一次（秒）
    
    # Redis 連接狀態快取（避免重複檢查）
    _redis_available = True
    _last_redis_check = 0
    _redis_check_interval = 60  # 每 60 秒檢查一次 Redis 狀態
    
    @classmethod
    def _check_redis_health(cls):
        """檢查 Redis 連線狀態（帶快取，避免頻繁檢查）"""
        current_time = time.time()
        if current_time - cls._last_redis_check < cls._redis_check_interval:
            return cls._redis_available
        
        try:
            cache.ping()
            cls._redis_available = True
        except Exception:
            cls._redis_available = False
        
        cls._last_redis_check = current_time
        return cls._redis_available
    
    @classmethod
    def increment(cls, pId: str) -> int:
        """
        增加商品點擊次數（優先寫 Redis，失敗時 fallback 到資料庫）
        
        處理 Redis 恢復後的情況：
        - 如果 Redis 中沒有該商品的 key（incr 返回 1），先從 DB 讀取基礎值
        - 這樣可以確保 Redis 恢復後不會從 1 開始計數，而是基於 DB 的當前值
        
        Args:
            pId: 商品 ID
        
        Returns:
            新的點擊次數
        """
        cache_key = f"{cls.CACHE_PREFIX}{pId}"
        
        # 優先使用 Redis（快速）
        if cls._check_redis_health():
            try:
                # 先檢查 key 是否存在，如果不存在，先從 DB 讀取基礎值
                exists = cache.exists(cache_key)
                if not exists:
                    # Redis 中沒有該 key（可能是 Redis 恢復後），先從 DB 讀取基礎值
                    try:
                        product = Product.query.filter_by(pId=pId).first()
                        if product and product.clickTimes and product.clickTimes > 0:
                            # 設置 Redis 為 DB 值，然後再累加
                            db_base = product.clickTimes
                            cache.set(cache_key, db_base, ex=cls.CACHE_TTL)
                            logger.info(f"Redis 恢復後，從 DB 基礎值 {db_base} 開始計數")
                    except Exception as e:
                        logger.warning(f"讀取 DB 基礎值失敗: {e}")
                
                # 執行累加
                new_count = cache.incr(cache_key)
                cache.expire(cache_key, cls.CACHE_TTL)
                return int(new_count)
            except Exception as e:
                logger.warning(f"Redis increment 失敗，fallback 到資料庫: {e}")
                cls._redis_available = False
        
        # Fallback: 直接更新資料庫（較慢但可靠）
        return cls._increment_db(pId)
    
    @classmethod
    def get(cls, pId: str) -> int:
        """
        取得商品點擊次數（優先從 Redis 讀取，沒有才從資料庫讀）
        
        邏輯說明：
        1. 優先從 Redis 讀取（最快，且值是最新的，因為會持續累加）
        2. 如果 Redis 中沒有值（過期或不存在），從資料庫讀取最新的值
        3. 從資料庫讀取後，寫入 Redis 以便下次快速讀取
        
        Args:
            pId: 商品 ID
        
        Returns:
            點擊次數
        """
        cache_key = f"{cls.CACHE_PREFIX}{pId}"
        
        # 優先從 Redis 讀取（這是最新的值，因為會持續累加）
        if cls._check_redis_health():
            try:
                cached_value = cache.get(cache_key)
                if cached_value is not None:
                    return int(cached_value)
            except Exception as e:
                logger.warning(f"Redis get 失敗: {e}")
                cls._redis_available = False
        
        # Redis 沒有值或失敗，從資料庫讀取（這是資料的來源）
        try:
            product = Product.query.filter_by(pId=pId).first()
            if product:
                db_value = product.clickTimes or 0
                # 將資料庫的值寫入 Redis（下次讀取會更快）
                if cls._check_redis_health():
                    try:
                        cache.set(cache_key, db_value, ex=cls.CACHE_TTL)
                    except:
                        pass
                return db_value
        except Exception as e:
            logger.error(f"資料庫讀取失敗: {e}")
        
        return 0
    
    @classmethod
    def get_batch(cls, pIds: list) -> dict:
        """
        批量取得多個商品的點擊次數（高效能版本）
        
        邏輯說明：
        1. 優先從 Redis 讀取（最快，且值是最新的，因為會持續累加）
        2. 如果 Redis 中沒有值（過期或不存在），從資料庫讀取最新的值
        3. 從資料庫讀取後，寫入 Redis 以便下次快速讀取
        
        Args:
            pIds: 商品 ID 列表
        
        Returns:
            {pId: clickTimes} 字典
        """
        result = {}
        if not pIds:
            return result
        
        cache_keys = [f"{cls.CACHE_PREFIX}{pId}" for pId in pIds]
        
        # 批量從 Redis 讀取
        if cls._check_redis_health():
            try:
                cached_values = cache.mget(cache_keys)
                for pId, cached_value in zip(pIds, cached_values):
                    if cached_value is not None:
                        # Redis 中有值，直接使用（這是最新的值，因為會持續累加）
                        result[pId] = int(cached_value)
            except Exception as e:
                logger.warning(f"Redis mget 失敗: {e}")
                cls._redis_available = False
        
        # 找出 Redis 中沒有的商品，從資料庫批量讀取（這是資料的來源）
        missing_pIds = [pId for pId in pIds if pId not in result]
        if missing_pIds:
            try:
                products = Product.query.filter(Product.pId.in_(missing_pIds)).all()
                # 使用字典推導式提升效能
                db_values = {product.pId: (product.clickTimes or 0) for product in products}
                result.update(db_values)
                
                # 批量寫入 Redis（使用 pipeline 提升效能）
                # 這樣下次讀取時就可以直接從 Redis 取得，不需要查資料庫
                if cls._check_redis_health() and db_values:
                    try:
                        pipe = cache.pipeline()
                        for pId, value in db_values.items():
                            pipe.set(f"{cls.CACHE_PREFIX}{pId}", value, ex=cls.CACHE_TTL)
                        pipe.execute()
                    except Exception as e:
                        logger.warning(f"Redis pipeline 寫入失敗: {e}")
            except Exception as e:
                logger.error(f"資料庫批量讀取失敗: {e}")
        
        return result
    
    @classmethod
    def sync_to_db(cls, pId: str = None):
        """
        將 Redis 中的點擊次數同步到資料庫（批量同步，高效能）
        
        合併策略：
        - 比較 Redis 和 DB 的值，取較大者（避免 Redis 當機期間的增量遺失）
        - 如果 Redis 值 > DB 值：以 Redis 為準（正常情況）
        - 如果 DB 值 > Redis 值：以 DB 為準（Redis 當機期間的增量）
        - 同步後更新 Redis 為最終值，確保一致性
        
        Args:
            pId: 如果指定，只同步該商品；否則批量同步所有有變更的商品
        """
        if pId:
            # 同步單個商品
            cache_key = f"{cls.CACHE_PREFIX}{pId}"
            try:
                if not cls._check_redis_health():
                    return
                
                cached_value = cache.get(cache_key)
                if cached_value is not None:
                    product = Product.query.filter_by(pId=pId).first()
                    if product:
                        redis_count = int(cached_value)
                        db_count = product.clickTimes or 0
                        
                        # 合併策略：取較大者，避免遺失 Redis 當機期間的增量
                        final_count = max(redis_count, db_count)
                        
                        if final_count != db_count:
                            product.clickTimes = final_count
                            db.session.commit()
                            logger.info(f"已同步 {pId} 的點擊次數: Redis={redis_count}, DB={db_count}, 最終={final_count}")
                            
                            # 更新 Redis 為最終值，確保一致性
                            try:
                                cache.set(cache_key, final_count, ex=cls.POST_SYNC_TTL)
                            except Exception as e:
                                logger.warning(f"更新 Redis 值失敗: {e}")
                        else:
                            # 值相同，只重置 TTL
                            try:
                                cache.expire(cache_key, cls.POST_SYNC_TTL)
                            except Exception as e:
                                logger.warning(f"重置 Redis TTL 失敗: {e}")
            except Exception as e:
                logger.error(f"同步 {pId} 失敗: {e}")
                db.session.rollback()
        else:
            # 批量同步：找出所有有 click_times: 前綴的 key
            try:
                if not cls._check_redis_health():
                    logger.warning("Redis 不可用，跳過批量同步")
                    return
                
                pattern = f"{cls.CACHE_PREFIX}*"
                keys = cache.keys(pattern)
                
                if not keys:
                    return
                
                # 批量讀取（使用 pipeline）
                pipe = cache.pipeline()
                for key in keys:
                    pipe.get(key)
                values = pipe.execute()
                
                # 準備批量更新資料庫（先讀取 Redis 值）
                redis_updates = {}
                for key, value in zip(keys, values):
                    if value is not None:
                        pId = key.decode('utf-8').replace(cls.CACHE_PREFIX, '')
                        redis_updates[pId] = int(value)
                
                if redis_updates:
                    # 批量從資料庫讀取當前值，進行合併
                    pIds_list = list(redis_updates.keys())
                    products = Product.query.filter(Product.pId.in_(pIds_list)).all()
                    db_values = {product.pId: (product.clickTimes or 0) for product in products}
                    
                    # 合併策略：比較 Redis 和 DB 的值，取較大者
                    final_updates = {}
                    redis_to_update = {}  # 需要更新 Redis 的值
                    for pId, redis_count in redis_updates.items():
                        db_count = db_values.get(pId, 0)
                        final_count = max(redis_count, db_count)
                        final_updates[pId] = final_count
                        
                        # 如果最終值與 Redis 不同，需要更新 Redis
                        if final_count != redis_count:
                            redis_to_update[pId] = final_count
                    
                    # 批量更新資料庫
                    if final_updates:
                        for pId, count in final_updates.items():
                            Product.query.filter_by(pId=pId).update({'clickTimes': count})
                        db.session.commit()
                        
                        merged_count = len([pId for pId in final_updates.keys() if redis_updates[pId] != final_updates[pId]])
                        logger.info(f"批量同步 {len(final_updates)} 個商品的點擊次數（其中 {merged_count} 個進行了合併）")
                        
                        # 更新 Redis：將需要更新的值設為最終值，其他只重置 TTL
                        try:
                            pipe = cache.pipeline()
                            for pId in final_updates.keys():
                                cache_key = f"{cls.CACHE_PREFIX}{pId}"
                                if pId in redis_to_update:
                                    # 更新 Redis 為最終值（合併後的結果）
                                    pipe.set(cache_key, redis_to_update[pId], ex=cls.POST_SYNC_TTL)
                                else:
                                    # 值相同，只重置 TTL
                                    pipe.expire(cache_key, cls.POST_SYNC_TTL)
                            pipe.execute()
                            logger.info(f"已更新 Redis：{len(redis_to_update)} 個值已合併，{len(final_updates) - len(redis_to_update)} 個只重置 TTL")
                        except Exception as e:
                            logger.warning(f"更新 Redis 失敗: {e}")
                    
            except Exception as e:
                logger.error(f"批量同步失敗: {e}")
                db.session.rollback()
    
    @classmethod
    def _increment_db(cls, pId: str) -> int:
        """Fallback: 直接更新資料庫（當 Redis 不可用時）"""
        try:
            product = Product.query.filter_by(pId=pId).first()
            if product:
                product.clickTimes = (product.clickTimes or 0) + 1
                db.session.commit()
                return product.clickTimes
        except Exception as e:
            logger.error(f"資料庫 increment 失敗: {e}")
            db.session.rollback()
        return 0

# 單例實例
click_times_service = ClickTimesService()

