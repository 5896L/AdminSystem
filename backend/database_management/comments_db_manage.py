from datetime import datetime
import pymysql

# 数据库配置
DB_CONFIG = {
    'host': 'localhost',
    'port': 3306,
    'user': 'root',
    'password': 'Ljj200402260522',
    'database': 'weiboarticles',
    'charset': 'utf8mb4',
    'cursorclass': pymysql.cursors.DictCursor
}

def get_connection():
    return pymysql.connect(**DB_CONFIG)

def format_comment(row):
    created_at = row.get('created_at')
    if isinstance(created_at, datetime):
        row['created_at'] = created_at.strftime('%Y-%m-%d %H:%M:%S')
    return row

def get_all_comments():
    with get_connection() as conn:
        with conn.cursor() as cursor:
            sql = """
                SELECT id,articleId, created_at, likes_counts, region, content,
                       authorName, authorGender, authorAddress, sentiment
                FROM comments ORDER BY created_at DESC
            """
            cursor.execute(sql)
            rows = cursor.fetchall()
            return [format_comment(row) for row in rows]

def get_comments_by_field(field, value):
    if field not in ['authorName', 'region']:
        raise ValueError("不支持的查询字段")
    with get_connection() as conn:
        with conn.cursor() as cursor:
            sql = f"""
                SELECT id, articleId, created_at, likes_counts, region, content,
                    authorName, authorGender, authorAddress, sentiment
                FROM comments
                WHERE {field} LIKE %s
                ORDER BY created_at DESC
            """
            cursor.execute(sql, (f"%{value}%",))
            rows = cursor.fetchall()
            return [format_comment(row) for row in rows]

def add_comment(data):
    with get_connection() as conn:
        with conn.cursor() as cursor:
            created_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            sql = """
                INSERT INTO comments (articleId, created_at, likes_counts, region, content,
                    authorName, authorGender, authorAddress)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """
            cursor.execute(sql, (
                data.get('articleId', ''),
                created_at,
                int(data.get('likes_counts', 0)),
                data.get('region', ''),
                data.get('content', ''),
                data.get('authorName', ''),
                data.get('authorGender', ''),
                data.get('authorAddress', ''),
            ))
            conn.commit()
            return cursor.lastrowid

def update_comment(comment_id, data):
    with get_connection() as conn:
        with conn.cursor() as cursor:
            sql = """
                UPDATE comments SET likes_counts=%s, region=%s, content=%s,
                    authorName=%s, authorGender=%s, authorAddress=%s, sentiment=%s
                WHERE id=%s
            """
            cursor.execute(sql, (
                int(data.get('likes_counts', 0)),
                data.get('region', ''),
                data.get('content', ''),
                data.get('authorName', ''),
                data.get('authorGender', ''),
                data.get('authorAddress', ''),
                data.get('sentiment', ''),
                comment_id
            ))
            conn.commit()
            return cursor.rowcount > 0

def delete_comment(comment_id):
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM comments WHERE id=%s", (comment_id,))
            conn.commit()
            return cursor.rowcount > 0
