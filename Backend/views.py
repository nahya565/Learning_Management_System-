import json
from datetime import datetime
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from db import Student, Instructor, Course, Enrollment, Assignment

def get_json_data(request):
    try:
        return json.loads(request.body.decode('utf-8'))
    except Exception:
        return {}

def parse_date(date_str):
    if not date_str:
        return datetime.today().date()
    try:
        return datetime.strptime(date_str.split('T')[0], '%Y-%m-%d').date()
    except Exception:
        return datetime.today().date()

# Serialization Helpers
def serialize_student(s):
    return {
        "student_id": s.student_id,
        "full_name": s.full_name,
        "email": s.email,
        "phone": s.phone,
        "qualification": s.qualification,
        "password": s.password
    }

def serialize_instructor(inst):
    return {
        "instructor_id": inst.instructor_id,
        "instructor_name": inst.instructor_name,
        "specialization": inst.specialization,
        "experience": inst.experience,
        "email": inst.email,
        "phone": inst.phone
    }

def serialize_course(c):
    return {
        "course_id": c.course_id,
        "course_name": c.course_name,
        "instructor_name": c.instructor_name,
        "category": c.category,
        "duration": c.duration,
        "price": c.price,
        "level": c.level
    }

def serialize_enrollment(e):
    return {
        "enrollment_id": e.enrollment_id,
        "student_name": e.student_name,
        "course_name": e.course_name,
        "enrollment_date": e.enrollment_date.strftime('%Y-%m-%d') if e.enrollment_date else None,
        "payment_status": e.payment_status,
        "course_status": e.course_status
    }

def serialize_assignment(a):
    return {
        "assignment_id": a.assignment_id,
        "course_name": a.course_name,
        "student_name": a.student_name,
        "assignment_title": a.assignment_title,
        "submission_date": a.submission_date.strftime('%Y-%m-%d') if a.submission_date else None,
        "marks": a.marks,
        "status": a.status
    }

# ----------------- Student APIs -----------------
@csrf_exempt
def add_student(request):
    if request.method != 'POST':
        return JsonResponse({"error": "Only POST allowed"}, status=405)
    data = get_json_data(request)
    student_id = data.get('student_id')
    if not student_id:
        max_id = Student.objects.all().order_by('-student_id').first()
        student_id = (max_id.student_id + 1) if max_id else 101
    
    if Student.objects.filter(student_id=student_id).exists():
        return JsonResponse({"error": f"Student with ID {student_id} already exists"}, status=400)
    if Student.objects.filter(email=data.get('email')).exists():
        return JsonResponse({"error": f"Student with email {data.get('email')} already exists"}, status=400)
        
    try:
        s = Student.objects.create(
            student_id=student_id,
            full_name=data.get('full_name', ''),
            email=data.get('email', ''),
            phone=data.get('phone', ''),
            qualification=data.get('qualification', ''),
            password=data.get('password', '')
        )
        return JsonResponse(serialize_student(s), status=201)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)

@csrf_exempt
def get_students(request):
    if request.method != 'GET':
        return JsonResponse({"error": "Only GET allowed"}, status=405)
    
    email = request.GET.get('email')
    if email:
        students = Student.objects.filter(email=email)
    else:
        students = Student.objects.all()
        
    result = [serialize_student(s) for s in students]
    return JsonResponse(result, safe=False)

@csrf_exempt
def update_student(request, pk):
    if request.method != 'PUT':
        return JsonResponse({"error": "Only PUT allowed"}, status=405)
    try:
        s = Student.objects.get(student_id=pk)
    except Student.DoesNotExist:
        return JsonResponse({"error": "Student not found"}, status=404)
        
    data = get_json_data(request)
    s.full_name = data.get('full_name', s.full_name)
    s.email = data.get('email', s.email)
    s.phone = data.get('phone', s.phone)
    s.qualification = data.get('qualification', s.qualification)
    if 'password' in data:
        s.password = data.get('password')
        
    try:
        s.save()
        return JsonResponse(serialize_student(s))
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)

@csrf_exempt
def delete_student(request, pk):
    if request.method != 'DELETE':
        return JsonResponse({"error": "Only DELETE allowed"}, status=405)
    try:
        s = Student.objects.get(student_id=pk)
        s.delete()
        return JsonResponse({"message": "Student deleted successfully"})
    except Student.DoesNotExist:
        return JsonResponse({"error": "Student not found"}, status=404)

@csrf_exempt
def student_login(request):
    if request.method != 'POST':
        return JsonResponse({"error": "Only POST allowed"}, status=405)
    data = get_json_data(request)
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return JsonResponse({"error": "Email and password are required"}, status=400)
        
    try:
        student = Student.objects.get(email=email, password=password)
        return JsonResponse({
            "message": "Login successful",
            "student": serialize_student(student)
        })
    except Student.DoesNotExist:
        return JsonResponse({"error": "Invalid email or password"}, status=401)


# ----------------- Instructor APIs -----------------
@csrf_exempt
def add_instructor(request):
    if request.method != 'POST':
        return JsonResponse({"error": "Only POST allowed"}, status=405)
    data = get_json_data(request)
    instructor_id = data.get('instructor_id')
    if not instructor_id:
        max_id = Instructor.objects.all().order_by('-instructor_id').first()
        instructor_id = (max_id.instructor_id + 1) if max_id else 201
    
    if Instructor.objects.filter(instructor_id=instructor_id).exists():
        return JsonResponse({"error": f"Instructor with ID {instructor_id} already exists"}, status=400)
        
    try:
        inst = Instructor.objects.create(
            instructor_id=instructor_id,
            instructor_name=data.get('instructor_name', ''),
            specialization=data.get('specialization', ''),
            experience=int(data.get('experience', 0)),
            email=data.get('email', ''),
            phone=data.get('phone', '')
        )
        return JsonResponse(serialize_instructor(inst), status=201)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)

@csrf_exempt
def get_instructors(request):
    if request.method != 'GET':
        return JsonResponse({"error": "Only GET allowed"}, status=405)
    instructors = Instructor.objects.all()
    result = [serialize_instructor(inst) for inst in instructors]
    return JsonResponse(result, safe=False)

@csrf_exempt
def update_instructor(request, pk):
    if request.method != 'PUT':
        return JsonResponse({"error": "Only PUT allowed"}, status=405)
    try:
        inst = Instructor.objects.get(instructor_id=pk)
    except Instructor.DoesNotExist:
        return JsonResponse({"error": "Instructor not found"}, status=404)
        
    data = get_json_data(request)
    inst.instructor_name = data.get('instructor_name', inst.instructor_name)
    inst.specialization = data.get('specialization', inst.specialization)
    if 'experience' in data:
        inst.experience = int(data.get('experience'))
    inst.email = data.get('email', inst.email)
    inst.phone = data.get('phone', inst.phone)
    
    try:
        inst.save()
        return JsonResponse(serialize_instructor(inst))
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)

@csrf_exempt
def delete_instructor(request, pk):
    if request.method != 'DELETE':
        return JsonResponse({"error": "Only DELETE allowed"}, status=405)
    try:
        inst = Instructor.objects.get(instructor_id=pk)
        inst.delete()
        return JsonResponse({"message": "Instructor deleted successfully"})
    except Instructor.DoesNotExist:
        return JsonResponse({"error": "Instructor not found"}, status=404)


# ----------------- Course APIs -----------------
@csrf_exempt
def add_course(request):
    if request.method != 'POST':
        return JsonResponse({"error": "Only POST allowed"}, status=405)
    data = get_json_data(request)
    course_id = data.get('course_id')
    if not course_id:
        max_id = Course.objects.all().order_by('-course_id').first()
        course_id = (max_id.course_id + 1) if max_id else 301
        
    if Course.objects.filter(course_id=course_id).exists():
        return JsonResponse({"error": f"Course with ID {course_id} already exists"}, status=400)
        
    try:
        c = Course.objects.create(
            course_id=course_id,
            course_name=data.get('course_name', ''),
            instructor_name=data.get('instructor_name', ''),
            category=data.get('category', ''),
            duration=data.get('duration', ''),
            price=int(data.get('price', 0)),
            level=data.get('level', 'Beginner')
        )
        return JsonResponse(serialize_course(c), status=201)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)

@csrf_exempt
def get_courses(request):
    if request.method != 'GET':
        return JsonResponse({"error": "Only GET allowed"}, status=405)
    courses = Course.objects.all()
    result = [serialize_course(c) for c in courses]
    return JsonResponse(result, safe=False)

@csrf_exempt
def update_course(request, pk):
    if request.method != 'PUT':
        return JsonResponse({"error": "Only PUT allowed"}, status=405)
    try:
        c = Course.objects.get(course_id=pk)
    except Course.DoesNotExist:
        return JsonResponse({"error": "Course not found"}, status=404)
        
    data = get_json_data(request)
    c.course_name = data.get('course_name', c.course_name)
    c.instructor_name = data.get('instructor_name', c.instructor_name)
    c.category = data.get('category', c.category)
    c.duration = data.get('duration', c.duration)
    if 'price' in data:
        c.price = int(data.get('price'))
    c.level = data.get('level', c.level)
    
    try:
        c.save()
        return JsonResponse(serialize_course(c))
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)

@csrf_exempt
def delete_course(request, pk):
    if request.method != 'DELETE':
        return JsonResponse({"error": "Only DELETE allowed"}, status=405)
    try:
        c = Course.objects.get(course_id=pk)
        c.delete()
        return JsonResponse({"message": "Course deleted successfully"})
    except Course.DoesNotExist:
        return JsonResponse({"error": "Course not found"}, status=404)


# ----------------- Enrollment APIs -----------------
@csrf_exempt
def add_enrollment(request):
    if request.method != 'POST':
        return JsonResponse({"error": "Only POST allowed"}, status=405)
    data = get_json_data(request)
    enrollment_id = data.get('enrollment_id')
    if not enrollment_id:
        max_id = Enrollment.objects.all().order_by('-enrollment_id').first()
        enrollment_id = (max_id.enrollment_id + 1) if max_id else 401
        
    if Enrollment.objects.filter(enrollment_id=enrollment_id).exists():
        return JsonResponse({"error": f"Enrollment with ID {enrollment_id} already exists"}, status=400)
        
    try:
        e = Enrollment.objects.create(
            enrollment_id=enrollment_id,
            student_name=data.get('student_name', ''),
            course_name=data.get('course_name', ''),
            enrollment_date=parse_date(data.get('enrollment_date')),
            payment_status=data.get('payment_status', 'Pending'),
            course_status=data.get('course_status', 'Active')
        )
        return JsonResponse(serialize_enrollment(e), status=201)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)

@csrf_exempt
def get_enrollments(request):
    if request.method != 'GET':
        return JsonResponse({"error": "Only GET allowed"}, status=405)
    
    student_name = request.GET.get('student_name')
    if student_name:
        enrollments = Enrollment.objects.filter(student_name=student_name)
    else:
        enrollments = Enrollment.objects.all()
        
    result = [serialize_enrollment(e) for e in enrollments]
    return JsonResponse(result, safe=False)

@csrf_exempt
def update_enrollment(request, pk):
    if request.method != 'PUT':
        return JsonResponse({"error": "Only PUT allowed"}, status=405)
    try:
        e = Enrollment.objects.get(enrollment_id=pk)
    except Enrollment.DoesNotExist:
        return JsonResponse({"error": "Enrollment not found"}, status=404)
        
    data = get_json_data(request)
    e.student_name = data.get('student_name', e.student_name)
    e.course_name = data.get('course_name', e.course_name)
    if 'enrollment_date' in data:
        e.enrollment_date = parse_date(data.get('enrollment_date'))
    e.payment_status = data.get('payment_status', e.payment_status)
    e.course_status = data.get('course_status', e.course_status)
    
    try:
        e.save()
        return JsonResponse(serialize_enrollment(e))
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)

@csrf_exempt
def delete_enrollment(request, pk):
    if request.method != 'DELETE':
        return JsonResponse({"error": "Only DELETE allowed"}, status=405)
    try:
        e = Enrollment.objects.get(enrollment_id=pk)
        e.delete()
        return JsonResponse({"message": "Enrollment deleted successfully"})
    except Enrollment.DoesNotExist:
        return JsonResponse({"error": "Enrollment not found"}, status=404)


# ----------------- Assignment APIs -----------------
@csrf_exempt
def add_assignment(request):
    if request.method != 'POST':
        return JsonResponse({"error": "Only POST allowed"}, status=405)
    data = get_json_data(request)
    assignment_id = data.get('assignment_id')
    if not assignment_id:
        max_id = Assignment.objects.all().order_by('-assignment_id').first()
        assignment_id = (max_id.assignment_id + 1) if max_id else 501
        
    if Assignment.objects.filter(assignment_id=assignment_id).exists():
        return JsonResponse({"error": f"Assignment with ID {assignment_id} already exists"}, status=400)
        
    try:
        a = Assignment.objects.create(
            assignment_id=assignment_id,
            course_name=data.get('course_name', ''),
            student_name=data.get('student_name', ''),
            assignment_title=data.get('assignment_title', ''),
            submission_date=parse_date(data.get('submission_date')),
            marks=int(data.get('marks', 0)),
            status=data.get('status', 'Pending')
        )
        return JsonResponse(serialize_assignment(a), status=201)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)

@csrf_exempt
def get_assignments(request):
    if request.method != 'GET':
        return JsonResponse({"error": "Only GET allowed"}, status=405)
        
    student_name = request.GET.get('student_name')
    if student_name:
        assignments = Assignment.objects.filter(student_name=student_name)
    else:
        assignments = Assignment.objects.all()
        
    result = [serialize_assignment(a) for a in assignments]
    return JsonResponse(result, safe=False)

@csrf_exempt
def update_assignment(request, pk):
    if request.method != 'PUT':
        return JsonResponse({"error": "Only PUT allowed"}, status=405)
    try:
        a = Assignment.objects.get(assignment_id=pk)
    except Assignment.DoesNotExist:
        return JsonResponse({"error": "Assignment not found"}, status=404)
        
    data = get_json_data(request)
    a.course_name = data.get('course_name', a.course_name)
    a.student_name = data.get('student_name', a.student_name)
    a.assignment_title = data.get('assignment_title', a.assignment_title)
    if 'submission_date' in data:
        a.submission_date = parse_date(data.get('submission_date'))
    if 'marks' in data:
        a.marks = int(data.get('marks'))
    a.status = data.get('status', a.status)
    
    try:
        a.save()
        return JsonResponse(serialize_assignment(a))
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)

@csrf_exempt
def delete_assignment(request, pk):
    if request.method != 'DELETE':
        return JsonResponse({"error": "Only DELETE allowed"}, status=405)
    try:
        a = Assignment.objects.get(assignment_id=pk)
        a.delete()
        return JsonResponse({"message": "Assignment deleted successfully"})
    except Assignment.DoesNotExist:
        return JsonResponse({"error": "Assignment not found"}, status=404)
