import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from .models import db, Department, Course, User, LandingPageSection, LandingPageItem, ExaminationResult

# Configure paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DB_DIR = os.path.join(BASE_DIR, 'database')
try:
    os.makedirs(DB_DIR, exist_ok=True)
    DB_PATH = os.path.join(DB_DIR, 'ums.db')
except OSError:
    # Fallback to /tmp which is writable in serverless environments like Vercel
    DB_PATH = '/tmp/ums.db'

app = Flask(__name__)
# Enable CORS so frontend can communicate with backend
CORS(app)

# Configure Database
db_url = os.environ.get('DATABASE_URL')
if db_url:
    # SQLAlchemy 1.4+ requires postgresql:// instead of postgres://
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{DB_PATH}'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

# Initialize database tables
with app.app_context():
    db.create_all()
    # Seed default users if none exist
    if User.query.count() == 0:
        default_users = [
            User(username='admin', role='admin'),
            User(username='student123', role='student'),
            User(username='faculty123', role='faculty')
        ]
        # Hash passwords before saving
        for u in default_users:
            u.set_password('password')
            
        db.session.bulk_save_objects(default_users)
        db.session.commit()

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "message": "Flask backend is running!"})

# --- Authentication APIs ---

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.json
        if not data or 'username' not in data or 'password' not in data:
            return jsonify({"error": "Missing credentials"}), 400
        
        user = User.query.filter_by(username=data['username']).first()
        if not user or not user.check_password(data['password']):
            return jsonify({"error": "Invalid credentials"}), 401
        
        return jsonify({"message": "Login successful", "user": user.to_dict()}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/user/update', methods=['POST'])
def update_user():
    try:
        data = request.json
        if not data or 'user_id' not in data:
            return jsonify({"error": "Missing user_id"}), 400
            
        user = User.query.get(data['user_id'])
        if not user:
            return jsonify({"error": "User not found"}), 404
            
        if 'new_username' in data and data['new_username']:
            existing = User.query.filter_by(username=data['new_username']).first()
            if existing and existing.id != user.id:
                return jsonify({"error": "Username already taken"}), 409
            user.username = data['new_username']
            
        if 'new_password' in data and data['new_password']:
            user.set_password(data['new_password'])
            
        db.session.commit()
        return jsonify({"message": "Profile updated successfully", "user": user.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to update profile", "details": str(e)}), 500

# --- Department APIs ---

@app.route('/api/departments', methods=['GET'])
def get_departments():
    departments = Department.query.all()
    return jsonify([d.to_dict() for d in departments])

@app.route('/api/departments', methods=['POST'])
def add_department():
    data = request.json
    if not data or not data.get('name'):
        return jsonify({"error": "Department name is required"}), 400
    
    # Check if exists
    if Department.query.filter_by(name=data['name']).first():
        return jsonify({"error": "Department already exists"}), 409

    new_dept = Department(
        name=data['name'],
        head_of_department=data.get('head_of_department', '')
    )
    db.session.add(new_dept)
    db.session.commit()
    
    return jsonify({"message": "Department added successfully", "department": new_dept.to_dict()}), 201

# --- Course APIs ---

@app.route('/api/courses', methods=['GET'])
def get_courses():
    courses = Course.query.all()
    return jsonify([c.to_dict() for c in courses])

@app.route('/api/courses', methods=['POST'])
def add_course():
    data = request.json
    required_fields = ['course_code', 'title', 'credits', 'department_id']
    if not data or not all(k in data for k in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    if Course.query.filter_by(course_code=data['course_code']).first():
        return jsonify({"error": "Course code already exists"}), 409

    # Verify department exists
    if not Department.query.get(data['department_id']):
        return jsonify({"error": "Invalid department_id"}), 400

    new_course = Course(
        course_code=data['course_code'],
        title=data['title'],
        credits=int(data['credits']),
        department_id=int(data['department_id'])
    )
    db.session.add(new_course)
    db.session.commit()
    
    return jsonify({"message": "Course added successfully", "course": new_course.to_dict()}), 201

# --- Landing Page CMS APIs ---

@app.route('/api/public/landing-content', methods=['GET'])
def get_landing_content():
    sections = LandingPageSection.query.order_by(LandingPageSection.order).all()
    return jsonify([s.to_dict() for s in sections])

@app.route('/api/admin/landing-content/section', methods=['POST'])
def add_landing_section():
    data = request.json
    if not data or not data.get('title'):
        return jsonify({"error": "Title is required"}), 400
    
    if LandingPageSection.query.filter_by(title=data['title']).first():
        return jsonify({"error": "Section title already exists"}), 409
        
    section = LandingPageSection(title=data['title'], order=data.get('order', 0))
    db.session.add(section)
    db.session.commit()
    return jsonify({"message": "Section added", "section": section.to_dict()}), 201

@app.route('/api/admin/landing-content/section/<int:id>', methods=['DELETE'])
def delete_landing_section(id):
    section = LandingPageSection.query.get(id)
    if not section:
        return jsonify({"error": "Section not found"}), 404
    db.session.delete(section)
    db.session.commit()
    return jsonify({"message": "Section deleted"}), 200

@app.route('/api/admin/landing-content/item', methods=['POST'])
def add_landing_item():
    data = request.json
    if not data or not data.get('title') or not data.get('section_id'):
        return jsonify({"error": "Title and section_id required"}), 400
        
    item = LandingPageItem(
        title=data['title'],
        link=data.get('link', '#'),
        order=data.get('order', 0),
        section_id=data['section_id']
    )
    db.session.add(item)
    db.session.commit()
    return jsonify({"message": "Item added", "item": item.to_dict()}), 201

@app.route('/api/admin/landing-content/item/<int:id>', methods=['DELETE'])
def delete_landing_item(id):
    item = LandingPageItem.query.get(id)
    if not item:
        return jsonify({"error": "Item not found"}), 404
    db.session.delete(item)
    db.session.commit()
    return jsonify({"message": "Item deleted"}), 200

# --- Examination Results APIs ---

@app.route('/api/public/results', methods=['GET'])
def get_exam_results():
    results = ExaminationResult.query.all()
    hierarchy = {}
    for r in results:
        pl = r.parent_level
        prog = r.program
        if pl not in hierarchy:
            hierarchy[pl] = {}
        if prog not in hierarchy[pl]:
            hierarchy[pl][prog] = []
        hierarchy[pl][prog].append(r.to_dict())
    return jsonify(hierarchy)

@app.route('/api/faculty/results', methods=['POST'])
def add_exam_result():
    data = request.json
    required_fields = ['parent_level', 'program', 'title', 'result_link']
    if not data or not all(k in data for k in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    result = ExaminationResult(
        parent_level=data['parent_level'],
        program=data['program'],
        title=data['title'],
        result_link=data['result_link']
    )
    db.session.add(result)
    db.session.commit()
    return jsonify({"message": "Result uploaded successfully", "result": result.to_dict()}), 201

if __name__ == '__main__':
    # Run the server on port 5000
    app.run(debug=True, host='0.0.0.0', port=5000)
