from flask import Blueprint, request, jsonify
from database_management.article_db_manage import (
    get_all_articles, get_articles_by_field,
    add_article, update_article, delete_article
)

article_bp = Blueprint('article', __name__, url_prefix='/api/articles')

def json_success(data=None, msg="success"):
    '''
    成功返回
    '''
    return jsonify({"code": 200, "msg": msg, "data": data or []})

def json_error(message="error", code=500):
    '''
    失败返回
    '''
    return jsonify({"code": code, "msg": message, "data": []})

@article_bp.route('', methods=['GET'])
def list_articles():
    '''
    获取所有文章
    '''
    try:
        author = request.args.get('author')
        region = request.args.get('region')
        type_ = request.args.get('type')

        # 优先级查询：author > region > type，可根据需求调整
        if author:
            data = get_articles_by_field('author_name', author)
        elif region:
            data = get_articles_by_field('region', region)
        elif type_:
            data = get_articles_by_field('type', type_)
        else:
            data = get_all_articles()

        return json_success(data)
    except Exception as e:
        return json_error(f"查询失败: {str(e)}")

@article_bp.route('', methods=['POST'])
def create_article():
    '''
    新增文章
    '''
    try:
        data = request.get_json(force=True)
        print("接收到的数据:", data)
        if not data:
            return json_error("请求体不能为空", 400)
        print("新增文章数据:", data)
        new_id = add_article(data)

        if new_id is None:
            return json_error("新增失败", 400)

        return json_success({"id": new_id}, msg="文章新增成功")
    except Exception as e:
        return json_error(f"新增失败: {str(e)}")

@article_bp.route('/<int:article_id>', methods=['PUT'])
def edit_article(article_id):
    '''
    更新文章
    '''
    try:
        data = request.get_json(force=True)
        if not data:
            return json_error("请求体不能为空", 400)

        success = update_article(article_id, data)
        if success:
            return json_success({"success": True}, msg="文章更新成功")
        else:
            return json_success({"success": False}, msg="未修改任何内容")
    except Exception as e:
        return json_error(f"更新失败: {str(e)}")

@article_bp.route('/<int:article_id>', methods=['DELETE'])
def remove_article(article_id):
    '''
    删除文章
    '''
    try:
        success = delete_article(article_id)
        if success:
            return json_success({"success": True}, msg="删除成功")
        else:
            return json_success({"success": False}, msg="删除失败")
    except Exception as e:
        return json_error(f"删除失败: {str(e)}")
