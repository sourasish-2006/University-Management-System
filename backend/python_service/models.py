from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=False, unique=True)
    password_hash = db.Column(db.String(255), nullable=False)
    # 'admin', 'student', 'faculty'
    role = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __init__(self, username, role, **kwargs):
        super().__init__(**kwargs)
        self.username = username
        self.role = role

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'role': self.role
        }


class Department(db.Model):
    __tablename__ = 'departments'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    head_of_department = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationship: One department has many courses
    courses = db.relationship(
        'Course',
        backref='department',
        lazy=True,
        cascade='all, delete-orphan')

    def __init__(self, name, head_of_department=None, **kwargs):
        super().__init__(**kwargs)
        self.name = name
        self.head_of_department = head_of_department

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'head_of_department': self.head_of_department,
            'created_at': self.created_at.isoformat()
        }


class Course(db.Model):
    __tablename__ = 'courses'
    id = db.Column(db.Integer, primary_key=True)
    course_code = db.Column(db.String(20), nullable=False, unique=True)
    title = db.Column(db.String(150), nullable=False)
    credits = db.Column(db.Integer, nullable=False)
    department_id = db.Column(
        db.Integer,
        db.ForeignKey('departments.id'),
        nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __init__(self, course_code, title, credits, department_id, **kwargs):
        super().__init__(**kwargs)
        self.course_code = course_code
        self.title = title
        self.credits = credits
        self.department_id = department_id

    def to_dict(self):
        return {
            'id': self.id,
            'course_code': self.course_code,
            'title': self.title,
            'credits': self.credits,
            'department_id': self.department_id,
            'created_at': self.created_at.isoformat()
        }


class LandingPageSection(db.Model):
    __tablename__ = 'landing_page_sections'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False, unique=True)
    order = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    items = db.relationship(
        'LandingPageItem',
        backref='section',
        lazy=True,
        cascade='all, delete-orphan')

    def __init__(self, title, order=0, **kwargs):
        super().__init__(**kwargs)
        self.title = title
        self.order = order

    def to_dict(self):
        return {'id': self.id, 'title': self.title, 'order': self.order, 'items': sorted(
            [item.to_dict() for item in self.items], key=lambda x: x['order'])}


class LandingPageItem(db.Model):
    __tablename__ = 'landing_page_items'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    link = db.Column(db.String(255), nullable=False, default='#')
    order = db.Column(db.Integer, default=0)
    section_id = db.Column(db.Integer, db.ForeignKey(
        'landing_page_sections.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __init__(self, title, section_id, link='#', order=0, **kwargs):
        super().__init__(**kwargs)
        self.title = title
        self.section_id = section_id
        self.link = link
        self.order = order

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'link': self.link,
            'order': self.order,
            'section_id': self.section_id
        }


class ExaminationResult(db.Model):
    __tablename__ = 'examination_results'
    id = db.Column(db.Integer, primary_key=True)
    parent_level = db.Column(db.String(20), nullable=False)  # e.g. "UG", "PG"
    program = db.Column(
        db.String(50),
        nullable=False)      # e.g. "BSc", "BTech"
    title = db.Column(db.String(150), nullable=False)
    result_link = db.Column(db.String(500), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __init__(self, parent_level, program, title, result_link, **kwargs):
        super().__init__(**kwargs)
        self.parent_level = parent_level
        self.program = program
        self.title = title
        self.result_link = result_link

    def to_dict(self):
        return {
            'id': self.id,
            'parent_level': self.parent_level,
            'program': self.program,
            'title': self.title,
            'result_link': self.result_link,
            'created_at': self.created_at.isoformat()
        }
