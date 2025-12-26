import pymysql
from pymysql import connect
import datetime
# === 建立数据库连接 ===
conn = connect(
    host='localhost',
    port=3306,
    user='root',
    password='Ljj200402260522',
    database='weiboarticles',
    charset='utf8mb4'
)
cursor = conn.cursor()

# === 数据库操作 ===
def check_connection():
    """
    检查并保持数据库连接
    """
    try:
        conn.ping(reconnect=True)
    except pymysql.MySQLError as e:
        print(f"[连接错误] 数据库连接失败: {e}")
        raise

#-----------------------------------------------------------------管理员的登录和注册功能----------------------------------------------------
def login(id, password):
    """
    登录函数：验证用户名和密码是否匹配
    :param ID: 用户ID
    :param password: 密码
    :return: True 表示登录成功，False 表示失败
    """
    try:
        check_connection()
        id = int(id)
        sql = "SELECT * FROM admin WHERE ID=%s AND password=%s"
        cursor.execute(sql, (id, password))
        if cursor.rowcount == 0:
            return False
        else:
            return True
    except pymysql.MySQLError as e:
        print(f"[数据库错误] 登录失败: {e}")
        conn.rollback()
        return False
    except Exception as e:
        print(f"[其他错误] 登录失败: {e}")
        conn.rollback()
        return False

def register(id, password):

    """
    注册函数：将新管理员插入 admin 表
    :param id: 管理员ID (int)
    :param password: 密码 (字符串) 
    :return: True 表示注册成功，False 表示失败（如管理员已存在） 
    注意：系统只能有四位管理员 要求id分别为  1 2 3 4
    """ 
    try:
        check_connection()
        #获取当前的时间
        now = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        print(id,password)
        sql = "INSERT INTO admin (id, password,create_time) VALUES (%s, %s,%s)"
        cursor.execute(sql, (id, password,now))
        conn.commit()
        return True
    except pymysql.IntegrityError as e:
        print(f"[注册失败] 用户名已存在或违反唯一性约束: {e}")
        conn.rollback()
        return False
    except pymysql.MySQLError as e:
        print(f"[数据库错误] 注册失败: {e}")
        conn.rollback()
        return False
    except Exception as e:
        print(f"[其他错误] 注册失败: {e}")
        conn.rollback()
        return False
    
#------------------------------------------对用户的增删改查（1号管理员）---------------------------------------------------------    
def add_user(id_, password, ip, permission):
    '''
    添加用户
    user_id: 待添加用户的ID
    password: 待添加用户的密码
    ip: 待添加用户的IP地址
    permission: 待添加用户的权限
    '''
    check_connection()
    cursor.execute("SELECT * FROM user WHERE id=%s", (id_,))
    if cursor.fetchone():
        return False
    sql = "INSERT INTO user (id, password, ip, permission, create_time) VALUES (%s, %s, %s, %s, NOW())"
    print(sql)
    try:
        cursor.execute(sql, (id_, password, ip, permission))
        conn.commit()
        return True
    except Exception as e:
        conn.rollback()
        print(f"新增用户失败: {e}")
        return False
def delete_user_by_id(user_id):
    '''
    删除用户
    user_id: 待删除用户的ID
    '''
    try:
        check_connection()
        sql = "SELECT * FROM user WHERE id = %s"
        if cursor.execute(sql, (user_id,)) == 0:
            print(f"[用户删除失败]，用户ID不存在")
            return False
        sql = "DELETE FROM user WHERE id = %s"
        cursor.execute(sql, (user_id,))
        conn.commit()
        return True
    except Exception as e:
        print(f"[用户删除失败] {e}")
        conn.rollback()
        return False
    
def update_user_by_id(user_id, permission, ip):
    '''
    修改用户的权限和ip
    '''
    try:
        check_connection()
        sql = "UPDATE user SET permission = %s, ip = %s WHERE id = %s"
        affected = cursor.execute(sql, (permission, ip, user_id))
        if affected == 0:
            return False  # 用户不存在
        conn.commit()
        return True
    except Exception as e:
        print(f"[数据库错误] 更新用户失败: {e}")
        conn.rollback()
        return False

#对用户的查询操作暂时先不写

def get_all_users():
    '''
    获取所有用户信息:
    返回值是一个列表，列表中的元素是字典，字典的键值对为：
    id: 用户ID
    create_time: 用户创建时间
    permission: 用户权限
    ip: 用户IP
    '''
    try:
        check_connection()
        sql = "SELECT id, create_time, permission, ip FROM user"
        cursor.execute(sql)
        rows = cursor.fetchall()
        # rows是列表的元组，需要转成字典列表
        user_list = []
        for row in rows:
            user = {
                "id": row[0],
                "create_time": row[1].strftime('%Y年%m月%d日 %H:%M:%S') if isinstance(row[1], datetime.datetime) else row[1],
                "permission": row[2],
                "ip": row[3],
            }
            user_list.append(user)
        return user_list
    except Exception as e:
        print(f"[获取用户错误] {e}")
        return []
    
def get_users_by_field(field, value):
    '''
    根据字段和值查询用户信息
    field: 字段名，支持 'ip' 和 'permission'
    value: 字段值
    '''
    if field not in ['ip', 'permission']:
        raise ValueError("不支持的查询字段")
    check_connection()
    # sql = f"SELECT id, create_time, permission, ip FROM user WHERE {field} is %s"
    # print(sql)
    print("-----2222-----------------")
    # SELECT id, create_time, permission, ip FROM user where ip = '重庆';
    # sql = f"SELECT id, create_time, permission, ip FROM user where %s = %s"
    print(field,value)
    # cursor.execute(sql, (field, value))


    sql = f"SELECT id, create_time, permission, ip FROM user WHERE {field} = %s"
    cursor.execute(sql, (value,))
    rows = cursor.fetchall()
    print("查询结果显示如下")
    print(rows)
    return [
        {
            'id': row[0],
            'create_time': row[1].strftime('%Y-%m-%d %H:%M:%S') if row[1] else '',
            'permission': row[2],
            'ip': row[3]
        }
        for row in rows
    ]


if __name__ == '__main__':


#------------------------------------------管理员登录注册功能-----------------------------------------------------
    
    # 登录测试
    #print(login(1,  1))
    # 注册测试
    #print(register(4, '4'))
    # 注册测试
    #print(register(5, '5'))
    
#--------------------------------------------------对用户的增删改查操作（1）号管理员---------------------------------
    # 添加用户测试
    print(add_user(9, '8',"重庆",'2'))

    # 删除用户测试
    #print(delete_user(6, '1'))
    
    #修改用户的权限
    #print(change_user_permission('1',1,1))

    #查看用户 暂时不写
