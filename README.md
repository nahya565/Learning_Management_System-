# Learning Management System (LMS) - EduFlow Academy

EduFlow is a Full Stack Learning Management System built using a **Django REST API** backend (powered by SQLite) and a modern **HTML5, CSS3, and JavaScript** frontend using the **Fetch API**.

---

## Technology Stack

- **Frontend**: HTML5, CSS3 (Vanilla Dark-themed Glassmorphism UI), JavaScript (ES6), Fetch API, jsPDF (for client-side certificate rendering).
- **Backend**: Django 6.0, Function-Based Views (with CORS and JSON payload parsers).
- **Database**: SQLite3.

---

## Folder Structure

```
LearningManagementSystem/
│
├── Backend/
│   ├── db.py            # Django SQLite models (Student, Instructor, Course, Enrollment, Assignment)
│   ├── views.py         # 20 required function-based REST API views + login view
│   ├── urls.py          # Django routes mapped to Views
│   ├── settings.py      # App configurations, SQLite setup, local CORS middleware
│   ├── manage.py        # Django entry point utility
│   ├── seed.py          # Seeding script with sample evaluation data
│   ├── verify_apis.py   # Automated API test suite covering all 20 CRUD endpoints
│   └── db.sqlite3       # Database file (generated after migrations)
│
├── Frontend/
│   ├── index.html       # Landing page (Features catalog cards & about block)
│   ├── login.html       # Student / Admin Login Form
│   ├── register.html    # Student Registration Form
│   ├── courses.html     # Course Explorer (Features query search & level filters)
│   ├── enrollments.html # My Courses (Features course progress track & certificate downloads)
│   ├── assignments.html # Student Assignments (Features due dates & submission modals)
│   ├── dashboard.html   # Student Analytics (Features overall progress ring metrics)
│   ├── admin.html       # Administration Console (Features complete tabular CRUD modals)
│   ├── style.css        # Premium dark glassmorphism styling
│   └── script.js        # Core Fetch API integration, session manager, and PDF generator
│
└── README.md            # Setup and execution documentation
```

---

## Setup & Running Locally

Follow these quick steps to get the server and frontend running locally:

### 1. Start the Backend API
Navigate to the `Backend` directory, prepare migrations, and run the server:
```bash
# Go to Backend folder
cd Backend

# Run Django migrations to build SQLite tables
python manage.py makemigrations db
python manage.py migrate

# Seed database with sample testing data
python seed.py

# Start the Django server
python manage.py runserver 8000
```
*The backend API will start running at `http://127.0.0.1:8000`.*

### 2. Verify Backend CRUD APIs (Optional)
While the Django server is running, you can verify all 20 CRUD endpoints using the automated test suite:
```bash
# Run API test suite
python verify_apis.py
```

### 3. Open the Frontend Application
Navigate to the `Frontend` directory and launch the home page:
- Double click `Frontend/index.html` to open it directly in your web browser.
- Alternatively, serve it via any local server (e.g. Live Server in VS Code, or python server: `python -m http.server 3000` inside `Frontend/`).

---

## Sample Testing Credentials

Use the following pre-seeded credentials to explore the system:

### Student Login
- **Email**: `rahul@gmail.com`
- **Password**: `rahul123`
- *Includes pre-seeded course enrollment in "Python Full Stack" and one "Milestone 1 - Overview Project" assignment.*

### System Admin Login
- **Email**: `admin@lms.com`
- **Password**: `admin123`
- *Allows managing students, instructors, courses, enrollments, and grading student assignments.*

---

## Core Features & Marks Evaluation Checklist

### 1. CRUD Modules (135 Marks)
- **Student CRUD**: GET, POST, PUT, DELETE endpoints. Add/update profiles via registration and dashboards.
- **Instructor CRUD**: GET, POST, PUT, DELETE endpoints. View and edit instructor details in the Admin panel.
- **Course CRUD**: GET, POST, PUT, DELETE endpoints. Create, update, or remove courses from the catalogue.
- **Enrollment CRUD**: GET, POST, PUT, DELETE endpoints. Enrolls student names to specific course names.
- **Assignment CRUD**: GET, POST, PUT, DELETE endpoints. Grade assignment marks and update statuses.

### 2. Premium Frontend & Fetch Integration (100 Marks)
- Fully responsive dark-glassmorphism CSS stylesheet design layout.
- Active authentication sessions and session persistence using `localStorage`.
- Comprehensive admin control panel to perform instant CRUD updates via Fetch APIs.

### 3. Bonus Features (20 Marks)
- **Course Search & Filter**: Real-time filtering by course titles, instructors, level levels, and categories.
- **Course Completion Percentage**: Dynamic completion calculator (40% active, 100% completed) displayed per enrollment card.
- **Student Progress Bar**: Dynamic visual indicators inside My Enrollments and Student Dashboards.
- **Overall Completion Ring**: Dynamic SVG circle ring displaying completed courses fraction on the Student Dashboard.
- **Certificate Generation**: Automatic creation and download of landscape PDF certificates for "Completed" courses, generated locally using `jsPDF`.
