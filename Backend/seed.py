import os
import django
from datetime import datetime

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
django.setup()

from db import Student, Instructor, Course, Enrollment, Assignment

def seed_data():
    # Seed Student
    student, created = Student.objects.update_or_create(
        student_id=101,
        defaults={
            "full_name": "Rahul Sharma",
            "email": "rahul@gmail.com",
            "phone": "9876543210",
            "qualification": "B.Tech",
            "password": "rahul123"
        }
    )
    print(f"Student 'Rahul Sharma' (101): {'Created' if created else 'Updated'}")

    # Seed Instructor
    instructor, created = Instructor.objects.update_or_create(
        instructor_id=201,
        defaults={
            "instructor_name": "Saran Velmurugan",
            "specialization": "Full Stack Development",
            "experience": 5,
            "email": "trainer@gmail.com",
            "phone": "9876543211"
        }
    )
    print(f"Instructor 'Saran Velmurugan' (201): {'Created' if created else 'Updated'}")

    # Seed Course
    course, created = Course.objects.update_or_create(
        course_id=301,
        defaults={
            "course_name": "Python Full Stack",
            "instructor_name": "Saran Velmurugan",
            "category": "Programming",
            "duration": "6 Months",
            "price": 25000,
            "level": "Beginner"
        }
    )
    print(f"Course 'Python Full Stack' (301): {'Created' if created else 'Updated'}")

    # Seed Enrollment
    enrollment, created = Enrollment.objects.update_or_create(
        enrollment_id=401,
        defaults={
            "student_name": "Rahul Sharma",
            "course_name": "Python Full Stack",
            "enrollment_date": datetime.strptime("2026-07-15", "%Y-%m-%d").date(),
            "payment_status": "Paid",
            "course_status": "Active"
        }
    )
    print(f"Enrollment (401): {'Created' if created else 'Updated'}")

    # Seed Assignment
    assignment, created = Assignment.objects.update_or_create(
        assignment_id=501,
        defaults={
            "course_name": "Python Full Stack",
            "student_name": "Rahul Sharma",
            "assignment_title": "Student Management System",
            "submission_date": datetime.strptime("2026-07-25", "%Y-%m-%d").date(),
            "marks": 95,
            "status": "Evaluated"
        }
    )
    print(f"Assignment (501): {'Created' if created else 'Updated'}")

if __name__ == "__main__":
    seed_data()
    print("Database seeding process complete.")
