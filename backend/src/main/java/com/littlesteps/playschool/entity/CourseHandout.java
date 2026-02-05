package com.littlesteps.playschool.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "course_handouts")
@CompoundIndex(name = "unique_handout", def = "{'classId': 1, 'subject': 1, 'academicYear': 1}", unique = true)
public class CourseHandout {

    @Id
    private String id;

    private String teacherId;
    private String schoolId;
    private String classId;
    private String section;
    private String subject;
    private String academicYear;

    private List<Topic> topics = new ArrayList<>();

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    // Embedded Topic class
    public static class Topic {
        private String id;
        private String title;
        private String description;
        private boolean isCompleted = false;
        private LocalDateTime completedOn;

        public Topic() {
            this.id = java.util.UUID.randomUUID().toString();
        }

        public Topic(String title, String description) {
            this.id = java.util.UUID.randomUUID().toString();
            this.title = title;
            this.description = description;
        }

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public boolean isCompleted() {
            return isCompleted;
        }

        public void setCompleted(boolean completed) {
            isCompleted = completed;
        }

        public LocalDateTime getCompletedOn() {
            return completedOn;
        }

        public void setCompletedOn(LocalDateTime completedOn) {
            this.completedOn = completedOn;
        }
    }

    // Constructors
    public CourseHandout() {
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTeacherId() {
        return teacherId;
    }

    public void setTeacherId(String teacherId) {
        this.teacherId = teacherId;
    }

    public String getSchoolId() {
        return schoolId;
    }

    public void setSchoolId(String schoolId) {
        this.schoolId = schoolId;
    }

    public String getClassId() {
        return classId;
    }

    public void setClassId(String classId) {
        this.classId = classId;
    }

    public String getSection() {
        return section;
    }

    public void setSection(String section) {
        this.section = section;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getAcademicYear() {
        return academicYear;
    }

    public void setAcademicYear(String academicYear) {
        this.academicYear = academicYear;
    }

    public List<Topic> getTopics() {
        return topics;
    }

    public void setTopics(List<Topic> topics) {
        this.topics = topics;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    // Helper methods for progress calculation
    public int getTotalTopics() {
        return topics != null ? topics.size() : 0;
    }

    public int getCompletedTopics() {
        if (topics == null)
            return 0;
        return (int) topics.stream().filter(Topic::isCompleted).count();
    }

    public double getProgressPercentage() {
        int total = getTotalTopics();
        if (total == 0)
            return 0;
        return (double) getCompletedTopics() / total * 100;
    }
}
