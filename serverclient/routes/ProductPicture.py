import imp
from flask import Blueprint, request, jsonify
from dbconfig.dbconnect import db
from models.models import Product_Picture
from services.s3_service import s3_service
import os
from dotenv import load_dotenv

# 載入環境變數
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(BASE_DIR, '.env'))
product_picture_bp = Blueprint("product_picture", __name__, url_prefix="/productPicture")

'''
取得商品主要圖片 URL
'''
@product_picture_bp.route("/<pId>/isMain", methods=["GET"])
def get_product_picture(pId):
    # 根據 pId 查詢，並取得第一筆符合的主要圖片資料
    pic_record = db.session.query(Product_Picture).filter(
        Product_Picture.pId == pId, 
        Product_Picture.isMain == 1
    ).first()

    if not pic_record:
        return jsonify({"error": "No picture found"}), 404
    
    # 如果有 storage_key，生成 CloudFront URL
    if pic_record.storage_key:
        visibility = pic_record.visibility or 'public'
        url = s3_service.generate_url(pic_record.storage_key, visibility)
        print(f"  visibility: {visibility}")
        jsonify(f"  URL: {url}")
        return jsonify({
            "url": url,
            "picId": pic_record.picId,
            "width": pic_record.width,
            "height": pic_record.height,
            "isMain": pic_record.isMain
        }), 200
    else:
        # 如果還沒有遷移到 S3，回傳錯誤
        return jsonify({"error": "Image not migrated to S3"}), 404

'''
取得商品所有圖片 URL 列表
'''
@product_picture_bp.route("/<pId>", methods=["GET"])
def get_all_product_pictures(pId):
    pic_records = db.session.query(Product_Picture).filter(
        Product_Picture.pId == pId
    ).all()

    if not pic_records:
        return jsonify({"message": "No pictures found"}), 404

    # 生成所有圖片的 URL 列表
    pic_list = []
    for pic in pic_records:
        if pic.storage_key:
            visibility = pic.visibility or 'public'
            url = s3_service.generate_url(pic.storage_key, visibility)

            print(f"  visibility: {visibility}")            
            pic_list.append({
                "url": url,
                "picId": pic.picId,
                "isMain": pic.isMain,
                "width": pic.width,
                "height": pic.height
            })

    if not pic_list:
        return jsonify({"message": "No pictures with storage_key found"}), 404

    return jsonify({"pictures": pic_list}), 200