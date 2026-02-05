package com.littlesteps.playschool.dto;

import java.util.List;

public class CreateCourseHandoutDTO {
    private String classId;
    private String section;
    private String subject;
    private String academicYear;
    private List<TopicInput> topics;

    public static class TopicInput {
        private String title;
        private String description;

        public TopicInput() {
        }

        public TopicInput(String title, String description) {
            this.title = title;
            this.description = description;
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
    }

    // Getters and Setters
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

    public List<TopicInput> getTopics() {
        return topics;
    }

    public void setTopics(List<TopicInput> topics) {
        this.topics = topics;
    }
}
