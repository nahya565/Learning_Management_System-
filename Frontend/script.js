// API Base URL (Configured to match Django local server)
const API_BASE = 'http://127.0.0.1:8000';

// Session State Management
let currentUser = null;
let isAdmin = false;

// Global arrays for admin lookup
let loadedStudents = [];
let loadedInstructors = [];
let loadedCourses = [];
let loadedEnrollments = [];
let loadedAssignments = [];

// Initialize Session on Load
document.addEventListener('DOMContentLoaded', () => {
    // Read Session
    currentUser = JSON.parse(localStorage.getItem('currentUser'));
    isAdmin = localStorage.getItem('isAdmin') === 'true';

    updateNavbarState();
    initializeToastContainer();

    // Page-specific initializations
    const path = window.location.pathname;
    const page = path.substring(path.lastIndexOf('/') + 1) || 'index.html';

    if (page === 'index.html') {
        loadFeaturedCourses();
    } else if (page === 'login.html') {
        initLoginPage();
    } else if (page === 'register.html') {
        initRegisterPage();
    } else if (page === 'courses.html') {
        loadAllCourses();
    } else if (page === 'enrollments.html') {
        protectPage();
        loadMyEnrollments();
    } else if (page === 'assignments.html') {
        protectPage();
        loadMyAssignments();
    } else if (page === 'dashboard.html') {
        protectPage();
        loadStudentDashboard();
    } else if (page === 'admin.html') {
        protectAdminPage();
        loadAdminPanel();
    }
});

// Toast Notifications helper
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let iconClass = 'fa-circle-check';
    if (type === 'error') iconClass = 'fa-circle-xmark';
    if (type === 'warning') iconClass = 'fa-triangle-exclamation';
    
    toast.innerHTML = `
        <i class="fa-solid ${iconClass}"></i>
        <div>${message}</div>
    `;
    
    container.appendChild(toast);
    
    // Auto-remove
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s reverse forwards';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function initializeToastContainer() {
    if (!document.getElementById('toast-container')) {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
}

// Check session and redirect if guest tries to view protected pages
function protectPage() {
    if (!currentUser) {
        showToast('You must log in to view this page!', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    }
}

function protectAdminPage() {
    if (!isAdmin) {
        const modal = document.getElementById('admin-auth-modal');
        if (modal) {
            modal.classList.add('active');
            
            document.getElementById('admin-auth-form').addEventListener('submit', (e) => {
                e.preventDefault();
                const pass = document.getElementById('admin-auth-pass').value;
                if (pass === 'admin123') {
                    localStorage.setItem('isAdmin', 'true');
                    isAdmin = true;
                    modal.classList.remove('active');
                    showToast('Admin panel unlocked successfully!');
                    loadAdminPanel();
                } else {
                    showToast('Incorrect Admin password!', 'error');
                }
            });
        } else {
            window.location.href = 'login.html';
        }
    }
}

// Update Header Links dynamically depending on logged user
function updateNavbarState() {
    const authSection = document.getElementById('nav-auth-section');
    const authLinks = document.querySelectorAll('.auth-only');

    if (currentUser) {
        // Show restricted tabs
        authLinks.forEach(link => link.style.display = 'block');
        
        if (authSection) {
            authSection.innerHTML = `
                <span style="font-size: 0.9rem; font-weight: 500; display: flex; align-items: center; gap: 0.5rem; background: rgba(255,255,255,0.05); padding: 0.4rem 0.8rem; border-radius: 20px; border: 1px solid var(--border-color);">
                    <i class="fa-regular fa-user" style="color: var(--secondary);"></i> ${currentUser.full_name}
                </span>
                <button class="btn btn-secondary btn-sm" onclick="logoutUser()">Logout <i class="fa-solid fa-right-from-bracket"></i></button>
            `;
        }
    } else if (isAdmin) {
        if (authSection) {
            authSection.innerHTML = `
                <span style="font-size: 0.9rem; font-weight: 500; display: flex; align-items: center; gap: 0.5rem; background: rgba(255,255,255,0.05); padding: 0.4rem 0.8rem; border-radius: 20px; border: 1px solid var(--border-color);">
                    <i class="fa-solid fa-shield-halved" style="color: var(--warning);"></i> System Admin
                </span>
                <button class="btn btn-secondary btn-sm" onclick="logoutUser()">Logout <i class="fa-solid fa-right-from-bracket"></i></button>
            `;
        }
    } else {
        authLinks.forEach(link => link.style.display = 'none');
    }
}

function logoutUser() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAdmin');
    currentUser = null;
    isAdmin = false;
    showToast('Logged out successfully.');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Helper: Open/Close Modals
function openModal(id) {
    document.getElementById(id).classList.add('active');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

// ------------------- Landing Page (index.html) -------------------
async function loadFeaturedCourses() {
    const container = document.getElementById('featured-courses-container');
    if (!container) return;

    try {
        const response = await fetch(`${API_BASE}/courses/`);
        const courses = await response.json();
        
        if (courses.length === 0) {
            container.innerHTML = `
                <div class="card" style="grid-column: 1/-1; text-align: center; padding: 2rem;">
                    <p style="color: var(--text-muted);">No courses available currently.</p>
                </div>
            `;
            return;
        }

        // Display up to 3 featured courses
        const featured = courses.slice(0, 3);
        container.innerHTML = featured.map(c => `
            <div class="card">
                <div>
                    <span class="card-tag tag-${c.level.toLowerCase()}">${c.level}</span>
                    <h3 class="card-title">${c.course_name}</h3>
                    <p style="color: var(--text-muted); font-size: 0.9rem;">Instructor: <strong>${c.instructor_name}</strong></p>
                </div>
                <div>
                    <div class="card-meta">
                        <span><i class="fa-regular fa-clock"></i> ${c.duration}</span>
                        <span><i class="fa-solid fa-tag"></i> ${c.category}</span>
                    </div>
                    <div class="card-footer">
                        <span class="card-price">₹${Number(c.price).toLocaleString()}</span>
                        <a href="courses.html" class="btn btn-primary btn-sm">View Details</a>
                    </div>
                </div>
            </div>
        `).join('');

    } catch (err) {
        console.error(err);
        container.innerHTML = `
            <div class="card" style="grid-column: 1/-1; text-align: center; padding: 2rem; border-color: var(--danger);">
                <p style="color: var(--danger);">Failed to load course catalog from backend API. Make sure Django server is running!</p>
            </div>
        `;
    }
}

// ------------------- Authentication (login.html & register.html) -------------------
function initLoginPage() {
    const form = document.getElementById('login-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const isAdminLogin = document.getElementById('admin-login-checkbox').checked;

        if (isAdminLogin) {
            // Simulated Admin Authentication
            if (email === 'admin@lms.com' && password === 'admin123') {
                localStorage.setItem('isAdmin', 'true');
                showToast('Welcome, Administrator!');
                setTimeout(() => {
                    window.location.href = 'admin.html';
                }, 1500);
            } else {
                showToast('Invalid Admin email or password!', 'error');
            }
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/students/login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();
            
            if (response.ok) {
                localStorage.setItem('currentUser', JSON.stringify(result.student));
                showToast(result.message);
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                showToast(result.error || 'Authentication failed!', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Unable to connect to the backend server.', 'error');
        }
    });
}

function initRegisterPage() {
    const form = document.getElementById('register-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const student_id = document.getElementById('student_id').value;
        const full_name = document.getElementById('full_name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const qualification = document.getElementById('qualification').value;
        const password = document.getElementById('password').value;

        const payload = { full_name, email, phone, qualification, password };
        if (student_id) payload.student_id = parseInt(student_id);

        try {
            const response = await fetch(`${API_BASE}/students/add/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok) {
                showToast('Registration successful! Please login.');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
            } else {
                showToast(result.error || 'Registration failed!', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Error connecting to backend server.', 'error');
        }
    });
}

// ------------------- Courses Page (courses.html) -------------------


async function loadAllCourses() {
    const grid = document.getElementById('courses-grid');
    if (!grid) return;

    try {
        const response = await fetch(`${API_BASE}/courses/`);
        loadedCourses = await response.json();
        
        renderCoursesList(loadedCourses);
        populateCategoryFilter(loadedCourses);
        setupCoursesFilterListeners();

    } catch (err) {
        console.error(err);
        grid.innerHTML = `
            <div class="card" style="grid-column: 1/-1; text-align: center; padding: 2rem; border-color: var(--danger);">
                <p style="color: var(--danger);">Failed to connect to Django API.</p>
            </div>
        `;
    }
}

function renderCoursesList(courses) {
    const grid = document.getElementById('courses-grid');
    if (courses.length === 0) {
        grid.innerHTML = `
            <div class="card" style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <i class="fa-solid fa-graduation-cap" style="font-size: 2.5rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                <p style="color: var(--text-muted);">No courses match your filter criteria.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = courses.map(c => `
        <div class="card">
            <div>
                <span class="card-tag tag-${c.level.toLowerCase()}">${c.level}</span>
                <h3 class="card-title">${c.course_name}</h3>
                <p style="color: var(--text-muted); font-size: 0.9rem;">Instructor: <strong>${c.instructor_name}</strong></p>
            </div>
            <div>
                <div class="card-meta">
                    <span><i class="fa-regular fa-clock"></i> ${c.duration}</span>
                    <span><i class="fa-solid fa-tag"></i> ${c.category}</span>
                </div>
                <div class="card-footer">
                    <span class="card-price">₹${Number(c.price).toLocaleString()}</span>
                    <button class="btn btn-primary btn-sm" onclick="triggerEnrollment('${c.course_name}', '${c.price}')">Enroll Now</button>
                </div>
            </div>
        </div>
    `).join('');
}

function populateCategoryFilter(courses) {
    const filter = document.getElementById('filter-category');
    if (!filter) return;

    // Get unique categories
    const categories = [...new Set(courses.map(c => c.category))];
    filter.innerHTML = '<option value="">All Categories</option>' +
        categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
}

function setupCoursesFilterListeners() {
    const search = document.getElementById('course-search');
    const level = document.getElementById('filter-level');
    const category = document.getElementById('filter-category');

    const applyFilters = () => {
        const query = search.value.toLowerCase();
        const lvl = level.value;
        const cat = category.value;

        const filtered = loadedCourses.filter(c => {
            const matchesQuery = c.course_name.toLowerCase().includes(query) || 
                                 c.instructor_name.toLowerCase().includes(query);
            const matchesLevel = !lvl || c.level === lvl;
            const matchesCategory = !cat || c.category === cat;

            return matchesQuery && matchesLevel && matchesCategory;
        });

        renderCoursesList(filtered);
    };

    search.addEventListener('input', applyFilters);
    level.addEventListener('change', applyFilters);
    category.addEventListener('change', applyFilters);
}

let pendingEnrollmentCourse = null;

function triggerEnrollment(courseName, price) {
    if (!currentUser) {
        showToast('Please login to enroll in courses.', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }

    pendingEnrollmentCourse = courseName;
    const msg = document.getElementById('enrollment-confirm-msg');
    msg.innerHTML = `You are enrolling in <strong>${courseName}</strong>.<br>The course cost is <strong>₹${Number(price).toLocaleString()}</strong>. Would you like to confirm payment and activate your access?`;
    
    openModal('enrollment-modal');
}

// Confirmation event trigger
const confirmEnrollBtn = document.getElementById('confirm-enroll-btn');
if (confirmEnrollBtn) {
    confirmEnrollBtn.addEventListener('click', async () => {
        if (!pendingEnrollmentCourse || !currentUser) return;
        
        closeModal('enrollment-modal');
        
        const payload = {
            student_name: currentUser.full_name,
            course_name: pendingEnrollmentCourse,
            enrollment_date: new Date().toISOString().split('T')[0],
            payment_status: 'Paid',
            course_status: 'Active'
        };

        try {
            const response = await fetch(`${API_BASE}/enrollments/add/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok) {
                // Autocreate a sample assignment for this enrollment to make the assignments page more interactive
                await createDefaultAssignment(currentUser.full_name, pendingEnrollmentCourse);
                
                showToast(`Enrolled in ${pendingEnrollmentCourse} successfully!`);
                setTimeout(() => {
                    window.location.href = 'enrollments.html';
                }, 1500);
            } else {
                showToast(result.error || 'Enrollment failed!', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Connection error during enrollment.', 'error');
        }
    });
}

// Autocreate a template assignment so the user has something to submit
async function createDefaultAssignment(studentName, courseName) {
    const payload = {
        course_name: courseName,
        student_name: studentName,
        assignment_title: `Milestone 1 - Overview Project`,
        submission_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
        marks: 0,
        status: 'Pending'
    };
    try {
        await fetch(`${API_BASE}/assignments/add/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } catch (e) {
        console.error("Failed to seed default assignment", e);
    }
}

// ------------------- Enrollments Page (enrollments.html) -------------------
async function loadMyEnrollments() {
    const container = document.getElementById('enrollments-list-container');
    if (!container) return;

    try {
        const response = await fetch(`${API_BASE}/enrollments/?student_name=${encodeURIComponent(currentUser.full_name)}`);
        const enrollments = await response.json();

        if (enrollments.length === 0) {
            container.innerHTML = `
                <div class="card" style="text-align: center; padding: 4rem;">
                    <i class="fa-solid fa-book-open" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                    <p style="color: var(--text-muted); font-size: 1.1rem; margin-bottom: 1rem;">You are not enrolled in any courses yet.</p>
                    <a href="courses.html" class="btn btn-primary">Find a Course</a>
                </div>
            `;
            return;
        }

        container.innerHTML = enrollments.map(e => {
            // Compute visual progress percentage (Bonus feature)
            let progress = 0;
            if (e.course_status === 'Completed') progress = 100;
            else if (e.course_status === 'Active') progress = 40; // Simulated progress
            else if (e.course_status === 'Cancelled') progress = 0;

            const isCompleted = e.course_status === 'Completed';

            return `
                <div class="card" style="margin-bottom: 1.5rem; display: flex; flex-direction: row; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1.5rem;">
                    <div style="flex: 1; min-width: 250px;">
                        <h3 class="card-title" style="margin-bottom: 0.5rem;">${e.course_name}</h3>
                        <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 0.5rem;">
                            Enrolled: <strong>${e.enrollment_date}</strong>
                        </p>
                        <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 0.75rem;">
                            <span class="status-badge badge-${e.payment_status.toLowerCase()}">Payment: ${e.payment_status}</span>
                            <span class="status-badge badge-${e.course_status.toLowerCase()}">Status: ${e.course_status}</span>
                        </div>
                    </div>
                    
                    <div style="flex: 1; min-width: 250px;">
                        <div class="progress-header">
                            <span>Course Progress</span>
                            <span>${progress}%</span>
                        </div>
                        <div class="progress-track" style="margin-bottom: 0.5rem;">
                            <div class="progress-fill" style="width: ${progress}%;"></div>
                        </div>
                        <span style="font-size: 0.8rem; color: var(--text-muted);">
                            ${e.course_status === 'Active' ? 'Keep learning to unlock certificate!' : 
                              e.course_status === 'Completed' ? 'Congratulations! Certificate unlocked.' : 'This course has been cancelled.'}
                        </span>
                    </div>

                    <div>
                        ${isCompleted ? 
                          `<button class="btn btn-primary" onclick="downloadCertificate('${e.course_name}')"><i class="fa-solid fa-award"></i> Certificate</button>` : 
                          `<button class="btn btn-secondary" disabled><i class="fa-solid fa-lock"></i> Certificate</button>`}
                    </div>
                </div>
            `;
        }).join('');

    } catch (err) {
        console.error(err);
        container.innerHTML = `
            <div class="card" style="text-align: center; padding: 2rem; border-color: var(--danger);">
                <p style="color: var(--danger);">Failed to load enrollments from API.</p>
            </div>
        `;
    }
}

// Certificate Generation (PDF) using jsPDF (Bonus Feature)
function downloadCertificate(courseName) {
    if (!currentUser) return;
    
    showToast('Generating certificate PDF...');
    
    // Default Instructor (e.g. Saran Velmurugan as in sample)
    const instructorName = "Saran Velmurugan";
    const dateStr = new Date().toISOString().split('T')[0];

    const { jsPDF } = window.jspdf;
    
    // Landscape A4 certificate
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'pt',
        format: 'a4'
    });

    // 1. Draw solid peach-pink background outer frame
    doc.setFillColor(255, 240, 236); // #FFF0EC
    doc.rect(0, 0, 842, 595, "F");

    // 2. Draw border lines
    doc.setDrawColor(112, 26, 117); // #701a75 (Deep purple)
    doc.setLineWidth(15);
    doc.rect(30, 30, 782, 535, "D");

    doc.setDrawColor(217, 70, 239); // #d946ef (Fuchsia)
    doc.setLineWidth(2);
    doc.rect(42, 42, 758, 511, "D");

    // 3. Header Text
    doc.setTextColor(112, 26, 117); // #701a75
    doc.setFont("helvetica", "bold");
    doc.setFontSize(36);
    doc.text("EduFlow Academy", 421, 120, { align: "center" });

    doc.setTextColor(217, 70, 239); // #d946ef
    doc.setFont("helvetica", "italic");
    doc.setFontSize(16);
    doc.text("Certificate of Course Completion", 421, 155, { align: "center" });

    // 4. Ribbon / Decoration Icon (simulated via text)
    doc.setTextColor(217, 70, 239); // #d946ef
    doc.setFont("courier", "bold");
    doc.setFontSize(28);
    doc.text("★ ★ ★ ★ ★", 421, 205, { align: "center" });

    // 5. Body Text
    doc.setTextColor(112, 26, 117); // #701a75
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text("THIS CERTIFICATE IS PROUDLY PRESENTED TO", 421, 245, { align: "center" });

    // Student Name
    doc.setTextColor(74, 4, 78); // #4a044e (Very deep purple for readability on light bg)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(30);
    doc.text(currentUser.full_name.toUpperCase(), 421, 290, { align: "center" });

    // Core verification text
    doc.setTextColor(112, 26, 117); // #701a75
    doc.setFont("helvetica", "normal");
    doc.setFontSize(13);
    doc.text("for successfully finishing all learning modules, tests, and assignments associated with", 421, 335, { align: "center" });
    doc.text("the advanced industry-standard certification curriculum of", 421, 355, { align: "center" });

    // Course Name
    doc.setTextColor(217, 70, 239); // #d946ef
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text(courseName, 421, 405, { align: "center" });

    // 6. Signatures & Metadata Footer
    doc.setDrawColor(112, 26, 117); // #701a75 line
    doc.setLineWidth(1);
    doc.line(150, 470, 692, 470);

    // Issue Date
    doc.setTextColor(112, 26, 117); // #701a75
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("DATE OF ISSUE", 200, 495);
    doc.setTextColor(74, 4, 78); // #4a044e
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(dateStr, 200, 515);

    // Instructor
    doc.setTextColor(112, 26, 117); // #701a75
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("INSTRUCTOR SIGNATURE", 642, 495, { align: "right" });
    doc.setTextColor(217, 70, 239); // #d946ef
    doc.setFont("courier", "bolditalic");
    doc.setFontSize(14);
    doc.text(instructorName, 642, 515, { align: "right" });

    // 7. Save file
    const fileBase = currentUser.full_name.replace(/\s+/g, '_');
    const courseBase = courseName.replace(/\s+/g, '_');
    doc.save(`${fileBase}_${courseBase}_Certificate.pdf`);
    
    showToast('Certificate PDF downloaded!');
}

// ------------------- Assignments Page (assignments.html) -------------------
let pendingSubmissionAssignmentId = null;

async function loadMyAssignments() {
    const tbody = document.getElementById('assignments-table-body');
    if (!tbody) return;

    try {
        const response = await fetch(`${API_BASE}/assignments/?student_name=${encodeURIComponent(currentUser.full_name)}`);
        const assignments = await response.json();

        if (assignments.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 3rem; color: var(--text-muted);">
                        <i class="fa-solid fa-folder-open" style="font-size: 2rem; display: block; margin-bottom: 0.5rem;"></i>
                        No assignments have been assigned to you yet.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = assignments.map(a => {
            const isPending = a.status === 'Pending';
            
            let actionBtn = '';
            if (isPending) {
                actionBtn = `<button class="btn btn-primary btn-sm" onclick="triggerSubmitAssignment('${a.assignment_id}', '${a.assignment_title}')">Submit</button>`;
            } else {
                actionBtn = `<button class="btn btn-secondary btn-sm" disabled><i class="fa-solid fa-check"></i> Submited</button>`;
            }

            return `
                <tr>
                    <td style="font-weight:600;">${a.course_name}</td>
                    <td>${a.assignment_title}</td>
                    <td>${a.submission_date}</td>
                    <td><span class="status-badge badge-${a.status.toLowerCase()}">${a.status}</span></td>
                    <td><strong style="color: #a78bfa;">${a.status === 'Evaluated' ? a.marks + '/100' : 'N/A'}</strong></td>
                    <td>${actionBtn}</td>
                </tr>
            `;
        }).join('');

    } catch (err) {
        console.error(err);
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; color: var(--danger); padding: 2rem;">
                    Failed to fetch assignments from API.
                </td>
            </tr>
        `;
    }
}

function triggerSubmitAssignment(id, title) {
    pendingSubmissionAssignmentId = id;
    document.getElementById('submit-assignment-title').innerText = title;
    openModal('submit-assignment-modal');
}

// Assignment submission form handler
const submitAssignmentForm = document.getElementById('submit-assignment-form');
if (submitAssignmentForm) {
    submitAssignmentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!pendingSubmissionAssignmentId) return;

        closeModal('submit-assignment-modal');
        
        // Fetch current assignment details to preserve fields during PUT update
        try {
            const getRes = await fetch(`${API_BASE}/assignments/`);
            const assignments = await getRes.json();
            const assignment = assignments.find(a => a.assignment_id == pendingSubmissionAssignmentId);
            
            if (!assignment) {
                showToast('Assignment metadata not found.', 'error');
                return;
            }

            // Update status & date
            const payload = {
                course_name: assignment.course_name,
                student_name: assignment.student_name,
                assignment_title: assignment.assignment_title,
                submission_date: new Date().toISOString().split('T')[0], // Set to submitted date
                marks: assignment.marks,
                status: 'Submitted'
            };

            const response = await fetch(`${API_BASE}/assignments/update/${pendingSubmissionAssignmentId}/`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                showToast('Assignment submitted successfully!');
                loadMyAssignments();
            } else {
                showToast('Failed to submit assignment.', 'error');
            }

        } catch (err) {
            console.error(err);
            showToast('Error uploading assignment submission.', 'error');
        }
    });
}

// ------------------- Student Dashboard (dashboard.html) -------------------
async function loadStudentDashboard() {
    document.getElementById('welcome-message').innerText = `Welcome back, ${currentUser.full_name}!`;
    document.getElementById('student-meta-badge').innerHTML = `
        <span style="margin-right: 1rem;"><i class="fa-solid fa-graduation-cap"></i> Qualification: <strong>${currentUser.qualification}</strong></span>
        <span><i class="fa-solid fa-id-badge"></i> Student ID: <strong>${currentUser.student_id}</strong></span>
    `;

    try {
        // Fetch student enrollments and assignments
        const [enrollRes, assignRes] = await Promise.all([
            fetch(`${API_BASE}/enrollments/?student_name=${encodeURIComponent(currentUser.full_name)}`),
            fetch(`${API_BASE}/assignments/?student_name=${encodeURIComponent(currentUser.full_name)}`)
        ]);

        const enrollments = await enrollRes.json();
        const assignments = await assignRes.json();

        // 1. Calculate and update stats counters
        const totalCourses = enrollments.length;
        const activeCourses = enrollments.filter(e => e.course_status === 'Active').length;
        const completedCourses = enrollments.filter(e => e.course_status === 'Completed').length;
        const pendingAssignments = assignments.filter(a => a.status === 'Pending').length;

        document.getElementById('stat-total-courses').innerText = totalCourses;
        document.getElementById('stat-active-courses').innerText = activeCourses;
        document.getElementById('stat-completed-courses').innerText = completedCourses;
        document.getElementById('stat-pending-assignments').innerText = pendingAssignments;

        // 2. Compute course completion percentage (Bonus Feature)
        const progressPercentage = totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0;
        
        // Update circular ring progress bar (Bonus Feature)
        const progressCircle = document.getElementById('progress-circle-bar');
        const progressText = document.getElementById('progress-text-percent');
        const overallBar = document.getElementById('overall-progress-bar');
        const fractionText = document.getElementById('progress-header-fraction');

        if (progressCircle && progressText) {
            // Stroke-dasharray is 314 (2 * pi * r = 2 * 3.14 * 50)
            const offset = 314 - (314 * progressPercentage) / 100;
            progressCircle.style.strokeDashoffset = offset;
            progressText.innerText = `${progressPercentage}%`;
        }

        if (overallBar) overallBar.style.width = `${progressPercentage}%`;
        if (fractionText) fractionText.innerText = `${completedCourses}/${totalCourses} Courses Completed`;

        // 3. Render course progress items
        const progressList = document.getElementById('dashboard-course-progress-list');
        if (progressList) {
            if (enrollments.length === 0) {
                progressList.innerHTML = `
                    <div class="card" style="text-align: center; padding: 2rem;">
                        <p style="color: var(--text-muted);">You are not enrolled in any courses.</p>
                    </div>
                `;
            } else {
                progressList.innerHTML = enrollments.map(e => {
                    let pct = 0;
                    if (e.course_status === 'Completed') pct = 100;
                    else if (e.course_status === 'Active') pct = 40;

                    return `
                        <div class="card" style="padding: 1.25rem;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                <strong style="font-size: 1rem;">${e.course_name}</strong>
                                <span class="status-badge badge-${e.course_status.toLowerCase()}">${e.course_status}</span>
                            </div>
                            <div class="progress-track" style="height: 6px;">
                                <div class="progress-fill" style="width: ${pct}%;"></div>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }

        // 4. Render Action items (pending assignments tasks)
        const actionItems = document.getElementById('dashboard-action-items');
        if (actionItems) {
            const pendingList = assignments.filter(a => a.status === 'Pending');
            if (pendingList.length === 0) {
                actionItems.innerHTML = `
                    <div class="card" style="text-align: center; padding: 2rem; border-color: rgba(255, 255, 255, 0.05);">
                        <i class="fa-regular fa-square-check" style="font-size: 2rem; color: var(--success); margin-bottom: 0.5rem;"></i>
                        <p style="color: var(--text-muted); font-size: 0.9rem;">No pending assignments to complete.</p>
                    </div>
                `;
            } else {
                actionItems.innerHTML = pendingList.map(a => `
                    <div class="card" style="padding: 1rem; border-color: rgba(245, 158, 11, 0.3);">
                        <div style="display: flex; flex-direction: column; gap: 0.25rem;">
                            <span style="font-size: 0.75rem; color: var(--warning); text-transform: uppercase; font-weight: 700;">Pending Submission</span>
                            <strong style="font-size: 0.95rem;">${a.assignment_title}</strong>
                            <span style="font-size: 0.8rem; color: var(--text-muted);">${a.course_name}</span>
                            <span style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.5rem;"><i class="fa-regular fa-calendar-xmark"></i> Due: ${a.submission_date}</span>
                        </div>
                        <a href="assignments.html" class="btn btn-primary btn-sm" style="margin-top: 1rem; width: 100%;">Submit Assignment</a>
                    </div>
                `).join('');
            }
        }

    } catch (err) {
        console.error(err);
        showToast('Error syncing dashboard metrics.', 'error');
    }
}


// ------------------- Admin Dashboard Panel (admin.html) -------------------
let currentAdminTab = 'students';
let activeEditId = null;

function switchAdminTab(tabId, el) {
    // Toggle active tab buttons
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');

    // Toggle active panels
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');

    currentAdminTab = tabId.replace('-tab', '');
    loadAdminDataForTab(currentAdminTab);
}

function loadAdminPanel() {
    // Default load Students data on init
    loadAdminDataForTab('students');
}

function loadAdminDataForTab(tab) {
    if (tab === 'students') fetchAdminStudents();
    else if (tab === 'instructors') fetchAdminInstructors();
    else if (tab === 'courses') fetchAdminCourses();
    else if (tab === 'enrollments') fetchAdminEnrollments();
    else if (tab === 'assignments') fetchAdminAssignments();
}

async function fetchAdminStudents() {
    const tbody = document.getElementById('admin-students-table-body');
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;"><i class="fa-solid fa-spinner fa-spin"></i> Loading...</td></tr>`;
    try {
        const res = await fetch(`${API_BASE}/students/`);
        const data = await res.json();
        loadedStudents = data;
        tbody.innerHTML = data.map(s => `
            <tr>
                <td><strong>${s.student_id}</strong></td>
                <td>${s.full_name}</td>
                <td>${s.email}</td>
                <td>${s.phone}</td>
                <td>${s.qualification}</td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="openEditModal('student', ${s.student_id})"><i class="fa-solid fa-pencil"></i></button>
                    <button class="btn btn-danger btn-sm" onclick="deleteAdminEntity('students', ${s.student_id})"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: var(--danger);">Failed to load students registry.</td></tr>`;
    }
}

async function fetchAdminInstructors() {
    const tbody = document.getElementById('admin-instructors-table-body');
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;"><i class="fa-solid fa-spinner fa-spin"></i> Loading...</td></tr>`;
    try {
        const res = await fetch(`${API_BASE}/instructors/`);
        const data = await res.json();
        loadedInstructors = data;
        tbody.innerHTML = data.map(inst => `
            <tr>
                <td><strong>${inst.instructor_id}</strong></td>
                <td>${inst.instructor_name}</td>
                <td>${inst.specialization}</td>
                <td>${inst.experience} Years</td>
                <td>${inst.email}</td>
                <td>${inst.phone}</td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="openEditModal('instructor', ${inst.instructor_id})"><i class="fa-solid fa-pencil"></i></button>
                    <button class="btn btn-danger btn-sm" onclick="deleteAdminEntity('instructors', ${inst.instructor_id})"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color: var(--danger);">Failed to load instructors.</td></tr>`;
    }
}

async function fetchAdminCourses() {
    const tbody = document.getElementById('admin-courses-table-body');
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;"><i class="fa-solid fa-spinner fa-spin"></i> Loading...</td></tr>`;
    try {
        const res = await fetch(`${API_BASE}/courses/`);
        const data = await res.json();
        loadedCourses = data;
        tbody.innerHTML = data.map(c => `
            <tr>
                <td><strong>${c.course_id}</strong></td>
                <td>${c.course_name}</td>
                <td>${c.instructor_name}</td>
                <td>${c.category}</td>
                <td>${c.duration}</td>
                <td>₹${Number(c.price).toLocaleString()}</td>
                <td><span class="status-badge badge-${c.level.toLowerCase()}">${c.level}</span></td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="openEditModal('course', ${c.course_id})"><i class="fa-solid fa-pencil"></i></button>
                    <button class="btn btn-danger btn-sm" onclick="deleteAdminEntity('courses', ${c.course_id})"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color: var(--danger);">Failed to load courses catalogue.</td></tr>`;
    }
}

async function fetchAdminEnrollments() {
    const tbody = document.getElementById('admin-enrollments-table-body');
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;"><i class="fa-solid fa-spinner fa-spin"></i> Loading...</td></tr>`;
    try {
        const res = await fetch(`${API_BASE}/enrollments/`);
        const data = await res.json();
        loadedEnrollments = data;
        tbody.innerHTML = data.map(e => `
            <tr>
                <td><strong>${e.enrollment_id}</strong></td>
                <td>${e.student_name}</td>
                <td>${e.course_name}</td>
                <td>${e.enrollment_date}</td>
                <td><span class="status-badge badge-${e.payment_status.toLowerCase()}">${e.payment_status}</span></td>
                <td><span class="status-badge badge-${e.course_status.toLowerCase()}">${e.course_status}</span></td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="openEditModal('enrollment', ${e.enrollment_id})"><i class="fa-solid fa-pencil"></i></button>
                    <button class="btn btn-danger btn-sm" onclick="deleteAdminEntity('enrollments', ${e.enrollment_id})"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color: var(--danger);">Failed to load enrollments.</td></tr>`;
    }
}

async function fetchAdminAssignments() {
    const tbody = document.getElementById('admin-assignments-table-body');
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;"><i class="fa-solid fa-spinner fa-spin"></i> Loading...</td></tr>`;
    try {
        const res = await fetch(`${API_BASE}/assignments/`);
        const data = await res.json();
        loadedAssignments = data;
        tbody.innerHTML = data.map(a => `
            <tr>
                <td><strong>${a.assignment_id}</strong></td>
                <td>${a.course_name}</td>
                <td>${a.student_name}</td>
                <td>${a.assignment_title}</td>
                <td>${a.submission_date}</td>
                <td><strong style="color: #a78bfa;">${a.status === 'Evaluated' ? a.marks + '/100' : 'N/A'}</strong></td>
                <td><span class="status-badge badge-${a.status.toLowerCase()}">${a.status}</span></td>
                <td>
                    <button class="btn btn-secondary btn-sm" title="Grade Assignment" onclick="openEditModal('assignment', ${a.assignment_id})"><i class="fa-solid fa-marker"></i></button>
                    <button class="btn btn-danger btn-sm" onclick="deleteAdminEntity('assignments', ${a.assignment_id})"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color: var(--danger);">Failed to load assignments directory.</td></tr>`;
    }
}

// DELETE Entity logic
async function deleteAdminEntity(module, id) {
    if (!confirm(`Are you sure you want to delete this record from ${module}?`)) return;

    try {
        const response = await fetch(`${API_BASE}/${module}/delete/${id}/`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showToast('Record deleted successfully.');
            loadAdminDataForTab(currentAdminTab);
        } else {
            showToast('Failed to delete record.', 'error');
        }
    } catch (err) {
        console.error(err);
        showToast('Connection error during deletion request.', 'error');
    }
}

// Modal Form Injections for ADD and EDIT CRUD Forms
function openAddModal(type) {
    activeEditId = null; // Adding mode
    document.getElementById('admin-modal-title').innerText = `Add New ${type.toUpperCase()}`;
    const fieldsContainer = document.getElementById('admin-modal-fields-container');
    
    injectFormFields(type, null);
    openModal('admin-modal');
}

function openEditModal(type, id) {
    activeEditId = id; // Editing mode
    document.getElementById('admin-modal-title').innerText = `Edit ${type.toUpperCase()} (#${id})`;
    
    let data = null;
    if (type === 'student') data = loadedStudents.find(x => x.student_id == id);
    else if (type === 'instructor') data = loadedInstructors.find(x => x.instructor_id == id);
    else if (type === 'course') data = loadedCourses.find(x => x.course_id == id);
    else if (type === 'enrollment') data = loadedEnrollments.find(x => x.enrollment_id == id);
    else if (type === 'assignment') data = loadedAssignments.find(x => x.assignment_id == id);
    
    injectFormFields(type, data);
    openModal('admin-modal');
}

function injectFormFields(type, data = null) {
    const fieldsContainer = document.getElementById('admin-modal-fields-container');
    
    if (type === 'student') {
        fieldsContainer.innerHTML = `
            ${!data ? `
            <div class="form-group">
                <label>Student ID (Optional)</label>
                <input type="number" id="m-student_id" class="form-control" placeholder="Leave blank to auto-generate">
            </div>
            ` : ''}
            <div class="form-group">
                <label>Full Name</label>
                <input type="text" id="m-full_name" class="form-control" value="${data ? data.full_name : ''}" required>
            </div>
            <div class="form-group">
                <label>Email Address</label>
                <input type="email" id="m-email" class="form-control" value="${data ? data.email : ''}" required>
            </div>
            <div class="form-group">
                <label>Phone Number</label>
                <input type="tel" id="m-phone" class="form-control" value="${data ? data.phone : ''}" required>
            </div>
            <div class="form-group">
                <label>Qualification</label>
                <input type="text" id="m-qualification" class="form-control" value="${data ? data.qualification : ''}" required>
            </div>
            <div class="form-group">
                <label>Password</label>
                <input type="text" id="m-password" class="form-control" value="${data ? data.password : ''}" required>
            </div>
        `;
    } else if (type === 'instructor') {
        fieldsContainer.innerHTML = `
            ${!data ? `
            <div class="form-group">
                <label>Instructor ID (Optional)</label>
                <input type="number" id="m-instructor_id" class="form-control" placeholder="Leave blank to auto-generate">
            </div>
            ` : ''}
            <div class="form-group">
                <label>Instructor Name</label>
                <input type="text" id="m-instructor_name" class="form-control" value="${data ? data.instructor_name : ''}" required>
            </div>
            <div class="form-group">
                <label>Specialization</label>
                <input type="text" id="m-specialization" class="form-control" value="${data ? data.specialization : ''}" required>
            </div>
            <div class="form-group">
                <label>Experience (Years)</label>
                <input type="number" id="m-experience" class="form-control" value="${data ? data.experience : ''}" required>
            </div>
            <div class="form-group">
                <label>Email Address</label>
                <input type="email" id="m-email" class="form-control" value="${data ? data.email : ''}" required>
            </div>
            <div class="form-group">
                <label>Phone Number</label>
                <input type="tel" id="m-phone" class="form-control" value="${data ? data.phone : ''}" required>
            </div>
        `;
    } else if (type === 'course') {
        fieldsContainer.innerHTML = `
            ${!data ? `
            <div class="form-group">
                <label>Course ID (Optional)</label>
                <input type="number" id="m-course_id" class="form-control" placeholder="Leave blank to auto-generate">
            </div>
            ` : ''}
            <div class="form-group">
                <label>Course Name</label>
                <input type="text" id="m-course_name" class="form-control" value="${data ? data.course_name : ''}" required>
            </div>
            <div class="form-group">
                <label>Instructor Name</label>
                <input type="text" id="m-instructor_name" class="form-control" value="${data ? data.instructor_name : ''}" required>
            </div>
            <div class="form-group">
                <label>Category</label>
                <input type="text" id="m-category" class="form-control" value="${data ? data.category : ''}" required>
            </div>
            <div class="form-group">
                <label>Duration (e.g. 3 Months)</label>
                <input type="text" id="m-duration" class="form-control" value="${data ? data.duration : ''}" required>
            </div>
            <div class="form-group">
                <label>Price (INR)</label>
                <input type="number" id="m-price" class="form-control" value="${data ? data.price : ''}" required>
            </div>
            <div class="form-group">
                <label>Level</label>
                <select id="m-level" class="form-control" required>
                    <option value="Beginner" ${data && data.level === 'Beginner' ? 'selected' : ''}>Beginner</option>
                    <option value="Intermediate" ${data && data.level === 'Intermediate' ? 'selected' : ''}>Intermediate</option>
                    <option value="Advanced" ${data && data.level === 'Advanced' ? 'selected' : ''}>Advanced</option>
                </select>
            </div>
        `;
    } else if (type === 'enrollment') {
        fieldsContainer.innerHTML = `
            ${!data ? `
            <div class="form-group">
                <label>Enrollment ID (Optional)</label>
                <input type="number" id="m-enrollment_id" class="form-control" placeholder="Leave blank to auto-generate">
            </div>
            ` : ''}
            <div class="form-group">
                <label>Student Name</label>
                <input type="text" id="m-student_name" class="form-control" value="${data ? data.student_name : ''}" required>
            </div>
            <div class="form-group">
                <label>Course Name</label>
                <input type="text" id="m-course_name" class="form-control" value="${data ? data.course_name : ''}" required>
            </div>
            <div class="form-group">
                <label>Enrollment Date</label>
                <input type="date" id="m-enrollment_date" class="form-control" value="${data ? data.enrollment_date : new Date().toISOString().split('T')[0]}" required>
            </div>
            <div class="form-group">
                <label>Payment Status</label>
                <select id="m-payment_status" class="form-control" required>
                    <option value="Paid" ${data && data.payment_status === 'Paid' ? 'selected' : ''}>Paid</option>
                    <option value="Pending" ${data && data.payment_status === 'Pending' ? 'selected' : ''}>Pending</option>
                </select>
            </div>
            <div class="form-group">
                <label>Course Status</label>
                <select id="m-course_status" class="form-control" required>
                    <option value="Active" ${data && data.course_status === 'Active' ? 'selected' : ''}>Active</option>
                    <option value="Completed" ${data && data.course_status === 'Completed' ? 'selected' : ''}>Completed</option>
                    <option value="Cancelled" ${data && data.course_status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
            </div>
        `;
    } else if (type === 'assignment') {
        fieldsContainer.innerHTML = `
            ${!data ? `
            <div class="form-group">
                <label>Assignment ID (Optional)</label>
                <input type="number" id="m-assignment_id" class="form-control" placeholder="Leave blank to auto-generate">
            </div>
            ` : ''}
            <div class="form-group">
                <label>Course Name</label>
                <input type="text" id="m-course_name" class="form-control" value="${data ? data.course_name : ''}" required>
            </div>
            <div class="form-group">
                <label>Student Name</label>
                <input type="text" id="m-student_name" class="form-control" value="${data ? data.student_name : ''}" required>
            </div>
            <div class="form-group">
                <label>Assignment Title</label>
                <input type="text" id="m-assignment_title" class="form-control" value="${data ? data.assignment_title : ''}" required>
            </div>
            <div class="form-group">
                <label>Submission Date</label>
                <input type="date" id="m-submission_date" class="form-control" value="${data ? data.submission_date : new Date().toISOString().split('T')[0]}" required>
            </div>
            <div class="form-group">
                <label>Marks (0-100)</label>
                <input type="number" id="m-marks" class="form-control" min="0" max="100" value="${data ? data.marks : '0'}" required>
            </div>
            <div class="form-group">
                <label>Status</label>
                <select id="m-status" class="form-control" required>
                    <option value="Pending" ${data && data.status === 'Pending' ? 'selected' : ''}>Pending</option>
                    <option value="Submitted" ${data && data.status === 'Submitted' ? 'selected' : ''}>Submitted</option>
                    <option value="Evaluated" ${data && data.status === 'Evaluated' ? 'selected' : ''}>Evaluated</option>
                </select>
            </div>
        `;
    }
}

// Handle Form Submission inside Admin Modal Form
const adminModalForm = document.getElementById('admin-modal-form');
if (adminModalForm) {
    adminModalForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        let url = '';
        let method = '';
        let payload = {};
        
        const isEdit = activeEditId !== null;

        if (currentAdminTab === 'students') {
            method = isEdit ? 'PUT' : 'POST';
            url = isEdit ? `${API_BASE}/students/update/${activeEditId}/` : `${API_BASE}/students/add/`;
            
            payload = {
                full_name: document.getElementById('m-full_name').value,
                email: document.getElementById('m-email').value,
                phone: document.getElementById('m-phone').value,
                qualification: document.getElementById('m-qualification').value,
                password: document.getElementById('m-password').value,
            };
            if (!isEdit && document.getElementById('m-student_id').value) {
                payload.student_id = parseInt(document.getElementById('m-student_id').value);
            }
        } 
        else if (currentAdminTab === 'instructors') {
            method = isEdit ? 'PUT' : 'POST';
            url = isEdit ? `${API_BASE}/instructors/update/${activeEditId}/` : `${API_BASE}/instructors/add/`;
            
            payload = {
                instructor_name: document.getElementById('m-instructor_name').value,
                specialization: document.getElementById('m-specialization').value,
                experience: parseInt(document.getElementById('m-experience').value),
                email: document.getElementById('m-email').value,
                phone: document.getElementById('m-phone').value,
            };
            if (!isEdit && document.getElementById('m-instructor_id').value) {
                payload.instructor_id = parseInt(document.getElementById('m-instructor_id').value);
            }
        }
        else if (currentAdminTab === 'courses') {
            method = isEdit ? 'PUT' : 'POST';
            url = isEdit ? `${API_BASE}/courses/update/${activeEditId}/` : `${API_BASE}/courses/add/`;
            
            payload = {
                course_name: document.getElementById('m-course_name').value,
                instructor_name: document.getElementById('m-instructor_name').value,
                category: document.getElementById('m-category').value,
                duration: document.getElementById('m-duration').value,
                price: parseInt(document.getElementById('m-price').value),
                level: document.getElementById('m-level').value,
            };
            if (!isEdit && document.getElementById('m-course_id').value) {
                payload.course_id = parseInt(document.getElementById('m-course_id').value);
            }
        }
        else if (currentAdminTab === 'enrollments') {
            method = isEdit ? 'PUT' : 'POST';
            url = isEdit ? `${API_BASE}/enrollments/update/${activeEditId}/` : `${API_BASE}/enrollments/add/`;
            
            payload = {
                student_name: document.getElementById('m-student_name').value,
                course_name: document.getElementById('m-course_name').value,
                enrollment_date: document.getElementById('m-enrollment_date').value,
                payment_status: document.getElementById('m-payment_status').value,
                course_status: document.getElementById('m-course_status').value,
            };
            if (!isEdit && document.getElementById('m-enrollment_id').value) {
                payload.enrollment_id = parseInt(document.getElementById('m-enrollment_id').value);
            }
        }
        else if (currentAdminTab === 'assignments') {
            method = isEdit ? 'PUT' : 'POST';
            url = isEdit ? `${API_BASE}/assignments/update/${activeEditId}/` : `${API_BASE}/assignments/add/`;
            
            payload = {
                course_name: document.getElementById('m-course_name').value,
                student_name: document.getElementById('m-student_name').value,
                assignment_title: document.getElementById('m-assignment_title').value,
                submission_date: document.getElementById('m-submission_date').value,
                marks: parseInt(document.getElementById('m-marks').value),
                status: document.getElementById('m-status').value,
            };
            if (!isEdit && document.getElementById('m-assignment_id').value) {
                payload.assignment_id = parseInt(document.getElementById('m-assignment_id').value);
            }
        }

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok) {
                showToast(`Record ${isEdit ? 'updated' : 'added'} successfully.`);
                closeModal('admin-modal');
                loadAdminDataForTab(currentAdminTab);
            } else {
                showToast(result.error || 'Operation failed!', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Server connection failed.', 'error');
        }
    });
}
