import os
import pyodbc
from datetime import datetime

'''
此腳本用於將DOCUMENT\Binary中的所有 .bin 檔案匯入到 SQL Server 資料庫的 Product_Picture 表中。
'''

# 設定資料夾路徑
folder_path = r'..\..\DOCUMENT\Binary'  # 修改為實際路徑

# 建立 SQL Server 連線字串
# conn_str = (
#     r'DRIVER={ODBC Driver 17 for SQL Server};'
#     r'SERVER=localhost;'
#     r'UID=sa;'
#     r'PWD=Root_123456;'
#     r'DATABASE=DB;'
# )

conn_str = (
    r'DRIVER={ODBC Driver 17 for SQL Server};'
    r'SERVER=database-1.cd2aiok0ov3v.ap-east-2.rds.amazonaws.com;'
    r'UID=admin;'
    r'PWD=NCUE+930825;'
    r'DATABASE=DB;'
)

# 清空舊資料
cleanTable = 'DELETE FROM Product_Picture'


# 資料庫新增語法
sql = '''
    INSERT INTO Product_Picture ( pId, pic, updateTime, isMain )
    VALUES ( ?, ?, ?, ?)
'''

# 連接資料庫
conn = pyodbc.connect(conn_str)
cursor = conn.cursor()

cursor.execute(cleanTable)

# 讀取所有 .bin 檔案
for file_name in os.listdir(folder_path):
    if file_name.endswith('.bin'):
        file_path = os.path.join(folder_path, file_name)

        # 取掉副檔名
        name_without_ext = os.path.splitext(file_name)[0]  # 例如 P34_main 或 P34_1 或 P10

        # 判斷最後一欄的值
        if '_' not in name_without_ext or 'main' in name_without_ext.lower():
            flag = 1
        else:
            parts = name_without_ext.split('_')
            if len(parts) == 2 and parts[1].isdigit():
                flag = 0
            else:
                flag = 0  # 預設0

        # 取出 pId（底線前面的部分）
        pId = name_without_ext.split('_')[0]

        # 讀取檔案內容（二進位）
        with open(file_path, 'rb') as f:
            file_data = f.read()

        # 執行 SQL 插入
        cursor.execute(sql, (pId, file_data, datetime.now(), flag))


# 提交並關閉連線
conn.commit()
cursor.close()
conn.close()

print('所有檔案已成功匯入！')