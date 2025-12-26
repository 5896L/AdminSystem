from flask import Blueprint, request, jsonify

from database_management.comments_db_manage import (
    get_all_comments, get_comments_by_field,
    add_comment, update_comment, delete_comment
)

comment_bp = Blueprint('comment', __name__)

@comment_bp.route('/api/comments2', methods=['GET'])
def list_comments():
    field = request.args.get('field')
    value = request.args.get('value')
    print("dddddddddddddd")
    print(field,value)
    if field and value:
        print("sssssss")
        data = get_comments_by_field(field, value)
    else:
        data = get_all_comments()
    return jsonify({'data': data})

@comment_bp.route('/api/comments', methods=['POST'])
def create_comment():
    comment_id = add_comment(request.json)
    return jsonify({'Id': comment_id})

@comment_bp.route('/api/comments/<int:comment_id>', methods=['PUT'])
def edit_comment(comment_id):
    success = update_comment(comment_id, request.json)
    return jsonify({'success': success})

@comment_bp.route('/api/comments/<int:comment_id>', methods=['DELETE'])
def remove_comment(comment_id):
    success = delete_comment(comment_id)
    return jsonify({'success': success})
