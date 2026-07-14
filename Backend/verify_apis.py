import urllib.request
import json
import sys

API_BASE = "http://127.0.0.1:8000"

def make_request(path, method="GET", payload=None):
    url = f"{API_BASE}{path}"
    data = json.dumps(payload).encode('utf-8') if payload else None
    headers = {"Content-Type": "application/json"} if payload else {}
    
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as res:
            return res.status, json.loads(res.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        try:
            return e.code, json.loads(e.read().decode('utf-8'))
        except Exception:
            return e.code, {"error": e.reason}
    except Exception as e:
        return 0, {"error": str(e)}

def run_tests():
    print("==================================================")
    print("      LMS REST API - CRUD VERIFICATION TESTS       ")
    print("==================================================")
    
    results = {}
    
    # ------------------ STUDENT TESTS ------------------
    # 1. Add Student (POST)
    student_payload = {
        "student_id": 999,
        "full_name": "Test Student",
        "email": "teststudent@gmail.com",
        "phone": "1112223333",
        "qualification": "Graduate",
        "password": "pass999"
    }
    status, res = make_request("/students/add/", "POST", student_payload)
    results["POST /students/add/"] = (status == 201, f"Status: {status}, Response: {res}")
    
    # 2. Get Students (GET)
    status, res = make_request("/students/")
    has_student = any(s.get("student_id") == 999 for s in res) if isinstance(res, list) else False
    results["GET /students/"] = (status == 200 and has_student, f"Status: {status}, Count: {len(res) if isinstance(res, list) else 0}")
    
    # 3. Update Student (PUT)
    student_update = {
        "full_name": "Test Student Updated",
        "qualification": "Post-Graduate"
    }
    status, res = make_request("/students/update/999/", "PUT", student_update)
    results["PUT /students/update/<id>/"] = (status == 200 and res.get("full_name") == "Test Student Updated", f"Status: {status}, Response: {res}")
    
    # 4. Delete Student (DELETE)
    status, res = make_request("/students/delete/999/", "DELETE")
    results["DELETE /students/delete/<id>/"] = (status == 200, f"Status: {status}, Response: {res}")

    # ------------------ INSTRUCTOR TESTS ------------------
    # 5. Add Instructor (POST)
    inst_payload = {
        "instructor_id": 999,
        "instructor_name": "Test Instructor",
        "specialization": "Testing Specialists",
        "experience": 10,
        "email": "testinstructor@gmail.com",
        "phone": "9998887777"
    }
    status, res = make_request("/instructors/add/", "POST", inst_payload)
    results["POST /instructors/add/"] = (status == 201, f"Status: {status}, Response: {res}")
    
    # 6. Get Instructors (GET)
    status, res = make_request("/instructors/")
    has_inst = any(i.get("instructor_id") == 999 for i in res) if isinstance(res, list) else False
    results["GET /instructors/"] = (status == 200 and has_inst, f"Status: {status}, Count: {len(res) if isinstance(res, list) else 0}")
    
    # 7. Update Instructor (PUT)
    inst_update = {
        "instructor_name": "Test Instructor Updated",
        "experience": 11
    }
    status, res = make_request("/instructors/update/999/", "PUT", inst_update)
    results["PUT /instructors/update/<id>/"] = (status == 200 and res.get("instructor_name") == "Test Instructor Updated", f"Status: {status}, Response: {res}")
    
    # 8. Delete Instructor (DELETE)
    status, res = make_request("/instructors/delete/999/", "DELETE")
    results["DELETE /instructors/delete/<id>/"] = (status == 200, f"Status: {status}, Response: {res}")

    # ------------------ COURSE TESTS ------------------
    # 9. Add Course (POST)
    course_payload = {
        "course_id": 999,
        "course_name": "Test Course",
        "instructor_name": "Saran Velmurugan",
        "category": "Testing",
        "duration": "1 Month",
        "price": 1000,
        "level": "Intermediate"
    }
    status, res = make_request("/courses/add/", "POST", course_payload)
    results["POST /courses/add/"] = (status == 201, f"Status: {status}, Response: {res}")
    
    # 10. Get Courses (GET)
    status, res = make_request("/courses/")
    has_course = any(c.get("course_id") == 999 for c in res) if isinstance(res, list) else False
    results["GET /courses/"] = (status == 200 and has_course, f"Status: {status}, Count: {len(res) if isinstance(res, list) else 0}")
    
    # 11. Update Course (PUT)
    course_update = {
        "course_name": "Test Course Updated",
        "price": 1200
    }
    status, res = make_request("/courses/update/999/", "PUT", course_update)
    results["PUT /courses/update/<id>/"] = (status == 200 and res.get("course_name") == "Test Course Updated", f"Status: {status}, Response: {res}")
    
    # 12. Delete Course (DELETE)
    status, res = make_request("/courses/delete/999/", "DELETE")
    results["DELETE /courses/delete/<id>/"] = (status == 200, f"Status: {status}, Response: {res}")

    # ------------------ ENROLLMENT TESTS ------------------
    # 13. Add Enrollment (POST)
    enroll_payload = {
        "enrollment_id": 999,
        "student_name": "Rahul Sharma",
        "course_name": "Python Full Stack",
        "enrollment_date": "2026-07-14",
        "payment_status": "Pending",
        "course_status": "Active"
    }
    status, res = make_request("/enrollments/add/", "POST", enroll_payload)
    results["POST /enrollments/add/"] = (status == 201, f"Status: {status}, Response: {res}")
    
    # 14. Get Enrollments (GET)
    status, res = make_request("/enrollments/")
    has_enroll = any(e.get("enrollment_id") == 999 for e in res) if isinstance(res, list) else False
    results["GET /enrollments/"] = (status == 200 and has_enroll, f"Status: {status}, Count: {len(res) if isinstance(res, list) else 0}")
    
    # 15. Update Enrollment (PUT)
    enroll_update = {
        "payment_status": "Paid",
        "course_status": "Completed"
    }
    status, res = make_request("/enrollments/update/999/", "PUT", enroll_update)
    results["PUT /enrollments/update/<id>/"] = (status == 200 and res.get("payment_status") == "Paid", f"Status: {status}, Response: {res}")
    
    # 16. Delete Enrollment (DELETE)
    status, res = make_request("/enrollments/delete/999/", "DELETE")
    results["DELETE /enrollments/delete/<id>/"] = (status == 200, f"Status: {status}, Response: {res}")

    # ------------------ ASSIGNMENT TESTS ------------------
    # 17. Add Assignment (POST)
    assign_payload = {
        "assignment_id": 999,
        "course_name": "Python Full Stack",
        "student_name": "Rahul Sharma",
        "assignment_title": "Test Assignment",
        "submission_date": "2026-07-20",
        "marks": 0,
        "status": "Pending"
    }
    status, res = make_request("/assignments/add/", "POST", assign_payload)
    results["POST /assignments/add/"] = (status == 201, f"Status: {status}, Response: {res}")
    
    # 18. Get Assignments (GET)
    status, res = make_request("/assignments/")
    has_assign = any(a.get("assignment_id") == 999 for a in res) if isinstance(res, list) else False
    results["GET /assignments/"] = (status == 200 and has_assign, f"Status: {status}, Count: {len(res) if isinstance(res, list) else 0}")
    
    # 19. Update Assignment (PUT)
    assign_update = {
        "marks": 90,
        "status": "Evaluated"
    }
    status, res = make_request("/assignments/update/999/", "PUT", assign_update)
    results["PUT /assignments/update/<id>/"] = (status == 200 and res.get("marks") == 90, f"Status: {status}, Response: {res}")
    
    # 20. Delete Assignment (DELETE)
    status, res = make_request("/assignments/delete/999/", "DELETE")
    results["DELETE /assignments/delete/<id>/"] = (status == 200, f"Status: {status}, Response: {res}")

    # ------------------ RESULTS OVERVIEW ------------------
    print("\nTest Run Completed. Evaluation:")
    print("--------------------------------------------------")
    passed = 0
    for api, (success, detail) in results.items():
        status_text = "PASS" if success else "FAIL"
        print(f"[{status_text}] {api}")
        print(f"      Details: {detail}")
        if success: passed += 1
    print("--------------------------------------------------")
    print(f"Passed: {passed}/20 APIs")
    print("==================================================")
    
    if passed == 20:
        print("ALL 20 CRUD API ENDPOINTS VERIFIED SUCCESSFULLY!")
        sys.exit(0)
    else:
        print("SOME API TESTS FAILED. CHECK LOGS ABOVE.")
        sys.exit(1)

if __name__ == "__main__":
    run_tests()
