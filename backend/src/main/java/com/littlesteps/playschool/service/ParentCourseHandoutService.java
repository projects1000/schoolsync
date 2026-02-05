package com.littlesteps.playschool.service;

import com.littlesteps.playschool.dto.CourseHandoutDTO;
import com.littlesteps.playschool.entity.CourseHandout;
import com.littlesteps.playschool.entity.Parent;
import com.littlesteps.playschool.entity.Student;
import com.littlesteps.playschool.entity.User;
import com.littlesteps.playschool.repository.CourseHandoutRepository;
import com.littlesteps.playschool.repository.ParentRepository;
import com.littlesteps.playschool.repository.ParentStudentMapRepository;
import com.littlesteps.playschool.repository.StudentRepository;
import com.littlesteps.playschool.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ParentCourseHandoutService {

    @Autowired
    private CourseHandoutRepository courseHandoutRepository;

    @Autowired
    private ParentRepository parentRepository;

    @Autowired
    private ParentStudentMapRepository parentStudentMapRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Get course handouts for a student (for parent view)
     */
    public List<CourseHandoutDTO> getHandoutsForStudent(String email, String studentId) {
        validateParentStudentRelationship(email, studentId);

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        List<CourseHandout> handouts = courseHandoutRepository.findByClassIdAndSchoolId(
                student.getClassId(), student.getSchoolId());

        return handouts.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get course progress summary for a student (for parent dashboard widget)
     */
    public List<CourseProgressDTO> getCourseProgress(String email, String studentId) {
        validateParentStudentRelationship(email, studentId);

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        List<CourseHandout> handouts = courseHandoutRepository.findByClassIdAndSchoolId(
                student.getClassId(), student.getSchoolId());

        return handouts.stream()
                .map(h -> new CourseProgressDTO(
                        h.getId(),
                        h.getSubject(),
                        h.getTotalTopics(),
                        h.getCompletedTopics(),
                        h.getProgressPercentage()))
                .collect(Collectors.toList());
    }

    /**
     * Get handout details by ID (for parent view)
     */
    public CourseHandoutDTO getHandoutDetails(String email, String handoutId, String studentId) {
        validateParentStudentRelationship(email, studentId);

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        CourseHandout handout = courseHandoutRepository.findById(handoutId)
                .orElseThrow(() -> new RuntimeException("Handout not found"));

        // Validate handout belongs to student's class and school
        if (!handout.getClassId().equals(student.getClassId()) ||
                !handout.getSchoolId().equals(student.getSchoolId())) {
            throw new RuntimeException("Unauthorized: This handout does not belong to your child's class");
        }

        return convertToDTO(handout);
    }

    /**
     * Validate that the parent is authorized to view the student's data
     */
    private void validateParentStudentRelationship(String email, String studentId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Parent parent = parentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Parent not found"));

        // Verify student exists
        if (!studentRepository.existsById(studentId)) {
            throw new RuntimeException("Student not found");
        }

        // Check if the student belongs to this parent using the mapping table
        boolean isLinked = parentStudentMapRepository.existsByParentIdAndStudentId(parent.getId(), studentId);
        if (!isLinked) {
            throw new RuntimeException("Unauthorized: This student does not belong to you");
        }
    }

    private CourseHandoutDTO convertToDTO(CourseHandout handout) {
        CourseHandoutDTO dto = new CourseHandoutDTO();
        dto.setId(handout.getId());
        dto.setTeacherId(handout.getTeacherId());
        dto.setSchoolId(handout.getSchoolId());
        dto.setClassId(handout.getClassId());
        dto.setSection(handout.getSection());
        dto.setSubject(handout.getSubject());
        dto.setAcademicYear(handout.getAcademicYear());
        dto.setCreatedAt(handout.getCreatedAt());
        dto.setUpdatedAt(handout.getUpdatedAt());

        if (handout.getTopics() != null) {
            List<CourseHandoutDTO.TopicDTO> topicDTOs = handout.getTopics().stream()
                    .map(t -> new CourseHandoutDTO.TopicDTO(t.getId(), t.getTitle(), t.getDescription(),
                            t.isCompleted(), t.getCompletedOn()))
                    .collect(Collectors.toList());
            dto.setTopics(topicDTOs);
        }

        dto.setTotalTopics(handout.getTotalTopics());
        dto.setCompletedTopics(handout.getCompletedTopics());
        dto.setProgressPercentage(handout.getProgressPercentage());

        return dto;
    }

    // Inner DTO class for course progress summary
    public static class CourseProgressDTO {
        private String handoutId;
        private String subject;
        private int totalTopics;
        private int completedTopics;
        private double progressPercentage;

        public CourseProgressDTO(String handoutId, String subject, int totalTopics, int completedTopics,
                double progressPercentage) {
            this.handoutId = handoutId;
            this.subject = subject;
            this.totalTopics = totalTopics;
            this.completedTopics = completedTopics;
            this.progressPercentage = progressPercentage;
        }

        // Getters and Setters
        public String getHandoutId() {
            return handoutId;
        }

        public void setHandoutId(String handoutId) {
            this.handoutId = handoutId;
        }

        public String getSubject() {
            return subject;
        }

        public void setSubject(String subject) {
            this.subject = subject;
        }

        public int getTotalTopics() {
            return totalTopics;
        }

        public void setTotalTopics(int totalTopics) {
            this.totalTopics = totalTopics;
        }

        public int getCompletedTopics() {
            return completedTopics;
        }

        public void setCompletedTopics(int completedTopics) {
            this.completedTopics = completedTopics;
        }

        public double getProgressPercentage() {
            return progressPercentage;
        }

        public void setProgressPercentage(double progressPercentage) {
            this.progressPercentage = progressPercentage;
        }
    }
}
