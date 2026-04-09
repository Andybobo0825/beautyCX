# app/routes/GoodPage.py
from flask import Blueprint, request, jsonify
from dbconfig.dbconnect import db
from dbconfig.redisconfig import cache
import json
from models.models import Product, Price_Now
from sqlalchemy import func
from services.click_times_service import click_times_service

goodPage_bp = Blueprint("good", __name__, url_prefix="/goodpage")

# /product 顯示所有商品，或根據 category 類別篩選，按 clickTimes 排序
@goodPage_bp.route("/product", methods=["GET"])
def get_all_products():
    category = request.args.get("category", None)  # 查詢參數 category
    sort = request.args.get("sort", "clickTimes")  # 默認按 clickTimes 排序

    # 嘗試從快取讀取資料（但如果按 clickTimes 排序，不使用快取，因為 clickTimes 變化頻繁）
    cache_key = f"products_{category}_{sort}"
    cached_data = None
    
    # 只有非 clickTimes 排序時才使用快取
    if sort != "clickTimes":
        try:
            cached_data = cache.get(cache_key)
            if cached_data:
                # 從快取讀取，但仍需要更新 clickTimes
                results = json.loads(cached_data)
                # 批量更新 clickTimes
                pIds = [item["pId"] for item in results]
                click_times_map = click_times_service.get_batch(pIds)
                for item in results:
                    item["clickTimes"] = click_times_map.get(item["pId"], item.get("clickTimes", 0))
                return jsonify({"results": results}), 200
        except Exception:
            pass  # 快取失敗，繼續查詢資料庫
    
    # 基本參數驗證：非字串型態
    if (category and not isinstance(category, str)):
        return jsonify({"message": "Invalid request parameter"}), 400
    
    # 防止無效排序欄位
    allowed_sort_fields = {"clickTimes", "price", "review"}
    if sort not in allowed_sort_fields:
        return jsonify({"message": "Invalid request parameter"}), 400

    # 以 Price_Now 聚合價格範圍
    query = (
        db.session.query(
            Product.pId,
            Product.pName,
            Product.brand,
            Product.category,
            Product.clickTimes,
            Product.review,
            func.min(Price_Now.storePrice).label("minPrice"),
            func.max(Price_Now.storePrice).label("maxPrice"),
        )
        .outerjoin(Price_Now, Price_Now.pId == Product.pId)
        .group_by(
            Product.pId,
            Product.pName,
            Product.brand,
            Product.category,
            Product.clickTimes,
            Product.review,
        )
    )

    # 排序：如果按 clickTimes 排序，先不排序（之後用 Redis 的值在 Python 中排序）
    if sort == "price":
        query = query.order_by(func.min(Price_Now.storePrice).asc())
    elif sort == "review":
        query = query.order_by(Product.review.desc())
    # clickTimes 排序留到後面用 Redis 值排序

    if category:
        query = query.filter(Product.category == category)
        
    rows = query.all()

    if not rows:
        return jsonify({"message": "find no result"}), 404  # 找不到資料

    # 批量從 Redis 取得最新的點擊次數
    pIds = [r.pId for r in rows]
    click_times_map = click_times_service.get_batch(pIds)

    results = []
    for r in rows:
        # 使用 Redis 的值，如果沒有則用資料庫的值
        click_times = click_times_map.get(r.pId, r.clickTimes or 0)
        results.append({
            "pId": r.pId,
            "pName": r.pName,
            "brand": r.brand,
            "category": r.category,
            "price_max": float(r.maxPrice) if r.maxPrice is not None else None,
            "price_min": float(r.minPrice) if r.minPrice is not None else None,
            "clickTimes": click_times,  # 使用 Redis 的值
            "review": r.review,
        })

    # 如果按 clickTimes 排序，在 Python 中重新排序
    if sort == "clickTimes":
        results.sort(key=lambda x: x["clickTimes"], reverse=True)

    # 只有非 clickTimes 排序時才快取（因為 clickTimes 變化頻繁）
    if sort != "clickTimes":
        try:
            cache.set(cache_key, json.dumps(results), ex=1800)  # 30 分鐘快取（縮短時間）
        except Exception:
            pass  # 快取失敗不影響回應
    
    return jsonify({"results": results}), 200
