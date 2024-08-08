from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from app.models import db, Card, CardTask, Comment, UserInBoard, List
from datetime import datetime, timezone

card_routes = Blueprint('cards', __name__)

@card_routes.route('/<int:id>/', methods=['GET'])
@login_required
def get_card_by_id(id):
    """
    Returns a Card by specified id
    """
    card = Card.query.get(id)

    if not card:
        return jsonify({"message": "Card couldn't be found"}), 404

    # Check for board membership of current user
    user_in_board = UserInBoard.query.filter_by(board_id=id, user_id=current_user.id).first()
    if not user_in_board:
       return jsonify({"message": "Forbidden"}), 403

    return jsonify(card.to_dict()), 200

@card_routes.route('/<int:id>/cardtasks', methods=['GET'])
@login_required
def get_card_tasks_by_card_id(id):
    """
    Returns all card tasks that belong to a card by specified id
    """

    # Check for board membership of current user
    user_in_board = UserInBoard.query.filter_by(board_id=id, user_id=current_user.id).all()
    if not user_in_board:
       return jsonify({"message": "Forbidden"}), 403
    
    tasks = CardTask.query.filter_by(card_id=id).all()
    if not tasks:
        return jsonify({"message": "No tasks found"}), 404

    return jsonify({"CardTasks": [task.to_dict() for task in tasks]}), 200
    
    
@card_routes.route('/<int:id>', methods=['PUT'])
@login_required
def edit_card(id):
    """
    Edits and returns an existing Card
    """
    card = Card.query.get(id)

    if not card:
        return jsonify({"message": "Card couldn't be found"}), 404

    data = request.get_json()
    title = data.get('title')
    description = data.get('description')
    list_id = data.get('list_id')

    if list_id is not None:
        try:
            list_id = int(list_id)  # Ensure list_id is an integer
        except ValueError:
            return jsonify({"message": "Invalid List ID"}), 400

        # Check if list_id exists
        if not List.query.get(list_id):
            return jsonify({"message": "List not found"}), 404

        card.list_id = list_id

    # Only update title and description if they are provided
    if title is not None:
        if not title:
            return jsonify({"message": "Title is required"}), 400
        card.title = title

    if description is not None:
        if not description:
            return jsonify({"message": "Description is required"}), 400
        card.description = description

    card.updated_at = datetime.now(timezone.utc)

    # Check for board membership of current user
    user_in_board = UserInBoard.query.filter_by(board_id=card.list_id, user_id=current_user.id).first()
    if not user_in_board:
        return jsonify({"message": "Forbidden"}), 403

    db.session.commit()

    return jsonify(card.to_dict()), 200




@card_routes.route('/<int:id>', methods=['DELETE'])
@login_required
def delete_card(id):
    """
    Deletes an existing Card along with its tasks and comments
    """
    card = Card.query.get(id)

    if not card:
        return jsonify({"message": "Card couldn't be found"}), 404

    # Check for board membership of current user
    user_in_board = UserInBoard.query.filter_by(board_id=card.list_id, user_id=current_user.id).first()
    if not user_in_board:
       return jsonify({"message": "Forbidden"}), 403

    db.session.delete(card)
    db.session.commit()

    return jsonify({"message": "Successfully deleted"}), 200


@card_routes.route('/<int:id>/cardtasks', methods=['POST'])
@login_required
def create_card_task(id):
    """
    Creates and returns a new Card_Task
    """
    data = request.get_json()
    description = data.get('description')
    completed = data.get('completed', False)

    if not description:
        return jsonify({"message": "Bad Request", "errors": {"description": "Description is required"}}), 400

    # Check for board membership of current user
    user_in_board = UserInBoard.query.filter_by(board_id=id, user_id=current_user.id).first()
    if not user_in_board:
       return jsonify({"message": "Forbidden"}), 403

    new_task = CardTask(
        card_id=id,
        description=description,
        completed=completed
    )

    db.session.add(new_task)
    db.session.commit()

    return jsonify(new_task.to_dict()), 201

@card_routes.route('/<int:id>/comments', methods=['GET'])
@login_required
def get_comments_by_card_id(id):
    """
    Get all Comments by Card's ID
    """
    print(f"Fetching comments for card id: {id}")  # Log the card id

    # Check for board membership of current user
    user_in_board = UserInBoard.query.filter_by(board_id=id, user_id=current_user.id).first()
    if not user_in_board:
       print(f"User {current_user.id} is not a member of board {id}")  # Log the user and board id
       return jsonify({"message": "Forbidden"}), 403
    
    comments = Comment.query.filter_by(card_id=id).all()
    if not comments:
        return jsonify({"message": "No comments found"}), 404
    
    print(f"Found {len(comments)} comments for card id: {id}")  # Log the number of comments found

    return jsonify({"Comments": [comment.to_dict() for comment in comments]}), 200


@card_routes.route('/<int:id>/comments', methods=['POST'])
@login_required
def create_comment(id):
    """
    Creates and returns a new Comment on a Card
    """
    data = request.get_json()
    content = data.get('content')
    description = data.get('description')

    if not content or not description:
        errors = {}
        if not content:
            errors["content"] = "Content is required"
        if not description:
            errors["description"] = "Description is required"
        return jsonify({"message": "Bad Request", "errors": errors}), 400

    # Check for board membership of current user
    user_in_board = UserInBoard.query.filter_by(board_id=id, user_id=current_user.id).first()
    if not user_in_board:
       return jsonify({"message": "Forbidden"}), 403

    new_comment = Comment(
        card_id=id,
        user_id=current_user.id,
        content=content,
        description=description
    )

    db.session.add(new_comment)
    db.session.commit()

    return jsonify(new_comment.to_dict()), 201
