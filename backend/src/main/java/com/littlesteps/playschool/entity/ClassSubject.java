package com.littlesteps.playschool.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "class_subjects")
@CompoundIndex(name = "school_class_subject_idx", def = "{'schoolId': 1, 'classId': 1, 'subjectId': 1}", unique = true)
public class ClassSubject {

    @Id
    private String id;

    private String schoolId;

    private String classId;

    private String subjectId;

    private String teacherId; // Can be null (subject assigned but no teacher yet)

    private LocalDateTime createdAt = LocalDateTime.now();

    public ClassSubject() {
    }

    public ClassSubject(String schoolId, String classId, String subjectId, String teacherId) {
        this.schoolId = schoolId;
        this.classId = classId;
        this.subjectId = subjectId;
        this.teacherId = teacherId;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public String getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(String subjectId) {
        this.subjectId = subjectId;
    }

    public String getTeacherId() {
        return teacherId;
    }

    public void setTeacherId(String teacherId) {
        this.teacherId = teacherId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
