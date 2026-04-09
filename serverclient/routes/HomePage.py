from flask import Blueprint, request, jsonify
from dbconfig.dbconnect import db
from dbconfig.redisconfig import cache
from models.models import Product, Price_History, Price_Now
from sqlalchemy import or_, func
from services.click_times_service import click_times_service
import json

home_bp = Blueprint("home", __name__, url_prefix="/homepage")

@home_bp.route("/product", methods=["GET"])
def get_products():
    category = request.args.get("category", None)  # 查詢參數 category
    sort = request.args.get("sort", "clickTimes")  # 默認按 clickTimes 排序
    
    # 基本參數驗證：非字串型態
    if (category and not isinstance(category, str)):
        return jsonify({"message": "Invalid request parameter"}), 400

    # 防止無效排序欄位
    allowed_sort_fields = {"clickTimes", "price", "review"}
    if sort not in allowed_sort_fields:
        return jsonify({"message": "Invalid request parameter"}), 400

    # 嘗試從快取讀取資料（但如果按 clickTimes 排序，不使用快取，因為 clickTimes 變化頻繁）
    cache_key = f"homepage:product:{category or 'all'}:{sort}"
    
    # 只有非 clickTimes 排序時才使用快取
    if sort != "clickTimes":
        try:
            cached = cache.get(cache_key)
            if cached:
                try:
                    payload = json.loads(cached.decode("utf-8"))
                    # 從快取讀取，但仍需要更新 clickTimes
                    results = payload.get("results", [])
                    if results:
                        pIds = [item["pId"] for item in results]
                        click_times_map = click_times_service.get_batch(pIds)
                        for item in results:
                            item["clickTimes"] = click_times_map.get(item["pId"], item.get("clickTimes", 0))
                        return jsonify({"results": results}), 200
                except Exception:
                    pass
        except Exception:
            pass    # 若快取失敗，直接查詢 DB

    # Price_Now, Product 做 outerjoin, 取得每個商品的最低/最高價格
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

    if category: # 如果有提供類別篩選
        query = query.filter(Product.category == category)

    # 排序：如果按 clickTimes 排序，先不排序（之後用 Redis 的值在 Python 中排序）
    # 其他排序仍用 SQL ORDER BY
    if sort == "price":
        query = query.order_by(func.min(Price_Now.storePrice).asc())
    elif sort == "review":
        query = query.order_by(Product.review.desc())
    # clickTimes 排序留到後面用 Redis 值排序

    rows = query.all()

    if not rows:
        return jsonify({"message": "find no result"}), 404  # 找不到資料

    # 批量從 Redis 取得最新的點擊次數
    pIds = [r.pId for r in rows]
    click_times_map = click_times_service.get_batch(pIds)

    # 返回商品資料（含最小/最大價格），使用 Redis 的 clickTimes
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
            "review": r.review
        })

    # 如果按 clickTimes 排序，在 Python 中重新排序
    if sort == "clickTimes":
        results.sort(key=lambda x: x["clickTimes"], reverse=True)

    # 只有非 clickTimes 排序時才快取（因為 clickTimes 變化頻繁）
    if sort != "clickTimes":
        try:
            cache.set(cache_key, json.dumps({"results": results}), ex=1800)  # 30 分鐘快取
        except Exception:
            pass  # 快取失敗不影響回應

    return jsonify({"results": results}), 200

