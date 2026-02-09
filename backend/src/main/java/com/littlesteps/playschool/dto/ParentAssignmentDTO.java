package com.littlesteps.playschool.dto;

import java.time.LocalDate;

public class ParentAssignmentDTO {
    private String id;
    private String title;
    private String description;
    private LocalDate dueDate;
    private String attachmentUrl;
    private String teacherName;
    private String subjectName; // It might be useful too, though assignment doesn't link to subject directly in
                                // entity, let's stick to teacher for now as per request

    // Constructors
    public ParentAssignmentDTO() {
    }

    public ParentAssignmentDTO(String id, String title, String description, LocalDate dueDate, String attachmentUrl,
            String teacherName) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.attachmentUrl = attachmentUrl;
        this.teacherName = teacherName;
    }

    // Getters and Setters
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

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public String getAttachmentUrl() {
        return attachmentUrl;
    }

    public void setAttachmentUrl(String attachmentUrl) {
        this.attachmentUrl = attachmentUrl;
    }

    public String getTeacherName() {
        return teacherName;
    }

    public void setTeacherName(String teacherName) {
        this.teacherName = teacherName;
    }
}
