
from flask import Blueprint, jsonify, request
import database_management.database as database  

users_bp = Blueprint('users', __name__)

@users_bp.route('/api/users', methods=['GET'])
def get_users():
    '''
    获取所有用户
    '''
    try:
        user_list = database.get_all_users()  # 你需要写这个函数
        return jsonify(user_list)  # 返回数组即可，前端写的是 setUsers(res.data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    


@users_bp.route('/api/users/<user_id>', methods=['DELETE'])
def delete_user(user_id):
    '''
    删除用户
    '''
    try:
        success = database.delete_user_by_id(user_id)
        if success:
            return jsonify({'message': '删除成功'})
        else:
            return jsonify({'error': '删除失败，用户不存在或数据库错误'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

@users_bp.route('/api/users/<user_id>', methods=['PUT'])
def update_user(user_id):
    '''
    修改用户信息
    '''
    try:
        data = request.json  # 前端发来的修改数据
        permission = data.get('permission')
        ip = data.get('ip')

        if not permission or not ip:
            return jsonify({'error': '缺少必要的字段'}), 400

        # 这里调用数据库更新函数，假设叫 update_user_by_id
        success = database.update_user_by_id(user_id, permission, ip)
        if success:
            return jsonify({'message': '更新成功'})
        else:
            return jsonify({'error': '更新失败，用户不存在或数据库错误'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

@users_bp.route('/api/users2', methods=['GET'])
def fetch_users():
    '''
    按条件查询用户
    '''
    ip = request.args.get('ip')
    permission = request.args.get('permission')
    print("---------------")
    print(ip)
    try:
        if ip:
            users = database.get_users_by_field('ip', ip)
        elif permission:
            users = database.get_users_by_field('permission', permission)
        else:
            users = database.get_all_users()
        print(users)
        return jsonify(users)
    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500


@users_bp.route('/api/users', methods=['POST'])
def add_user():
    '''
    新增用户
    '''
    data = request.get_json()
    id_ = data.get('id')
    password = data.get('password')
    ip = data.get('ip')
    permission = data.get('permission')

    if not all([id_, password, ip, permission]):
        return jsonify({'error': '缺少必要字段'}), 400

    try:
        success = database.add_user(id_, password, ip, permission)
        if success:
            return jsonify({'message': '新增成功'})
        else:
            return jsonify({'error': '新增失败，用户已存在'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500@users_bp.route('/api/users', methods=['GET'])


