from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from sqlalchemy import Unicode, LargeBinary, Integer, DateTime, Float
from dbconfig.dbconnect import db

class Product(db.Model):
    __table_args__ = {'schema': 'dbo'} # 如果需要指定 schema
    __tablename__ = 'Product'
    pId = db.Column(Unicode(8), primary_key=True)
    pName = db.Column(Unicode(50))
    brand = db.Column(Unicode(30))
    category = db.Column(Unicode(20))
    clickTimes = db.Column(Integer)
    review = db.Column(Float)

class Price_History(db.Model):
    __table_args__ = {'schema': 'dbo'} # 如果需要指定 schema
    __tablename__ = 'Price_History'
    pId = db.Column(Unicode(8), primary_key=True)
    prePrice = db.Column(Float)
    updateTime = db.Column(DateTime, default=datetime.utcnow,primary_key=True)
    storeName = db.Column(Unicode (50))

class Price_Now(db.Model):
    __table_args__ = {'schema': 'dbo'} # 如果需要指定 schema
    __tablename__ = 'Price_Now'
    pId = db.Column(Unicode(8),primary_key=True)
    store = db.Column(Unicode(50),primary_key=True)
    updateTime = db.Column(DateTime, default=datetime.utcnow,primary_key=True)
    storePrice = db.Column(Float)
    storeDiscount = db.Column(Unicode(200))
    storeLink = db.Column(Unicode(200))
    status = db.Column(Integer)

class Client(db.Model):
    __table_args__ = {'schema': 'dbo'} # 如果需要指定 schema
    __tablename__ = 'Client'
    cId = db.Column(Unicode(8), primary_key=True)
    cName = db.Column(Unicode(30))
    account = db.Column(Unicode(20), unique=True)
    password_hash = db.Column('password', db.String(255), nullable=False)
    email = db.Column(Unicode(64), unique=True)
    phone = db.Column(Unicode(10), unique=True)
    sex = db.Column(Unicode(14))
    birthday = db.Column(DateTime)

class Client_Favorites(db.Model):
    __table_args__ = {'schema': 'dbo'} # 如果需要指定 schema
    __tablename__ = 'Client_Favorites'
    cId = db.Column(Unicode(8), primary_key=True)
    pId = db.Column(Unicode(8), primary_key=True)
    updateTime = db.Column(DateTime)

class Good_Review(db.Model):
    __table_args__ = {'schema': 'dbo'} # 如果需要指定 schema
    __tablename__ = 'Good_Review'
    pId = db.Column(Unicode(8),primary_key=True)
    userName = db.Column(Unicode(30))
    date = db.Column(DateTime, default=datetime.utcnow,primary_key=True)
    rating = db.Column(Float)
    reviewText = db.Column(Unicode)

class Product_Picture(db.Model):
    __tablename__ = 'Product_Picture'
    __table_args__ = {
        'schema': 'dbo'
    }
    picId = db.Column(Unicode(16), primary_key=True)
    pId = db.Column(Unicode(8))
    pic = db.Column(LargeBinary)  # 保留用于迁移，迁移完成后可删除
    storage_key = db.Column(Unicode(255))  # S3 存储路径
    isMain = db.Column(Integer)
    visibility = db.Column(Unicode(20), default='public')  # 'public' 或 'private'
    width = db.Column(Integer)
    height = db.Column(Integer)
    file_extension = db.Column(Unicode(10))
    updateTime = db.Column(DateTime)
