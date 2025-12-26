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
    'cursorclass': pymysql.cursors.DictCursor  # 返回字典形式结果
}

def get_connection():
    '''
    获取数据库连接
    '''
    return pymysql.connect(**DB_CONFIG)

def format_article(row):
    '''
    格式化文章数据
    '''
    create_time = row.get('create_time')
    if isinstance(create_time, datetime):
        row['create_time'] = create_time.strftime('%Y-%m-%d %H:%M:%S')
    return row

def get_all_articles():
    '''
    获取所有文章数据
    '''
    with get_connection() as conn:
        with conn.cursor() as cursor:
            sql = """
                SELECT id, likeNum, commentsLen, reposts_count, region,
                       create_time, type, detailUrl, author_name, authorDetail, emotion
                FROM article ORDER BY create_time DESC
            """
            cursor.execute(sql)
            rows = cursor.fetchall()
            return [format_article(row) for row in rows]

def get_articles_by_field(field, value):
    '''
    根据指定字段查询文章数据
    '''
    if field not in ['author_name', 'region', 'type']:
        raise ValueError("Unsupported query field")
    with get_connection() as conn:
        with conn.cursor() as cursor:
            sql = f"""
                SELECT id, likeNum, commentsLen, reposts_count, region,
                       create_time, type, detailUrl, author_name, authorDetail, emotion
                FROM article WHERE {field} LIKE %s ORDER BY create_time DESC
            """
            cursor.execute(sql, (f"%{value}%",))
            rows = cursor.fetchall()
            return [format_article(row) for row in rows]

def add_article(data):
    '''
    添加文章数据
    '''
    print("调用新增文章的函数0")
    with get_connection() as conn:
        with conn.cursor() as cursor:
            print("调用新增文章的函数1")
            create_time = data.get('create_time')
            create_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            
            likeNum = int(data.get('likeNum', 0))
            commentsLen = int(data.get('commentsLen', 0))
            reposts_count = int(data.get('reposts_count', 0))
            print("调用新增文章的函数4")
            sql = """
                INSERT INTO article (likeNum, commentsLen, reposts_count, region,
                    create_time, type, detailUrl, author_name, authorDetail)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            cursor.execute(sql, (
                likeNum,
                commentsLen,
                reposts_count,
                data.get('region', ''),
                create_time,
                data.get('type', ''),
                data.get('detailUrl', ''),
                data.get('author_name', ''),
                data.get('authorDetail', '')
            ))
            print("调用新增文章的函数5")
            conn.commit()
            return cursor.lastrowid
def update_article(article_id, data):
    '''
    更新文章数据
    '''
    with get_connection() as conn:
        with conn.cursor() as cursor:
            sql = """
                UPDATE article SET likeNum=%s, commentsLen=%s, reposts_count=%s, region=%s,
                    type=%s, detailUrl=%s, author_name=%s, authorDetail=%s, emotion=%s
                WHERE id=%s
            """
            cursor.execute(sql, (
                data.get('likeNum', 0),
                data.get('commentsLen', 0),
                data.get('reposts_count', 0),
                data.get('region', ''),
                data.get('type', ''),
                data.get('detailUrl', ''),
                data.get('author_name', ''),
                data.get('authorDetail', ''),
                data.get('emotion', ''),
                article_id
            ))
            print(cursor.rowcount)
            conn.commit()
            return cursor.rowcount > 0

def delete_article(article_id):
    '''
    删除文章数据
    '''
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM article WHERE id=%s", (article_id,))
            conn.commit()
            return cursor.rowcount > 0
