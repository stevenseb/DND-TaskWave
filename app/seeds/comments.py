from app.models import db, Comment, environment, SCHEMA
from sqlalchemy.sql import text

def seed_comments():
    CommentOne = Comment(
        user_id=1,
        content='Test 1',
        card_id=1
    )
    CommentTwo = Comment(
        user_id=2,
        content='Test 2',
        card_id=2

    )
    CommentThree = Comment(
        user_id=3,
        content='Test 3',
        card_id=3
    )

    db.session.add(CommentOne)
    db.session.add(CommentTwo)
    db.session.add(CommentThree)
    db.session.commit()

def undo_comments():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.comments RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM comments"))

    db.session.commit()
