from flask import Blueprint, request, jsonify
from sqlalchemy import or_, func
from dbconfig.dbconnect import db
from models.models import Product, Price_Now
from services.click_times_service import click_times_service

frame_bp = Blueprint("frame", __name__, url_prefix="/frame")

@frame_bp.route("/search", methods=["POST"])
def search_products():
    data = request.get_json()
    keyword = data.get("keyword", "").strip() if data else ""

    try:
        products_to_return = []

        # --- 情況一：有提供搜尋關鍵字 ---
        if keyword:
            query = (
                db.session.query(
                    Product.pId,
                    Product.pName,
                    Product.brand,
                    Product.category,
                    Product.clickTimes,
                    Product.review,
                    func.min(Price_Now.storePrice).label("price_min"),
                    func.max(Price_Now.storePrice).label("price_max"),
                )
                .outerjoin(Price_Now, Product.pId == Price_Now.pId)
                .filter(
                    or_(
                        Product.pName.ilike(f"%{keyword}%"),
                        Product.brand.ilike(f"%{keyword}%")
                    )
                )
                .group_by(
                    Product.pId,
                    Product.pName,
                    Product.brand,
                    Product.category,
                    Product.clickTimes,
                    Product.review,
                )
            )

            rows = query.all()

            if not rows:
                return jsonify({"results": []}), 204  

        # --- 情況二：沒有 keyword，查全部 ---
        else:
            query = (
                db.session.query(
                    Product.pId,
                    Product.pName,
                    Product.brand,
                    Product.category,
                    Product.clickTimes,
                    Product.review,
                    func.min(Price_Now.storePrice).label("price_min"),
                    func.max(Price_Now.storePrice).label("price_max"),
                )
                .outerjoin(Price_Now, Product.pId == Price_Now.pId)
                .group_by(
                    Product.pId,
                    Product.pName,
                    Product.brand,
                    Product.category,
                    Product.clickTimes,
                    Product.review,
                )
            )

            rows = query.all()

        # 批量從 Redis 取得最新的點擊次數
        pIds = [row[0] for row in rows]  # 第一個元素是 pId
        click_times_map = click_times_service.get_batch(pIds)

        # --- 整理回傳資料 ---
        for (
            pId,
            pName,
            brand_val,
            category,
            clickTimes,
            review,
            price_min,
            price_max,
        ) in rows:
            # 使用 Redis 的值，如果沒有則用資料庫的值
            click_times = click_times_map.get(pId, clickTimes or 0)
            products_to_return.append({
                "pId": pId,
                "pName": pName,
                "brand": brand_val,
                "category": category,
                "price_min": float(price_min) if price_min is not None else None,
                "price_max": float(price_max) if price_max is not None else None,
                "clickTimes": click_times,  # 使用 Redis 的值
                "review": review,
            })

        return jsonify({"results": products_to_return}), 200

    except Exception as e:
        print(f"搜尋商品時發生錯誤: {e}")
        return jsonify({"message": "伺服器內部錯誤，搜尋失敗"}), 500