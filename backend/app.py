from flask import Flask, request, jsonify
from flask_cors import CORS
from db import get_connection
import config

def log_activity(action, performed_by, role):
    conn = get_connection()
    cursor = conn.cursor()

    query = "INSERT INTO activity_logs (action, performed_by, role) VALUES (%s, %s, %s)"
    cursor.execute(query, (action, performed_by, role))

    conn.commit()
    cursor.close()
    conn.close()

app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return "Backend Running Successfully"

@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role")

    conn = get_connection()
    cursor = conn.cursor()

    query = "INSERT INTO users (name, email, password, role) VALUES (%s, %s, %s, %s)"
    cursor.execute(query, (name, email, password, role))

    conn.commit()

    log_activity(f"Added user: {name}", "Admin", "Admin")

    cursor.close()
    conn.close()

    return jsonify({"message": "User registered successfully"})

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()


    email = data.get("email")
    password = data.get("password")

    conn = get_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM users WHERE email=%s AND password=%s"
    cursor.execute(query, (email, password))

    user = cursor.fetchone()

    cursor.close()
    conn.close()

    if user:
        return jsonify({
            "message": "Login successful",
            "role": user["role"],
            "name": user["name"]
        })
    else:
        return jsonify({"message": "Invalid credentials"}), 401


@app.route("/submit-payment", methods=["POST"])
def submit_payment():
    data = request.get_json()


    email = data.get("email")
    amount = data.get("amount")
    mode = data.get("mode")
    ref = data.get("reference")

    conn = get_connection()
    cursor = conn.cursor()

    query = "INSERT INTO payment_requests (student_email, amount, payment_mode, reference_no) VALUES (%s, %s, %s, %s)"
    cursor.execute(query, (email, amount, mode, ref))

    conn.commit()

    cursor.close()
    conn.close()

    return jsonify({"message": "Payment request submitted"})

# API to GET requests
@app.route("/payment-requests", methods=["GET"])
def get_payment_requests():
    conn = get_connection()
    cursor = conn.cursor()


    query = "SELECT * FROM payment_requests ORDER BY date DESC"
    cursor.execute(query)

    data = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(data)

# Approve API
@app.route("/approve-payment", methods=["POST"])
def approve_payment():
    data = request.get_json()
    request_id = data.get("id")


    conn = get_connection()
    cursor = conn.cursor()

    query = "UPDATE payment_requests SET status='approved' WHERE id=%s"
    cursor.execute(query, (request_id,))

    conn.commit()

    log_activity("Approved payment request", "Accountant", "Accountant")

    cursor.close()
    conn.close()

    return jsonify({"message": "Payment approved"})

# Reject API

@app.route("/reject-payment", methods=["POST"])
def reject_payment():
    data = request.get_json()
    request_id = data.get("id")


    conn = get_connection()
    cursor = conn.cursor()

    query = "UPDATE payment_requests SET status='rejected' WHERE id=%s"
    cursor.execute(query, (request_id,))

    conn.commit()

    log_activity("Rejected payment request", "Accountant", "Accountant")

    cursor.close()
    conn.close()

    return jsonify({"message": "Payment rejected"})


# ===============================
# 🎓 COURSE MANAGEMENT APIs
# ===============================

# ➕ Add Course
@app.route("/add-course", methods=["POST"])
def add_course():
    data = request.get_json()

    course_name = data.get("course_name")
    total_fee = data.get("total_fee")
    semesters = data.get("semesters")

    conn = get_connection()
    cursor = conn.cursor()

    query = "INSERT INTO courses (course_name, total_fee, semesters) VALUES (%s, %s, %s)"
    cursor.execute(query, (course_name, total_fee, semesters))

    conn.commit()

    cursor.close()
    conn.close()

    return jsonify({"message": "Course added successfully"})


# 📥 Get All Courses
@app.route("/courses", methods=["GET"])
def get_courses():
    conn = get_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM courses"
    cursor.execute(query)

    courses = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(courses)


# 🔗 Assign Course to Student
@app.route("/assign-course", methods=["POST"])
def assign_course():
    data = request.get_json()

    email = data.get("email")
    course_id = data.get("course_id")

    conn = get_connection()
    cursor = conn.cursor()

    query = "UPDATE users SET course_id = %s WHERE email = %s"
    cursor.execute(query, (course_id, email))

    conn.commit()

    log_activity(f"Assigned course to {email}", "Admin", "Admin")

    cursor.close()
    conn.close()

    return jsonify({"message": "Course assigned successfully"})


@app.route("/delete-course", methods=["POST"])
def delete_course():

    data = request.get_json()
    course_id = data.get("course_id")

    conn = get_connection()
    cursor = conn.cursor()

    # Get course name
    cursor.execute(
        "SELECT course_name FROM courses WHERE id=%s",
        (course_id,)
    )

    course = cursor.fetchone()

    if not course:
        cursor.close()
        conn.close()

        return jsonify({
            "message": "Course not found"
        })

    course_name = course["course_name"]

    # Get assigned students
    cursor.execute(
        """
        SELECT name
        FROM users
        WHERE course_id=%s
        """,
        (course_id,)
    )

    students = cursor.fetchall()

    if len(students) > 0:

        student_names = "\n".join(
            [f"• {s['name']}" for s in students]
        )

        cursor.close()
        conn.close()

        return jsonify({
            "message":
            f"Cannot delete {course_name}.\n\nAssigned Students:\n{student_names}"
        })

    # Delete course
    cursor.execute(
        "DELETE FROM courses WHERE id=%s",
        (course_id,)
    )

    conn.commit()

    cursor.close()
    conn.close()

    return jsonify({
        "message": f"{course_name} deleted successfully"
    })

@app.route("/users", methods=["GET"])
def get_users():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT name, email, role, course_id FROM users")
    users = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(users)


@app.route("/delete-user", methods=["POST"])
def delete_user():
    data = request.get_json()
    email = data.get("email")

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM users WHERE email=%s", (email,))
    conn.commit()

    log_activity(f"Deleted user: {email}", "Admin", "Admin")

    cursor.close()
    conn.close()

    return jsonify({"message": "User deleted successfully"})

@app.route("/student-fee/<email>", methods=["GET"])
def get_student_fee(email):

    conn = get_connection()
    cursor = conn.cursor()

    query = """
    SELECT u.email, c.total_fee
    FROM users u
    JOIN courses c ON u.course_id = c.id
    WHERE u.email = %s
    """

    cursor.execute(query, (email,))
    data = cursor.fetchone()

    cursor.close()
    conn.close()

    if data:
        return jsonify(data)
    else:
        return jsonify({"message": "No course assigned"}), 404
    

@app.route("/admin-dashboard", methods=["GET"])
def admin_dashboard():

    conn = get_connection()
    cursor = conn.cursor()

    # Total users
    cursor.execute("SELECT COUNT(*) as total FROM users")
    total_users = cursor.fetchone()["total"]

    # Students
    cursor.execute("SELECT COUNT(*) as total FROM users WHERE role='student'")
    students = cursor.fetchone()["total"]

    # Fees collected
    cursor.execute("SELECT SUM(amount) as total FROM payment_requests WHERE status='approved'")
    collected = cursor.fetchone()["total"] or 0

    # 🔥 Total fees of all students
    cursor.execute("""
    SELECT SUM(c.total_fee) as total
    FROM users u
    JOIN courses c ON u.course_id = c.id
    WHERE u.role='student'
    """)
    total_fees = cursor.fetchone()["total"] or 0

    # 🔥 Correct pending
    pending = total_fees - collected

    # Pending requests count
    cursor.execute("SELECT COUNT(*) as total FROM payment_requests WHERE status='pending'")
    pending_requests = cursor.fetchone()["total"]

    # 🔥 students with pending fees
    cursor.execute("""
    SELECT COUNT(*) as total FROM (
        SELECT u.id, 
           c.total_fee - IFNULL(SUM(pr.amount), 0) as remaining
        FROM users u
        JOIN courses c ON u.course_id = c.id
        LEFT JOIN payment_requests pr 
            ON u.email = pr.student_email AND pr.status='approved'
        WHERE u.role='student'
        GROUP BY u.id
        HAVING remaining > 0
    ) as pending_students
    """)

    pending_students = cursor.fetchone()["total"]

    cursor.close()
    conn.close()

    return jsonify({
        "total_users": total_users,
        "students": students,
        "collected": collected,
        "pending": pending,
        "pending_requests": pending_requests,
        "total_fees": total_fees,
        "pending_students": pending_students   # 🔥 ADD THIS
    })

@app.route("/recent-activity", methods=["GET"])
def recent_activity():

    conn = get_connection()
    cursor = conn.cursor()

    query = """
    SELECT student_email, status, date 
    FROM payment_requests 
    ORDER BY date DESC 
    LIMIT 7
    """

    cursor.execute(query)
    data = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(data)


@app.route("/activity-logs", methods=["GET"])
def get_activity_logs():
    conn = get_connection()
    cursor = conn.cursor()   # keep this

    query = "SELECT action, performed_by, role, timestamp FROM activity_logs ORDER BY timestamp DESC LIMIT 7"
    cursor.execute(query)

    rows = cursor.fetchall()

    data = []
    for r in rows:
        data.append({
            "action": r["action"],            # ✅ FIXED
            "performed_by": r["performed_by"],
            "role": r["role"],
            "timestamp": str(r["timestamp"])
        })

    cursor.close()
    conn.close()

    return jsonify(data)


@app.route("/student-balance/<email>", methods=["GET"])
def student_balance(email):

    conn = get_connection()
    cursor = conn.cursor()

    # Get student's course fee
    cursor.execute("""
    SELECT c.total_fee 
    FROM users u
    JOIN courses c ON u.course_id = c.id
    WHERE u.email = %s
    """, (email,))
    
    total_fee = cursor.fetchone()["total_fee"]

    # Get total approved payments
    cursor.execute("""
    SELECT IFNULL(SUM(amount), 0) as paid
    FROM payment_requests
    WHERE student_email = %s AND status='approved'
    """, (email,))
    
    paid = cursor.fetchone()["paid"]

    pending = total_fee - paid

    cursor.close()
    conn.close()

    return jsonify({
        "total_fee": total_fee,
        "paid": paid,
        "pending": pending
    })


@app.route("/students", methods=["GET"])
def get_students():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT email FROM users WHERE role='student'
    """)

    students = cursor.fetchall()

    cursor.close()
    conn.close()

@app.route("/defaulters", methods=["GET"])
def get_defaulters():

    conn = get_connection()
    cursor = conn.cursor()

    query = """
    SELECT 
        u.email,
        c.total_fee,
        COALESCE(SUM(CASE WHEN pr.status='approved' THEN pr.amount END), 0) as paid
    FROM users u
    JOIN courses c ON u.course_id = c.id
    LEFT JOIN payment_requests pr ON u.email = pr.student_email
    WHERE u.role='student'
    GROUP BY u.email, c.total_fee
    """

    cursor.execute(query)
    rows = cursor.fetchall()

    result = []

    for r in rows:
        total = r["total_fee"]
        paid = r["paid"]
        pending = total - paid

        if pending > 0:
            result.append({
                "email": r["email"],
                "paid": paid,
                "pending": pending
            })

    cursor.close()
    conn.close()

    return jsonify(result)

    return jsonify(students)

if __name__ == "__main__":
    app.run(debug=True)