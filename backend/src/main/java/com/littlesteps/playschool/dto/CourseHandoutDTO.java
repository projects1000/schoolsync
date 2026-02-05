package com.littlesteps.playschool.dto;

import java.time.LocalDateTime;
import java.util.List;

public class CourseHandoutDTO {
    private String id;
    private String teacherId;
    private String schoolId;
    private String classId;
    private String section;
    private String subject;
    private String academicYear;
    private List<TopicDTO> topics;
    private int totalTopics;
    private int completedTopics;
    private double progressPercentage;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static class TopicDTO {
        private String id;
        private String title;
        private String description;
        private boolean isCompleted;
        private LocalDateTime completedOn;

        public TopicDTO() {
        }

        public TopicDTO(String id, String title, String description, boolean isCompleted, LocalDateTime completedOn) {
            this.id = id;
            this.title = title;
            this.description = description;
            this.isCompleted = isCompleted;
            this.completedOn = completedOn;
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

    public List<TopicDTO> getTopics() {
        return topics;
    }

    public void setTopics(List<TopicDTO> topics) {
        this.topics = topics;
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
}
