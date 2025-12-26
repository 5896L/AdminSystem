from flask import Blueprint, jsonify
import pymysql

log_bp = Blueprint('log', __name__)

# 数据库连接函数（可改为连接池）
def get_db_connection():
    '''
    获取数据库连接
    '''
    return pymysql.connect(
        host='localhost',
        user='root',
        password='Ljj200402260522',
        database='weiboarticles',
        cursorclass=pymysql.cursors.DictCursor
    )

@log_bp.route('/api/logs', methods=['GET'])
def get_logs():
    '''
    获取日志列表
    '''
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM Log ORDER BY id ASC")
            logs = cursor.fetchall()
        return jsonify({"code": 200, "msg": "获取日志成功", "data": logs})
    finally:
        conn.close()