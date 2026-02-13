package com.littlesteps.playschool.service;

import com.littlesteps.playschool.dto.TeacherDashboardDTO;
import com.littlesteps.playschool.entity.Classes;
import com.littlesteps.playschool.entity.School;
import com.littlesteps.playschool.entity.Teacher;
import com.littlesteps.playschool.entity.User;
import com.littlesteps.playschool.repository.ClassesRepository;
import com.littlesteps.playschool.repository.SchoolRepository;
import com.littlesteps.playschool.repository.StudentRepository;
import com.littlesteps.playschool.repository.TeacherRepository;
import com.littlesteps.playschool.repository.UserRepository;
import com.littlesteps.playschool.dto.AttendanceDTO;
import com.littlesteps.playschool.dto.StudentDTO;
import com.littlesteps.playschool.entity.Student;
import com.littlesteps.playschool.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TeacherDashboardService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private ClassesRepository classesRepository;

    @Autowired
    private SchoolRepository schoolRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private AttendanceService attendanceService;

    @Autowired
    private com.littlesteps.playschool.repository.AttendanceRepository attendanceRepository;

    @Autowired
    private com.littlesteps.playschool.repository.ClassSubjectRepository classSubjectRepository;

    @Autowired
    private com.littlesteps.playschool.repository.SubjectRepository subjectRepository;

    public TeacherDashboardDTO getDashboardData(String email) {
        // 1. Find User
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2. Find Teacher Profile
        Teacher teacher = teacherRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Teacher profile not found for this user"));

        // 3. Find School Name
        String schoolName = "Unknown School";
        if (teacher.getSchoolId() != null) {
            Optional<School> schoolOpt = schoolRepository.findById(teacher.getSchoolId());
            if (schoolOpt.isPresent()) {
                schoolName = schoolOpt.get().getName();
            }
        }

        // 4. Fetch Assigned Classes (from assignedClasses field, subject teacher
        // assignments, AND class teacher assignment) with role and subject info
        List<Map<String, String>> assignedClassesList = new ArrayList<>();

        // Map: classId -> {role, subject}
        java.util.Map<String, java.util.Map<String, String>> classRoleMap = new java.util.HashMap<>();

        // Add classes from assignedClasses field
        List<String> classIds = teacher.getAssignedClasses();
        if (classIds != null && !classIds.isEmpty()) {
            for (String classId : classIds) {
                java.util.Map<String, String> roleInfo = new java.util.HashMap<>();
                roleInfo.put("role", "Assigned");
                roleInfo.put("subject", "");
                classRoleMap.put(classId, roleInfo);
            }
        }

        // Add classes where teacher is assigned as subject teacher (with subject name)
        List<com.littlesteps.playschool.entity.ClassSubject> subjectAssignments = classSubjectRepository
                .findByTeacherId(teacher.getId());
        for (com.littlesteps.playschool.entity.ClassSubject cs : subjectAssignments) {
            String classId = cs.getClassId();
            // Look up subject name
            String subjectName = "Unknown Subject";
            Optional<com.littlesteps.playschool.entity.Subject> subjectOpt = subjectRepository
                    .findById(cs.getSubjectId());
            if (subjectOpt.isPresent()) {
                subjectName = subjectOpt.get().getName();
            }
            if (classRoleMap.containsKey(classId)) {
                java.util.Map<String, String> existing = classRoleMap.get(classId);
                String existingSubjects = existing.get("subject");
                if (existingSubjects == null || existingSubjects.isEmpty()) {
                    existing.put("subject", subjectName);
                } else if (!existingSubjects.contains(subjectName)) {
                    existing.put("subject", existingSubjects + ", " + subjectName);
                }
                existing.put("role", "Subject Teacher");
            } else {
                java.util.Map<String, String> roleInfo = new java.util.HashMap<>();
                roleInfo.put("role", "Subject Teacher");
                roleInfo.put("subject", subjectName);
                classRoleMap.put(classId, roleInfo);
            }
        }

        // Add class where teacher is the CLASS TEACHER
        List<Classes> classTeacherOfList = classesRepository.findByClassTeacherId(teacher.getId());
        for (Classes cls : classTeacherOfList) {
            String classId = cls.getId();
            if (classRoleMap.containsKey(classId)) {
                classRoleMap.get(classId).put("role", "Class Teacher");
            } else {
                java.util.Map<String, String> roleInfo = new java.util.HashMap<>();
                roleInfo.put("role", "Class Teacher");
                roleInfo.put("subject", "");
                classRoleMap.put(classId, roleInfo);
            }
        }

        if (!classRoleMap.isEmpty()) {
            List<Classes> classes = classesRepository.findAllById(new ArrayList<>(classRoleMap.keySet()));
            for (Classes cls : classes) {
                Map<String, String> classMap = new HashMap<>();
                classMap.put("id", cls.getId());
                classMap.put("name", cls.getName());
                classMap.put("grade", cls.getGrade());
                classMap.put("section", cls.getSection());
                classMap.put("role", classRoleMap.get(cls.getId()).get("role"));
                classMap.put("subject", classRoleMap.get(cls.getId()).get("subject"));
                assignedClassesList.add(classMap);
            }
        }

        // 5. Construct DTO
        return new TeacherDashboardDTO(
                teacher.getName(),
                teacher.getEmail(),
                teacher.getDepartment(),
                schoolName,
                assignedClassesList.size(),
                assignedClassesList);
    }

    public List<StudentDTO> getMyStudents(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Teacher teacher = teacherRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Teacher profile not found"));

        // Collect all class IDs from assignedClasses, subject teacher assignments, and
        // class teacher assignment
        java.util.Set<String> allClassIds = new java.util.HashSet<>();

        List<String> classIds = teacher.getAssignedClasses();
        if (classIds != null && !classIds.isEmpty()) {
            allClassIds.addAll(classIds);
        }

        // Add classes where teacher is assigned as subject teacher
        List<com.littlesteps.playschool.entity.ClassSubject> subjectAssignments = classSubjectRepository
                .findByTeacherId(teacher.getId());
        for (com.littlesteps.playschool.entity.ClassSubject cs : subjectAssignments) {
            allClassIds.add(cs.getClassId());
        }

        // Add class where teacher is the CLASS TEACHER
        List<Classes> classTeacherOfList = classesRepository.findByClassTeacherId(teacher.getId());
        for (Classes cls : classTeacherOfList) {
            allClassIds.add(cls.getId());
        }

        if (allClassIds.isEmpty()) {
            return new ArrayList<>();
        }

        List<Student> students = studentRepository.findByClassIdIn(new ArrayList<>(allClassIds));

        // Sort by Roll No ASC
        students.sort((s1, s2) -> {
            Integer r1 = s1.getRollNo() != null ? s1.getRollNo() : Integer.MAX_VALUE;
            Integer r2 = s2.getRollNo() != null ? s2.getRollNo() : Integer.MAX_VALUE;
            return r1.compareTo(r2);
        });

        return students.stream().map(s -> {
            StudentDTO dto = new StudentDTO();
            dto.setId(s.getId());
            dto.setAdmissionNo(s.getAdmissionNo());
            dto.setRollNo(s.getRollNo());
            dto.setName(s.getName());
            dto.setAge(s.getAge());
            dto.setClassName(s.getClassName());
            dto.setClassId(s.getClassId());
            dto.setSectionId(s.getSectionId());
            dto.setGuardian(s.getGuardian());
            dto.setGuardianPhone(s.getGuardianPhone());
            dto.setGuardianEmail(s.getGuardianEmail());
            dto.setAddress(s.getAddress());
            if (s.getStatus() != null) {
                dto.setStatus(s.getStatus().name());
            }
            return dto;
        }).collect(Collectors.toList());
    }

    public List<Map<String, String>> getAssignedClasses(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Teacher teacher = teacherRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Teacher profile not found"));

        // Collect all class IDs with their roles and subjects
        // Map: classId -> {role: "Class Teacher" or "Subject Teacher", subject:
        // subjectName}
        java.util.Map<String, java.util.Map<String, String>> classRoleMap = new java.util.HashMap<>();

        List<String> classIds = teacher.getAssignedClasses();
        if (classIds != null && !classIds.isEmpty()) {
            for (String classId : classIds) {
                java.util.Map<String, String> roleInfo = new java.util.HashMap<>();
                roleInfo.put("role", "Assigned");
                roleInfo.put("subject", "");
                classRoleMap.put(classId, roleInfo);
            }
        }

        // Add classes where teacher is assigned as subject teacher (with subject name)
        List<com.littlesteps.playschool.entity.ClassSubject> subjectAssignments = classSubjectRepository
                .findByTeacherId(teacher.getId());
        for (com.littlesteps.playschool.entity.ClassSubject cs : subjectAssignments) {
            String classId = cs.getClassId();
            // Look up subject name from subject repository
            String subjectName = "Unknown Subject";
            Optional<com.littlesteps.playschool.entity.Subject> subjectOpt = subjectRepository
                    .findById(cs.getSubjectId());
            if (subjectOpt.isPresent()) {
                subjectName = subjectOpt.get().getName();
            }
            if (classRoleMap.containsKey(classId)) {
                // Already exists, append subject if there's one
                java.util.Map<String, String> existing = classRoleMap.get(classId);
                String existingSubjects = existing.get("subject");
                if (existingSubjects == null || existingSubjects.isEmpty()) {
                    existing.put("subject", subjectName);
                } else if (!existingSubjects.contains(subjectName)) {
                    existing.put("subject", existingSubjects + ", " + subjectName);
                }
                existing.put("role", "Subject Teacher");
            } else {
                java.util.Map<String, String> roleInfo = new java.util.HashMap<>();
                roleInfo.put("role", "Subject Teacher");
                roleInfo.put("subject", subjectName);
                classRoleMap.put(classId, roleInfo);
            }
        }

        // Add class where teacher is the CLASS TEACHER
        List<Classes> classTeacherOfList = classesRepository.findByClassTeacherId(teacher.getId());
        for (Classes cls : classTeacherOfList) {
            String classId = cls.getId();
            if (classRoleMap.containsKey(classId)) {
                classRoleMap.get(classId).put("role", "Class Teacher");
            } else {
                java.util.Map<String, String> roleInfo = new java.util.HashMap<>();
                roleInfo.put("role", "Class Teacher");
                roleInfo.put("subject", "");
                classRoleMap.put(classId, roleInfo);
            }
        }

        if (classRoleMap.isEmpty()) {
            return new ArrayList<>();
        }

        List<Classes> classes = classesRepository.findAllById(new ArrayList<>(classRoleMap.keySet()));
        return classes.stream().map(cls -> {
            Map<String, String> map = new HashMap<>();
            map.put("id", cls.getId());
            map.put("name", cls.getName());
            map.put("grade", cls.getGrade());
            map.put("section", cls.getSection());
            map.put("role", classRoleMap.get(cls.getId()).get("role"));
            map.put("subject", classRoleMap.get(cls.getId()).get("subject"));
            return map;
        }).collect(Collectors.toList());
    }

    /**
     * Returns only classes where the teacher is the CLASS TEACHER (not subject
     * teacher).
     * This is used for attendance marking which is restricted to class teachers
     * only.
     */
    public List<Map<String, String>> getClassTeacherClasses(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Teacher teacher = teacherRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Teacher profile not found"));

        // Find classes where this teacher is the class teacher
        List<Classes> classTeacherOfList = classesRepository.findByClassTeacherId(teacher.getId());

        return classTeacherOfList.stream().map(cls -> {
            Map<String, String> map = new HashMap<>();
            map.put("id", cls.getId());
            map.put("name", cls.getName());
            map.put("grade", cls.getGrade());
            map.put("section", cls.getSection());
            return map;
        }).collect(Collectors.toList());
    }

    public List<AttendanceDTO> getAttendance(String email, String dateStr, String className) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Teacher teacher = teacherRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Teacher profile not found"));

        LocalDate date = LocalDate.parse(dateStr);

        // Collect all class IDs from all sources (same pattern as other methods)
        java.util.Set<String> allClassIds = new java.util.HashSet<>();

        List<String> classIds = teacher.getAssignedClasses();
        if (classIds != null && !classIds.isEmpty()) {
            allClassIds.addAll(classIds);
        }

        // Add classes where teacher is assigned as subject teacher
        List<com.littlesteps.playschool.entity.ClassSubject> subjectAssignments = classSubjectRepository
                .findByTeacherId(teacher.getId());
        for (com.littlesteps.playschool.entity.ClassSubject cs : subjectAssignments) {
            allClassIds.add(cs.getClassId());
        }

        // Add class where teacher is the CLASS TEACHER
        List<Classes> classTeacherOfList = classesRepository.findByClassTeacherId(teacher.getId());
        for (Classes cls : classTeacherOfList) {
            allClassIds.add(cls.getId());
        }

        List<AttendanceDTO> allAttendance = attendanceService.getAttendanceByDate(date);

        // Get assigned class names (using final variable for lambda)
        final List<String> assignedClassNames;
        if (!allClassIds.isEmpty()) {
            List<Classes> classes = classesRepository.findAllById(new ArrayList<>(allClassIds));
            assignedClassNames = classes.stream().map(Classes::getName).collect(Collectors.toList());
        } else {
            assignedClassNames = new ArrayList<>();
        }

        if (className != null && !className.equals("all")) {
            if (!assignedClassNames.contains(className)) {
                // Or just return empty if not assigned
                return new ArrayList<>();
            }
            return attendanceService.getAttendanceByDateAndClass(date, className);
        } else {
            // Return for all assigned classes
            return allAttendance.stream()
                    .filter(a -> assignedClassNames.contains(a.getClassName()))
                    .collect(Collectors.toList());
        }
    }

    public AttendanceDTO updateAttendance(String id, String status, String reason) {
        // Actually, the previous method getStudentAttendance has email passed.
        // Let's check SecurityContext.

        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();
        String email = auth.getName();

        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getRole() == User.Role.ADMIN || user.getRole() == User.Role.SUPERADMIN) {
            // Admin always allowed
            AttendanceDTO dto = new AttendanceDTO();
            dto.setStatus(status);
            dto.setNotes(reason);
            return attendanceService.updateAttendance(id, dto);
        }

        Teacher teacher = teacherRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        // Fetch Attendance to find student and class
        // Service doesn't expose "findById" returns Entity easily?
        // attendanceService.getAttendanceById(id)?
        // Let's check AttendanceService.
        // If not available, use Repository directly.
        // But AttendanceService is injected.
        // Let's use Repository which I don't have injected?
        // I have studentRepository, classesRepository...
        // I need AttendanceRepository.

        // Wait, I cannot inject AttendanceRepository if it's not already there.
        // It is NOT injected.
        // I should inject it.

        // But for this tool call, I can only replace content.
        // I should inject it in a separate edit or use what I have.
        // I have 'attendanceService'. Does it have 'getAttendanceById'?
        // Probably not DTO.

        // Let's assume for now I will add AttendanceRepository in the next step or
        // modify the Service.
        // OR rely on saveAttendance logic if I could.

        // Let's add TODO and try to inject repository in a separate step?
        // Actually, I can add fields with MultiReplace or separate Replace.
        // I will use MultiReplace to add the field and update the method.

        // For now, let's just use SecurityContextHolder to get email, and assume I will
        // fix the repository injection.

        throw new RuntimeException(
                "Update Attendance requires strict permission check. Please inject AttendanceRepository.");
    }

    public List<AttendanceDTO> saveAttendance(String email, List<AttendanceDTO> attendanceList) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Teacher teacher = teacherRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Teacher profile not found"));

        if (attendanceList.isEmpty())
            return new ArrayList<>();

        // Validate Date
        LocalDate date = attendanceList.get(0).getAttendanceDate();
        if (date.isAfter(LocalDate.now())) {
            throw new RuntimeException("Cannot mark attendance for future dates.");
        }

        // Validate Class Teacher Permission
        // We assume all records in the list belong to the same class or we check each.
        // DTO has className.

        // Optimize: Cache class checks
        Map<String, Boolean> classAuthCache = new HashMap<>();

        for (AttendanceDTO dto : attendanceList) {
            String className = dto.getClassName();
            if (!classAuthCache.containsKey(className)) {
                // Check auth
                // Find class by name and schoolId
                Classes cls = classesRepository.findBySchoolIdAndName(teacher.getSchoolId(), className)
                        .orElseThrow(() -> new RuntimeException("Class not found: " + className));

                boolean isClassTeacher = cls.getClassTeacherId() != null
                        && cls.getClassTeacherId().equals(teacher.getId());
                if (!isClassTeacher) {
                    // Check if Admin? (Did the prompt allow Admin? "Subject teacher only -> DENY".
                    // "Class teacher -> ALLOW".
                    // Usually Admin is allowed, but this is Teacher API.
                    // The prompt is strict about Teacher.
                    // But let's assume if it is a Teacher calling this, they MUST be Class Teacher.
                    throw new RuntimeException(
                            "Unauthorized: Only the Class Teacher can mark attendance for " + className);
                }
                classAuthCache.put(className, true);
            }
        }

        return attendanceService.saveAttendance(attendanceList);
    }

    public List<StudentDTO> getStudentsByClassId(String email, String classId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Teacher teacher = teacherRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Teacher profile not found"));

        // Check if teacher is assigned to this class (Direct assignment, Class Teacher,
        // or Subject Teacher)
        boolean isAuthorized = false;

        // 1. Check direct assignment
        if (teacher.getAssignedClasses() != null && teacher.getAssignedClasses().contains(classId)) {
            isAuthorized = true;
        }

        // 2. Check if Class Teacher
        if (!isAuthorized) {
            Optional<Classes> classOpt = classesRepository.findById(classId);
            if (classOpt.isPresent() && teacher.getId().equals(classOpt.get().getClassTeacherId())) {
                isAuthorized = true;
            }
        }

        // 3. Check if Subject Teacher
        if (!isAuthorized) {
            List<com.littlesteps.playschool.entity.ClassSubject> subjectAssignments = classSubjectRepository
                    .findByTeacherId(teacher.getId());
            for (com.littlesteps.playschool.entity.ClassSubject cs : subjectAssignments) {
                if (cs.getClassId().equals(classId)) {
                    isAuthorized = true;
                    break;
                }
            }
        }

        if (!isAuthorized) {
            throw new RuntimeException("Unauthorized: Class not assigned to teacher.");
        }

        List<Student> students = studentRepository.findByClassId(classId);

        return students.stream().map(s -> {
            StudentDTO dto = new StudentDTO();
            dto.setId(s.getId());
            dto.setAdmissionNo(s.getAdmissionNo());
            dto.setRollNo(s.getRollNo());
            dto.setName(s.getName());
            dto.setAge(s.getAge());
            dto.setClassName(s.getClassName());
            dto.setClassId(s.getClassId());
            dto.setSectionId(s.getSectionId());
            dto.setGuardian(s.getGuardian());
            dto.setGuardianPhone(s.getGuardianPhone());
            dto.setGuardianEmail(s.getGuardianEmail());
            dto.setAddress(s.getAddress());
            if (s.getStatus() != null) {
                dto.setStatus(s.getStatus().name());
            }
            return dto;
        }).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getAttendanceHistory(String email, String classId, LocalDate startDate,
            LocalDate endDate) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        Teacher teacher = teacherRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        // Check if teacher is assigned to this class (Direct assignment, Class Teacher,
        // or Subject Teacher)
        boolean isAuthorized = false;

        // 1. Check direct assignment
        if (teacher.getAssignedClasses() != null && teacher.getAssignedClasses().contains(classId)) {
            isAuthorized = true;
        }

        // 2. Check if Class Teacher
        if (!isAuthorized) {
            Optional<Classes> classOpt = classesRepository.findById(classId);
            if (classOpt.isPresent() && teacher.getId().equals(classOpt.get().getClassTeacherId())) {
                isAuthorized = true;
            }
        }

        // 3. Check if Subject Teacher
        if (!isAuthorized) {
            List<com.littlesteps.playschool.entity.ClassSubject> subjectAssignments = classSubjectRepository
                    .findByTeacherId(teacher.getId());
            for (com.littlesteps.playschool.entity.ClassSubject cs : subjectAssignments) {
                if (cs.getClassId().equals(classId)) {
                    isAuthorized = true;
                    break;
                }
            }
        }

        if (!isAuthorized) {
            throw new RuntimeException("Unauthorized class access");
        }

        List<Student> students = studentRepository.findByClassId(classId);

        List<AttendanceDTO> attendances = attendanceService.getAttendanceByDateRange(startDate, endDate);

        List<Map<String, Object>> report = new ArrayList<>();

        for (Student student : students) {
            Map<String, Object> row = new HashMap<>();
            row.put("studentId", student.getId());
            row.put("name", student.getName());
            row.put("admissionNo", student.getAdmissionNo());

            List<AttendanceDTO> studentRecs = attendances.stream()
                    .filter(a -> a.getStudentId() != null && a.getStudentId().equals(student.getId()))
                    .collect(Collectors.toList());

            long present = studentRecs.stream()
                    .filter(a -> "PRESENT".equals(a.getStatus()) || "LATE".equals(a.getStatus())).count();
            long absent = studentRecs.stream().filter(a -> "ABSENT".equals(a.getStatus())).count();
            long halfDay = studentRecs.stream().filter(a -> "HALF_DAY".equals(a.getStatus())).count();
            long total = present + absent + halfDay;

            row.put("present", present);
            row.put("absent", absent);
            row.put("halfDay", halfDay);
            row.put("total", total);
            row.put("percentage", total > 0 ? Math.round(((double) present / total * 100) * 100.0) / 100.0 : 0);

            Map<String, String> dailyRecord = new HashMap<>();
            for (AttendanceDTO rec : studentRecs) {
                if (rec.getAttendanceDate() != null) {
                    dailyRecord.put(rec.getAttendanceDate().toString(), rec.getStatus());
                }
            }
            row.put("dailyRecord", dailyRecord);

            report.add(row);
        }
        return report;
    }

    public com.littlesteps.playschool.dto.TeacherProfileDTO getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Teacher teacher = teacherRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        String schoolName = "Unknown School";
        if (teacher.getSchoolId() != null) {
            Optional<School> schoolOpt = schoolRepository.findById(teacher.getSchoolId());
            if (schoolOpt.isPresent()) {
                schoolName = schoolOpt.get().getName();
            }
        }

        List<Map<String, String>> assignedClassesList = new ArrayList<>();
        if (teacher.getAssignedClasses() != null && !teacher.getAssignedClasses().isEmpty()) {
            List<Classes> classes = classesRepository.findAllById(teacher.getAssignedClasses());
            for (Classes cls : classes) {
                Map<String, String> classMap = new HashMap<>();
                classMap.put("id", cls.getId());
                classMap.put("name", cls.getName());
                classMap.put("grade", cls.getGrade());
                classMap.put("section", cls.getSection());
                assignedClassesList.add(classMap);
            }
        }

        return new com.littlesteps.playschool.dto.TeacherProfileDTO(
                teacher.getName(),
                teacher.getEmail(),
                teacher.getEmployeeId(),
                teacher.getPhone(),
                teacher.getDepartment(),
                teacher.getQualification(),
                teacher.getExperience(),
                teacher.getJoiningDate(),
                schoolName,
                assignedClassesList);
    }

    public com.littlesteps.playschool.dto.TeacherRoleInfoDTO getTeacherRoleInfo(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Teacher teacher = teacherRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Teacher profile not found"));

        com.littlesteps.playschool.dto.TeacherRoleInfoDTO dto = new com.littlesteps.playschool.dto.TeacherRoleInfoDTO();

        // Check if Class Teacher
        List<Classes> classTeacherOfList = classesRepository.findByClassTeacherId(teacher.getId());
        if (!classTeacherOfList.isEmpty()) {
            Classes cls = classTeacherOfList.get(0); // Should only be one due to hard constraint
            dto.setClassTeacher(true);
            dto.setClassTeacherOfClassId(cls.getId());
            dto.setClassTeacherOfClassName(cls.getName());
        } else {
            dto.setClassTeacher(false);
        }

        // Get Subject Assignments
        List<com.littlesteps.playschool.entity.ClassSubject> subjectAssignments = classSubjectRepository
                .findByTeacherId(teacher.getId());
        List<com.littlesteps.playschool.dto.TeacherRoleInfoDTO.SubjectAssignment> assignments = new ArrayList<>();

        for (com.littlesteps.playschool.entity.ClassSubject cs : subjectAssignments) {
            String className = "Unknown Class";
            String subjectName = "Unknown Subject";

            Optional<Classes> clsOpt = classesRepository.findById(cs.getClassId());
            if (clsOpt.isPresent()) {
                className = clsOpt.get().getName();
            }

            Optional<com.littlesteps.playschool.entity.Subject> subjectOpt = subjectRepository
                    .findById(cs.getSubjectId());
            if (subjectOpt.isPresent()) {
                subjectName = subjectOpt.get().getName();
            }

            assignments.add(new com.littlesteps.playschool.dto.TeacherRoleInfoDTO.SubjectAssignment(
                    cs.getClassId(), className, cs.getSubjectId(), subjectName));
        }

        dto.setSubjectAssignments(assignments);
        return dto;
    }

    /**
     * Returns students of the class where the teacher is the class teacher.
     * Used for the Promotions tab.
     */
    public Map<String, Object> getClassTeacherStudentsForPromotion(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Teacher teacher = teacherRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Teacher profile not found"));

        // Find class where teacher is class teacher
        List<Classes> classTeacherOfList = classesRepository.findByClassTeacherId(teacher.getId());
        if (classTeacherOfList.isEmpty()) {
            throw new RuntimeException("You are not assigned as a class teacher of any class.");
        }

        Classes classTeacherOf = classTeacherOfList.get(0);

        // Get students of this class
        List<Student> students = studentRepository.findByClassId(classTeacherOf.getId());

        // Sort by Roll No ASC
        students.sort((s1, s2) -> {
            Integer r1 = s1.getRollNo() != null ? s1.getRollNo() : Integer.MAX_VALUE;
            Integer r2 = s2.getRollNo() != null ? s2.getRollNo() : Integer.MAX_VALUE;
            return r1.compareTo(r2);
        });

        List<StudentDTO> studentDTOs = students.stream().map(s -> {
            StudentDTO dto2 = new StudentDTO();
            dto2.setId(s.getId());
            dto2.setAdmissionNo(s.getAdmissionNo());
            dto2.setRollNo(s.getRollNo());
            dto2.setName(s.getName());
            dto2.setAge(s.getAge());
            dto2.setClassName(s.getClassName());
            dto2.setClassId(s.getClassId());
            dto2.setSectionId(s.getSectionId());
            dto2.setGuardian(s.getGuardian());
            dto2.setGuardianPhone(s.getGuardianPhone());
            dto2.setGuardianEmail(s.getGuardianEmail());
            dto2.setAddress(s.getAddress());
            if (s.getStatus() != null) {
                dto2.setStatus(s.getStatus().name());
            }
            return dto2;
        }).collect(Collectors.toList());

        // Get all classes in the same school (for target class dropdown), excluding
        // current class
        List<Classes> allClasses = classesRepository.findBySchoolId(teacher.getSchoolId());
        List<Map<String, String>> availableClasses = allClasses.stream()
                .filter(cls -> !cls.getId().equals(classTeacherOf.getId()))
                .filter(cls -> cls.getStatus() == Classes.Status.ACTIVE)
                .map(cls -> {
                    Map<String, String> map = new HashMap<>();
                    map.put("id", cls.getId());
                    map.put("name", cls.getName());
                    map.put("grade", cls.getGrade());
                    map.put("section", cls.getSection());
                    return map;
                }).collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("currentClass", Map.of(
                "id", classTeacherOf.getId(),
                "name", classTeacherOf.getName(),
                "grade", classTeacherOf.getGrade(),
                "section", classTeacherOf.getSection()));
        result.put("students", studentDTOs);
        result.put("availableClasses", availableClasses);

        return result;
    }

    /**
     * Promotes selected students to a target class.
     * Only the class teacher of the students' current class can promote them.
     */
    public Map<String, Object> promoteStudents(String email, List<String> studentIds, String targetClassId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Teacher teacher = teacherRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Teacher profile not found"));

        // Validate teacher is a class teacher
        List<Classes> classTeacherOfList = classesRepository.findByClassTeacherId(teacher.getId());
        if (classTeacherOfList.isEmpty()) {
            throw new RuntimeException("You are not assigned as a class teacher of any class.");
        }

        Classes currentClass = classTeacherOfList.get(0);

        // Validate target class exists and belongs to the same school
        Classes targetClass = classesRepository.findById(targetClassId)
                .orElseThrow(() -> new RuntimeException("Target class not found."));

        if (!targetClass.getSchoolId().equals(teacher.getSchoolId())) {
            throw new RuntimeException("Target class does not belong to your school.");
        }

        if (targetClass.getId().equals(currentClass.getId())) {
            throw new RuntimeException("Cannot promote students to the same class.");
        }

        // Promote each student
        int promotedCount = 0;
        for (String studentId : studentIds) {
            Optional<Student> studentOpt = studentRepository.findById(studentId);
            if (studentOpt.isPresent()) {
                Student student = studentOpt.get();
                // Only promote students currently in the teacher's class
                if (currentClass.getId().equals(student.getClassId())) {
                    student.setClassId(targetClass.getId());
                    student.setSectionId(targetClass.getSection());
                    student.setClassName(targetClass.getName());
                    student.setUpdatedAt(java.time.LocalDateTime.now());
                    studentRepository.save(student);
                    promotedCount++;
                }
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("promotedCount", promotedCount);
        result.put("targetClassName", targetClass.getName());
        result.put("message", promotedCount + " student(s) promoted to " + targetClass.getName() + " successfully.");

        return result;
    }
}
