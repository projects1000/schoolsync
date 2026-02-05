package com.littlesteps.playschool.service;

import com.littlesteps.playschool.dto.CourseHandoutDTO;
import com.littlesteps.playschool.dto.CreateCourseHandoutDTO;
import com.littlesteps.playschool.entity.CourseHandout;
import com.littlesteps.playschool.entity.Teacher;
import com.littlesteps.playschool.entity.User;
import com.littlesteps.playschool.repository.CourseHandoutRepository;
import com.littlesteps.playschool.repository.TeacherRepository;
import com.littlesteps.playschool.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CourseHandoutService {

    @Autowired
    private CourseHandoutRepository courseHandoutRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private UserRepository userRepository;

    public List<CourseHandoutDTO> getHandoutsByTeacher(String email, String classId, String subject) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Teacher teacher = teacherRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        List<CourseHandout> handouts;

        if (classId != null && subject != null) {
            handouts = courseHandoutRepository.findByTeacherIdAndSchoolIdAndClassIdAndSubject(
                    teacher.getId(), teacher.getSchoolId(), classId, subject);
        } else if (classId != null) {
            handouts = courseHandoutRepository.findByTeacherIdAndSchoolIdAndClassId(
                    teacher.getId(), teacher.getSchoolId(), classId);
        } else if (subject != null) {
            handouts = courseHandoutRepository.findByTeacherIdAndSchoolIdAndSubject(
                    teacher.getId(), teacher.getSchoolId(), subject);
        } else {
            handouts = courseHandoutRepository.findByTeacherIdAndSchoolId(
                    teacher.getId(), teacher.getSchoolId());
        }

        return handouts.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public CourseHandoutDTO createHandout(String email, CreateCourseHandoutDTO dto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Teacher teacher = teacherRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        // Validate class belongs to teacher
        if (teacher.getAssignedClasses() == null || !teacher.getAssignedClasses().contains(dto.getClassId())) {
            throw new RuntimeException("Unauthorized: Class does not belong to teacher's assigned classes");
        }

        // Check for duplicate handout
        if (courseHandoutRepository.existsByClassIdAndSubjectAndAcademicYear(
                dto.getClassId(), dto.getSubject(), dto.getAcademicYear())) {
            throw new RuntimeException("A handout already exists for this class, subject, and academic year");
        }

        CourseHandout handout = new CourseHandout();
        handout.setTeacherId(teacher.getId());
        handout.setSchoolId(teacher.getSchoolId());
        handout.setClassId(dto.getClassId());
        handout.setSection(dto.getSection());
        handout.setSubject(dto.getSubject());
        handout.setAcademicYear(dto.getAcademicYear());

        if (dto.getTopics() != null) {
            List<CourseHandout.Topic> topics = dto.getTopics().stream()
                    .map(t -> new CourseHandout.Topic(t.getTitle(), t.getDescription()))
                    .collect(Collectors.toList());
            handout.setTopics(topics);
        }

        CourseHandout saved = courseHandoutRepository.save(handout);
        return convertToDTO(saved);
    }

    @Transactional
    public CourseHandoutDTO updateTopicCompletion(String email, String handoutId, int topicIndex, boolean completed) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Teacher teacher = teacherRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        CourseHandout handout = courseHandoutRepository.findById(handoutId)
                .orElseThrow(() -> new RuntimeException("Handout not found"));

        if (!handout.getTeacherId().equals(teacher.getId())) {
            throw new RuntimeException("Unauthorized: This handout does not belong to you");
        }

        if (topicIndex < 0 || topicIndex >= handout.getTopics().size()) {
            throw new RuntimeException("Invalid topic index");
        }

        CourseHandout.Topic topic = handout.getTopics().get(topicIndex);
        topic.setCompleted(completed);
        topic.setCompletedOn(completed ? LocalDateTime.now() : null);
        handout.setUpdatedAt(LocalDateTime.now());

        CourseHandout saved = courseHandoutRepository.save(handout);
        return convertToDTO(saved);
    }

    @Transactional
    public CourseHandoutDTO updateTopicById(String email, String handoutId, String topicId, boolean completed) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Teacher teacher = teacherRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        CourseHandout handout = courseHandoutRepository.findById(handoutId)
                .orElseThrow(() -> new RuntimeException("Handout not found"));

        if (!handout.getTeacherId().equals(teacher.getId())) {
            throw new RuntimeException("Unauthorized: This handout does not belong to you");
        }

        // Find topic by ID
        CourseHandout.Topic topic = handout.getTopics().stream()
                .filter(t -> topicId.equals(t.getId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Topic not found"));

        topic.setCompleted(completed);
        topic.setCompletedOn(completed ? LocalDateTime.now() : null);
        handout.setUpdatedAt(LocalDateTime.now());

        CourseHandout saved = courseHandoutRepository.save(handout);
        return convertToDTO(saved);
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
}
