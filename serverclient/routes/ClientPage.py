import re
from flask import Blueprint, Response, json, jsonify, request
from routes.GoodDetail import toggle_track_status  # 匯入函式
from sqlalchemy.exc import OperationalError, SQLAlchemyError
from models.models import Client, Client_Favorites, Product, Price_Now
from sqlalchemy import func
from routes.RegisterPage import is_valid_account, is_valid_password
from sqlalchemy.orm import Session
from dbconfig.dbconnect import db
from werkzeug.security import generate_password_hash

from utils.auth import token_required 

clientPage_bp = Blueprint("clientPage", __name__, url_prefix="/clientPage")

'''
 * 基本參數驗證：非字串型態& 齊全
 * 防止無效
'''

#-------------------------------------#
#      call /GoodDetail/track func    #
#-------------------------------------#
@clientPage_bp.route("/track", methods=["POST"])
@token_required
def clientpage_toggle_track(current_user): # 確保函式接收 current_user 參數
    """
    切換商品的追蹤（收藏）狀態：如果已收藏則取消，如果未收藏則加入。
    cId 從 Token 中獲取。
    """
    try:
        cId = current_user['clientId'] # 從 Token 中獲取 cId
        data = request.get_json()
        pId = data.get('pId')

        # 驗證 pId 是否齊全且為字串類型
        if not pId or not isinstance(pId, str):
            return jsonify({'error': '請求參數錯誤，缺少或無效的 pId'}), 400

        # 使用 Composite Primary Key 查找收藏記錄
        # db.session.get 適用於主鍵查詢，這裡假設 Client_Favorites 有複合主鍵 (cId, pId)
        favorite = db.session.get(Client_Favorites, {'cId': cId, 'pId': pId})

        if favorite:
            # 如果已收藏，則取消追蹤
            db.session.delete(favorite)
            new_status = 0
            message = "已取消追蹤"
        else:
            # 如果未收藏，則加入追蹤
            # 首先檢查商品是否存在
            product_exists = Product.query.filter_by(pId=pId).first()
            if not product_exists:
                return jsonify({'error': f'無法追蹤，商品 ID {pId} 不存在'}), 404
            
            # 商品存在，新增收藏記錄
            add_favorite = Client_Favorites(cId=cId, pId=pId)
            db.session.add(add_favorite)
            new_status = 1
            message = "已加入追蹤"
        
        db.session.commit() # 提交事務

        return jsonify({
            'message': message,
            'cId': cId,
            'pId': pId,
            'status': new_status # 0 表示取消，1 表示加入
        }), 200

    except SQLAlchemyError as e:
        db.session.rollback() # 確保在數據庫錯誤時回滾
        print(f"SQLAlchemy 錯誤 (clientpage_toggle_track): {e}")
        return jsonify({'error': f'資料庫操作錯誤: {str(e)}'}), 500
    except Exception as e:
        db.session.rollback() # 確保在任何意外錯誤發生時回滾
        print(f"追蹤狀態切換時發生未預期錯誤 (clientpage_toggle_track): {e}")
        return jsonify({'error': '伺服器內部錯誤'}), 500


@clientPage_bp.route("/trackList", methods=["GET"])
@token_required
def get_track_list(current_user):
    try:
        # 從 token_required 裝飾器附加的 request.user 中獲取 cId，更安全可靠
        cId = current_user['clientId']

        track = Client_Favorites.query.filter(Client_Favorites.cId == cId).all()

        if not track:
            return jsonify({"results": []}), 204
        
        row = (
            db.session.query(
                Product.pId,
                Product.pName,
                Product.brand,
                Product.category,
                func.min(Price_Now.storePrice).label("price_min"),
                func.max(Price_Now.storePrice).label("price_max"),
                Product.review
            )
            .outerjoin(Price_Now, Price_Now.pId == Product.pId)
            .outerjoin(Client_Favorites, Client_Favorites.pId == Product.pId)
            .filter(Client_Favorites.cId == cId)
            .group_by(
                Product.pId,
                Product.pName,
                Product.brand,
                Product.category,
                Product.review
            )
            .all()
        )
        # 獲取追蹤商品詳細資訊
        results = []
        for item in row:
            results.append({
            "pId": item.pId,
            "pName": item.pName,
            "brand": item.brand,
            "category": item.category,
            "price_max": float(item.price_max) if item.price_max is not None else None,
            "price_min": float(item.price_min) if item.price_min is not None else None,
            "review": item.review,
        })
        
        return Response(json.dumps({"results": results}, ensure_ascii=False), mimetype='application/json')

    except SQLAlchemyError as e:
        print(f"!!! SQLAlchemy Error Details: {e}")
        db.session.rollback() # 確保在錯誤時回滾
        return jsonify({'error': f'資料庫操作錯誤: {str(e)}'}), 500
    except Exception as e:
        print(f"發生未預期錯誤: {e}")
        db.session.rollback() # 確保在錯誤時回滾
        return jsonify({'error': '伺服器內部錯誤'}), 500



# /client
@clientPage_bp.route("/client", methods=["GET"]) # 建議改成 GET，因為是獲取資源
@token_required
def get_client_data(current_user):
    try:

        cId = current_user['clientId']
        client_data = Client.query.filter(Client.cId == cId).first()

        if not client_data:
            # 理論上，如果 Token 有效但找不到使用者，可能是數據不一致，可以考慮 500 或 404
            return jsonify({"error": "未找到會員資料"}), 404
        
        client_data_json = {
            "cName": client_data.cName,
            "account": client_data.account,
            "email": client_data.email,
            "phone": client_data.phone,
            "sex": client_data.sex,
            "birthday": client_data.birthday.strftime("%Y-%m-%d") if client_data.birthday else None # 格式化日期
        }
        
        return Response(json.dumps({"results": client_data_json}, ensure_ascii=False), mimetype='application/json')
        # return jsonify({'message': "OK"}), 200
    except SQLAlchemyError as e:
        print(f"!!! SQLAlchemy Error Details: {e}")
        db.session.rollback()
        return jsonify({'error': f'資料庫操作錯誤: {str(e)}'}), 500
    except Exception as e:
        print(f"發生未預期錯誤: {e}")
        db.session.rollback()
        return jsonify({'error': '伺服器內部錯誤'}), 500


'''
update data欄位是否重複函式
'''
def is_duplicate_account(db: Session, account: str, exclude_id=None):
    query = db.query(Client).filter(Client.account == account)
    if exclude_id:
        query = query.filter(Client.cId != exclude_id)
    return query.first() is not None

def is_duplicate_email(db: Session, email: str, exclude_id=None):
    query = db.query(Client).filter(Client.email == email)
    if exclude_id:
        query = query.filter(Client.cId != exclude_id)
    return query.first() is not None

def is_duplicate_phone(db: Session, phone: str, exclude_id=None):
    query = db.query(Client).filter(Client.phone == phone)
    if exclude_id:
        query = query.filter(Client.cId != exclude_id)
    return query.first() is not None

@clientPage_bp.route("/data/update", methods=["POST"])
@token_required
def update_client_data(current_user):
    try:
        '''
        * 需登入，account + birthday 不可修改
        * 用textfield方式呈現，default value 為原本會員資料
            * 密碼不需要放default value
            * textfeild value不可為空值
        * 送出後要檢查
            * 所有欄位皆為required
            * cName: 1<=長度<=30
            * account:需含大小寫、符號、8<=長度<=20
            * password: 需含大小寫、符號、8<=長度<=20
            * email: >=8,<=20
            * phone: 長度 == 10
            * birthday: 日期<=現在日期
            * account、password、phone、email皆不可重複
        '''
        cId = current_user['clientId']

        # 1. 檢查必要欄位
        data = request.get_json()
        required_fields = ["cName", "email", "phone", "sex"]
        missing = [field for field in required_fields if not (field in data and data[field] is not None)]
        if missing:
            return jsonify({"message": f"缺少必要欄位: {', '.join(missing)}"}), 400
        

        # 2. Get data and columns
        '''
        修改密碼可能要另外寫一支API
        '''
        cName = data["cName"]
        email = data["email"]
        phone = data["phone"]
        sex = data["sex"]
        
        # 新增物件
        client = Client.query.filter_by(cId=cId).first()
        if not client:
            return jsonify({"message": "查無此會員"}), 404

        # Form Validation

        if not (1 <= len(cName) <= 30):
            return jsonify({"message": "姓名長度必須介於 1 到 30 個字元之間"}), 400
        
        # From Register import func: is_valid_account, is_valid_password
        # Considering move those form validation func into *services/*
        if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email) or not (8 <= len(email) <= 64):
            return jsonify({"message": "電子郵件格式或長度錯誤 (需 8-64 字元)"}), 400
        if not re.match(r"^[0-9]{10}$", phone):
            return jsonify({"message": "電話號碼必須是 10 位數字"}), 400


        # verify duplicate
        # 這表示在查詢時會排除自己的 cId，也就是排除掉「正在更新的那個人」
        if is_duplicate_email(db.session, email, exclude_id=cId):
            return jsonify({"message": "Email 已存在"}), 400
        if is_duplicate_phone(db.session, phone, exclude_id=cId):
            return jsonify({"message": "電話已存在"}), 400

        # Update
        client.cName = cName
        client.email = email
        client.phone = phone
        client.sex = sex
        
        db.session.commit()
        return jsonify({"message": "會員資料更新成功"}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({str(e)}), 500
    
    except Exception as e:
        db.session.rollback()
        print(f"發生未預期錯誤: {e}")
        return jsonify({'error': '伺服器內部錯誤'}), 500


@clientPage_bp.route("/password/update", methods=["POST"])
@token_required
def password_update(current_user):

    try:
        data = request.get_json()

        cId = current_user['clientId']
        new_password = data["password"]
        if not new_password or not isinstance(new_password, str):
                return jsonify({"error": "請求參數錯誤"}), 400

        if not is_valid_password(new_password):
                return jsonify({"message": "密碼格式錯誤 (需 8-20 字元，包含大小寫字母及符號)"}), 400
                
        password_hash = generate_password_hash(new_password)

        Client.query.filter_by(cId = cId).update({
            Client.password_hash: password_hash
        })
        db.session.commit()

        return jsonify({"message": "successfully modify password", "cId": cId}), 200

    except OperationalError as oe:
        # 連線超時或資料庫無法操作
        db.session.rollback()
        return jsonify({'error': f'資料庫連線失敗或逾時: {str(oe)}'}), 500

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': f'資料庫操作錯誤: {str(e)}'}), 500

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'伺服器內部錯誤: {str(e)}'}), 500
