# 🎓 Little Steps Playschool Management System - Backend

A comprehensive Spring Boot backend application for managing playschool operations including student management, parent registration, teacher management, attendance tracking, and more.

## 🚀 Tech Stack

- **Framework:** Spring Boot 3.3.13
- **Java Version:** Java 21 LTS
- **Database:** PostgreSQL (Cloud hosted on Render)
- **Security:** JWT Authentication with role-based access
- **Build Tool:** Maven
- **ORM:** JPA/Hibernate
- **Documentation:** Spring Boot Actuator

## 📋 Features

### 🔐 Authentication & Authorization
- JWT token-based authentication
- Role-based access control (Admin, Teacher, Parent)
- Secure password encryption
- Session management

### 👥 User Management
- **Students:** Complete CRUD operations, class-wise filtering, search functionality
- **Parents:** Two-step registration process with validation codes
- **Teachers:** Entity management with department assignments
- **Admins:** Full system access and management capabilities

### 📊 Core Modules
- **Attendance Management:** Daily attendance tracking and reporting
- **Fee Management:** Fee structure and invoice generation
- **Communications:** School-parent communication system
- **Timetable Management:** Class scheduling and management
- **School Settings:** Configurable school parameters

## 🏗️ Architecture

### Entity-Relationship Structure
```
User (Base Authentication)
├── Role: ADMIN, TEACHER, PARENT
├── Student Management
├── Parent Registration System
├── Teacher Management
└── Attendance & Fee Tracking
```

### API Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - General registration
- `POST /api/auth/register-parent` - Parent-specific registration

#### Student Management
- `GET /api/students` - Get all students
- `POST /api/students` - Create new student
- `PUT /api/students/{id}` - Update student
- `DELETE /api/students/{id}` - Delete student
- `GET /api/students/class/{className}` - Get students by class
- `GET /api/students/search` - Search students

#### Admin Operations
- `POST /api/admin/create-parent-registration` - Create parent registration
- `GET /api/admin/registrations` - Get all registrations
- `GET /api/admin/registrations/status/{status}` - Filter by status

#### Attendance
- `POST /api/attendance` - Mark attendance
- `GET /api/attendance/student/{studentId}` - Get student attendance
- `GET /api/attendance/class/{className}/date/{date}` - Get class attendance

## 🛠️ Setup & Installation

### Prerequisites
- Java 21 LTS
- Maven 3.6+
- PostgreSQL Database
- Git

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/projects1000/LittlestepBackend.git
   cd LittlestepBackend
   ```

2. **Configure Database**
   Update `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:postgresql://your-database-url:5432/your-database-name
   spring.datasource.username=your-username
   spring.datasource.password=your-password
   ```

3. **Build the project**
   ```bash
   mvn clean compile
   ```

4. **Run the application**
   ```bash
   mvn spring-boot:run
   ```

5. **Application will start on:** `http://localhost:8080`

### Production Deployment

1. **Build JAR file**
   ```bash
   mvn clean package -DskipTests
   ```

2. **Run JAR**
   ```bash
   java -jar target/playschool-management-1.0.0.jar
   ```

## 📊 Database Schema

### Core Tables
- `users` - Authentication and user profiles
- `students` - Student information and class assignments
- `teachers` - Teacher profiles and department assignments
- `parent_registrations` - Parent registration requests and codes
- `attendance` - Daily attendance records
- `fee_structures` - Fee configurations
- `fee_invoices` - Generated fee invoices
- `communications` - School-parent messages
- `timetables` - Class schedules
- `school_settings` - Configurable parameters

## 🔧 Configuration

### Environment Variables
```properties
# Database Configuration
DB_URL=jdbc:postgresql://localhost:5432/playschool
DB_USERNAME=username
DB_PASSWORD=password

# JWT Configuration
JWT_SECRET=your-secret-key
JWT_EXPIRATION=86400000

# Server Configuration
SERVER_PORT=8080
```

### Security Configuration
- CORS enabled for frontend integration
- JWT token expiration: 24 hours
- Password encryption using BCrypt
- Role-based endpoint protection

## 📝 API Documentation

### Authentication Flow
1. **Login:** POST `/api/auth/login` with credentials
2. **Receive JWT token** in response
3. **Include token** in Authorization header: `Bearer <token>`
4. **Access protected endpoints** based on user role

### Parent Registration Flow
1. **Admin creates registration:** POST `/api/admin/create-parent-registration`
2. **System generates registration code**
3. **Parent registers using code:** POST `/api/auth/register-parent`
4. **System creates user account and marks registration as used**

## 🧪 Testing

### Run Tests
```bash
mvn test
```

### API Testing
- Use Postman collection or similar tool
- Test endpoints with proper JWT tokens
- Validate role-based access controls

## 📁 Project Structure

```
src/main/java/com/littlesteps/playschool/
├── config/          # Configuration classes
├── controller/      # REST API endpoints
├── dto/            # Data Transfer Objects
├── entity/         # JPA Entities
├── repository/     # Data Access Layer
├── security/       # Security configurations
├── service/        # Business Logic Layer
└── util/           # Utility classes
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

**Project Maintainer:** [projects1000](https://github.com/projects1000)

**Repository:** [LittlestepBackend](https://github.com/projects1000/LittlestepBackend)

## 🚧 Future Enhancements

- [ ] Teacher management API endpoints
- [ ] Advanced reporting and analytics
- [ ] Email notification system
- [ ] Mobile app API support
- [ ] File upload for student photos
- [ ] Automated fee payment integration
- [ ] Parent-teacher communication portal

---

**Made with ❤️ for Little Steps Playschool Management**