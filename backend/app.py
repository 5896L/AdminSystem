from flask import Flask, request, jsonify,redirect, url_for
from flask_cors import CORS
import database_management.database as database
from routes.user import users_bp  
from routes.log import log_bp
from routes.article import article_bp 
from routes.comment import comment_bp
app = Flask(__name__)
CORS(app)

# ✅ 注册蓝图
app.register_blueprint(users_bp)
app.register_blueprint(article_bp)  
app.register_blueprint(log_bp)
app.register_blueprint(comment_bp)
# 原有接口


@app.route('/api/login', methods=['POST'])
def login():
    '''
    登录接口
    '''
    data = request.json
    id = data.get('username')
    password = data.get('password')
    if database.login(id, password):
        token = 'fake-jwt-token'
        print("登录成功")
        return jsonify({'token': token})
    else:
        print("登录失败")
        return jsonify({'error': '登录失败'}), 401

@app.route('/api/register', methods=['POST'])
def register():
    '''
    注册接口
    '''
    data = request.json
    id = data.get('username')
    password = data.get('password')
    success = database.register(id, password)
    if success:
        return jsonify({'message': '注册成功'})
    else:
        return jsonify({'message': '注册失败'}), 400

if __name__ == '__main__':
    app.run(debug=True)
