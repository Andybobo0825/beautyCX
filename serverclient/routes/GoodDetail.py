from flask import Response, Blueprint, jsonify, request
from models.models import Client_Favorites, Good_Review, Price_History, Product, Price_Now
from sqlalchemy.exc import SQLAlchemyError, OperationalError
from dbconfig.dbconnect import db
from utils.auth import token_required
from services.click_times_service import click_times_service
import json

goodDetail_bp = Blueprint("goodDetail", __name__, url_prefix="/gooddetail")

# /product/<string:pId>
@goodDetail_bp.route("/product/<string:pId>", methods=["GET"])
@token_required
def get_product_detail(pId, current_user):
    """
    根據商品 ID 獲取商品詳細資訊。
    此路由不需要 Token。
    """
    try:
        cId = current_user['clientId'] # 從 Token 中獲取 cId

        if not pId or not isinstance(pId, str):
            return jsonify({"error": "請求參數錯誤"}), 400

        from sqlalchemy import func
        row = (
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
            .outerjoin(Price_Now, Price_Now.pId == Product.pId)
            .filter(Product.pId == pId)
            .group_by(
                Product.pId,
                Product.pName,
                Product.brand,
                Product.category,
                Product.clickTimes,
                Product.review,
            )
            .first()
        )

        isTrack = db.session.query(Client_Favorites).filter_by(pId=pId).first() is not None

        if not row:
            return jsonify({"error": "未找到資源"}), 404
        
        # 從 Redis 取得最新的點擊次數（如果有的話）
        click_times = click_times_service.get(row.pId)
        
        results = {
            "pId": row.pId,
            "pName": row.pName,
            "brand": row.brand,
            "category": row.category,
            "price_max": float(row.price_max) if row.price_max is not None else None,
            "price_min": float(row.price_min) if row.price_min is not None else None,
            "review": float(row.review) if row.review is not None else None,
            "clickTimes": click_times,  # 使用 Redis 的值
            "isTrack": isTrack
        }

        return Response(json.dumps({"results": results}, ensure_ascii=False), mimetype='application/json')

    except SQLAlchemyError as e:
        print(f"SQLAlchemy 錯誤 (get_product_detail): {e}")
        return jsonify({"error": "資料庫操作錯誤"}), 500
    except Exception as e:
        print(f"發生未預期錯誤: {e}")
        return jsonify({'error': '伺服器內部錯誤'}), 500
    

# /priceNow/<string:pId>
@goodDetail_bp.route("/priceNow/<string:pId>", methods=["GET"])
def get_price_now(pId):
    try:
        if not pId or not isinstance(pId, str):
            return jsonify({"error": "請求參數錯誤"}), 400
        
        price_now_list = Price_Now.query.filter_by(pId=pId).all()
        if not price_now_list:
            return jsonify({"error": "未找到資源"}), 404
        
        # datetime 類型，不能直接丟進 json.dumps()
        results = [
                    {
                        "pId": item.pId,
                        "store": item.store,
                        "storePrice": float(item.storePrice) if item.storePrice is not None else None,
                        "storeDiscount": item.storeDiscount,
                        "storeLink": item.storeLink
                    }for item in price_now_list
                ]
        
        return Response(json.dumps({"results": results}, ensure_ascii=False), mimetype='application/json')

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# /productReview/<string:pId>
@goodDetail_bp.route("/productReview/<string:pId>", methods=["GET"])
def get_product_review(pId):
    try:
        if not pId:
            return jsonify({"error": "請求參數錯誤"}), 400

        get_review_list = Good_Review.query.filter_by(pId=pId).all()

        if not get_review_list:
            return jsonify({"error": "未找到資源"}), 204
        
        # The date needs to be converted into date format.
        result = [
                    {
                        "pId": item.pId,
                        "userName": item.userName,
                        "date": item.date.isoformat() if item.date else None,
                        "rating": item.rating,
                        "reviewText": item.reviewText
                    }
                    for item in get_review_list
                ]
        return Response(json.dumps({"results": result}, ensure_ascii=False), mimetype='application/json')

    except SQLAlchemyError as e:
        return jsonify({str(e)}), 500

# /click/<string:pId>
@goodDetail_bp.route("/click/<string:pId>", methods=["POST"]) 
def click(pId):
    """
    增加商品的點擊次數。
    此路由不需要 Token。
    """
    try:
        if not pId or not isinstance(pId, str): 
            return jsonify({"error": "請求參數錯誤"}), 400

        # 使用服務層處理點擊次數累加（自動處理 Redis fallback）
        new_click_times = click_times_service.increment(pId)

        return jsonify({
            "message": "點擊次數已累積",
            "new_click_times": new_click_times 
        }), 200
    except Exception as e:
        print(f"發生未預期錯誤: {e}")
        return jsonify({'error': '伺服器內部錯誤'}), 500

"""
檢查指定商品是否已被當前登入用戶追蹤（收藏）。
需要 Token 驗證，cId 從 Token 中獲取。
"""
@goodDetail_bp.route("/track", methods=["POST"])
@token_required
def toggle_track_status(current_user):
    try:
        cId = current_user['clientId'] # 從 Token 中獲取 cId
        data = request.get_json()
        pId = data.get('pId')

        if not cId or not pId:
            return jsonify({'error': '請求參數錯誤'}), 400

        favorite = db.session.get(Client_Favorites, {'cId': cId, 'pId': pId})

        action_taken = False

        if favorite:
            db.session.delete(favorite)
            new_status = 0
            message = "已取消追蹤"
            action_taken = True
        else:
            product_exists = Product.query.filter_by(pId=pId).first()
            if not product_exists:
                return jsonify({'error': f'無法追蹤，商品 ID {pId} 不存在'}), 404
            add_favorite = Client_Favorites(cId=cId, pId=pId)
            db.session.add(add_favorite)
            new_status = 1
            message = "已加入追蹤"
            action_taken = True

        if action_taken:
            db.session.commit()

        return jsonify({
            'message': message,
            'cId': cId,
            'pId': pId,
            'status': new_status
        }), 200
    except SQLAlchemyError as e:
        print(f"!!! SQLAlchemy Error Details: {e}")
        db.session.rollback()
        return jsonify({'error': f'資料庫操作錯誤: {str(e)}'}), 500
    except Exception as e:
        db.session.rollback()
        print(f"追蹤狀態切換時發生未預期錯誤: {e}")
        return jsonify({'error': '伺服器內部錯誤'}), 500
    
@goodDetail_bp.route('/priceHistory/<string:pId>', methods=['GET'])
def homepage_price_history_by_pid(pId: str):
    try:
        # 依照規格回傳單一物件，這裡選擇回傳該商品最新一筆歷史價格
        ph_list = (
            Price_History.query
            .filter(Price_History.pId == pId)
            .filter(Price_History.prePrice.isnot(None))
            .order_by(Price_History.updateTime.desc())
            .all()
        )
        if not ph_list:
            return jsonify({'message': 'find no result'}), 404
        
        results = []
        for ph in ph_list:
            results.append({
                'pId': ph.pId,
                'updateTime': ph.updateTime.strftime('%Y-%m-%d %H:%M:%S')[:-3] if ph.updateTime else '-',    #.f
                'prePrice': float(ph.prePrice) if ph.prePrice is not None else None,
                'storeName': ph.storeName or '-'
            })

        return jsonify({'results': results}), 200
    
    except Exception as e:
        return jsonify({'error': 'Invalid request parameter', 'detail': str(e)}), 400