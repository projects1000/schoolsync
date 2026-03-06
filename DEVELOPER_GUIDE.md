# SchoolSync — Developer Guide

> **Little Steps Playschool Management System**
> A full-stack web application for managing playschool operations — students, teachers, parents, attendance, fees, communications, and more.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Architecture Overview](#3-architecture-overview)
4. [Folder Structure](#4-folder-structure)
5. [Prerequisites](#5-prerequisites)
6. [Getting Started](#6-getting-started)
7. [Environment Configuration](#7-environment-configuration)
8. [User Roles & Access](#8-user-roles--access)
9. [Frontend Route Map](#9-frontend-route-map)
10. [Backend API Overview](#10-backend-api-overview)
11. [Database (MongoDB)](#11-database-mongodb)
12. [Deployment](#12-deployment)
13. [Troubleshooting](#13-troubleshooting)

---

## 1. Project Overview

SchoolSync is a multi-role school management system with four user roles:

| Role | Description |
|------|-------------|
| **Super Admin** | Platform owner — manages schools, admins, global settings, audit logs |
| **Admin** | School-level admin — manages students, teachers, parents, fees, classes, attendance |
| **Teacher** | Manages assigned classes, attendance, assignments, course handouts, communications |
| **Parent** | Views child's academic details, attendance, messages, fees, assignments |

---

## 2. Tech Stack

### Backend
| Component | Technology |
|-----------|-----------|
| Framework | **Spring Boot 3.3.13** (Java 21) |
| Database | **MongoDB** (via Spring Data MongoDB) |
| Authentication | **JWT** (jjwt 0.12.3) |
| Security | Spring Security |
| Build Tool | Maven (bundled in `tools/apache-maven-3.9.9`) |
| Utilities | Lombok, ModelMapper |

### Frontend
| Component | Technology |
|-----------|-----------|
| Framework | **React 18** (JSX) |
| Build Tool | **Vite 7** |
| Styling | **Tailwind CSS 3** |
| HTTP Client | Axios |
| UI Components | Radix UI (Dialog, Select, Tabs, Toast, etc.) |
| Animations | Framer Motion |
| Icons | Lucide React |
| Routing | React Router DOM v7 |
| PDF Export | jsPDF + jspdf-autotable |

---

## 3. Architecture Overview

```
┌──────────────────────────────────┐
│           FRONTEND               │
│     React + Vite + Tailwind      │
│     (Port 3005 in dev)           │
│                                  │
│  Axios ──► /api/* proxy ─────────┼──┐
└──────────────────────────────────┘  │
                                      │
                                      ▼
┌──────────────────────────────────┐
│            BACKEND               │
│   Spring Boot (Port 8089)        │
│                                  │
│  Controllers → Services → Repos  │
│        ↕ JWT Auth Filter         │
│                                  │
│  MongoDB (Atlas / Local)         │
└──────────────────────────────────┘
```

- The frontend dev server proxies `/api/*` requests to the backend at `http://localhost:8089`.
- JWT tokens are stored in `localStorage` and sent via `Authorization: Bearer <token>` header.
- A `DataInitializer` seeds the Super Admin account on first startup.

---

## 4. Folder Structure

### Root

```
schoolsync/
├── backend/              # Spring Boot backend
├── frontend/             # React frontend
├── tools/                # Bundled tools (Maven 3.9.9)
└── .gitignore
```

### Backend (`backend/`)

```
backend/
├── pom.xml                           # Maven config (dependencies, plugins)
├── Dockerfile                        # Docker image definition
├── docker-compose.yml                # Docker Compose (Postgres setup — legacy)
├── migration.sql                     # DB migration script (legacy/reference)
├── src/
│   └── main/
│       ├── java/com/littlesteps/playschool/
│       │   ├── PlayschoolManagementApplication.java   # Main entry point
│       │   ├── config/
│       │   │   ├── AppConfig.java                     # ModelMapper bean
│       │   │   ├── DataInitializer.java               # Seeds Super Admin on startup
│       │   │   ├── SecurityConfig.java                # Spring Security & CORS config
│       │   │   └── WebConfig.java                     # Additional web config
│       │   ├── security/
│       │   │   ├── JwtAuthenticationFilter.java       # JWT filter for requests
│       │   │   └── SchoolContext.java                 # Thread-local school context
│       │   ├── controller/    # REST API controllers (30 files)
│       │   │   ├── AuthController.java
│       │   │   ├── AdminController.java
│       │   │   ├── TeacherController.java
│       │   │   ├── ParentController.java
│       │   │   ├── StudentController.java
│       │   │   ├── AttendanceController.java
│       │   │   ├── ClassController.java
│       │   │   ├── FeeController.java
│       │   │   ├── InviteController.java
│       │   │   ├── SuperAdminController.java
│       │   │   └── ... (20 more)
│       │   ├── service/       # Business logic layer (31 files)
│       │   │   ├── AuthService.java
│       │   │   ├── AdminService.java
│       │   │   ├── TeacherService.java
│       │   │   ├── ParentService.java
│       │   │   ├── StudentService.java
│       │   │   ├── AttendanceService.java
│       │   │   ├── FeeService.java
│       │   │   └── ... (24 more)
│       │   ├── repository/    # MongoDB repository interfaces (27 files)
│       │   ├── entity/        # MongoDB document models (27 files)
│       │   │   ├── User.java
│       │   │   ├── Student.java
│       │   │   ├── Teacher.java
│       │   │   ├── Parent.java
│       │   │   ├── Classes.java
│       │   │   ├── Attendance.java
│       │   │   ├── FeeInvoice.java
│       │   │   ├── Communication.java
│       │   │   └── ... (19 more)
│       │   ├── dto/           # Data Transfer Objects (39 files)
│       │   ├── exception/     # Custom exception handlers
│       │   └── util/          # Utility classes
│       └── resources/
│           └── application.properties   # App configuration
```

### Frontend (`frontend/`)

```
frontend/
├── package.json                # Dependencies & scripts
├── vite.config.js              # Vite config (proxy, aliases, plugins)
├── tailwind.config.js          # Tailwind CSS customization
├── postcss.config.js           # PostCSS config
├── netlify.toml                # Netlify deployment config
├── index.html                  # HTML entry point
├── .env.production             # Production environment variables
├── .nvmrc                      # Node version (20.19.1)
├── public/                     # Static assets
├── plugins/                    # Custom Vite plugins (visual editor)
├── src/
│   ├── main.jsx                # React entry point
│   ├── App.jsx                 # Root component (routing, auth, layout)
│   ├── index.css               # Global styles
│   ├── routeConfig.js          # Centralized route definitions
│   ├── context/
│   │   ├── ParentContext.jsx       # Parent dashboard state management
│   │   └── NotificationContext.jsx # Notification state management
│   ├── hooks/
│   │   └── useLocalStorage.js      # Custom localStorage hook
│   ├── lib/
│   │   └── utils.js                # Utility functions (cn, etc.)
│   ├── services/
│   │   ├── api.js                  # Axios instance with JWT interceptor
│   │   ├── adminService.js         # Admin API calls
│   │   ├── parentService.js        # Parent API calls
│   │   └── superAdminService.js    # Super Admin API calls
│   └── components/
│       ├── auth/               # Login components
│       ├── layout/             # Sidebar, navigation layout
│       ├── ui/                 # Reusable UI components (17 files)
│       │                         (Button, Dialog, Select, Tabs, Toast, etc.)
│       ├── dashboard/          # Admin dashboard widgets
│       ├── superadmin/         # Super Admin portal components
│       │   ├── SuperAdminDashboard.jsx
│       │   ├── SchoolManagement.jsx
│       │   ├── AdminManagement.jsx
│       │   ├── SecurityAuditLogs.jsx
│       │   └── ... (charts/, widgets/, mock data)
│       ├── admin/              # Admin-level management components
│       │   ├── AcademicsManagement.jsx
│       │   ├── ParentRegistrationManagement.jsx
│       │   ├── SchoolProfile.jsx
│       │   └── ...
│       ├── teacher/            # Teacher portal components
│       │   ├── TeacherPortal.jsx
│       │   ├── TeacherDashboard.jsx
│       │   ├── MarkAttendance.jsx
│       │   ├── MyClasses.jsx
│       │   ├── StudentPromotions.jsx
│       │   └── ...
│       ├── parent/             # Parent portal components
│       │   ├── ParentOverview.jsx
│       │   ├── ParentStudentProfile.jsx
│       │   ├── ParentAttendance.jsx
│       │   ├── ParentFees.jsx
│       │   └── ...
│       ├── students/           # Student management
│       ├── teachers/           # Teacher management
│       ├── parents/            # Parent management
│       ├── classes/            # Class management
│       ├── attendance/         # Attendance management
│       ├── fees/               # Fee management
│       ├── communications/     # Communication/messaging
│       ├── timetable/          # Timetable management
│       ├── invites/            # Invite management
│       └── common/             # Shared components
```

---

## 5. Prerequisites

Make sure the following are installed on your machine:

| Tool | Version | Purpose |
|------|---------|---------|
| **Git** | Latest | Clone the repository |
| **Java JDK** | 21+ | Run the Spring Boot backend |
| **Maven** | 3.9+ (or use bundled `tools/apache-maven-3.9.9`) | Build the backend |
| **Node.js** | 20.x (see `.nvmrc`: 20.19.1) | Run the frontend |
| **npm** | Comes with Node.js | Install frontend dependencies |
| **MongoDB** | Atlas (cloud) or local instance | Database |

---

## 6. Getting Started

### Step 1: Clone the Repository

```bash
git clone https://github.com/projects1000/schoolsync.git
cd schoolsync
```

### Step 2: Start the Backend

```bash
cd backend

# Option A: Using system Maven
mvn spring-boot:run

# Option B: Using bundled Maven (Windows)
..\tools\apache-maven-3.9.9\bin\mvn spring-boot:run

# Option C: Using bundled Maven (Linux/Mac)
../tools/apache-maven-3.9.9/bin/mvn spring-boot:run
```

The backend starts on **port 8089** by default.

> **First Run:** The `DataInitializer` automatically creates the Super Admin account. See [Environment Configuration](#7-environment-configuration) for credentials.

### Step 3: Start the Frontend

Open a **new terminal**:

```bash
cd frontend

# Install dependencies (first time only)
npm install

# Start the dev server
npm run dev
```

The frontend starts on **http://localhost:3005**.

### Step 4: Open the Application

Navigate to `http://localhost:3005` in your browser.

**Default Super Admin Login:**
- Email: `admin@littlesteps.com`
- Password: `SecureLittleSteps2024!`

---

## 7. Environment Configuration

### Backend (`backend/src/main/resources/application.properties`)

| Property | Default | Description |
|----------|---------|-------------|
| `server.port` | `8089` | Backend server port (override with `PORT` env var) |
| `spring.data.mongodb.uri` | Atlas cluster URI | MongoDB connection string (override with `MONGODB_URI`) |
| `cors.allowed.origins` | `http://localhost:3005, http://localhost:5173` | Allowed frontend origins (override with `CORS_ORIGINS`) |
| `jwt.secret` | Default secret key | JWT signing secret (override with `JWT_SECRET`) |
| `jwt.expiration` | `1800000` (30 min) | JWT token expiry in milliseconds |
| `app.superadmin.email` | `admin@littlesteps.com` | Super Admin email (override with `SUPER_ADMIN_EMAIL`) |
| `app.superadmin.password` | `SecureLittleSteps2024!` | Super Admin password (override with `SUPER_ADMIN_PASSWORD`) |

### Frontend

| File | Variable | Description |
|------|----------|-------------|
| `.env.production` | `VITE_API_BASE_URL` | Production API URL (`https://schoolsync-1-iysg.onrender.com/api`) |
| `.env.production` | `VITE_APP_TITLE` | App title |
| `vite.config.js` | Proxy `/api` → `http://localhost:8089` | Dev server proxy (no `.env` needed for local dev) |

> **💡 Tip:** For local development, the Vite proxy handles API routing automatically. You don't need to set `VITE_API_BASE_URL`.

---

## 8. User Roles & Access

### Role Hierarchy

```
Super Admin
  └── Admin (per school)
        ├── Teacher (per school)
        └── Parent (per school, linked to students)
```

### How Users Are Created

| Role | Created By |
|------|------------|
| **Super Admin** | Auto-seeded by `DataInitializer` on first startup |
| **Admin** | Created by Super Admin via School Management |
| **Teacher** | Created by Admin via Teacher Management |
| **Parent** | Self-registers via Invite system, approved by Admin |

### Authentication Flow

1. User logs in via `POST /api/auth/login` with email/password.
2. Backend returns a JWT token with user info (role, schoolId, etc.).
3. Frontend stores the token in `localStorage`.
4. All subsequent API calls include `Authorization: Bearer <token>` via Axios interceptor.
5. `JwtAuthenticationFilter` validates the token on every request.
6. `SecurityConfig` enforces role-based access to endpoints.

---

## 9. Frontend Route Map

| Path | Role | Component |
|------|------|-----------|
| **Super Admin** | | |
| `/superadmin` | Super Admin | Super Admin Dashboard |
| `/superadmin/schools` | Super Admin | School Management |
| `/superadmin/admins` | Super Admin | Admin Management |
| `/superadmin/academics` | Super Admin | Academic Settings |
| `/superadmin/fees` | Super Admin | Fee Settings |
| `/superadmin/security` | Super Admin | Security & Audit Logs |
| `/superadmin/system-health` | Super Admin | System Health & Backup |
| `/superadmin/trash` | Super Admin | Trash Management |
| **Admin** | | |
| `/dashboard` | Admin | Admin Dashboard |
| `/students` | Admin | Student Management |
| `/teachers` | Admin | Teacher Management |
| `/parents` | Admin | Parent Management |
| `/parent-registrations` | Admin | Registration Approval |
| `/attendance` | Admin | Attendance Overview |
| `/fees` | Admin | Fee Management |
| `/classes` | Admin | Class Management |
| `/academics` | Admin | Academics Management |
| `/communications` | Admin | Communications |
| `/notifications` | Admin | Notification Management |
| `/timetable` | Admin | Timetable |
| `/school-profile` | Admin | School Profile |
| `/trash` | Admin | Trash Management |
| **Teacher** | | |
| `/teacher` | Teacher | Teacher Dashboard |
| `/teacher/classes` | Teacher | My Classes |
| `/teacher/course-handouts` | Teacher | Course Handouts |
| `/teacher/create-handout` | Teacher | Create Handout |
| `/teacher/resources` | Teacher | Learning Resources |
| `/teacher/assignments` | Teacher | Assignments |
| `/teacher/communications` | Teacher | Communications |
| `/teacher/profile` | Teacher | Teacher Profile |
| `/teacher/promotions` | Teacher | Student Promotions |
| **Parent** | | |
| `/parent` | Parent | Overview Dashboard |
| `/parent/profile` | Parent | Student Profile |
| `/parent/academics` | Parent | Academic Details |
| `/parent/attendance` | Parent | Attendance History |
| `/parent/messages` | Parent | Messages |
| `/parent/assignments` | Parent | Assignments |
| `/parent/study-materials` | Parent | Study Materials |
| `/parent/course-handouts` | Parent | Course Handouts |
| `/parent/fees` | Parent | Fee Details |

---

## 10. Backend API Overview

All API endpoints are prefixed with `/api`. Key controller groups:

| Controller | Base Path | Responsibility |
|-----------|-----------|----------------|
| `AuthController` | `/api/auth` | Login, register, token management |
| `SuperAdminController` | `/api/superadmin` | Platform-wide management |
| `AdminController` | `/api/admin` | School-level CRUD operations |
| `AdminDashboardController` | `/api/admin/dashboard` | Dashboard statistics |
| `TeacherController` | `/api/teacher` | Teacher operations |
| `TeacherDashboardController` | `/api/teacher/dashboard` | Teacher dashboard data |
| `ParentController` | `/api/parent` | Parent operations |
| `ParentAccessController` | `/api/parent` | Parent data access |
| `StudentController` | `/api/students` | Student CRUD |
| `ClassController` | `/api/classes` | Class management |
| `AttendanceController` | `/api/attendance` | Attendance marking/viewing |
| `FeeController` | `/api/fees` | Fee structures & invoices |
| `InviteController` | `/api/invites` | Parent invite system |
| `CommunicationController` | `/api/communications` | Admin & teacher messaging |
| `NotificationController` | `/api/notifications` | Notification management |
| `SubjectController` | `/api/subjects` | Subject management |
| `AuditController` | `/api/audit` | Audit log viewing |
| `SchoolController` | `/api/schools` | School data |
| `SchoolSettingsController` | `/api/school-settings` | School configuration |

---

## 11. Database (MongoDB)

The project uses **MongoDB** (NoSQL). Key collections map to entity classes:

| Entity | Collection | Key Fields |
|--------|-----------|------------|
| `User` | users | email, password, role, schoolId |
| `Student` | students | name, classId, parentId, schoolId |
| `Teacher` | teachers | name, email, schoolId, assignedClasses |
| `Parent` | parents | name, email, children, schoolId |
| `Classes` | classes | name, section, schoolId |
| `Attendance` | attendances | studentId, classId, date, status |
| `FeeStructure` | fee_structures | class, amount, frequency |
| `FeeInvoice` | fee_invoices | studentId, amount, status |
| `Communication` | communications | sender, recipients, message |
| `Subject` | subjects | name, code, schoolId |
| `Timetable` | timetables | classId, day, periods |
| `CourseHandout` | course_handouts | teacherId, classId, content |
| `Notification` | notifications | recipientId, title, message, read |
| `Invite` | invites | email, schoolId, status, token |
| `School` | schools | name, address, settings |
| `AuditLog` | audit_logs | action, userId, timestamp |

> **Note:** MongoDB Atlas is used by default. You can switch to a local MongoDB instance by changing `MONGODB_URI`.

---

## 12. Deployment

### Current Production Setup

| Component | Platform | URL |
|-----------|----------|-----|
| Frontend | **Netlify** | Configured via `netlify.toml` |
| Backend | **Render** | `https://schoolsync-1-iysg.onrender.com` |
| Database | **MongoDB Atlas** | Cloud-hosted cluster |

### Build Commands

**Frontend (Production Build):**
```bash
cd frontend
npm run build      # Output in frontend/dist/
npm run preview    # Preview production build locally on port 3000
```

**Backend (Production JAR):**
```bash
cd backend
mvn clean package -DskipTests
java -jar target/playschool-management-1.0.0.jar
```

### Docker (Optional)

A `Dockerfile` and `docker-compose.yml` are available in the `backend/` folder:

```bash
cd backend
docker-compose up
```

> **Note:** The `docker-compose.yml` references PostgreSQL (legacy). The application now uses MongoDB. Use Docker only for the backend service, not the DB container.

---

## 13. Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| **Backend won't start** | Ensure Java 21+ is installed: `java -version`. Check MongoDB URI is reachable. |
| **Frontend `npm install` fails** | Ensure Node.js 20.x is installed: `node -v`. Delete `node_modules` and `package-lock.json`, then retry. |
| **API calls return 401** | JWT token may have expired (30 min). Log in again. |
| **API calls return 403** | User role doesn't have permission for that endpoint. Check `SecurityConfig.java`. |
| **CORS errors in browser** | Ensure the frontend URL is listed in `cors.allowed.origins` in `application.properties`. |
| **MongoDB connection fails** | Check `MONGODB_URI`. Ensure IP is whitelisted in MongoDB Atlas. |
| **Port conflict** | Backend defaults to 8089, frontend to 3005. Change in `application.properties` or `package.json` dev script. |

### Useful Commands

```bash
# Check Java version
java -version

# Check Node version
node -v

# Check Maven version (bundled)
.\tools\apache-maven-3.9.9\bin\mvn -version

# Backend: clean build
cd backend && mvn clean install -DskipTests

# Frontend: lint check
cd frontend && npx eslint src/

# Git: check current branch
git branch -a
```

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────┐
│                  SchoolSync Quick Ref                │
├─────────────────────────────────────────────────────┤
│  Clone:     git clone https://github.com/           │
│             projects1000/schoolsync.git              │
│                                                     │
│  Backend:   cd backend && mvn spring-boot:run       │
│             → http://localhost:8089                  │
│                                                     │
│  Frontend:  cd frontend && npm install && npm run dev│
│             → http://localhost:3005                  │
│                                                     │
│  Login:     admin@littlesteps.com                   │
│             SecureLittleSteps2024!                   │
│                                                     │
│  DB:        MongoDB Atlas (see application.properties│
│  Auth:      JWT (30 min expiry)                     │
│  Deploy:    Netlify (FE) + Render (BE)              │
└─────────────────────────────────────────────────────┘
```
